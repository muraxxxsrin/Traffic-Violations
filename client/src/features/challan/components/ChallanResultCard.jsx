import React from "react";
import { Download } from "lucide-react";
import { FlowButton } from "../../../components/ui/FlowButton";
import { formatMongoDate } from "../utils/formatters";

export default function ChallanResultCard({ challan, onDownload, onPay }) {
  const isPaid = challan.payment_status?.toLowerCase() === "paid";
  const statusLabel = isPaid ? "PAID" : "UNPAID";
  const footerLabel =
    isPaid && challan.paid_at ? `Paid on ${formatMongoDate(challan.paid_at)}` : "Pending payment";

  return (
    <article className={`dashboard-card ${isPaid ? "is-paid" : "is-unpaid"}`}>
      <div className="dashboard-card__content">
        <div className="dashboard-card__meta">
          <span className={`dashboard-card__status ${isPaid ? "is-paid" : "is-unpaid"}`}>
            {statusLabel}
          </span>
          <span className="dashboard-card__id">CHALLAN ID: {challan.challan_id}</span>
        </div>

        <div className="dashboard-card__topline">
          <h3 className="dashboard-card__title">{challan.violation_type || "Traffic violation"}</h3>
          <button
            className="dashboard-card__download"
            onClick={() => onDownload(challan)}
            title="Download Report & Receipt"
          >
            <Download size={18} />
          </button>
        </div>

        <div className="dashboard-card__grid">
          <div className="dashboard-card__metric">
            <span className="dashboard-card__label">Fine Amount</span>
            <strong className="dashboard-card__value">&#8377;{challan.fine_amount}</strong>
          </div>
          <div className="dashboard-card__metric">
            <span className="dashboard-card__label">Location</span>
            <strong className="dashboard-card__value">{challan.location_name || "Unknown location"}</strong>
          </div>
          <div className="dashboard-card__metric">
            <span className="dashboard-card__label">Vehicle</span>
            <strong className="dashboard-card__value">{challan.plate_clean || "N/A"}</strong>
          </div>
          <div className="dashboard-card__metric">
            <span className="dashboard-card__label">Phone</span>
            <strong className="dashboard-card__value">{challan.phone_number || "N/A"}</strong>
          </div>
        </div>

        <div className={`dashboard-card__footer ${isPaid ? "is-paid" : "is-unpaid"}`}>
          <span>{footerLabel}</span>
          {!isPaid && (
            <FlowButton
              text={`Pay Now (₹${challan.fine_amount})`}
              onClick={() => onPay(challan)}
              variant="orange"
              size="sm"
            />
          )}
        </div>
      </div>

      <div className="dashboard-card__media">
        {challan.violation_image_url ? (
          <img src={challan.violation_image_url} alt="evidence" className="dashboard-card__image" />
        ) : (
          <div className="dashboard-card__image dashboard-card__image--placeholder">
            No evidence image
          </div>
        )}
      </div>
    </article>
  );
}
