import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { bulkUpdateRules, getRules, updateRule } from "../../api/rules";
import type { ApiRule } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

interface RuleRow {
  ruleId: number;
  id: string;
  category: string;
  rule: string;
  value: string;
  unit: string;
  editable: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  "Loan Period": { bg: "rgba(37,99,235,.1)", color: "#2563eb", border: "rgba(37,99,235,.25)" },
  "Fine Policy": { bg: "rgba(220,38,38,.1)", color: "#dc2626", border: "rgba(220,38,38,.25)" },
  "Borrowing Limits": { bg: "rgba(217,119,6,.1)", color: "#d97706", border: "rgba(217,119,6,.25)" },
  "Request Rules": { bg: "rgba(22,163,74,.1)", color: "#16a34a", border: "rgba(22,163,74,.25)" },
};

const CATEGORY_ICONS: Record<string, string> = {
  "Loan Period": "📅",
  "Fine Policy": "💰",
  "Borrowing Limits": "📦",
  "Request Rules": "📋",
};

function mapApi(r: ApiRule): RuleRow {
  return {
    ruleId: r.rule_id,
    id: String(r.rule_id),
    category: r.category,
    rule: r.rule_name,
    value: String(r.value),
    unit: r.unit,
    editable: true,
  };
}

const Rules = () => {
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadErr(null);
    try {
      const { data } = await getRules();
      const arr = Array.isArray(data) ? (data as ApiRule[]) : [];
      setRules(arr.map(mapApi));
    } catch (e) {
      setLoadErr(apiErrorMessage(e, "Could not load rules"));
      setRules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = Array.from(new Set(rules.map((r) => r.category)));

  const startEdit = (rule: RuleRow) => {
    setEditingId(rule.id);
    setEditValue(rule.value);
  };

  const saveEdit = async (id: string) => {
    const row = rules.find((r) => r.id === id);
    if (!row) return;
    const num = parseFloat(editValue);
    if (!Number.isFinite(num)) return;
    setSaveErr(null);
    try {
      await updateRule(row.ruleId, num);
      setRules((prev) => prev.map((r) => (r.id === id ? { ...r, value: editValue } : r)));
      setEditingId(null);
    } catch (e) {
      setSaveErr(apiErrorMessage(e, "Update failed"));
    }
  };

  const cancelEdit = () => setEditingId(null);

  const handleSaveAll = async () => {
    setSaveErr(null);
    try {
      const items = rules.map((r) => ({ rule_id: r.ruleId, value: parseFloat(r.value) }));
      if (items.some((x) => !Number.isFinite(x.value))) {
        setSaveErr("All rule values must be numbers.");
        return;
      }
      await bulkUpdateRules(items);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await load();
    } catch (e) {
      setSaveErr(apiErrorMessage(e, "Bulk save failed"));
    }
  };

  return (
    <AdminLayout>
      <div className="page-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1>Rules & Policies</h1>
          <p>Configure borrowing rules, fine policies, and limits (synced with the database).</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => void handleSaveAll()} style={{ flexShrink: 0 }}>
          {saved ? "✓ Saved" : "Save All Changes"}
        </button>
      </div>

      {loadErr && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{loadErr}</div>}
      {saveErr && <div style={{ color: "var(--danger, #b91c1c)", marginBottom: 12 }}>{saveErr}</div>}
      {loading && <div style={{ marginBottom: 16 }}>Loading rules…</div>}

      <div className="stats-grid" style={{ marginBottom: 28 }}>
        {categories.map((cat) => {
          const c = CATEGORY_COLORS[cat] || CATEGORY_COLORS["Request Rules"];
          const count = rules.filter((r) => r.category === cat).length;
          return (
            <div key={cat} className="stat-card" style={{ "--card-accent": c.color } as React.CSSProperties}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{CATEGORY_ICONS[cat] || "📋"}</div>
              <div className="stat-label">{cat}</div>
              <div className="stat-value" style={{ fontSize: 20 }}>{count}</div>
              <div className="stat-sub">rules configured</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {categories.map((cat) => {
          const c = CATEGORY_COLORS[cat] || CATEGORY_COLORS["Request Rules"];
          const catRules = rules.filter((r) => r.category === cat);
          return (
            <div key={cat} className="panel">
              <div className="panel-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{CATEGORY_ICONS[cat] || "📋"}</span>
                  <span className="panel-title">{cat}</span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: c.bg,
                      color: c.color,
                      border: `1px solid ${c.border}`,
                    }}
                  >
                    {catRules.length} rules
                  </span>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Rule</th>
                    <th style={{ width: 140 }}>Value</th>
                    <th style={{ width: 80 }}>Unit</th>
                    <th style={{ width: 100 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {catRules.map((rule) => (
                    <tr key={rule.id}>
                      <td style={{ fontWeight: 500 }}>{rule.rule}</td>
                      <td>
                        {editingId === rule.id ? (
                          <input
                            className="form-input"
                            style={{ padding: "5px 8px", fontSize: 13, width: 100 }}
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") void saveEdit(rule.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                        ) : (
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: 15,
                              color: c.color,
                              background: c.bg,
                              padding: "3px 10px",
                              borderRadius: 6,
                              border: `1px solid ${c.border}`,
                            }}
                          >
                            {rule.value}
                          </span>
                        )}
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{rule.unit}</td>
                      <td>
                        {editingId === rule.id ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <button type="button" className="btn-primary btn-sm" onClick={() => void saveEdit(rule.id)}>
                              Save
                            </button>
                            <button type="button" className="btn-outline btn-sm" onClick={cancelEdit}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button type="button" className="btn-outline btn-sm" onClick={() => startEdit(rule)}>
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 24,
          padding: "14px 18px",
          borderRadius: 10,
          background: "var(--info-bg)",
          border: "1px solid rgba(3,105,161,.2)",
          fontSize: 13,
          color: "var(--info)",
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <span>ℹ️</span>
        <span>Changes apply to new requests. Use Save All to push every value to the server.</span>
      </div>
    </AdminLayout>
  );
};

export default Rules;
