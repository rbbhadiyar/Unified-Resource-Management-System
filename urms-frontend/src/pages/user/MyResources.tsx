import { useCallback, useEffect, useState } from "react";
import Layout from "../../components/layout/UserLayout";
import { useToast } from "../../context/ToastContext";
import { triggerStatsRefresh } from "../../context/ShellStatsContext";
import { getTransactions, requestReturn } from "../../api/transactions";
import type { ApiTransaction } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

type RowStatus = "issued" | "returned" | "overdue" | "return_pending";

function deriveStatus(t: ApiTransaction): RowStatus {
  const st = (t.transaction_status || "").toLowerCase();
  if (st === "returned") return "returned";
  if (st === "return_pending") return "return_pending";
  if (st === "overdue") return "overdue";
  if (st === "active" && t.due_date) {
    const due = new Date(t.due_date).getTime();
    if (due < Date.now()) return "overdue";
  }
  return "issued";
}

function typeLabel(name?: string | null): "Hardware" | "Software" | "Book" {
  const n = (name || "").toLowerCase();
  if (n.includes("software")) return "Software";
  if (n.includes("book")) return "Book";
  return "Hardware";
}

const TYPE_ICON: Record<string, string> = {
  Hardware: "💻",
  Software: "🖥️",
  Book: "📖",
};

const STATUS_LABEL: Record<RowStatus, string> = {
  issued: "Issued",
  returned: "Returned",
  overdue: "Overdue",
  return_pending: "Return pending",
};

const StatusPill = ({ status }: { status: RowStatus }) => {
  const cls = status === "return_pending" ? "pending" : status === "issued" ? "issued" : status;
  return <span className={`status-pill ${cls}`}>{STATUS_LABEL[status]}</span>;
};

const MyResources = () => {
  const { showToast } = useToast();
  const [rows, setRows] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await getTransactions();
      setRows(Array.isArray(data) ? (data as ApiTransaction[]) : []);
    } catch (e) {
      setErr(apiErrorMessage(e, "Could not load your resources"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const fmt = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return iso;
    }
  };

  const handleRequestReturn = async (t: ApiTransaction) => {
    setBusy(t.transaction_id);
    try {
      await requestReturn({ request_id: t.request_id });
      showToast(`Return requested for "${t.resource_name || "item"}". Staff will verify and complete it.`);
      triggerStatsRefresh();
      await load();
    } catch (e) {
      showToast(apiErrorMessage(e, "Could not submit return request"));
    } finally {
      setBusy(null);
    }
  };

  const onLoan = rows.filter((t) => {
    const s = (t.transaction_status || "").toLowerCase();
    return s === "active" || s === "return_pending";
  });
  const onLoanCount = onLoan.length;
  const overdueCount = onLoan.filter((t) => t.due_date && new Date(t.due_date).getTime() < Date.now()).length;

  return (
    <Layout>
      <div className="page-header">
        <h1>My Resources</h1>
        <p>Track resources currently issued to you and your borrowing history.</p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}
      {loading && <div>Loading…</div>}

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
          {onLoanCount} on loan
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
            {overdueCount} past due date
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
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
                    No issued items yet. Request a resource from Browse Resources.
                  </td>
                </tr>
              )}
              {rows.map((t) => {
                const st = deriveStatus(t);
                const typ = typeLabel(t.resource_type);
                const raw = (t.transaction_status || "").toLowerCase();
                const canRequestReturn = raw === "active";
                const awaiting = raw === "return_pending";
                return (
                  <tr key={t.transaction_id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 18 }}>{TYPE_ICON[typ]}</span>
                        <span style={{ fontWeight: 500 }}>{t.resource_name || "Resource"}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{typ}</span>
                    </td>
                    <td>{fmt(t.issue_date)}</td>
                    <td
                      style={{
                        color: st === "overdue" ? "var(--danger)" : "inherit",
                        fontWeight: st === "overdue" ? 500 : 400,
                      }}
                    >
                      {fmt(t.due_date)}
                    </td>
                    <td>
                      <StatusPill status={st} />
                    </td>
                    <td>
                      {canRequestReturn ? (
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          disabled={busy === t.transaction_id}
                          onClick={() => void handleRequestReturn(t)}
                        >
                          Request return
                        </button>
                      ) : awaiting ? (
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Awaiting staff</span>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text-hint)" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default MyResources;
