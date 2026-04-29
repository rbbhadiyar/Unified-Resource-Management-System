import { useCallback, useEffect, useState } from "react";
import Layout from "../../components/layout/UserLayout";
import { useToast } from "../../context/ToastContext";
import { getEligibleReturns, getMyFeedback, submitFeedback } from "../../api/feedback";
import type { ApiEligibleReturn, ApiFeedbackOut } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

const StarRating = ({
  value,
  onChange,
  readonly = false,
  size = 22,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: number;
}) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ display: "flex", gap: 3 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={star <= active ? "#f59e0b" : "none"}
            stroke={star <= active ? "#f59e0b" : "var(--text-hint)"}
            strokeWidth="1.5"
            style={{ cursor: readonly ? "default" : "pointer", transition: "fill 0.1s, stroke 0.1s" }}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange?.(star)}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
      {!readonly && active > 0 && (
        <span style={{ fontSize: 12, color: "#f59e0b", fontWeight: 600, minWidth: 60 }}>
          {LABELS[active]}
        </span>
      )}
    </div>
  );
};

function guessType(name: string): "Hardware" | "Software" | "Book" {
  const n = name.toLowerCase();
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
    return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

const Feedback = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState<ApiEligibleReturn[]>([]);
  const [mine, setMine] = useState<ApiFeedbackOut[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<"resources" | "overall">("resources");
  const [overallRating, setOverallRating] = useState(0);
  const [overallComment, setOverallComment] = useState("");
  const [category, setCategory] = useState("General");
  const [overallBusy, setOverallBusy] = useState(false);
  const [busyReq, setBusyReq] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [e, m] = await Promise.all([getEligibleReturns(), getMyFeedback()]);
      setEligible(Array.isArray(e.data) ? e.data : []);
      setMine(Array.isArray(m.data) ? m.data : []);
    } catch {
      setEligible([]);
      setMine([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const overallMine = mine.filter((x) => x.scope === "overall");

  const submitResource = async (requestId: number, resourceName: string) => {
    const rating = ratings[requestId] || 0;
    if (rating === 0) {
      showToast("Please select a star rating.");
      return;
    }
    setBusyReq(requestId);
    try {
      await submitFeedback({
        scope: "resource",
        request_id: requestId,
        rating,
        comment: comments[requestId]?.trim() || undefined,
      });
      showToast(`Feedback for "${resourceName}" saved.`);
      await load();
    } catch (err) {
      showToast(apiErrorMessage(err, "Could not save feedback"));
    } finally {
      setBusyReq(null);
    }
  };

  const submitOverall = async () => {
    if (overallRating === 0) {
      showToast("Please rate your overall experience.");
      return;
    }
    setOverallBusy(true);
    try {
      await submitFeedback({
        scope: "overall",
        rating: overallRating,
        comment: overallComment.trim() || undefined,
        category,
      });
      showToast("Thank you — overall feedback saved.");
      setOverallRating(0);
      setOverallComment("");
      await load();
    } catch (err) {
      showToast(apiErrorMessage(err, "Could not save feedback"));
    } finally {
      setOverallBusy(false);
    }
  };

  const pendingCount = eligible.length;
  const submittedResourceCount = mine.filter((x) => x.scope === "resource").length;

  return (
    <Layout>
      <div className="page-header">
        <h1>Feedback</h1>
        <p>Rate returned resources and share your overall experience with URMS.</p>
      </div>

      {loading && <div style={{ marginBottom: 16 }}>Loading…</div>}

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <div style={{ background: "var(--info-bg)", color: "var(--info)", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 500 }}>
          {pendingCount} return{pendingCount !== 1 ? "s" : ""} awaiting rating
        </div>
        {submittedResourceCount > 0 && (
          <div style={{ background: "var(--success-bg)", color: "var(--success)", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 500 }}>
            {submittedResourceCount} resource review{submittedResourceCount !== 1 ? "s" : ""} sent
          </div>
        )}
        {overallMine.length > 0 && (
          <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: 8, padding: "10px 18px", fontSize: 13, fontWeight: 500 }}>
            {overallMine.length} overall note{overallMine.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: "2px solid var(--border)" }}>
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
            {tab === "resources" ? "Resource feedback" : "Overall experience"}
          </button>
        ))}
      </div>

      {activeTab === "resources" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!loading && eligible.length === 0 && (
            <div className="panel" style={{ padding: 28, color: "var(--text-muted)", fontSize: 14 }}>
              No returned resources need a rating right now. After staff confirms a return, it will appear here.
            </div>
          )}
          {eligible.map((r) => {
            const name = r.resource_name || "Resource";
            const typ = guessType(name);
            const tag = TAG_COLORS[typ];
            const rid = r.request_id;
            return (
              <div key={rid} className="panel" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: "var(--page-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                    }}
                  >
                    {typ === "Book" ? "📖" : typ === "Software" ? "🖥️" : "💻"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>{name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: tag.bg, color: tag.color }}>{typ}</span>
                      <span style={{ fontSize: 11, color: "var(--text-hint)" }}>Returned {fmt(r.returned_at)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                    Your rating <span style={{ color: "var(--danger)" }}>*</span>
                  </div>
                  <StarRating value={ratings[rid] || 0} onChange={(v) => setRatings((s) => ({ ...s, [rid]: v }))} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
                    Comment <span style={{ fontWeight: 400, textTransform: "none" }}>(optional)</span>
                  </div>
                  <textarea
                    className="form-input"
                    rows={3}
                    value={comments[rid] ?? ""}
                    onChange={(e) => setComments((s) => ({ ...s, [rid]: e.target.value }))}
                    placeholder={`How was ${name}?`}
                    style={{ resize: "vertical", minHeight: 80, fontFamily: "var(--font)", fontSize: 13.5 }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={busyReq === rid || (ratings[rid] || 0) === 0}
                    onClick={() => void submitResource(rid, name)}
                  >
                    {busyReq === rid ? "Saving…" : "Submit feedback"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "overall" && (
        <div className="panel" style={{ padding: 28, maxWidth: 580 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Overall system experience</div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>Sitare University — how satisfied are you with URMS?</div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 10 }}>
              Overall rating <span style={{ color: "var(--danger)" }}>*</span>
            </div>
            <StarRating value={overallRating} onChange={setOverallRating} size={28} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Category</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["General", "UI/UX", "Performance", "Request process", "Support"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: category === cat ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: category === cat ? "var(--accent-light)" : "var(--page-bg)",
                    color: category === cat ? "var(--accent)" : "var(--text-muted)",
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Your feedback</div>
            <textarea
              className="form-input"
              rows={4}
              maxLength={300}
              placeholder="What worked well? What should we improve?"
              value={overallComment}
              onChange={(e) => setOverallComment(e.target.value)}
              style={{ resize: "vertical", minHeight: 100, fontFamily: "var(--font)", fontSize: 13.5 }}
            />
            <div style={{ fontSize: 11, color: "var(--text-hint)", marginTop: 4 }}>{overallComment.length}/300</div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="button" className="btn-primary" disabled={overallBusy || overallRating === 0} onClick={() => void submitOverall()}>
              {overallBusy ? "Saving…" : "Submit feedback"}
            </button>
          </div>

          {overallMine.length > 0 && (
            <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 12 }}>Your recent overall responses</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {overallMine.slice(0, 5).map((f) => (
                  <div key={f.feedback_id} style={{ fontSize: 13, color: "var(--text-muted)" }}>
                    <StarRating value={f.rating} readonly size={16} /> · {f.category || "General"} · {fmt(f.created_at)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Feedback;
