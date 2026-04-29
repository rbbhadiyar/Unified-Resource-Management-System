import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getDefaulters } from "../../api/users";
import { apiErrorMessage } from "../../utils/apiError";

interface DefRow {
  defaulter_id: number;
  user_name?: string | null;
  email?: string | null;
  fine_amount: number;
  overdue_days: number;
  marked_date?: string | null;
}

const Defaulters = () => {
  const [rows, setRows] = useState<DefRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await getDefaulters();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(apiErrorMessage(e, "Failed to load defaulters"));
      setRows([]);
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
        <h1>Defaulters</h1>
        <p>Users with overdue resources or unpaid fines</p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}
      {loading && <div>Loading…</div>}

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Fine (₹)</th>
                <th>Overdue Days</th>
                <th>Marked</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>
                    No active defaulters.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.defaulter_id}>
                  <td>{r.user_name || "—"}</td>
                  <td>{r.email || "—"}</td>
                  <td>₹{Number(r.fine_amount).toFixed(2)}</td>
                  <td>{r.overdue_days}</td>
                  <td>{r.marked_date ? new Date(r.marked_date).toLocaleString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Defaulters;
