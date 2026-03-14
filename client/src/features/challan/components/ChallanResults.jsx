import React from "react";
import ChallanResultCard from "./ChallanResultCard";

export default function ChallanResults({ results, resultsRef, onDownload, onPay }) {
  if (results.length === 0) return null;

  return (
    <div className="results-container" ref={resultsRef}>
      {results.map((challan) => (
        <ChallanResultCard
          key={challan._id?.$oid || challan._id}
          challan={challan}
          onDownload={onDownload}
          onPay={onPay}
        />
      ))}
    </div>
  );
}
