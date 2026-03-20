import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Topbar = ({ title }: { title: string }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // 🔥 Role-based notifications
  const adminNotifications = [
    "New request pending",
    "Resource stock low",
    "User overdue return",
  ];

  const userNotifications = [
    "Your request approved",
    "Return due tomorrow",
    "New resource available",
  ];

  const notifications =
    user?.role === "admin" ? adminNotifications : userNotifications;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="topbar">
      <div className="topbar-brand">URMS</div>
      <div className="topbar-sep">/</div>
      <div className="topbar-page">{title}</div>

      <div className="topbar-right">

        {/* 🔔 Notifications */}
        <div style={{ position: "relative" }}>
          <button
            className="topbar-icon-btn"
            onClick={() => setOpen(!open)}
          >
            🔔
            <span className="notif-dot"></span>
          </button>

          {open && (
            <div
              style={{
                position: "absolute",
                top: "40px",
                right: 0,
                width: "260px",
                background: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                padding: "10px",
                zIndex: 50
              }}
            >
              {notifications.map((n, i) => (
                <div
                  key={i}
                  style={{
                    padding: "8px",
                    borderBottom: "1px solid #eee",
                    fontSize: "13px"
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 👤 Role label (nice UX touch) */}
        <div
          style={{
            fontSize: "12px",
            color: "#64748b",
            marginRight: "8px"
          }}
        >
          {user?.role?.toUpperCase()}
        </div>

        {/* 🚪 Logout */}
        <button className="btn-outline btn-sm" onClick={handleLogout}>
          Logout
        </button>

      </div>
    </div>
  );
};

export default Topbar;