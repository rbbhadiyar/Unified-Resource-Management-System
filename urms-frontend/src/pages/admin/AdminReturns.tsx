import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { triggerStatsRefresh } from "../../context/ShellStatsContext";
import { getPendingReturns, confirmReturn } from "../../api/transactions";
import type { ApiPendingReturn } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

const fmt = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

const AdminReturns = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ApiPendingReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [damage, setDamage] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await getPendingReturns();
      setRows(Array.isArray(data) ? (data as ApiPendingReturn[]) : []);
    } catch (e) {
      setErr(apiErrorMessage(e, "Could not load pending returns"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const confirm = async (r: ApiPendingReturn) => {
    const extra = parseFloat(damage[r.transaction_id] || "0") || 0;
    setBusy(r.transaction_id);
    try {
      await confirmReturn({
        transaction_id: r.transaction_id,
        damage_fine: extra,
      });
      showToast(`Return confirmed for ${r.resource_name || "resource"}.`);
      triggerStatsRefresh();
      await load();
    } catch (e) {
      showToast(apiErrorMessage(e, "Confirm failed"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>Pending returns</h1>
        <p>Users have requested a return. Verify the physical item, then confirm to close the loan and apply any damage fee.</p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}
      {loading && <div>Loading…</div>}

      {!loading && rows.length === 0 && (
        <div className="panel" style={{ padding: 24, color: "var(--text-muted)" }}>
          No pending returns.{" "}
          <button type="button" className="auth-link" style={{ font: "inherit", cursor: "pointer" }} onClick={() => navigate("/admin/dashboard")}>
            Back to dashboard
          </button>
        </div>
      )}

      {rows.length > 0 && (
        <div className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Resource</th>
                  <th>Due</th>
                  <th>Requested</th>
                  <th>Damage fee (₹)</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.transaction_id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.user_name || `User #${r.user_id}`}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.user_email}</div>
                    </td>
                    <td>{r.resource_name || "—"}</td>
                    <td>{fmt(r.due_date)}</td>
                    <td>{fmt(r.return_requested_at)}</td>
                    <td>
                      <input
                        className="form-input"
                        style={{ width: 100, padding: "6px 8px", fontSize: 13 }}
                        inputMode="decimal"
                        placeholder="0"
                        value={damage[r.transaction_id] ?? ""}
                        onChange={(e) => setDamage((d) => ({ ...d, [r.transaction_id]: e.target.value }))}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        disabled={busy === r.transaction_id}
                        onClick={() => void confirm(r)}
                      >
                        {busy === r.transaction_id ? "…" : "Confirm return"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReturns;
