import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { blockUser, getUsers, unblockUser } from "../../api/users";
import { apiErrorMessage } from "../../utils/apiError";

interface UserRow {
  user_id: number;
  name: string;
  email: string;
  role: string;
  is_blocked: boolean;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await getUsers();
      const arr = Array.isArray(data) ? data : [];
      setUsers(
        arr.map((u: { user_id: number; name: string; email: string; role: string; is_blocked: boolean }) => ({
          user_id: u.user_id,
          name: u.name,
          email: u.email,
          role: u.role,
          is_blocked: !!u.is_blocked,
        }))
      );
    } catch (e) {
      setErr(apiErrorMessage(e, "Failed to load users"));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggle = async (u: UserRow) => {
    setBusy(u.user_id);
    setErr(null);
    try {
      if (u.is_blocked) await unblockUser(u.user_id);
      else await blockUser(u.user_id);
      await load();
    } catch (e) {
      setErr(apiErrorMessage(e, "Update failed"));
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>User Management</h1>
        <p>Control user access and roles</p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}
      {loading && <div>Loading…</div>}

      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">All Users</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`status-pill ${u.is_blocked ? "overdue" : "approved"}`}>
                      {u.is_blocked ? "blocked" : "active"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-sm btn-outline"
                      disabled={busy === u.user_id}
                      onClick={() => void toggle(u)}
                    >
                      {u.is_blocked ? "Unblock" : "Block"}
                    </button>
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

export default AdminUsers;
