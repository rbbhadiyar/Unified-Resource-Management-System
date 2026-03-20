import Layout from "../../components/layout/UserLayout";

interface Notification {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  unread: boolean;
}

const notifications: Notification[] = [
  {
    id: "N001",
    icon: "⚠️",
    title: "C++ Programming book is overdue",
    subtitle: "Due date was 8 May. A fine of ₹200 has been applied to your account.",
    time: "Today",
    unread: true,
  },
  {
    id: "N002",
    icon: "✅",
    title: "MS-Office License request approved",
    subtitle: "Your request has been approved. Collect from Lab C, Room 204.",
    time: "Yesterday",
    unread: true,
  },
  {
    id: "N003",
    icon: "📦",
    title: "Dell Laptop issued to you",
    subtitle: "Resource successfully issued. Due back by 17 May 2025.",
    time: "10 May",
    unread: false,
  },
  {
    id: "N004",
    icon: "🔔",
    title: "OS Book return confirmed",
    subtitle: "Thank you for returning the book on time. No fines applied.",
    time: "11 May",
    unread: false,
  },
  {
    id: "N005",
    icon: "📋",
    title: "MS-Office License request received",
    subtitle: "Your request has been received and is under review by the administrator.",
    time: "8 May",
    unread: false,
  },
];

const Notifications = () => {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Layout>
      <div className="page-header">
        <h1>Notifications</h1>
        <p>
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
            : "You're all caught up!"}
        </p>
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 12,
        }}
      >
        {["All", "Unread", "Alerts"].map((tab) => (
          <button
            key={tab}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: tab === "All" ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: tab === "All" ? "var(--accent-light)" : "var(--surface)",
              color: tab === "All" ? "var(--accent)" : "var(--text-muted)",
              fontSize: 13,
              fontFamily: "var(--font)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="notif-list">
        {notifications.map((n) => (
          <div key={n.id} className={`notif-item${n.unread ? " unread" : ""}`}>
            <div className="notif-ico">{n.icon}</div>
            <div style={{ flex: 1 }}>
              <div className="notif-text">{n.title}</div>
              <div className="notif-sub">{n.subtitle}</div>
            </div>
            <div className="notif-time">{n.time}</div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Notifications;