import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/layout/UserLayout";
import { useAuth } from "../../context/AuthContext";
import { getTransactions } from "../../api/transactions";
import { getRequests } from "../../api/requests";
import { getNotifications } from "../../api/notification";
import { getResources } from "../../api/resources";
import type { ApiLoanRequest, ApiResource, ApiTransaction } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

function typeLabel(name?: string | null): "Hardware" | "Software" | "Book" {
  const n = (name || "").toLowerCase();
  if (n.includes("software")) return "Software";
  if (n.includes("book")) return "Book";
  return "Hardware";
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tx, setTx] = useState<ApiTransaction[]>([]);
  const [reqs, setReqs] = useState<ApiLoanRequest[]>([]);
  const [unread, setUnread] = useState(0);
  const [resources, setResources] = useState<ApiResource[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [txRes, reqRes, nRes, rRes] = await Promise.all([
        getTransactions(),
        getRequests(),
        getNotifications(),
        getResources(),
      ]);
      setTx(Array.isArray(txRes.data) ? txRes.data : []);
      setReqs(Array.isArray(reqRes.data) ? reqRes.data : []);
      const notes = Array.isArray(nRes.data) ? nRes.data : [];
      setUnread(notes.filter((n: { is_read?: boolean }) => !n.is_read).length);
      setResources(Array.isArray(rRes.data) ? rRes.data : []);
    } catch (e) {
      setErr(apiErrorMessage(e, "Could not load dashboard"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onLoan = useMemo(
    () =>
      tx.filter((t) => {
        const s = (t.transaction_status || "").toLowerCase();
        return s === "active" || s === "return_pending";
      }),
    [tx]
  );
  const onLoanCount = onLoan.length;
  const pendingReqCount = reqs.filter((r) => (r.status || "").toLowerCase() === "pending").length;
  const overdueCount = onLoan.filter((t) => t.due_date && new Date(t.due_date).getTime() < Date.now()).length;
  const fineSum = tx
    .filter((t) => (t.transaction_status || "").toLowerCase() === "returned")
    .reduce((s, t) => s + (Number(t.fine_amount) || 0), 0);

  const stats = [
    {
      label: "On loan",
      value: String(onLoanCount),
      sub: "Active borrowings",
      accent: "#2563eb",
      iconBg: "#eff6ff",
      icon: (
        <svg viewBox="0 0 24 24" fill="#2563eb">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
        </svg>
      ),
    },
    {
      label: "Pending requests",
      value: String(pendingReqCount),
      sub: "Awaiting approval",
      accent: "#d97706",
      iconBg: "#fffbeb",
      icon: (
        <svg viewBox="0 0 24 24" fill="#d97706">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      ),
    },
    {
      label: "Notifications",
      value: String(unread),
      sub: "Unread",
      accent: "#7c3aed",
      iconBg: "#f5f3ff",
      icon: (
        <svg viewBox="0 0 24 24" fill="#7c3aed">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
      ),
    },
    {
      label: "Recorded fines",
      value: fineSum > 0 ? `₹${fineSum.toFixed(0)}` : "₹0",
      sub: "From completed returns",
      accent: "#dc2626",
      iconBg: "#fef2f2",
      icon: (
        <svg viewBox="0 0 24 24" fill="#dc2626">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
        </svg>
      ),
    },
  ];

  const recentActivity = useMemo(() => {
    const items: { color: string; text: string; time: string }[] = [];
    const sortedReq = [...reqs].sort((a, b) => {
      const ta = a.requested_at ? new Date(a.requested_at).getTime() : 0;
      const tb = b.requested_at ? new Date(b.requested_at).getTime() : 0;
      return tb - ta;
    });
    sortedReq.slice(0, 4).forEach((r) => {
      const st = (r.status || "").toLowerCase();
      const color = st === "pending" ? "#d97706" : st === "approved" ? "#16a34a" : st === "rejected" ? "#dc2626" : "#0369a1";
      items.push({
        color,
        text: `${r.resource_name || "Resource"} — ${r.status}`,
        time: r.requested_at
          ? new Date(r.requested_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
          : "—",
      });
    });
    const sortedTx = [...tx].sort((a, b) => {
      const ta = a.return_date ? new Date(a.return_date).getTime() : a.issue_date ? new Date(a.issue_date).getTime() : 0;
      const tb = b.return_date ? new Date(b.return_date).getTime() : b.issue_date ? new Date(b.issue_date).getTime() : 0;
      return tb - ta;
    });
    sortedTx.slice(0, 3).forEach((t) => {
      const st = (t.transaction_status || "").toLowerCase();
      if (st === "returned") {
        items.push({
          color: "#0369a1",
          text: `${t.resource_name || "Item"} returned`,
          time: t.return_date ? new Date(t.return_date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—",
        });
      } else if (st === "return_pending") {
        items.push({
          color: "#d97706",
          text: `Return pending staff check — ${t.resource_name || "item"}`,
          time: t.return_requested_at
            ? new Date(t.return_requested_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
            : "—",
        });
      }
    });
    return items.slice(0, 6);
  }, [reqs, tx]);

  const quickResources = useMemo(() => {
    const sorted = [...resources].sort((a, b) => (b.available_quantity || 0) - (a.available_quantity || 0));
    return sorted.slice(0, 3).map((r) => {
      const typ = typeLabel(r.type_name);
      const icon = typ === "Book" ? "📖" : typ === "Software" ? "🖥️" : "💻";
      const bg = typ === "Book" ? "#fffbeb" : typ === "Software" ? "#f0fdf4" : "#eff6ff";
      return {
        id: r.resource_id,
        icon,
        name: r.resource_name,
        type: typ,
        available: r.available_quantity,
        bg,
        low: (r.available_quantity || 0) <= 2,
      };
    });
  }, [resources]);

  const showFineBanner = overdueCount > 0 || fineSum > 0;

  return (
    <Layout>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}. Here&apos;s your overview for today.
        </p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}
      {loading && <div style={{ marginBottom: 12 }}>Loading…</div>}

      {showFineBanner && (
        <div className="fine-alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
          <span>
            {overdueCount > 0 && (
              <>
                You have <strong>{overdueCount}</strong> loan{overdueCount > 1 ? "s" : ""} past the due date. Return or request a return to avoid extra charges.{" "}
              </>
            )}
            {fineSum > 0 && (
              <>
                Recorded fines from past returns: <strong>₹{fineSum.toFixed(0)}</strong>.
              </>
            )}
          </span>
        </div>
      )}

      <div className="stats-grid">
        {stats.map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ "--card-accent": s.accent } as CSSProperties}
          >
            <div className="stat-icon" style={{ background: s.iconBg }}>
              {s.icon}
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Recent activity</span>
            <button type="button" className="panel-link" onClick={() => navigate("/requests")}>
              View all
            </button>
          </div>
          <div>
            {!loading && recentActivity.length === 0 && (
              <div style={{ padding: 20, color: "var(--text-muted)", fontSize: 13 }}>No recent activity.</div>
            )}
            {recentActivity.map((a, i) => (
              <div key={`${a.text}-${i}`} className="activity-item">
                <div className="activity-dot" style={{ background: a.color }} />
                <div>
                  <div className="activity-text">{a.text}</div>
                  <div className="activity-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="panel-title">Available resources</span>
            <button type="button" className="panel-link" onClick={() => navigate("/resources")}>
              Browse all
            </button>
          </div>
          <div>
            {!loading && quickResources.length === 0 && (
              <div style={{ padding: 20, color: "var(--text-muted)", fontSize: 13 }}>No resources in catalog.</div>
            )}
            {quickResources.map((r) => (
              <div key={r.id} className="resource-list-item">
                <div className="resource-thumb" style={{ background: r.bg }}>
                  {r.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{r.type}</div>
                </div>
                <div className={`avail-badge${r.low ? " low" : ""}`}>{r.available} left</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserDashboard;
