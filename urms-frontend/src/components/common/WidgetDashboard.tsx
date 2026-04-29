import { useState } from "react";
import Layout from "../../components/layout/UserLayout";
import { useToast } from "../../context/ToastContext";

// ─── Types ───────────────────────────────────────────────────────────────────

type AlertType = "warning" | "danger" | "info";
type ReqStatus = "pending" | "approved" | "rejected";

interface Alert {
  id: string;
  type: AlertType;
  text: string;
  time: string;
}

interface PendingRequest {
  id: string;
  initials: string;
  name: string;
  resource: string;
  duration: string;
  colorScheme: "blue" | "amber" | "teal" | "red";
  status: ReqStatus;
}

interface Defaulter {
  id: string;
  initials: string;
  name: string;
  resource: string;
  daysOverdue: number;
  colorScheme: "red" | "amber";
}

interface ActivityItem {
  id: string;
  type: "issue" | "return" | "add" | "fine";
  text: string;
  sub: string;
}

interface UtilisationCategory {
  label: string;
  pct: number;
  color: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const STATS = [
  {
    label: "Total resources",
    value: 120,
    trend: "+4 this month",
    trendUp: true,
    accentColor: "#378ADD",
  },
  {
    label: "Available",
    value: 75,
    trend: "62.5% of total",
    trendUp: true,
    accentColor: "#1D9E75",
  },
  {
    label: "Issued",
    value: 45,
    trend: "37.5% utilised",
    trendUp: false,
    accentColor: "#BA7517",
  },
  {
    label: "Overdue",
    value: 3,
    trend: "needs attention",
    trendUp: false,
    accentColor: "#E24B4A",
    danger: true,
  },
];

const INITIAL_ALERTS: Alert[] = [
  { id: "a1", type: "warning", text: "5 resources low in stock", time: "2h ago" },
  { id: "a2", type: "danger", text: "3 overdue returns pending", time: "1d ago" },
  { id: "a3", type: "info", text: "Maintenance due — Lab printer", time: "Today" },
];

const INITIAL_REQUESTS: PendingRequest[] = [
  { id: "r1", initials: "RK", name: "Ram Kumar", resource: "Dell Laptop", duration: "7 days", colorScheme: "blue", status: "pending" },
  { id: "r2", initials: "PS", name: "Priya Sharma", resource: "MATLAB License", duration: "14 days", colorScheme: "amber", status: "pending" },
  { id: "r3", initials: "AV", name: "Ananya Verma", resource: "Arduino Kit", duration: "3 days", colorScheme: "teal", status: "pending" },
  { id: "r4", initials: "SK", name: "Siddharth K", resource: "HP Laptop", duration: "7 days", colorScheme: "red", status: "pending" },
];

const DEFAULTERS: Defaulter[] = [
  { id: "d1", initials: "MB", name: "Mohit Bajaj", resource: "C++ Book", daysOverdue: 4, colorScheme: "red" },
  { id: "d2", initials: "TN", name: "Tanya Nair", resource: "Arduino Kit", daysOverdue: 2, colorScheme: "amber" },
  { id: "d3", initials: "AK", name: "Arjun Kumar", resource: "C++ Book", daysOverdue: 1, colorScheme: "red" },
];

const ACTIVITIES: ActivityItem[] = [
  { id: "ac1", type: "issue", text: "Laptop issued to Ram Kumar", sub: "Hardware · 7-day loan · 10:23 AM" },
  { id: "ac2", type: "return", text: "OS Book returned by Aditi", sub: "Book · on time · 9:05 AM" },
  { id: "ac3", type: "add", text: "New resource added: Projector", sub: "Equipment · Qty 2 · Yesterday" },
  { id: "ac4", type: "fine", text: "Fine of ₹200 applied — Mohit B", sub: "Overdue · C++ Book · Yesterday" },
];

const UTILISATION: UtilisationCategory[] = [
  { label: "Hardware", pct: 75, color: "#378ADD" },
  { label: "Software", pct: 60, color: "#1D9E75" },
  { label: "Books", pct: 38, color: "#BA7517" },
  { label: "Equipment", pct: 29, color: "#888780" },
];

// ─── Color helpers ────────────────────────────────────────────────────────────

const SCHEME_BG: Record<string, string> = {
  blue: "#E6F1FB", amber: "#FAEEDA", teal: "#E1F5EE", red: "#FCEBEB",
};
const SCHEME_TEXT: Record<string, string> = {
  blue: "#0C447C", amber: "#633806", teal: "#085041", red: "#791F1F",
};

const ALERT_DOT: Record<AlertType, string> = {
  warning: "#BA7517",
  danger: "#E24B4A",
  info: "#378ADD",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const TrendUpIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--w-teal)" strokeWidth="2">
    <polyline points="2,10 6,6 10,9 14,4" />
  </svg>
);

const TrendDownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="var(--w-red)" strokeWidth="2">
    <polyline points="2,4 6,8 10,5 14,10" />
  </svg>
);

const IssueIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--w-teal)" strokeWidth="1.5">
    <polyline points="2,8 6,12 14,4" />
  </svg>
);

const ReturnIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#185FA5" strokeWidth="1.5">
    <path d="M8 2v8M4 7l4 5 4-5" /><line x1="2" y1="14" x2="14" y2="14" />
  </svg>
);

const AddIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--w-amber)" strokeWidth="1.5">
    <circle cx="8" cy="8" r="5" /><line x1="8" y1="5" x2="8" y2="8" /><line x1="8" y1="10" x2="8" y2="11" />
  </svg>
);

const FineIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--w-red)" strokeWidth="1.5">
    <path d="M8 2L2 14h12L8 2z" /><line x1="8" y1="7" x2="8" y2="10" /><line x1="8" y1="12" x2="8" y2="12.5" />
  </svg>
);

const ACTIVITY_ICON: Record<ActivityItem["type"], { icon: React.ReactNode; bg: string }> = {
  issue: { icon: <IssueIcon />, bg: "#E1F5EE" },
  return: { icon: <ReturnIcon />, bg: "#E6F1FB" },
  add: { icon: <AddIcon />, bg: "#FAEEDA" },
  fine: { icon: <FineIcon />, bg: "#FCEBEB" },
};

// ─── Main Component ───────────────────────────────────────────────────────────

