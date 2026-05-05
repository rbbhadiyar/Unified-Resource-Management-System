import { ReactNode } from "react";
import "./auth.css";

const FEATURES = [
  "Track and issue resources in real-time",
  "Automated overdue alerts and fine tracking",
  "Role-based access for students and admins",
  "Detailed analytics and usage reports",
];

const METRICS = [
  { value: "12k+", label: "items tracked" },
  { value: "98%", label: "return accuracy" },
  { value: "340+", label: "institutions" },
];

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />

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
          Unified Resource Management System, rebuilt for institutions that need fast requests, accountable returns, and beautiful operations.
        </p>

        <div className="auth-brand-preview" aria-hidden="true">
          <div className="auth-preview-head">
            <span>Resource Pulse</span>
            <strong>Live</strong>
          </div>
          <div className="auth-preview-grid">
            {METRICS.map((m) => (
              <div key={m.label}>
                <strong>{m.value}</strong>
                <span>{m.label}</span>
              </div>
            ))}
          </div>
          <div className="auth-preview-bars">
            <span style={{ width: "78%" }} />
            <span style={{ width: "62%" }} />
            <span style={{ width: "46%" }} />
          </div>
        </div>

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
