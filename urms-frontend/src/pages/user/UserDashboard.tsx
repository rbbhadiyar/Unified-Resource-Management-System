import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/UserLayout";


const stats = [
  {
    label: "Issued Resources",
    value: "3",
    sub: "Active borrowings",
    accent: "#2563eb",
    iconBg: "#eff6ff",
    icon: (
      <svg viewBox="0 0 24 24" fill="#2563eb">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
      </svg>
    ),
  },
  {
    label: "Pending Requests",
    value: "1",
    sub: "Awaiting approval",
    accent: "#d97706",
    iconBg: "#fffbeb",
    icon: (
      <svg viewBox="0 0 24 24" fill="#d97706">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
  },
  {
    label: "Notifications",
    value: "2",
    sub: "Unread alerts",
    accent: "#7c3aed",
    iconBg: "#f5f3ff",
    icon: (
      <svg viewBox="0 0 24 24" fill="#7c3aed">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
      </svg>
    ),
  },
  {
    label: "Outstanding Fine",
    value: "₹200",
    sub: "Due immediately",
    accent: "#dc2626",
    iconBg: "#fef2f2",
    icon: (
      <svg viewBox="0 0 24 24" fill="#dc2626">
        <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
      </svg>
    ),
  },
];

const recentActivity = [
  { color: "#16a34a", text: "Dell Laptop issued successfully", time: "Today, 10:23 AM" },
  { color: "#d97706", text: "MS-Office License request pending approval", time: "Yesterday, 3:15 PM" },
  { color: "#dc2626", text: "Fine of ₹200 applied — OS Book overdue", time: "12 May, 9:00 AM" },
  { color: "#0369a1", text: "OS Book returned", time: "11 May, 4:30 PM" },
];

const quickResources = [
  { icon: "💻", name: "Dell Laptop", type: "Hardware", available: 3, bg: "#eff6ff", low: true },
  { icon: "📖", name: "OS Book", type: "Book", available: 7, bg: "#fffbeb", low: false },
  { icon: "🖥️", name: "MS-Office License", type: "Software", available: 10, bg: "#f0fdf4", low: false },
];

const UserDashboard = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, Ram. Here's your overview for today.</p>
      </div>

      {/* Fine Alert */}
      <div className="fine-alert">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
        </svg>
        <span>
          You have an outstanding fine of <strong>₹200</strong>. Please clear it
          to continue borrowing resources.
        </span>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ "--card-accent": s.accent } as React.CSSProperties}
          >
            <div className="stat-icon" style={{ background: s.iconBg }}>
              {s.icon}
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="dash-grid">
        {/* Recent Activity */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Recent Activity</span>
            <button className="panel-link" onClick={() => navigate("/requests")}>
              View all
            </button>
          </div>
          <div>
            {recentActivity.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-dot" style={{ background: a.color }} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Resources */}
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Available Resources</span>
            <button className="panel-link" onClick={() => navigate("/resources")}>
              Browse all
            </button>
          </div>
          <div>
            {quickResources.map((r) => (
              <div key={r.name} className="resource-list-item">
                <div className="resource-thumb" style={{ background: r.bg }}>
                  {r.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.type}</div>
                </div>
                <div className={`avail-badge${r.low ? " low" : ""}`}>
                  {r.available} left
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;