import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { triggerStatsRefresh } from "../../context/ShellStatsContext";
import { approveRequest, getRequests, rejectRequest } from "../../api/requests";
import type { ApiLoanRequest } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

const AdminRequests = () => {
  const [rows, setRows] = useState<ApiLoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

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
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const pillClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") return "status-pill pending";
    if (s === "approved") return "status-pill approved";
    if (s === "rejected") return "status-pill overdue";
    return "status-pill";
  };

  const act = async (id: number, kind: "approve" | "reject") => {
    setBusyId(id);
    setErr(null);
    try {
      if (kind === "approve") await approveRequest(id);
      else await rejectRequest(id);
      triggerStatsRefresh();
      await load();
    } catch (e) {
      setErr(apiErrorMessage(e, "Action failed"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>Requests</h1>
        <p>Approve or reject user requests</p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}
      {loading && <div>Loading…</div>}

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Resource</th>
                <th>Requested</th>
                <th>Loan days</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
                    No requests yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.request_id}>
                  <td>{r.user_name || `#${r.user_id}`}</td>
                  <td>{r.resource_name || `#${r.resource_id}`}</td>
                  <td>{fmt(r.requested_at)}</td>
                  <td>{r.loan_days}</td>
                  <td>
                    <span className={pillClass(r.status)}>{r.status}</span>
                  </td>
                  <td>
                    {r.status === "pending" ? (
                      <>
                        <button
                          type="button"
                          className="btn-primary btn-sm"
                          disabled={busyId === r.request_id}
                          onClick={() => void act(r.request_id, "approve")}
                        >
                          Approve
                        </button>{" "}
                        <button
                          type="button"
                          className="btn-outline btn-sm"
                          disabled={busyId === r.request_id}
                          onClick={() => void act(r.request_id, "reject")}
                        >
                          Reject
                        </button>
                      </>
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
    </AdminLayout>
  );
};

export default AdminRequests;
