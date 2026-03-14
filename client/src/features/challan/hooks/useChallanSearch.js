import { useRef, useState } from "react";
import axios from "axios";
import { createCaptcha } from "../utils/captcha";
import { useToast } from "../../../lib/toast";

export function useChallanSearch({ onSearchSuccess, onPaymentSuccess } = {}) {
  const { showToast } = useToast();
  const [type, setType] = useState("challan");
  const [value, setValue] = useState("");
  const [results, setResults] = useState([]);
  const [captchaText, setCaptchaText] = useState(createCaptcha);
  const [userInputCaptcha, setUserInputCaptcha] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentPaymentChallan, setCurrentPaymentChallan] = useState(null);
  const resultsRef = useRef(null);

  const generateCaptcha = () => {
    setCaptchaText(createCaptcha());
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setCurrentPaymentChallan(null);
  };

  const handleSearch = async () => {
    if (userInputCaptcha !== captchaText) {
      showToast("Invalid Captcha! Please try again.", "error", "top-right");
      generateCaptcha();
      setUserInputCaptcha("");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/challan/search", {
        type,
        value,
      });

      setResults(res.data);
      onSearchSuccess?.({ type, value, results: res.data });
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      showToast("No record found", "error", "top-right");
      setResults([]);
    }
  };

  const openPaymentModal = (challan) => {
    setCurrentPaymentChallan(challan);
    setIsPaymentModalOpen(true);
  };

  const processSimulatedPayment = async (event) => {
    event.preventDefault();

    if (!currentPaymentChallan) return;

    try {
      const res = await axios.post("http://localhost:5000/api/challan/simulate-payment", {
        challan_id: currentPaymentChallan.challan_id,
      });

      if (res.status === 200) {
        showToast("Payment Processed Successfully!", "success", "top-right");
        closePaymentModal();
        if (onPaymentSuccess) {
          await onPaymentSuccess();
        } else {
          await handleSearch();
        }
      }
    } catch {
      showToast("Payment failed. Please try again.", "error", "top-right");
    }
  };

  return {
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
  };
}
