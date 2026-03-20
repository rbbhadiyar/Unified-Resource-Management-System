import { Link, useLocation } from "react-router-dom";

const AdminSidebar = () => {
  const location = useLocation();

  const nav = [
    { name: "Dashboard", path: "/admin/dashboard" },
    { name: "Resources", path: "/admin/resources" },
    { name: "Requests", path: "/admin/requests" },
    { name: "Users", path: "/admin/users" },
    { name: "Defaulters", path: "/admin/defaulters" },
    { name: "Rules", path: "/admin/rules" },
  ];

  return (
    <div className="sidebar">

      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">⚙️</div>
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
            className={`nav-item ${
              location.pathname === item.path ? "active" : ""
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

    </div>
  );
};

export default AdminSidebar;