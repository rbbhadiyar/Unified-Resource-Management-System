import Layout from "../../components/layout/UserLayout";

type ReqStatus = "approved" | "pending" | "rejected";
type ResourceType = "Hardware" | "Software" | "Book";

interface RequestRecord {
  id: string;
  resourceName: string;
  resourceType: ResourceType;
  icon: string;
  iconBg: string;
  submittedDate: string;
  loanPeriod: string;
  status: ReqStatus;
}

const requestHistory: RequestRecord[] = [
  {
    id: "REQ-001",
    resourceName: "Operating System Book",
    resourceType: "Book",
    icon: "📖",
    iconBg: "#f0fdf4",
    submittedDate: "2 May 2025",
    loanPeriod: "7-day loan",
    status: "approved",
  },
  {
    id: "REQ-002",
    resourceName: "Dell Laptop",
    resourceType: "Hardware",
    icon: "💻",
    iconBg: "#eff6ff",
    submittedDate: "10 May 2025",
    loanPeriod: "7-day loan",
    status: "approved",
  },
  {
    id: "REQ-003",
    resourceName: "MS-Office License",
    resourceType: "Software",
    icon: "🖥️",
    iconBg: "#f0fdf4",
    submittedDate: "8 May 2025",
    loanPeriod: "14-day loan",
    status: "approved",
  },
  {
    id: "REQ-004",
    resourceName: "HP Laptop",
    resourceType: "Hardware",
    icon: "💻",
    iconBg: "#fffbeb",
    submittedDate: "15 May 2025",
    loanPeriod: "7-day loan",
    status: "pending",
  },
];

const STATUS_LABEL: Record<ReqStatus, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

const STATUS_PILL_CLASS: Record<ReqStatus, string> = {
  approved: "status-pill approved",
  pending: "status-pill pending",
  rejected: "status-pill overdue",
};

const RequestHistory = () => {
  const approvedCount = requestHistory.filter((r) => r.status === "approved").length;
  const pendingCount = requestHistory.filter((r) => r.status === "pending").length;

  return (
    <Layout>
      <div className="page-header">
        <h1>Request History</h1>
        <p>All resource requests you have submitted.</p>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div
          style={{
            background: "var(--success-bg)",
            color: "var(--success)",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {approvedCount} Approved
        </div>
        {pendingCount > 0 && (
          <div
            style={{
              background: "var(--warning-bg)",
              color: "var(--warning)",
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {pendingCount} Pending
          </div>
        )}
        <div
          style={{
            background: "var(--page-bg)",
            color: "var(--text-muted)",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 500,
            border: "1px solid var(--border)",
          }}
        >
          {requestHistory.length} Total
        </div>
      </div>

      <div className="req-list">
        {requestHistory.map((r) => (
          <div key={r.id} className="req-item">
            <div className="req-icon" style={{ background: r.iconBg }}>
              {r.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div className="req-resource">{r.resourceName}</div>
              <div className="req-date">Submitted: {r.submittedDate}</div>
              <div className="req-meta">
                {r.resourceType} · {r.loanPeriod} · {r.id}
              </div>
            </div>
            <span className={STATUS_PILL_CLASS[r.status]}>
              {STATUS_LABEL[r.status]}
            </span>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default RequestHistory;