import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useShellStats } from "../../context/ShellStatsContext";

const Icon = ({ name }: { name: string }) => {
  const paths: Record<string, string> = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    resources: "M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z",
    requests: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm1 14H8v-2h7v2zm1-4H8v-2h8v2zm-3-3V3.5L18.5 9H13z",
    returns: "M12 5V2L7 7l5 5V8c3.31 0 6 2.69 6 6 0 1.01-.25 1.96-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 14c0-4.42-3.58-8-8-8zm-6 5.2L4.54 8.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l5-5-5-5v4c-3.31 0-6-2.69-6-6 0-.63.1-1.23.28-1.8z",
    users: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zM8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    defaulters: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
    rules: "M12 2 4 5v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V5l-8-3zm-1 14-4-4 1.4-1.4 2.6 2.6 5.6-5.6L18 9l-7 7z",
    feedback: "M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z",
  };

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
};

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pendingRequestsCount, pendingReturnsCount } = useShellStats();

  const nav = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },
    { name: "Resources", path: "/admin/resources", icon: "resources" },
    { name: "Requests", path: "/admin/requests", icon: "requests", badge: pendingRequestsCount, warn: true },
    { name: "Pending returns", path: "/admin/returns", icon: "returns", badge: pendingReturnsCount, warn: true },
    { name: "Users", path: "/admin/users", icon: "users" },
    { name: "Defaulters", path: "/admin/defaulters", icon: "defaulters" },
    { name: "Rules", path: "/admin/rules", icon: "rules" },
    { name: "Feedback", path: "/admin/feedback", icon: "feedback" },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24" fill="white" width="16" height="16">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-text">Admin Panel</div>
            <div className="sidebar-logo-sub">URMS</div>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        {nav.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item${location.pathname === item.path ? " active" : ""}`}
          >
            <Icon name={item.icon} />
            {item.name}
            {item.badge && item.badge > 0 ? (
              <span className={item.warn ? "nav-badge warn" : "nav-badge"}>{item.badge}</span>
            ) : null}
          </Link>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-pill" onClick={() => navigate("/admin/profile")} title="View profile" role="presentation">
          <div className="user-avatar" style={{ fontSize: 11 }}>
            {user?.name?.slice(0, 2).toUpperCase() ?? "AD"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{user?.name ?? "Admin"}</div>
            <div className="user-role">Administrator</div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
