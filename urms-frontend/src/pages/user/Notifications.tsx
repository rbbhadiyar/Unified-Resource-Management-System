import { useCallback, useEffect, useMemo, useState } from "react";
import Layout from "../../components/layout/UserLayout";
import { triggerStatsRefresh } from "../../context/ShellStatsContext";
import { getNotifications, markAsRead } from "../../api/notification";
import type { ApiNotification } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

function iconFor(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("overdue") || t.includes("fine")) return "⚠️";
  if (t.includes("approved")) return "✅";
  if (t.includes("issued")) return "📦";
  if (t.includes("return")) return "🔔";
  if (t.includes("request")) return "📋";
  return "🔔";
}

function relTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    const day = 86400000;
    if (diff < day && diff >= 0) return "Today";
    if (diff < 2 * day && diff >= 0) return "Yesterday";
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

type Tab = "All" | "Unread" | "Alerts";

const Notifications = () => {
  const [tab, setTab] = useState<Tab>("All");
  const [rows, setRows] = useState<ApiNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await getNotifications();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(apiErrorMessage(e, "Failed to load notifications"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = rows.filter((n) => !n.is_read).length;

  const visible = useMemo(() => {
    if (tab === "Unread") return rows.filter((n) => !n.is_read);
    if (tab === "Alerts") {
      return rows.filter(
        (n) =>
          n.title.toLowerCase().includes("overdue") ||
          n.title.toLowerCase().includes("fine") ||
          n.message.toLowerCase().includes("overdue")
      );
    }
    return rows;
  }, [rows, tab]);

  const openItem = async (n: ApiNotification) => {
    if (n.is_read) return;
    try {
      await markAsRead(n.notification_id);
      setRows((prev) =>
        prev.map((x) => (x.notification_id === n.notification_id ? { ...x, is_read: true } : x))
      );
      triggerStatsRefresh();
    } catch {
      /* ignore mark-read failure; list still valid */
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1>Notifications</h1>
        <p>
          {unreadCount > 0
            ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
            : "You're all caught up!"}
        </p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}
      {loading && <div style={{ marginBottom: 16 }}>Loading…</div>}

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          borderBottom: "1px solid var(--border)",
          paddingBottom: 12,
        }}
      >
        {(["All", "Unread", "Alerts"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: tab === t ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: tab === t ? "var(--accent-light)" : "var(--surface)",
              color: tab === t ? "var(--accent)" : "var(--text-muted)",
              fontSize: 13,
              fontFamily: "var(--font)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="notif-list">
        {!loading && visible.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
            No notifications in this view.
          </div>
        )}
        {visible.map((n) => (
          <button
            key={n.notification_id}
            type="button"
            className={`notif-item${n.is_read ? "" : " unread"}`}
            onClick={() => void openItem(n)}
            style={{
              width: "100%",
              textAlign: "left",
              cursor: n.is_read ? "default" : "pointer",
              border: "none",
              font: "inherit",
              background: "transparent",
            }}
          >
            <div className="notif-ico">{iconFor(n.title)}</div>
            <div style={{ flex: 1 }}>
              <div className="notif-text">{n.title}</div>
              <div className="notif-sub">{n.message}</div>
            </div>
            <div className="notif-time">{relTime(n.created_at)}</div>
          </button>
        ))}
      </div>
    </Layout>
  );
};

export default Notifications;
