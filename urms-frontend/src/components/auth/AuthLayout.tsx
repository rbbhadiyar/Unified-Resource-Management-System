import { ReactNode } from "react";
import "./auth.css";

const FEATURES = [
  "Track and issue resources in real-time",
  "Automated overdue alerts and fine tracking",
  "Role-based access for students and admins",
  "Detailed analytics and usage reports",
];

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="auth-page">

      {/* ── Left brand panel ── */}
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <div className="auth-brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
          </div>
          <span className="auth-brand-name">URMS</span>
        </div>

        <p className="auth-brand-tagline">
          Unified Resource Management System — built for institutions that move fast.
        </p>

        <div className="auth-brand-features">
          {FEATURES.map((f) => (
            <div key={f} className="auth-brand-feat">
              <span className="auth-brand-feat-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-right">
        <div className="auth-card">
          {children}
        </div>
      </div>

    </div>
  );
};

export default AuthLayout;
