import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { getUsers } from "../../api/users";
import { getResources } from "../../api/resources";
import { getRequests } from "../../api/requests";
import { getDefaulters } from "../../api/users";
import { runReturnReminders } from "../../api/transactions";
import type { ApiLoanRequest } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

const StatCard = ({ title, value, sub }: { title: string; value: string | number; sub?: string }) => (
  <div className="stat-card">
    <div className="stat-label">{title}</div>
    <div className="stat-value">{value}</div>
    {sub ? <div className="stat-sub">{sub}</div> : null}
  </div>
);

const fmtShort = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
};

const statusClass = (s: string) => {
  const x = s.toLowerCase();
  if (x === "pending") return "status-pill pending";
  if (x === "approved") return "status-pill approved";
  if (x === "rejected") return "status-pill overdue";
  return "status-pill issued";
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [resourceCount, setResourceCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [defaulterCount, setDefaulterCount] = useState(0);
  const [recent, setRecent] = useState<ApiLoanRequest[]>([]);
  const [runningReminder, setRunningReminder] = useState(false);
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [usersRes, resRes, reqRes, defRes] = await Promise.all([
        getUsers(),
        getResources(),
        getRequests(),
        getDefaulters(),
      ]);
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const resources = Array.isArray(resRes.data) ? resRes.data : [];
      const reqs = Array.isArray(reqRes.data) ? (reqRes.data as ApiLoanRequest[]) : [];
      const defs = Array.isArray(defRes.data) ? defRes.data : [];
      setUserCount(users.length);
      setResourceCount(resources.length);
      setPendingCount(reqs.filter((r) => (r.status || "").toLowerCase() === "pending").length);
      setDefaulterCount(defs.length);
      const sorted = [...reqs].sort((a, b) => {
        const ta = a.requested_at ? new Date(a.requested_at).getTime() : 0;
        const tb = b.requested_at ? new Date(b.requested_at).getTime() : 0;
        return tb - ta;
      });
      setRecent(sorted.slice(0, 6));
    } catch (e) {
      setErr(apiErrorMessage(e, "Could not load dashboard"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Overview of system activity and controls</p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}
      {reminderMsg && <div style={{ color: "var(--text-muted)", marginBottom: 12 }}>{reminderMsg}</div>}
      {loading && <div style={{ marginBottom: 16 }}>Loading…</div>}

      <div className="stats-grid">
        <StatCard title="Total users" value={userCount} sub="Registered accounts" />
        <StatCard title="Resources" value={resourceCount} sub="Catalog items" />
        <StatCard title="Pending requests" value={pendingCount} sub="Awaiting decision" />
        <StatCard title="Active defaulters" value={defaulterCount} sub="Open fine records" />
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Recent Requests</div>
            <button type="button" className="panel-link" onClick={() => navigate("/admin/requests")}>
              View all
            </button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Resource</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {!loading && recent.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
                      No requests yet.
                    </td>
                  </tr>
                )}
                {recent.map((r) => (
                  <tr key={r.request_id}>
                    <td>{r.user_name || `User #${r.user_id}`}</td>
                    <td>{r.resource_name || `Resource #${r.resource_id}`}</td>
                    <td>
                      <span className={statusClass(r.status)}>{r.status}</span>
                    </td>
                    <td>{fmtShort(r.requested_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">Quick Actions</div>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <button type="button" className="btn-primary" onClick={() => navigate("/admin/resources")}>
              + Add / manage resources
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate("/admin/users")}>
              Manage users
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate("/admin/requests")}>
              View requests
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate("/admin/returns")}>
              Pending returns
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate("/admin/defaulters")}>
              Check defaulters
            </button>
            <button
              type="button"
              className="btn-outline"
              disabled={runningReminder}
              onClick={() => {
                setRunningReminder(true);
                setReminderMsg(null);
                void runReturnReminders()
                  .then(({ data }) => {
                    const n = Number((data as { processed?: number })?.processed ?? 0);
                    setReminderMsg(`Return reminder job completed (${n} item${n === 1 ? "" : "s"} processed).`);
                  })
                  .catch((e: unknown) => {
                    setReminderMsg(apiErrorMessage(e, "Reminder job failed"));
                  })
                  .finally(() => setRunningReminder(false));
              }}
            >
              {runningReminder ? "Running reminders..." : "Run due-date reminders (email)"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
