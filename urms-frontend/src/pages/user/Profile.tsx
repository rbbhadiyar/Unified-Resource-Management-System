import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Layout from "../../components/layout/UserLayout";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { triggerStatsRefresh } from "../../context/ShellStatsContext";
import { forgotPassword, getMe, updateProfile } from "../../api/auth";
import { getTransactions } from "../../api/transactions";
import type { ApiUserProfile, ApiTransaction } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

const Profile = () => {
  const { showToast } = useToast();
  const { user: authUser, token, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [me, setMe] = useState<ApiUserProfile | null>(null);
  const [draft, setDraft] = useState({
    name: "",
    phone: "",
    department: "",
    year_of_study: "",
    roll_number: "",
  });
  const [summary, setSummary] = useState({
    active: 0,
    returned: 0,
    totalBorrowed: 0,
    fineSum: 0,
    memberSince: "—",
  });
  const [resetSending, setResetSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [{ data: u }, { data: txRaw }] = await Promise.all([getMe(), getTransactions()]);
      const userData = u as ApiUserProfile;
      setMe(userData);
      setDraft({
        name: userData.name,
        phone: userData.phone ?? "",
        department: userData.department ?? "",
        year_of_study: userData.year_of_study ?? "",
        roll_number: userData.roll_number ?? "",
      });
      const tx = Array.isArray(txRaw) ? (txRaw as ApiTransaction[]) : [];
      const active = tx.filter((t) => {
        const s = (t.transaction_status || "").toLowerCase();
        return s === "active" || s === "return_pending";
      }).length;
      const returned = tx.filter((t) => (t.transaction_status || "").toLowerCase() === "returned").length;
      const fineSum = tx.reduce((s, t) => s + (Number(t.fine_amount) || 0), 0);
      setSummary({
        active,
        returned,
        totalBorrowed: tx.length,
        fineSum,
        memberSince: userData.user_id ? `User #${userData.user_id}` : "—",
      });
    } catch (e) {
      setErr(apiErrorMessage(e, "Could not load profile"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateProfile({
        name: draft.name.trim() || undefined,
        phone: draft.phone.trim() || undefined,
        department: draft.department.trim() || undefined,
        year_of_study: draft.year_of_study.trim() || undefined,
        roll_number: draft.roll_number.trim() || undefined,
      });
      const updated = data as ApiUserProfile;
      setMe(updated);
      setEditing(false);
      showToast("Profile updated.");
      if (authUser && token) {
        login(
          {
            name: updated.name,
            email: updated.email,
            role: authUser.role,
            userId: updated.user_id,
          },
          token
        );
      }
      triggerStatsRefresh();
    } catch (e) {
      showToast(apiErrorMessage(e, "Update failed"));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !me) {
    return (
      <Layout>
        <div style={{ padding: 40 }}>Loading…</div>
      </Layout>
    );
  }

  if (!me) {
    return (
      <Layout>
        <div style={{ padding: 40, color: "var(--danger)" }}>{err ?? "Unable to load profile."}</div>
      </Layout>
    );
  }

  const initials = me.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <Layout>
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your personal information and account settings.</p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}

      <div className="profile-wrap">
        <div className="profile-header-card">
          <div className="profile-avatar">{initials || "U"}</div>
          <div>
            <div className="profile-name">{me.name}</div>
            <div className="profile-role">
              {[me.department, me.year_of_study].filter(Boolean).join(" · ") || "Student / staff"}
            </div>
            <div className="profile-id">
              {me.roll_number ? `Roll: ${me.roll_number}` : `ID: ${me.user_id}`} · {me.email}
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {editing ? (
              <>
                <button type="button" className="btn-outline" onClick={() => setEditing(false)} style={{ fontSize: 13 }} disabled={saving}>
                  Cancel
                </button>
                <button type="button" className="btn-primary" onClick={() => void handleSave()} style={{ fontSize: 13 }} disabled={saving}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </>
            ) : (
              <button type="button" className="btn-primary" onClick={() => setEditing(true)} style={{ fontSize: 13 }}>
                Edit profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Personal information</div>
          <div className="profile-row">
            <div className="profile-key">Full name</div>
            {editing ? (
              <input
                className="form-input"
                style={{ maxWidth: 320 }}
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
            ) : (
              <div className="profile-val">{me.name}</div>
            )}
          </div>
          <div className="profile-row">
            <div className="profile-key">Email</div>
            <div className="profile-val">{me.email}</div>
          </div>
          <div className="profile-row">
            <div className="profile-key">Phone</div>
            {editing ? (
              <input
                className="form-input"
                style={{ maxWidth: 320 }}
                value={draft.phone}
                onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              />
            ) : (
              <div className="profile-val">{me.phone || "—"}</div>
            )}
          </div>
          <div className="profile-row">
            <div className="profile-key">Department</div>
            {editing ? (
              <input
                className="form-input"
                style={{ maxWidth: 320 }}
                value={draft.department}
                onChange={(e) => setDraft((d) => ({ ...d, department: e.target.value }))}
              />
            ) : (
              <div className="profile-val">{me.department || "—"}</div>
            )}
          </div>
          <div className="profile-row">
            <div className="profile-key">Year of study</div>
            {editing ? (
              <input
                className="form-input"
                style={{ maxWidth: 320 }}
                value={draft.year_of_study}
                onChange={(e) => setDraft((d) => ({ ...d, year_of_study: e.target.value }))}
              />
            ) : (
              <div className="profile-val">{me.year_of_study || "—"}</div>
            )}
          </div>
          <div className="profile-row">
            <div className="profile-key">Roll number</div>
            {editing ? (
              <input
                className="form-input"
                style={{ maxWidth: 320 }}
                value={draft.roll_number}
                onChange={(e) => setDraft((d) => ({ ...d, roll_number: e.target.value }))}
              />
            ) : (
              <div className="profile-val">{me.roll_number || "—"}</div>
            )}
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Account summary</div>
          {(
            [
              { label: "On loan / pending return", value: String(summary.active) },
              { label: "Completed returns", value: String(summary.returned) },
              { label: "Total transactions", value: String(summary.totalBorrowed) },
              {
                label: "Recorded fines (returns)",
                value: summary.fineSum > 0 ? `₹${summary.fineSum.toFixed(0)}` : "₹0",
                danger: summary.fineSum > 0,
              },
              { label: "Account", value: summary.memberSince },
            ] as { label: string; value: string; danger?: boolean }[]
          ).map((field) => (
            <div key={field.label} className="profile-row">
              <div className="profile-key">{field.label}</div>
              <div
                className="profile-val"
                style={
                  {
                    color: field.danger ? "var(--danger)" : "var(--text)",
                    fontWeight: field.danger ? 500 : 400,
                  } as CSSProperties
                }
              >
                {field.value}
              </div>
            </div>
          ))}
        </div>

        <div className="profile-section">
          <div className="profile-section-title">Account actions</div>
          <div className="profile-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Change password</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              We will send a secure reset link to <strong>{me?.email}</strong>.
            </div>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: 12, marginTop: 4 }}
              disabled={resetSending || !me?.email}
              onClick={() => {
                if (!me?.email) return;
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
    </Layout>
  );
};

export default Profile;
