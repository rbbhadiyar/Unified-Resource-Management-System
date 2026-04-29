import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/UserLayout";
import RequestModal from "../../components/common/RequestModal";
import { getResources } from "../../api/resources";
import type { ApiResource } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

type ResourceType = "Hardware" | "Software" | "Book";

function typeFromApi(typeName?: string | null): ResourceType {
  const n = (typeName || "").toLowerCase();
  if (n.includes("software")) return "Software";
  if (n.includes("book")) return "Book";
  return "Hardware";
}

function iconFor(t: ResourceType): string {
  if (t === "Software") return "🖥️";
  if (t === "Book") return "📖";
  return "💻";
}

const TAG_CLASS: Record<ResourceType, string> = {
  Hardware: "tag tag-hardware",
  Software: "tag tag-software",
  Book: "tag tag-book",
};

function specsFromAttributes(attrs: Record<string, unknown> | null | undefined): { label: string; value: string }[] {
  if (!attrs || typeof attrs !== "object") return [];
  return Object.entries(attrs).map(([label, value]) => ({
    label,
    value: typeof value === "object" && value !== null ? JSON.stringify(value) : String(value),
  }));
}

const ResourceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [row, setRow] = useState<ApiResource | null>(null);

  const numericId = useMemo(() => {
    const n = Number(id);
    return Number.isFinite(n) ? n : NaN;
  }, [id]);

  const load = useCallback(async () => {
    if (!Number.isFinite(numericId)) {
      setRow(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const { data } = await getResources();
      const list = Array.isArray(data) ? (data as ApiResource[]) : [];
      const found = list.find((r) => r.resource_id === numericId) ?? null;
      setRow(found);
    } catch (e) {
      setErr(apiErrorMessage(e, "Could not load resource"));
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [numericId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: 40 }}>Loading…</div>
      </Layout>
    );
  }

  if (err || !row) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            Resource not found
          </div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
            {err || `The resource with ID "${id}" does not exist.`}
          </div>
          <button type="button" className="btn-primary" onClick={() => navigate("/resources")}>
            Back to Browse
          </button>
        </div>
      </Layout>
    );
  }

  const typ = typeFromApi(row.type_name);
  const icon = iconFor(typ);
  const specs = specsFromAttributes(row.attributes_json);
  const loanHint =
    row.lease_per_day != null && row.lease_per_day > 0
      ? `Lease ₹${row.lease_per_day}/day (if applicable)`
      : "Loan duration set when you submit a request";

  return (
    <Layout>
      <button
        type="button"
        onClick={() => navigate("/resources")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "var(--text-muted)",
          fontSize: 13,
          cursor: "pointer",
          fontFamily: "var(--font)",
          marginBottom: 20,
          padding: 0,
        }}
      >
        ← Back to Browse
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        <div>
          <div className="panel" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 14,
                  background: "var(--page-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 30,
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>{row.resource_name}</h1>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <span className={TAG_CLASS[typ]}>{typ}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {row.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Specifications</span>
            </div>
            <div className="table-wrap">
              <table>
                <tbody>
                  {specs.length === 0 ? (
                    <tr>
                      <td colSpan={2} style={{ color: "var(--text-muted)", padding: 16 }}>
                        No extra attributes for this resource.
                      </td>
                    </tr>
                  ) : (
                    specs.map((s) => (
                      <tr key={s.label}>
                        <td style={{ color: "var(--text-muted)", width: "40%" }}>{s.label}</td>
                        <td style={{ fontWeight: 500 }}>{s.value}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="panel" style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: row.available_quantity > 0 ? "var(--success)" : "var(--danger)",
              marginBottom: 4,
            }}
          >
            {row.available_quantity}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
            units available (of {row.total_quantity} total)
          </div>

          {[
            { label: "Leasable", value: row.is_leasable ? "Yes" : "No" },
            { label: "Loan / lease", value: loanHint },
            {
              label: "Fine (per day)",
              value: row.fine_per_day != null ? `₹${row.fine_per_day}` : "—",
            },
            {
              label: "Security deposit",
              value: row.security_deposit != null ? `₹${row.security_deposit}` : "—",
            },
            { label: "Resource ID", value: `RES-${String(row.resource_id).padStart(4, "0")}` },
          ].map((r) => (
            <div
              key={r.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
                fontSize: 13,
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>{r.label}</span>
              <span style={{ fontWeight: 500, textAlign: "right", maxWidth: "58%" }}>{r.value}</span>
            </div>
          ))}

          <button
            type="button"
            className="btn-primary"
            disabled={row.available_quantity === 0}
            onClick={() => setShowModal(true)}
            style={{ width: "100%", marginTop: 20, padding: "11px" }}
          >
            {row.available_quantity === 0 ? "Currently Unavailable" : "Request Resource"}
          </button>
        </div>
      </div>

      {showModal && (
        <RequestModal
          resourceId={row.resource_id}
          resourceName={row.resource_name}
          onClose={() => setShowModal(false)}
          onSuccess={() => void load()}
        />
      )}
    </Layout>
  );
};

export default ResourceDetails;
