import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useShellStats } from "../../context/ShellStatsContext";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pendingRequestsCount, pendingReturnsCount } = useShellStats();

  const nav = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Resources", path: "/admin/resources" },
    { name: "Requests", path: "/admin/requests", badge: pendingRequestsCount, warn: true },
    { name: "Pending returns", path: "/admin/returns", badge: pendingReturnsCount, warn: true },
    { name: "Users", path: "/admin/users" },
    { name: "Defaulters", path: "/admin/defaulters" },
    { name: "Rules", path: "/admin/rules" },
    { name: "Feedback", path: "/admin/feedback" },
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
