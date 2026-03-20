import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/resources": "Browse Resources",
  "/my-resources": "My Resources",
  "/requests": "Request History",
  "/notifications": "Notifications",
  "/profile": "Profile",
};

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageLabel = PAGE_LABELS[location.pathname] ?? "Page";

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        {/* Topbar */}
        <div className="topbar">
          <span className="topbar-brand">Unified Resource Management</span>
          <span className="topbar-sep">›</span>
          <span className="topbar-page">{pageLabel}</span>
          <div className="topbar-right">
            <button
              className="topbar-icon-btn"
              onClick={() => navigate("/notifications")}
              aria-label="Notifications"
            >
              <BellIcon />
              <span className="notif-dot" />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;