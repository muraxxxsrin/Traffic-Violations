import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Header from "./components/layout/Header";
import NoticeBoard from "./features/challan/components/NoticeBoard";
import PaymentModal from "./features/challan/components/PaymentModal";
import DashboardPage from "./features/challan/components/DashboardPage";
import AnalyticsHome from "./features/challan/components/AnalyticsHome";
import SignInPage from "./features/auth/components/SignInPage";
import SignUpPage from "./features/auth/components/SignUpPage";
import FeaturesPage from "./features/home/components/FeaturesPage";
import AboutPage from "./features/home/components/AboutPage";
import ChallanSearchForm from "./features/challan/components/ChallanSearchForm";
import { useChallanSearch } from "./features/challan/hooks/useChallanSearch";
import { downloadChallanReport } from "./features/challan/utils/challanReport";
import { useToast } from "./lib/toast";
import { API_BASE_URL } from "./lib/api";
import "./styles/app.css";

function getTokenExpiryTime(token) {
  if (!token) {
    return null;
  }

  try {
    const [, payload] = token.split(".");

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=");
    const decodedPayload = JSON.parse(window.atob(paddedPayload));

    return typeof decodedPayload.exp === "number" ? decodedPayload.exp * 1000 : null;
  } catch {
    return null;
  }
}

const PROTECTED_PATHS = new Set(["/", "/dashboard"]);

