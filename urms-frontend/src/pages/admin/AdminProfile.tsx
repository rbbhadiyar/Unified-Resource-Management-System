import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { useToast } from "../../context/ToastContext";
import { forgotPassword, getMe, updateProfile } from "../../api/auth";
import { getResources } from "../../api/resources";
import { getRequests } from "../../api/requests";
import { getUsers } from "../../api/users";
import { getRules } from "../../api/rules";
import type { ApiUserProfile } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

const AdminProfile = () => {
  const { showToast } = useToast();
  const [me, setMe] = useState<ApiUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ resources: 0, requests: 0, users: 0, rules: 0 });
  const [resetSending, setResetSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [{ data: u }, res, req, users, rules] = await Promise.all([
        getMe(),
        getResources(),
        getRequests(),
        getUsers(),
        getRules(),
      ]);
      setMe(u as ApiUserProfile);
      setStats({
        resources: Array.isArray(res.data) ? res.data.length : 0,
        requests: Array.isArray(req.data) ? req.data.length : 0,
        users: Array.isArray(users.data) ? users.data.length : 0,
        rules: Array.isArray(rules.data) ? rules.data.length : 0,
      });
    } catch {
      showToast("Could not load admin profile.");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveDept = async (phone: string, department: string) => {
    try {
      const { data } = await updateProfile({ phone: phone || undefined, department: department || undefined });
      setMe(data as ApiUserProfile);
      showToast("Profile updated.");
    } catch (e) {
      showToast(apiErrorMessage(e, "Update failed"));
    }
  };

  if (loading || !me) {
    return (
      <AdminLayout>
        <div style={{ padding: 40 }}>Loading…</div>
      </AdminLayout>
    );
  }

  const statCards = [
    { label: "Resources in catalog", value: stats.resources },
    { label: "Loan requests (all)", value: stats.requests },
    { label: "Registered users", value: stats.users },
    { label: "Rules rows", value: stats.rules },
  ];

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>Profile</h1>
        <p>Your admin account and live system counts.</p>
      </div>

      <div className="profile-wrap">
        <div className="profile-header-card">
          <div className="profile-avatar">{me.name.slice(0, 2).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div className="profile-name">{me.name}</div>
            <div className="profile-role">Administrator · {me.role}</div>
            <div className="profile-id">{me.email}</div>
          </div>
          <button type="button" className="btn-primary" style={{ fontSize: 13 }} onClick={() => void load()}>
            Refresh stats
          </button>
        </div>

        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {statCards.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Account information</div>
          <div className="profile-row">
            <div className="profile-key">Phone</div>
            <div className="profile-val">{me.phone || "—"}</div>
          </div>
          <div className="profile-row">
            <div className="profile-key">Department / unit</div>
            <div className="profile-val">{me.department || "—"}</div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Quick edit</div>
          <div className="profile-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
            <input
              className="form-input"
              placeholder="Phone"
              defaultValue={me.phone ?? ""}
              id="admin-phone"
            />
            <input
              className="form-input"
              placeholder="Department"
              defaultValue={me.department ?? ""}
              id="admin-dept"
            />
            <button
              type="button"
              className="btn-outline"
              style={{ alignSelf: "flex-start", fontSize: 13 }}
              onClick={() => {
                const phone = (document.getElementById("admin-phone") as HTMLInputElement)?.value ?? "";
                const department = (document.getElementById("admin-dept") as HTMLInputElement)?.value ?? "";
                void saveDept(phone, department);
              }}
            >
              Save phone and department
            </button>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Password</div>
          <div className="profile-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              Send reset instructions to <strong>{me.email}</strong>.
            </div>
            <button
              type="button"
              className="btn-outline"
              style={{ alignSelf: "flex-start", fontSize: 13 }}
              disabled={resetSending}
              onClick={() => {
                setResetSending(true);
                void forgotPassword({ email: me.email })
                  .then(() => showToast("If this account supports password login, reset instructions were sent."))
                  .catch((e: unknown) => showToast(apiErrorMessage(e, "Could not send reset email")))
                  .finally(() => setResetSending(false));
              }}
            >
              {resetSending ? "Sending..." : "Send reset email"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