const WidgetDashboard = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState<PendingRequest[]>(INITIAL_REQUESTS);

  const handleApprove = (id: string, name: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
    );
    showToast(`Request by ${name} approved.`);
  };

  const handleReject = (id: string, name: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "rejected" } : r))
    );
    showToast(`Request by ${name} rejected.`);
  };

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <Layout>
      {/* ── Header ── */}
      <div style={s.headerRow}>
        <div>
          <h1 style={s.heading}>Smart resource insights</h1>
          <p style={s.subheading}>Live overview · Admin panel</p>
        </div>
        <div style={s.livePill}>
          <span style={s.liveDot} className="w-pulse" />
          Live
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={s.statsGrid}>
        {STATS.map((stat) => (
          <div
            key={stat.label}
            style={{ ...s.statCard, "--card-accent": stat.accentColor } as React.CSSProperties}
            className="w-stat-card"
          >
            <div style={s.statLabel}>{stat.label}</div>
            <div
              style={{
                ...s.statValue,
                color: stat.danger ? "#A32D2D" : "var(--color-text-primary)",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                ...s.statTrend,
                color: stat.trendUp ? "#0F6E56" : "#A32D2D",
              }}
            >
              {stat.trendUp ? <TrendUpIcon /> : <TrendDownIcon />}
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* ── Row 1: Alerts + Pending Requests ── */}
      <div style={s.twoCol}>
        {/* Alerts */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Alerts</span>
            <span style={{ ...s.tag, background: "#FCEBEB", color: "#791F1F" }}>
              {INITIAL_ALERTS.filter((a) => a.type !== "info").length} active
            </span>
          </div>
          <div>
            {INITIAL_ALERTS.map((alert) => (
              <div key={alert.id} style={s.alertItem}>
                <div
                  style={{
                    ...s.alertDot,
                    background: ALERT_DOT[alert.type],
                  }}
                />
                <span style={s.alertText}>{alert.text}</span>
                <span style={s.alertTime}>{alert.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Requests */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Pending requests</span>
            <span style={{ ...s.tag, background: "#FAEEDA", color: "#633806" }}>
              {pendingCount} waiting
            </span>
          </div>
          <div>
            {requests.map((req) => (
              <div key={req.id} style={s.reqItem}>
                <div
                  style={{
                    ...s.avatar,
                    background: SCHEME_BG[req.colorScheme],
                    color: SCHEME_TEXT[req.colorScheme],
                  }}
                >
                  {req.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.reqName}>{req.name}</div>
                  <div style={s.reqSub}>
                    {req.resource} · {req.duration}
                  </div>
                </div>
                {req.status === "pending" ? (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      style={s.approveBtn}
                      onClick={() => handleApprove(req.id, req.name)}
                    >
                      Approve
                    </button>
                    <button
                      style={s.rejectBtn}
                      onClick={() => handleReject(req.id, req.name)}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span
                    style={{
                      ...s.tag,
                      background: req.status === "approved" ? "#E1F5EE" : "#FCEBEB",
                      color: req.status === "approved" ? "#085041" : "#791F1F",
                    }}
                  >
                    {req.status === "approved" ? "Approved" : "Rejected"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: Chart + Utilisation ── */}
      <div style={s.twoCol}>
        {/* Inventory breakdown (SVG bar chart — no external lib needed) */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Inventory breakdown</span>
            <div style={{ display: "flex", gap: 12 }}>
              <Legend color="#1D9E75" label="Available" />
              <Legend color="#378ADD" label="Issued" />
            </div>
          </div>
          <div style={{ padding: "16px 16px 12px" }}>
            <InlineBarChart />
          </div>
        </div>

        {/* Utilisation */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Category utilisation</span>
          </div>
          <div style={{ padding: "12px 16px 8px" }}>
            {UTILISATION.map((cat) => (
              <div key={cat.label} style={{ marginBottom: 14 }}>
                <div style={s.utilRow}>
                  <span style={s.utilLabel}>{cat.label}</span>
                  <span style={s.utilPct}>{cat.pct}%</span>
                </div>
                <div style={s.utilTrack}>
                  <div
                    style={{
                      ...s.utilFill,
                      width: `${cat.pct}%`,
                      background: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: Defaulters + Activity ── */}
      <div style={s.twoCol}>
        {/* Defaulters */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Overdue defaulters</span>
            <span style={{ ...s.tag, background: "#FCEBEB", color: "#791F1F" }}>
              {DEFAULTERS.length} users
            </span>
          </div>
          <div>
            {DEFAULTERS.map((def) => (
              <div key={def.id} style={s.defItem}>
                <div
                  style={{
                    ...s.avatar,
                    background: SCHEME_BG[def.colorScheme],
                    color: SCHEME_TEXT[def.colorScheme],
                  }}
                >
                  {def.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.reqName}>{def.name}</div>
                  <div style={s.reqSub}>{def.resource}</div>
                </div>
                <span style={{ ...s.tag, background: "#FCEBEB", color: "#791F1F" }}>
                  +{def.daysOverdue} {def.daysOverdue === 1 ? "day" : "days"}
                </span>
                <button
                  style={s.notifyBtn}
                  onClick={() => showToast(`Reminder sent to ${def.name}`)}
                >
                  Remind
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div style={s.card}>
          <div style={s.cardHead}>
            <span style={s.cardTitle}>Recent activity</span>
          </div>
          <div>
            {ACTIVITIES.map((act) => {
              const { icon, bg } = ACTIVITY_ICON[act.type];
              return (
                <div key={act.id} style={s.actItem}>
                  <div style={{ ...s.actIcon, background: bg }}>{icon}</div>
                  <div>
                    <div style={s.actText}>{act.text}</div>
                    <div style={s.actSub}>{act.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ ...s.card, marginTop: 12 }}>
        <div style={s.cardHead}>
          <span style={s.cardTitle}>Quick actions</span>
        </div>
        <div style={s.actionsGrid}>
          <ActionButton
            label="Add resource"
            sub="Register new item"
            primary
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" strokeWidth="2">
                <circle cx="8" cy="8" r="6" stroke="white" />
                <line x1="8" y1="5" x2="8" y2="11" stroke="white" />
                <line x1="5" y1="8" x2="11" y2="8" stroke="white" />
              </svg>
            }
            onClick={() => showToast("Add resource — navigate to /admin/add-resource")}
          />
          <ActionButton
            label="View all requests"
            sub={`${pendingCount} pending`}
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="12" height="12" rx="2" />
                <line x1="5" y1="6" x2="11" y2="6" />
                <line x1="5" y1="9" x2="9" y2="9" />
              </svg>
            }
            onClick={() => showToast("Navigate to /admin/requests")}
          />
          <ActionButton
            label="Check defaulters"
            sub={`${DEFAULTERS.length} overdue`}
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="8" r="6" />
                <line x1="8" y1="5" x2="8" y2="8" />
                <line x1="8" y1="10.5" x2="8" y2="11" />
              </svg>
            }
            onClick={() => showToast("Navigate to /admin/defaulters")}
          />
          <ActionButton
            label="Export report"
            sub="Monthly summary"
            icon={
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="2,12 5,8 8,10 11,5 14,7" />
                <line x1="2" y1="14" x2="14" y2="14" />
              </svg>
            }
            onClick={() => showToast("Generating monthly report…")}
          />
        </div>
      </div>
    </Layout>
  );
};

// ─── Helper components ────────────────────────────────────────────────────────

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--color-text-secondary)" }}>
    <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: "inline-block" }} />
    {label}
  </span>
);

const InlineBarChart = () => {
  const categories = ["Hardware", "Books", "Software", "Equipment"];
  const available = [20, 30, 15, 10];
  const issued = [15, 18, 8, 4];
  const max = 35;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {categories.map((cat, i) => (
        <div key={cat}>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 5 }}>{cat}</div>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    height: 10,
                    width: `${(available[i] / max) * 100}%`,
                    background: "#1D9E75",
                    borderRadius: 3,
                    transition: "width .6s ease",
                  }}
                />
                <span style={{ fontSize: 10, color: "#0F6E56", fontWeight: 500 }}>{available[i]}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div
                  style={{
                    height: 10,
                    width: `${(issued[i] / max) * 100}%`,
                    background: "#378ADD",
                    borderRadius: 3,
                    transition: "width .6s ease",
                  }}
                />
                <span style={{ fontSize: 10, color: "#185FA5", fontWeight: 500 }}>{issued[i]}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface ActionButtonProps {
  label: string;
  sub: string;
  icon: React.ReactNode;
  primary?: boolean;
  onClick: () => void;
}

const ActionButton = ({ label, sub, icon, primary, onClick }: ActionButtonProps) => (
  <button
    onClick={onClick}
    style={primary ? s.actionBtnPrimary : s.actionBtn}
  >
    {icon}
    <span style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
      <span>{label}</span>
      <span style={{ fontSize: 10, fontWeight: 400, opacity: 0.7, marginTop: 1 }}>{sub}</span>
    </span>
  </button>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "1.5rem",
    gap: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: 500,
    color: "var(--color-text-primary)",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 13,
    color: "var(--color-text-secondary)",
  },
  livePill: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "var(--color-text-secondary)",
    padding: "4px 10px",
    borderRadius: 20,
    border: "0.5px solid var(--color-border-tertiary)",
    background: "var(--color-background-secondary)",
    whiteSpace: "nowrap",
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#1D9E75",
    display: "inline-block",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 10,
    marginBottom: "1.25rem",
  },
  statCard: {
    background: "var(--color-background-secondary)",
    borderRadius: "var(--border-radius-md)",
    padding: "14px 16px",
    position: "relative",
    overflow: "hidden",
    borderTop: "2.5px solid var(--card-accent, #378ADD)",
  },
  statLabel: {
    fontSize: 11,
    color: "var(--color-text-secondary)",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 500,
    lineHeight: 1,
    marginBottom: 6,
  },
  statTrend: {
    fontSize: 11,
    display: "flex",
    alignItems: "center",
    gap: 3,
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 12,
  },
  card: {
    background: "var(--color-background-primary)",
    border: "0.5px solid var(--color-border-tertiary)",
    borderRadius: "var(--border-radius-lg)",
    overflow: "hidden",
  },
  cardHead: {
    padding: "12px 16px",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-primary)",
  },
  tag: {
    fontSize: 10,
    padding: "2px 8px",
    borderRadius: 10,
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  alertItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 16px",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
  },
  alertDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    flexShrink: 0,
  },
  alertText: {
    fontSize: 13,
    color: "var(--color-text-primary)",
    flex: 1,
  },
  alertTime: {
    fontSize: 11,
    color: "var(--color-text-secondary)",
  },
  reqItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 16px",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 500,
    flexShrink: 0,
  },
  reqName: {
    fontSize: 13,
    color: "var(--color-text-primary)",
  },
  reqSub: {
    fontSize: 11,
    color: "var(--color-text-secondary)",
    marginTop: 1,
  },
  approveBtn: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid #1D9E75",
    background: "#E1F5EE",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500,
    color: "#085041",
  },
  rejectBtn: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-secondary)",
    background: "var(--color-background-secondary)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500,
    color: "var(--color-text-secondary)",
  },
  defItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 16px",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
  },
  notifyBtn: {
    fontSize: 11,
    padding: "4px 10px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-secondary)",
    background: "var(--color-background-secondary)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 500,
    color: "var(--color-text-secondary)",
    marginLeft: 4,
  },
  actItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "9px 16px",
    borderBottom: "0.5px solid var(--color-border-tertiary)",
  },
  actIcon: {
    width: 28,
    height: 28,
    borderRadius: "var(--border-radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actText: {
    fontSize: 13,
    color: "var(--color-text-primary)",
    lineHeight: 1.4,
  },
  actSub: {
    fontSize: 11,
    color: "var(--color-text-secondary)",
    marginTop: 2,
  },
  utilRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  utilLabel: {
    fontSize: 12,
    color: "var(--color-text-secondary)",
  },
  utilPct: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--color-text-primary)",
  },
  utilTrack: {
    height: 7,
    background: "var(--color-background-secondary)",
    borderRadius: 4,
    overflow: "hidden",
  },
  utilFill: {
    height: "100%",
    borderRadius: 4,
    transition: "width .6s ease",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
    padding: "12px 16px",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid var(--color-border-secondary)",
    background: "var(--color-background-secondary)",
    cursor: "pointer",
    fontSize: 12.5,
    fontFamily: "inherit",
    fontWeight: 500,
    color: "var(--color-text-primary)",
    width: "100%",
    textAlign: "left",
  },
  actionBtnPrimary: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: "var(--border-radius-md)",
    border: "0.5px solid #185FA5",
    background: "#185FA5",
    cursor: "pointer",
    fontSize: 12.5,
    fontFamily: "inherit",
    fontWeight: 500,
    color: "#ffffff",
    width: "100%",
    textAlign: "left",
  },
};

export default WidgetDashboard;