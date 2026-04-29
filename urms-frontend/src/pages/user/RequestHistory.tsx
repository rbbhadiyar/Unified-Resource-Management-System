import { useCallback, useEffect, useState } from "react";
import Layout from "../../components/layout/UserLayout";
import { getRequests } from "../../api/requests";
import type { ApiLoanRequest } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

type ReqStatus = "approved" | "pending" | "rejected";

function normalizeStatus(s: string): ReqStatus {
  const x = s.toLowerCase();
  if (x === "pending") return "pending";
  if (x === "rejected") return "rejected";
  return "approved";
}

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

function iconFor(name?: string | null) {
  const n = (name || "").toLowerCase();
  if (n.includes("software")) return { icon: "🖥️", bg: "#f0fdf4" };
  if (n.includes("book")) return { icon: "📖", bg: "#f0fdf4" };
  return { icon: "💻", bg: "#eff6ff" };
}

const RequestHistory = () => {
  const [rows, setRows] = useState<ApiLoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await getRequests();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(apiErrorMessage(e, "Failed to load requests"));
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

  const normalized = rows.map((r) => ({ ...r, uiStatus: normalizeStatus(r.status) }));
  const approvedCount = normalized.filter((r) => r.uiStatus === "approved").length;
  const pendingCount = normalized.filter((r) => r.uiStatus === "pending").length;

  return (
    <Layout>
      <div className="page-header">
        <h1>Request History</h1>
        <p>All resource requests you have submitted.</p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}
      {loading && <div>Loading…</div>}

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
          {rows.length} Total
        </div>
      </div>

      <div className="req-list">
        {!loading && rows.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>No requests yet.</div>
        )}
        {normalized.map((r) => {
          const st = r.uiStatus;
          const { icon, bg } = iconFor(r.resource_name);
          return (
            <div key={r.request_id} className="req-item">
              <div className="req-icon" style={{ background: bg }}>
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className="req-resource">{r.resource_name || `Resource #${r.resource_id}`}</div>
                <div className="req-date">Submitted: {fmt(r.requested_at)}</div>
                <div className="req-meta">
                  {r.loan_days}-day loan · REQ-{r.request_id}
                </div>
              </div>
              <span className={STATUS_PILL_CLASS[st]}>{STATUS_LABEL[st]}</span>
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default RequestHistory;
