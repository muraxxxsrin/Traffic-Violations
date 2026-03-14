import React from "react";
import ChallanResults from "./ChallanResults";
import { FlowButton } from "../../../components/ui/FlowButton";

export default function DashboardPage({
  results,
  resultsRef,
  onDownload,
  onPay,
  onBackToHome,
  isSignedInUser = false,
}) {
  if (results.length === 0) {
    return (
      <div className="dashboard-shell">
        <div className="dashboard-empty-state">
          <h2>No Reports Found</h2>
          <p>
            {isSignedInUser
              ? "No challans were found for the phone number linked to this account."
              : "Search for a challan, vehicle, or phone number from the home page to view records here."}
          </p>
          <FlowButton
            text={isSignedInUser ? "Go to Home" : "Back to Search"}
            onClick={onBackToHome}
            variant="dark"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Violation Reports</h2>
          <p className="dashboard-subtitle">
            {isSignedInUser
              ? `${results.length} challan record(s) linked to this account.`
              : `${results.length} matching challan record(s) found.`}
          </p>
        </div>
        <FlowButton
          text={isSignedInUser ? "Back Home" : "New Search"}
          onClick={onBackToHome}
          variant="light"
        />
      </div>

      <ChallanResults
        results={results}
        resultsRef={resultsRef}
        onDownload={onDownload}
        onPay={onPay}
      />
    </div>
  );
}
