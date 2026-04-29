import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useShellStats } from "../../context/ShellStatsContext";

const DashIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const BrowseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
  </svg>
);

const MyResIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
  </svg>
);

const ReqIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const FeedbackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12l-3-3H7V9h3l3-3 3 3h3v2h-3l-3 3z" />
  </svg>
);

const navItem = ({ isActive }: { isActive: boolean }) => `nav-item${isActive ? " active" : ""}`;

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeBorrowCount, unreadNotifications, pendingRequestsCount } = useShellStats();

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
            </svg>
          </div>
          <div>
            <div className="sidebar-logo-text">URMS</div>
            <div className="sidebar-logo-sub">Resource Manager</div>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">Menu</div>

        <NavLink to="/dashboard" className={navItem}>
          <DashIcon />
          Dashboard
        </NavLink>
        <NavLink to="/resources" className={navItem}>
          <BrowseIcon />
          Browse Resources
        </NavLink>
        <NavLink to="/my-resources" className={navItem}>
          <MyResIcon />
          My Resources
          {activeBorrowCount > 0 ? <span className="nav-badge">{activeBorrowCount}</span> : null}
        </NavLink>
        <NavLink to="/requests" className={navItem}>
          <ReqIcon />
          Request History
          {pendingRequestsCount > 0 ? <span className="nav-badge warn">{pendingRequestsCount}</span> : null}
        </NavLink>
        <NavLink to="/notifications" className={navItem}>
          <BellIcon />
          Notifications
          {unreadNotifications > 0 ? <span className="nav-badge warn">{unreadNotifications}</span> : null}
        </NavLink>
        <NavLink to="/profile" className={navItem}>
          <UserIcon />
          Profile
        </NavLink>
        <NavLink to="/feedback" className={navItem}>
          <FeedbackIcon />
          Feedback
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <div className="user-pill" onClick={() => navigate("/profile")} title="View profile" role="presentation">
          <div className="user-avatar">{user?.name?.slice(0, 2).toUpperCase() ?? "U"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name">{user?.name ?? "User"}</div>
            <div className="user-role">{user?.role === "admin" ? "Admin" : "Student"}</div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{ flexShrink: 0 }}>
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