function App() {
  const { showToast } = useToast();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || "/");
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = window.localStorage.getItem("redlight-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authToken, setAuthToken] = useState(() => window.localStorage.getItem("redlight-token"));
  const [refreshToken, setRefreshToken] = useState(() => window.localStorage.getItem("redlight-refresh-token"));
  const [userChallans, setUserChallans] = useState([]);
  const [isUserChallansLoading, setIsUserChallansLoading] = useState(false);
  const skipNextUserFetchRef = useRef(false);
  const refreshRequestRef = useRef(null);

  const navigateToPath = useCallback((path, { replace = false } = {}) => {
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({}, "", path);
    setCurrentPath(path);
  }, []);

  const persistSession = useCallback((user, nextAccessToken, nextRefreshToken) => {
    setCurrentUser(user);
    window.localStorage.setItem("redlight-user", JSON.stringify(user));

    if (nextAccessToken) {
      setAuthToken(nextAccessToken);
      window.localStorage.setItem("redlight-token", nextAccessToken);
    } else {
      setAuthToken(null);
      window.localStorage.removeItem("redlight-token");
    }

    if (nextRefreshToken) {
      setRefreshToken(nextRefreshToken);
      window.localStorage.setItem("redlight-refresh-token", nextRefreshToken);
    } else {
      setRefreshToken(null);
      window.localStorage.removeItem("redlight-refresh-token");
    }
  }, []);

  const clearSession = useCallback(
    ({ toastMessage, redirectPath = "/signin", replace = false } = {}) => {
      setCurrentUser(null);
      setAuthToken(null);
      setRefreshToken(null);
      setUserChallans([]);
      window.localStorage.removeItem("redlight-user");
      window.localStorage.removeItem("redlight-token");
      window.localStorage.removeItem("redlight-refresh-token");
      refreshRequestRef.current = null;

      if (toastMessage) {
        showToast(toastMessage, "error", "top-right");
      }

      navigateToPath(redirectPath, { replace });
    },
    [navigateToPath, showToast]
  );

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      clearSession({
        toastMessage: "Your session expired. Please sign in again.",
        replace: true,
      });
      return null;
    }

    if (!refreshRequestRef.current) {
      refreshRequestRef.current = (async () => {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, { refreshToken });
          const nextUser = res.data.user ?? currentUser;
          const nextAccessToken = res.data.accessToken ?? res.data.token ?? null;
          const nextRefreshToken = res.data.refreshToken ?? refreshToken;

          if (!nextUser || !nextAccessToken || !nextRefreshToken) {
            throw new Error("Incomplete refresh response.");
          }

          persistSession(nextUser, nextAccessToken, nextRefreshToken);
          return nextAccessToken;
        } catch {
          clearSession({
            toastMessage: "Your session expired. Please sign in again.",
            replace: true,
          });
          return null;
        } finally {
          refreshRequestRef.current = null;
        }
      })();
    }

    return refreshRequestRef.current;
  }, [clearSession, currentUser, persistSession, refreshToken]);

  const resolveAccessToken = useCallback(async (tokenOverride = authToken) => {
    if (!tokenOverride) {
      return refreshToken ? refreshAccessToken() : null;
    }

    const expiryTime = getTokenExpiryTime(tokenOverride);

    if (expiryTime && expiryTime <= Date.now()) {
      return refreshAccessToken();
    }

    return tokenOverride;
  }, [authToken, refreshAccessToken, refreshToken]);

  const executeAuthenticatedRequest = useCallback(async (requestFactory, tokenOverride = authToken) => {
    const activeToken = await resolveAccessToken(tokenOverride);

    if (!activeToken) {
      throw new Error("No valid access token available.");
    }

    try {
      return await requestFactory(activeToken);
    } catch (error) {
      if (error.response?.status !== 401 || !refreshToken) {
        if (error.response?.status === 401) {
          clearSession({
            toastMessage: "Your session expired. Please sign in again.",
            replace: true,
          });
        }

        throw error;
      }

      const nextAccessToken = await refreshAccessToken();

      if (!nextAccessToken) {
        throw error;
      }

      return requestFactory(nextAccessToken);
    }
  }, [authToken, clearSession, refreshAccessToken, refreshToken, resolveAccessToken]);

  const navigate = useCallback(async (path, options = {}) => {
    if (!currentUser || !PROTECTED_PATHS.has(path)) {
      navigateToPath(path, options);
      return;
    }

    const activeToken = await resolveAccessToken();

    if (!activeToken) {
      return;
    }

    navigateToPath(path, options);
  }, [currentUser, navigateToPath, resolveAccessToken]);

  const fetchUserChallans = useCallback(async (user, tokenOverride = authToken) => {
    if (!user?.phoneNumber) {
      setUserChallans([]);
      return;
    }

    setIsUserChallansLoading(true);
    try {
      try {
        const res = await executeAuthenticatedRequest(
          (token) =>
            axios.get(`${API_BASE_URL}/api/challan/user/${user.phoneNumber}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          tokenOverride
        );
        setUserChallans(res.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setUserChallans([]);
        } else {
          showToast("Unable to load user challans.", "error", "top-right");
        }
      }
    } finally {
      setIsUserChallansLoading(false);
    }
  }, [authToken, executeAuthenticatedRequest, showToast]);

  const handleAuthSuccess = useCallback((authData) => {
    const user = authData?.user ?? authData;
    const nextAccessToken = authData?.accessToken ?? authData?.token ?? null;
    const nextRefreshToken = authData?.refreshToken ?? null;

    persistSession(user, nextAccessToken, nextRefreshToken);
    skipNextUserFetchRef.current = true;
    fetchUserChallans(user, nextAccessToken);
  }, [fetchUserChallans, persistSession]);

  const handleSignOut = useCallback(async () => {
    const activeRefreshToken = refreshToken;

    clearSession({ redirectPath: "/" });

    if (!activeRefreshToken) {
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/auth/signout`, { refreshToken: activeRefreshToken });
    } catch {
      // Local logout is enough to protect the current session even if server cleanup fails.
    }
  }, [clearSession, refreshToken]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (currentUser?.phoneNumber) {
      if (skipNextUserFetchRef.current) {
        skipNextUserFetchRef.current = false;
        return;
      }

      fetchUserChallans(currentUser);
    }
  }, [currentUser, fetchUserChallans]);

  const {
    type,
    setType,
    value,
    setValue,
    results,
    captchaText,
    userInputCaptcha,
    setUserInputCaptcha,
    isPaymentModalOpen,
    currentPaymentChallan,
    resultsRef,
    generateCaptcha,
    handleSearch,
    openPaymentModal,
    closePaymentModal,
    processSimulatedPayment,
  } = useChallanSearch({
    onSearchSuccess: () => {
      navigate("/dashboard");
    },
    onPaymentSuccess: currentUser ? async () => fetchUserChallans(currentUser) : undefined,
    executeAuthenticatedRequest: currentUser ? executeAuthenticatedRequest : undefined,
  });

  const handleProtectedPayAction = useCallback(async (challan) => {
    if (!currentUser) {
      showToast("Please sign in to pay a challan.", "error", "top-right");
      navigateToPath("/signin");
      return;
    }

    const activeToken = await resolveAccessToken();

    if (!activeToken) {
      return;
    }

    openPaymentModal(challan);
  }, [currentUser, navigateToPath, openPaymentModal, resolveAccessToken, showToast]);

  const handleDownloadReport = useCallback(
    (challan) => downloadChallanReport(challan, showToast),
    [showToast]
  );

  return (
    <div className="echallan-app">
      {currentPath === "/signin" ? (
        <SignInPage onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />
      ) : currentPath === "/signup" ? (
        <SignUpPage onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />
      ) : currentUser ? (
        <>
          <Header
            currentPath={currentPath}
            onNavigate={navigate}
            currentUser={currentUser}
            onSignOut={handleSignOut}
          />
          {currentPath === "/dashboard" ? (
            <DashboardPage
              results={userChallans}
              resultsRef={resultsRef}
              onDownload={handleDownloadReport}
              onPay={handleProtectedPayAction}
              onBackToHome={() => navigate("/")}
              isSignedInUser={Boolean(currentUser)}
            />
          ) : currentPath === "/features" ? (
            <FeaturesPage />
          ) : currentPath === "/about" ? (
            <AboutPage />
          ) : (
            <AnalyticsHome
              user={currentUser}
              challans={userChallans}
              isLoading={isUserChallansLoading}
              onDownload={handleDownloadReport}
            />
          )}
        </>
      ) : (
        <>
          <Header
            currentPath={currentPath}
            onNavigate={navigate}
            currentUser={currentUser}
            onSignOut={handleSignOut}
          />

          {currentPath === "/dashboard" ? (
            <DashboardPage
              results={results}
              resultsRef={resultsRef}
              onDownload={handleDownloadReport}
              onPay={handleProtectedPayAction}
              onBackToHome={() => navigate("/")}
              isSignedInUser={false}
            />
          ) : currentPath === "/features" ? (
            <FeaturesPage />
          ) : currentPath === "/about" ? (
            <AboutPage />
          ) : (
            <div className="main-content">
              <NoticeBoard />
              <ChallanSearchForm
                type={type}
                setType={setType}
                value={value}
                setValue={setValue}
                captchaText={captchaText}
                userInputCaptcha={userInputCaptcha}
                setUserInputCaptcha={setUserInputCaptcha}
                onRefreshCaptcha={generateCaptcha}
                onSearch={handleSearch}
              />
            </div>
          )}
        </>
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        challan={currentPaymentChallan}
        onClose={closePaymentModal}
        onSubmit={processSimulatedPayment}
      />
    </div>
  );
}

export default App;
