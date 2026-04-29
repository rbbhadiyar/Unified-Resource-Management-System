import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { getNotifications, markAsRead } from "../api/notification";
import { getTransactions, getPendingReturns } from "../api/transactions";
import { getRequests } from "../api/requests";
import type { ApiNotification } from "../types/api";

function notifIcon(title: string): string {
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
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
}

export type ShellNotifPreview = {
  id: number;
  icon: string;
  title: string;
  sub: string;
  time: string;
  unread: boolean;
};

type ShellStatsContextType = {
  unreadNotifications: number;
  notificationPreview: ShellNotifPreview[];
  activeBorrowCount: number;
  pendingRequestsCount: number;
  pendingReturnsCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
};

const ShellStatsContext = createContext<ShellStatsContextType | undefined>(undefined);

export function ShellStatsProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notificationPreview, setNotificationPreview] = useState<ShellNotifPreview[]>([]);
  const [activeBorrowCount, setActiveBorrowCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pendingReturnsCount, setPendingReturnsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!token || !user) {
      setUnreadNotifications(0);
      setNotificationPreview([]);
      setActiveBorrowCount(0);
      setPendingRequestsCount(0);
      setPendingReturnsCount(0);
      return;
    }
    setLoading(true);
    try {
      const notifRes = await getNotifications();
      const raw = Array.isArray(notifRes.data) ? (notifRes.data as ApiNotification[]) : [];
      const unread = raw.filter((n) => !n.is_read).length;
      setUnreadNotifications(unread);
      setNotificationPreview(
        raw.slice(0, 8).map((n) => ({
          id: n.notification_id,
          icon: notifIcon(n.title),
          title: n.title,
          sub: n.message,
          time: relTime(n.created_at),
          unread: !n.is_read,
        }))
      );

      if (user.role === "user") {
        const txRes = await getTransactions();
        const txList = Array.isArray(txRes.data) ? txRes.data : [];
        const borrow = txList.filter((t: { transaction_status?: string }) => {
          const s = (t.transaction_status || "").toLowerCase();
          return s === "active" || s === "return_pending";
        }).length;
        setActiveBorrowCount(borrow);

        const reqRes = await getRequests();
        const reqs = Array.isArray(reqRes.data) ? reqRes.data : [];
        setPendingRequestsCount(
          reqs.filter((r: { status?: string }) => (r.status || "").toLowerCase() === "pending").length
        );
        setPendingReturnsCount(0);
      } else {
        setActiveBorrowCount(0);
        const [reqRes, pendRes] = await Promise.all([getRequests(), getPendingReturns()]);
        const reqs = Array.isArray(reqRes.data) ? reqRes.data : [];
        setPendingRequestsCount(
          reqs.filter((r: { status?: string }) => (r.status || "").toLowerCase() === "pending").length
        );
        const pend = Array.isArray(pendRes.data) ? pendRes.data : [];
        setPendingReturnsCount(pend.length);
      }
    } catch {
      setUnreadNotifications(0);
      setNotificationPreview([]);
      setActiveBorrowCount(0);
      setPendingRequestsCount(0);
      setPendingReturnsCount(0);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onRefresh = () => void refresh();
    window.addEventListener("urms:stats-refresh", onRefresh);
    return () => window.removeEventListener("urms:stats-refresh", onRefresh);
  }, [refresh]);

  const markNotificationRead = useCallback(
    async (id: number) => {
      try {
        await markAsRead(id);
        await refresh();
      } catch {
        /* ignore */
      }
    },
    [refresh]
  );

  const markAllNotificationsRead = useCallback(async () => {
    try {
      const { data } = await getNotifications();
      const raw = Array.isArray(data) ? (data as ApiNotification[]) : [];
      const ids = raw.filter((n) => !n.is_read).map((n) => n.notification_id);
      await Promise.all(ids.map((id) => markAsRead(id)));
    } catch {
      /* ignore */
    }
    await refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      unreadNotifications,
      notificationPreview,
      activeBorrowCount,
      pendingRequestsCount,
      pendingReturnsCount,
      loading,
      refresh,
      markAllNotificationsRead,
      markNotificationRead,
    }),
    [
      unreadNotifications,
      notificationPreview,
      activeBorrowCount,
      pendingRequestsCount,
      pendingReturnsCount,
      loading,
      refresh,
      markAllNotificationsRead,
      markNotificationRead,
    ]
  );

  return <ShellStatsContext.Provider value={value}>{children}</ShellStatsContext.Provider>;
}

export function useShellStats() {
  const ctx = useContext(ShellStatsContext);
  if (!ctx) throw new Error("useShellStats must be used within ShellStatsProvider");
  return ctx;
}

export function triggerStatsRefresh() {
  window.dispatchEvent(new Event("urms:stats-refresh"));
}
