import React, { useCallback, useEffect, useRef, useState } from "react";
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
import axios from "axios";
import { useToast } from "./lib/toast";
import { API_BASE_URL } from "./lib/api";
import "./styles/app.css";

function App() {
  const { showToast } = useToast();
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || "/");
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = window.localStorage.getItem("redlight-user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [authToken, setAuthToken] = useState(() => window.localStorage.getItem("redlight-token"));
  const [userChallans, setUserChallans] = useState([]);
  const [isUserChallansLoading, setIsUserChallansLoading] = useState(false);
  const skipNextUserFetchRef = useRef(false);

  const navigate = (path, { replace = false } = {}) => {
    const method = replace ? "replaceState" : "pushState";
    window.history[method]({}, "", path);
    setCurrentPath(path);
  };

  const fetchUserChallans = useCallback(async (user, tokenOverride = authToken) => {
    if (!user?.phoneNumber) {
      setUserChallans([]);
      return;
    }

    setIsUserChallansLoading(true);
    try {
      const requestConfig = tokenOverride
        ? {
            headers: {
              Authorization: `Bearer ${tokenOverride}`,
            },
          }
        : undefined;
      const res = await axios.get(`${API_BASE_URL}/api/challan/user/${user.phoneNumber}`, requestConfig);
      setUserChallans(res.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setUserChallans([]);
      } else {
        showToast("Unable to load user challans.", "error", "top-right");
      }
    } finally {
      setIsUserChallansLoading(false);
    }
  }, [authToken, showToast]);

  const handleAuthSuccess = (authData) => {
    const user = authData?.user ?? authData;
    const token = authData?.token ?? null;

    setCurrentUser(user);
    window.localStorage.setItem("redlight-user", JSON.stringify(user));
    if (token) {
      setAuthToken(token);
      window.localStorage.setItem("redlight-token", token);
    }
    skipNextUserFetchRef.current = true;
    fetchUserChallans(user, token);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setUserChallans([]);
    window.localStorage.removeItem("redlight-user");
    window.localStorage.removeItem("redlight-token");
    navigate("/");
  };

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
  });

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
              onPay={openPaymentModal}
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
              onPay={openPaymentModal}
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
