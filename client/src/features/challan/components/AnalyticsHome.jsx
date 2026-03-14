import React from "react";
import { buildChallanAnalytics } from "../utils/analytics";
import ChallanLogTable from "./ChallanLogTable";

const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export default function AnalyticsHome({ user, challans, isLoading = false, onDownload }) {
  if (isLoading) {
    return (
      <div className="analytics-shell">
        <div className="analytics-loading">Loading your challan analytics...</div>
      </div>
    );
  }

  const analytics = buildChallanAnalytics(challans);
  const maxFrequency = analytics.violationFrequency[0]?.value || 1;

  const cards = [
    { label: "Total Challans", value: analytics.totalChallans, tone: "neutral" },
    { label: "Paid Challans", value: analytics.paidChallans, tone: "paid" },
    { label: "Unpaid Challans", value: analytics.unpaidChallans, tone: "unpaid" },
    { label: "Total Fine Paid", value: formatCurrency(analytics.totalFinePaid), tone: "accent" },
  ];

  return (
    <div className="analytics-shell">
      <div className="analytics-hero">
        <div>
          <p className="analytics-hero__eyebrow">Signed in as {user.name}</p>
          <h2 className="analytics-hero__title">Traffic analytics for {user.phoneNumber}</h2>
          <p className="analytics-hero__subtitle">
            Review your challan status, paid totals, and the most frequent violations linked to this account.
          </p>
        </div>
      </div>

      <div className="analytics-cards">
        {cards.map((card) => (
          <article key={card.label} className={`analytics-card analytics-card--${card.tone}`}>
            <span className="analytics-card__label">{card.label}</span>
            <strong className="analytics-card__value">{card.value}</strong>
          </article>
        ))}
      </div>

      <div className="analytics-grid">
        <section className="analytics-panel">
          <h3 className="analytics-panel__title">Violation Frequency</h3>
          <p className="analytics-panel__subtitle">Different violation types and how often they appear.</p>

          {analytics.violationFrequency.length === 0 ? (
            <div className="analytics-empty">No challans available for this account yet.</div>
          ) : (
            <div className="analytics-bars">
              {analytics.violationFrequency.map((item) => (
                <div key={item.label} className="analytics-bar">
                  <div className="analytics-bar__row">
                    <span className="analytics-bar__label">{item.label}</span>
                    <span className="analytics-bar__value">{item.value}</span>
                  </div>
                  <div className="analytics-bar__track">
                    <div
                      className="analytics-bar__fill"
                      style={{ width: `${(item.value / maxFrequency) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="analytics-panel">
          <h3 className="analytics-panel__title">Account Snapshot</h3>
          <p className="analytics-panel__subtitle">Quick details mapped to your signed-in account.</p>

          <div className="analytics-profile">
            <div className="analytics-profile__item">
              <span>Name</span>
              <strong>{user.name}</strong>
            </div>
            <div className="analytics-profile__item">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
            <div className="analytics-profile__item">
              <span>Phone Number</span>
              <strong>{user.phoneNumber}</strong>
            </div>
            <div className="analytics-profile__item">
              <span>Latest challan count</span>
              <strong>{analytics.totalChallans}</strong>
            </div>
          </div>
        </section>
      </div>

      <ChallanLogTable challans={challans} onDownload={onDownload} />
    </div>
  );
}
