import React from "react";
import { FlowButton } from "../../../components/ui/FlowButton";

const SEARCH_OPTIONS = [
  { value: "challan", label: "Challan Number" },
  { value: "vehicle", label: "Vehicle Number" },
  { value: "phone", label: "Phone Number" },
];

const INPUT_LABELS = {
  challan: "Challan Number",
  vehicle: "Vehicle Number",
  phone: "Phone Number",
};

export default function ChallanSearchForm({
  type,
  setType,
  value,
  setValue,
  captchaText,
  userInputCaptcha,
  setUserInputCaptcha,
  onRefreshCaptcha,
  onSearch,
}) {
  return (
    <div className="challan-details-card">
      <h2 className="title">Challan Details</h2>
      <p className="subtitle">After getting challan details you can further go for online payment</p>
      <hr />

      <div className="radio-group">
        {SEARCH_OPTIONS.map((option) => (
          <label key={option.value} className="radio-label">
            <input
              type="radio"
              name="search_type"
              value={option.value}
              checked={type === option.value}
              onChange={() => setType(option.value)}
            />
            <span className="custom-radio" />
            {option.label}
          </label>
        ))}
      </div>

      <div className="input-container">
        <label className="input-label">{INPUT_LABELS[type]}</label>
        <input className="text-input" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>

      <div className="captcha-container">
        <div className="captcha-box">
          <span
            className="captcha-text"
            style={{ fontStyle: "italic", letterSpacing: "4px", textDecoration: "line-through" }}
          >
            {captchaText}
          </span>
          <button type="button" className="refresh-btn" onClick={onRefreshCaptcha}>
            &#x21bb;
          </button>
        </div>
        <label className="input-label" style={{ marginTop: "10px" }}>
          Captcha
        </label>
        <input
          className="text-input"
          placeholder="Enter Captcha"
          value={userInputCaptcha}
          onChange={(e) => setUserInputCaptcha(e.target.value)}
        />
      </div>

      <FlowButton
        text="Get Detail"
        onClick={onSearch}
        variant="orange"
        showArrow={false}
        className="mx-auto"
      />
    </div>
  );
}
