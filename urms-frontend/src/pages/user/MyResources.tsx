import Layout from "../../components/layout/UserLayout";
import { useToast } from "../../context/ToastContext";

type Status = "issued" | "returned" | "overdue";
type ResourceType = "Hardware" | "Software" | "Book";

interface IssuedResource {
  id: string;
  name: string;
  type: ResourceType;
  issueDate: string;
  dueDate: string;
  status: Status;
}

const issuedResources: IssuedResource[] = [
  {
    id: "R001",
    name: "Dell Laptop",
    type: "Hardware",
    issueDate: "10 May 2025",
    dueDate: "17 May 2025",
    status: "issued",
  },
  {
    id: "R002",
    name: "MS-Office License",
    type: "Software",
    issueDate: "8 May 2025",
    dueDate: "22 May 2025",
    status: "issued",
  },
  {
    id: "R003",
    name: "C++ Programming",
    type: "Book",
    issueDate: "1 May 2025",
    dueDate: "8 May 2025",
    status: "overdue",
  },
  {
    id: "R004",
    name: "OS Book",
    type: "Book",
    issueDate: "2 May 2025",
    dueDate: "9 May 2025",
    status: "returned",
  },
];

const TYPE_ICON: Record<ResourceType, string> = {
  Hardware: "💻",
  Software: "🖥️",
  Book: "📖",
};

const StatusPill = ({ status }: { status: Status }) => (
  <span className={`status-pill ${status}`}>
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

const MyResources = () => {
  const { showToast } = useToast();

  const handleReturn = (name: string) => {
    showToast(`Return request for "${name}" submitted.`);
  };

  const activeCount = issuedResources.filter((r) => r.status === "issued").length;
  const overdueCount = issuedResources.filter((r) => r.status === "overdue").length;

  return (
    <Layout>
      <div className="page-header">
        <h1>My Resources</h1>
        <p>Track resources currently issued to you and your borrowing history.</p>
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div
          style={{
            background: "var(--info-bg)",
            color: "var(--info)",
            borderRadius: 8,
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {activeCount} Currently Issued
        </div>
        {overdueCount > 0 && (
          <div
            style={{
              background: "var(--danger-bg)",
              color: "var(--danger)",
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {overdueCount} Overdue
          </div>
        )}
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Resource</th>
                <th>Type</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {issuedResources.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{TYPE_ICON[r.type]}</span>
                      <span style={{ fontWeight: 500 }}>{r.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.type}</span>
                  </td>
                  <td>{r.issueDate}</td>
                  <td
                    style={{
                      color: r.status === "overdue" ? "var(--danger)" : "inherit",
                      fontWeight: r.status === "overdue" ? 500 : 400,
                    }}
                  >
                    {r.dueDate}
                  </td>
                  <td>
                    <StatusPill status={r.status} />
                  </td>
                  <td>
                    {r.status !== "returned" ? (
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handleReturn(r.name)}
                      >
                        Return
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--text-hint)" }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default MyResources;