import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getAdminFeedback } from "../../api/feedback";
import type { ApiFeedbackOut } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

const Stars = ({ rating, size = 14 }: { rating: number; size?: number }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s <= rating ? "#f59e0b" : "none"} stroke={s <= rating ? "#f59e0b" : "var(--text-hint)"} strokeWidth="1.5">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

const RATING_LABEL: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: "Poor", color: "#dc2626", bg: "rgba(220,38,38,.1)" },
  2: { label: "Fair", color: "#d97706", bg: "rgba(217,119,6,.1)" },
  3: { label: "Good", color: "#0369a1", bg: "rgba(3,105,161,.1)" },
  4: { label: "Very Good", color: "#16a34a", bg: "rgba(22,163,74,.1)" },
  5: { label: "Excellent", color: "#7c3aed", bg: "rgba(124,58,237,.1)" },
};

function guessType(name?: string | null): "Hardware" | "Software" | "Book" {
  const n = (name || "").toLowerCase();
  if (n.includes("license") || n.includes("software") || n.includes("office")) return "Software";
  if (n.includes("book")) return "Book";
  return "Hardware";
}

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  Hardware: { bg: "rgba(126,34,206,.1)", color: "#7e22ce" },
  Software: { bg: "rgba(21,128,61,.1)", color: "#15803d" },
  Book: { bg: "rgba(180,83,9,.1)", color: "#b45309" },
};

const fmt = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
};

const AdminFeedback = () => {
  const [rows, setRows] = useState<ApiFeedbackOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"resources" | "overall">("resources");
  const [filterRating, setFilterRating] = useState<number | "all">("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await getAdminFeedback();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(apiErrorMessage(e, "Failed to load feedback"));
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const resourceRows = useMemo(() => rows.filter((r) => r.scope === "resource"), [rows]);
  const overallRows = useMemo(() => rows.filter((r) => r.scope === "overall"), [rows]);

  const avgResourceRating =
    resourceRows.length > 0 ? (resourceRows.reduce((s, f) => s + f.rating, 0) / resourceRows.length).toFixed(1) : "—";
  const avgOverallRating =
    overallRows.length > 0 ? (overallRows.reduce((s, f) => s + f.rating, 0) / overallRows.length).toFixed(1) : "—";
  const lowRated = resourceRows.filter((f) => f.rating <= 2).length;

  const filteredResources = useMemo(() => {
    return resourceRows.filter((f) => {
      const typ = guessType(f.resource_name);
      const matchRating = filterRating === "all" || f.rating === filterRating;
      const matchType = filterType === "all" || typ === filterType;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (f.user_name || "").toLowerCase().includes(q) ||
        (f.resource_name || "").toLowerCase().includes(q);
      return matchRating && matchType && matchSearch;
    });
  }, [resourceRows, filterRating, filterType, search]);

  const filteredOverall = useMemo(() => {
    return overallRows.filter((f) => {
      const matchRating = filterRating === "all" || f.rating === filterRating;
      const q = search.toLowerCase();
      const matchSearch =
        !q || (f.user_name || "").toLowerCase().includes(q) || (f.category || "").toLowerCase().includes(q);
      return matchRating && matchSearch;
    });
  }, [overallRows, filterRating, search]);

  return (
    <AdminLayout>
      <div className="page-header">
        <h1>Feedback</h1>
        <p>Ratings and comments from students and staff (live data).</p>
      </div>

      {err && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{err}</div>}
      {loading && <div style={{ marginBottom: 16 }}>Loading…</div>}

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ "--card-accent": "#f59e0b" } as CSSProperties}>
          <div className="stat-label">Avg resource rating</div>
          <div className="stat-value">{avgResourceRating === "—" ? "—" : `${avgResourceRating} ★`}</div>
          <div className="stat-sub">{resourceRows.length} review{resourceRows.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "#7c3aed" } as CSSProperties}>
          <div className="stat-label">Avg overall rating</div>
          <div className="stat-value">{avgOverallRating === "—" ? "—" : `${avgOverallRating} ★`}</div>
          <div className="stat-sub">{overallRows.length} response{overallRows.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "#dc2626" } as CSSProperties}>
          <div className="stat-label">Low resource ratings</div>
          <div className="stat-value">{lowRated}</div>
          <div className="stat-sub">2 stars or below</div>
        </div>
        <div className="stat-card" style={{ "--card-accent": "#16a34a" } as CSSProperties}>
          <div className="stat-label">Total entries</div>
          <div className="stat-value">{rows.length}</div>
          <div className="stat-sub">Resource + overall</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid var(--border)" }}>
        {(["resources", "overall"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 22px",
              background: "none",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid var(--accent)" : "2px solid transparent",
              marginBottom: -2,
              fontSize: 13.5,
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "var(--accent)" : "var(--text-muted)",
              cursor: "pointer",
              fontFamily: "var(--font)",
            }}
          >
            {tab === "resources" ? `Resource (${resourceRows.length})` : `Overall (${overallRows.length})`}
          </button>
        ))}
      </div>

      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="search-wrap">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          className="filter-select"
          value={String(filterRating)}
          onChange={(e) => setFilterRating(e.target.value === "all" ? "all" : Number(e.target.value))}
        >
          <option value="all">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} star{r !== 1 ? "s" : ""}
            </option>
          ))}
        </select>
        {activeTab === "resources" && (
          <select className="filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">All types</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Book">Book</option>
          </select>
        )}
      </div>

      {activeTab === "resources" && (
        <div className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Resource</th>
                  <th>Type</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredResources.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "var(--text-muted)", padding: 32 }}>
                      No resource feedback yet.
                    </td>
                  </tr>
                ) : (
                  filteredResources.map((f) => {
                    const typ = guessType(f.resource_name);
                    const rl = RATING_LABEL[f.rating];
                    const tc = TAG_COLORS[typ];
                    return (
                      <tr key={f.feedback_id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{f.user_name || `User #${f.user_id}`}</div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontWeight: 500 }}>{f.resource_name || "—"}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: tc.bg, color: tc.color }}>{typ}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <Stars rating={f.rating} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: rl.color, background: rl.bg, padding: "1px 7px", borderRadius: 10, width: "fit-content" }}>
                              {rl.label}
                            </span>
                          </div>
                        </td>
                        <td style={{ maxWidth: 260, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>
                          {f.comment || <span style={{ color: "var(--text-hint)", fontStyle: "italic" }}>No comment</span>}
                        </td>
                        <td style={{ color: "var(--text-hint)", fontSize: 12, whiteSpace: "nowrap" }}>{fmt(f.created_at)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "overall" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredOverall.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: 48 }}>No overall feedback yet.</div>
          ) : (
            filteredOverall.map((f) => {
              const rl = RATING_LABEL[f.rating];
              const initials = (f.user_name || "U")
                .split(/\s+/)
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div key={f.feedback_id} className="panel" style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div className="user-avatar" style={{ width: 38, height: 38, fontSize: 13 }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{f.user_name || `User #${f.user_id}`}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "var(--accent-light)", color: "var(--accent)" }}>
                        {f.category || "General"}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: rl.bg, color: rl.color }}>
                        {rl.label}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text-hint)", whiteSpace: "nowrap" }}>{fmt(f.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <Stars rating={f.rating} size={16} />
                  </div>
                  {f.comment && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: "12px 16px",
                        background: "var(--page-bg)",
                        borderRadius: 8,
                        fontSize: 13.5,
                        color: "var(--text-muted)",
                        lineHeight: 1.6,
                        borderLeft: "3px solid var(--border)",
                      }}
                    >
                      {f.comment}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminFeedback;
