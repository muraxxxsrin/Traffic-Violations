import React from "react";
import AnimatedGridPattern from "../../../components/ui/AnimatedGridPattern";

export default function AuthShell({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="auth-shell-wrap">
      <AnimatedGridPattern
        className="auth-shell__grid"
        numSquares={90}
        maxOpacity={0.48}
        duration={3.6}
        repeatDelay={0.15}
      />

      <div className="auth-shell">
        <div className="auth-brand">
          <div className="auth-brand__chip">RedLight Account</div>
          <h2 className="auth-brand__title">{title}</h2>
          <p className="auth-brand__subtitle">{subtitle}</p>
          <div className="auth-brand__meta">
            <span className="auth-brand__eyebrow">{eyebrow}</span>
            <span className="auth-brand__dot" />
            <span className="auth-brand__support">Secure access for challan search and dashboard tools</span>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-panel__card">
            {children}
            {footer}
          </div>
        </div>
      </div>
    </div>
  );
}
