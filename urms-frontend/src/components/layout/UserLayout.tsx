import { ReactNode, useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useShellStats } from "../../context/ShellStatsContext";
import Sidebar from "./Sidebar";

const PAGE_LABELS: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/resources": "Browse Resources",
  "/my-resources": "My Resources",
  "/requests": "Request History",
  "/notifications": "Notifications",
  "/profile": "Profile",
  "/feedback": "Feedback",
};

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Layout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const {
    unreadNotifications,
    notificationPreview,
    markAllNotificationsRead,
    markNotificationRead,
  } = useShellStats();
  const pageLabel = PAGE_LABELS[location.pathname] ?? "Page";

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <div className="topbar">
          <span className="topbar-brand">Unified Resource Management</span>
          <span className="topbar-sep">›</span>
          <span className="topbar-page">{pageLabel}</span>

          <div className="topbar-right">
            <button type="button" className="topbar-icon-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            <div style={{ position: "relative" }} ref={notifRef}>
              <button
                type="button"
                className="topbar-icon-btn"
                onClick={() => setNotifOpen((o) => !o)}
                aria-label="Notifications"
              >
                <BellIcon />
                {unreadNotifications > 0 && <span className="notif-dot" />}
              </button>

              {notifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <span className="notif-dropdown-title">Notifications</span>
                    {unreadNotifications > 0 && (
                      <button type="button" className="notif-dropdown-mark" onClick={() => void markAllNotificationsRead()}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notif-dropdown-list">
                    {notificationPreview.length === 0 && (
                      <div style={{ padding: 16, fontSize: 13, color: "var(--text-muted)" }}>No notifications yet.</div>
                    )}
                    {notificationPreview.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className={`notif-dropdown-item${n.unread ? " unread" : ""}`}
                        onClick={() => {
                          if (n.unread) void markNotificationRead(n.id);
                          navigate("/notifications");
                          setNotifOpen(false);
                        }}
                        style={{
                          width: "100%",
                          border: "none",
                          background: "transparent",
                          font: "inherit",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <span className="notif-dropdown-ico">{n.icon}</span>
                        <div className="notif-dropdown-body">
                          <div className="notif-dropdown-item-title">{n.title}</div>
                          <div className="notif-dropdown-item-sub">{n.sub}</div>
                        </div>
                        <span className="notif-dropdown-time">{n.time}</span>
                      </button>
                    ))}
                  </div>
                  <div className="notif-dropdown-footer">
                    <button
                      type="button"
                      className="notif-dropdown-view"
                      onClick={() => {
                        navigate("/notifications");
                        setNotifOpen(false);
                      }}
                    >
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button type="button" className="btn-outline btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
