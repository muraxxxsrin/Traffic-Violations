import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CircleCheck, Info, X } from "lucide-react";
import { ToastContext } from "../../lib/toast";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((previous) => previous.filter((item) => item.toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", position = "bottom-right") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);

    setToasts((previous) => [
      ...previous,
      {
        toast: { id, message, type },
        position,
      },
    ]);

    window.setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {["top-left", "top-right", "bottom-left", "bottom-right", "center"].map((position) => (
        <ToastContainer
          key={position}
          position={position}
          toasts={toasts.filter((item) => item.position === position)}
          onDismiss={removeToast}
        />
      ))}
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, position, onDismiss }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const adjustedPosition = isMobile
    ? position.startsWith("top")
      ? "top"
      : "bottom"
    : position;

  const getPositionClasses = () => {
    switch (adjustedPosition) {
      case "top-left":
        return "top-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      case "top":
        return "top-4 left-1/2 -translate-x-1/2";
      case "bottom":
        return "bottom-4 left-1/2 -translate-x-1/2";
      case "center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      default:
        return "";
    }
  };

  const getInitialY = () => {
    if (adjustedPosition.startsWith("top")) {
      return -50;
    }

    if (adjustedPosition === "center") {
      return 0;
    }

    return 50;
  };

  return (
    <div className={`pointer-events-none fixed z-[100] ${getPositionClasses()} w-full max-w-full space-y-2 px-4 sm:max-w-sm sm:px-0`}>
      <AnimatePresence>
        {toasts.map(({ toast }) => (
          <Motion.div
            key={toast.id}
            initial={{ opacity: 0, y: getInitialY() }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: getInitialY() }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <ToastItem {...toast} onDismiss={() => onDismiss(toast.id)} />
          </Motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ message, type, onDismiss }) {
  const typeConfig = {
    success: {
      icon: CircleCheck,
      bgColor: "bg-green-50",
      textColor: "text-green-800",
      borderColor: "border-green-200",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-50",
      textColor: "text-red-800",
      borderColor: "border-red-200",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
    },
  };

  const { icon: Icon, bgColor, textColor, borderColor } = typeConfig[type];

  return (
    <div className={`pointer-events-auto flex max-w-full items-center justify-between rounded-lg border p-4 shadow-lg ${bgColor} ${borderColor}`}>
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 ${textColor}`} />
        <p className={`font-medium ${textColor}`}>{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className={`ml-4 inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/5 ${textColor}`}
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
