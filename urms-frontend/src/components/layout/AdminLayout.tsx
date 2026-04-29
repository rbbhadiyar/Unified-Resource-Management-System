import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useShellStats } from "../../context/ShellStatsContext";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/resources": "Resources",
  "/admin/requests": "Requests",
  "/admin/returns": "Pending returns",
  "/admin/users": "Users",
  "/admin/defaulters": "Defaulters",
  "/admin/rules": "Rules",
  "/admin/feedback": "Feedback",
  "/admin/profile": "Profile",
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

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const {
    unreadNotifications,
    notificationPreview,
    markAllNotificationsRead,
    markNotificationRead,
  } = useShellStats();

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

  const pageTitle = PAGE_TITLES[location.pathname] ?? "Admin Panel";

  return (
    <div className="app-layout">
      <AdminSidebar />

      <div className="main-area">
        <div className="topbar">
          <div className="topbar-brand">URMS</div>
          <span className="topbar-sep">›</span>
          <span className="topbar-page">{pageTitle}</span>

          <div className="topbar-right">
            <button type="button" className="topbar-icon-btn" onClick={toggleTheme} title="Toggle theme">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>

            <div style={{ position: "relative" }} ref={notifRef}>
              <button type="button" className="topbar-icon-btn" onClick={() => setNotifOpen((o) => !o)} aria-label="Notifications">
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
                    <button type="button" className="notif-dropdown-view" onClick={() => void markAllNotificationsRead()}>
                      Mark all read and close
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="user-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
              {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
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

export default AdminLayout;
