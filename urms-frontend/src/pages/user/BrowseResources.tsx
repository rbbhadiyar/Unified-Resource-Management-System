import { useCallback, useEffect, useState } from "react";
import Layout from "../../components/layout/UserLayout";
import RequestModal from "../../components/common/RequestModal";
import { getResources } from "../../api/resources";
import type { ApiResource } from "../../types/api";
import { apiErrorMessage } from "../../utils/apiError";

type ResourceType = "Hardware" | "Software" | "Book";

const TAG_CLASS: Record<ResourceType, string> = {
  Hardware: "tag tag-hardware",
  Software: "tag tag-software",
  Book: "tag tag-book",
};

function typeFromName(typeName?: string | null): ResourceType {
  const t = (typeName || "").toLowerCase();
  if (t.includes("software")) return "Software";
  if (t.includes("book")) return "Book";
  return "Hardware";
}

function iconForType(typeName?: string | null) {
  const t = (typeName || "").toLowerCase();
  if (t.includes("software")) return "🖥️";
  if (t.includes("book")) return "📖";
  return "💻";
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-hint)" }}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const BrowseResources = () => {
  const [list, setList] = useState<ApiResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ResourceType | "">("");
  const [modal, setModal] = useState<ApiResource | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const { data } = await getResources();
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(apiErrorMessage(e, "Could not load resources"));
      setList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = list.filter((r) => {
    const matchesSearch = r.resource_name.toLowerCase().includes(search.toLowerCase());
    const t = typeFromName(r.type_name);
    const matchesType = typeFilter === "" || t === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <div className="page-header">
        <h1>Browse Resources</h1>
        <p>Find and request available resources from the inventory.</p>
      </div>

      <div className="filter-bar">
        <div className="search-wrap">
          <SearchIcon />
          <input
            className="search-input"
            placeholder="Search resources…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ResourceType | "")}
        >
          <option value="">All Types</option>
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Book">Book</option>
        </select>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading…</div>
      )}
      {!loading && err && (
        <div style={{ color: "var(--danger, #b91c1c)", padding: 16 }}>{err}</div>
      )}
      {!loading && !err && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>
          No resources match your filters. Admins can add inventory under Manage Resources.
        </div>
      )}
      {!loading && !err && filtered.length > 0 && (
        <div className="resource-grid">
          {filtered.map((r) => {
            const t = typeFromName(r.type_name);
            return (
              <div key={r.resource_id} className="resource-card">
                <div className="resource-card-icon">{iconForType(r.type_name)}</div>
                <div>
                  <div className="resource-card-name">{r.resource_name}</div>
                  <div className="resource-card-desc">{r.description || "—"}</div>
                </div>
                <div>
                  <span className={TAG_CLASS[t]}>{t}</span>
                </div>
                <div className="resource-card-avail">
                  Available: <strong>{r.available_quantity}</strong>
                </div>
                <button
                  className="btn-primary"
                  disabled={r.available_quantity === 0}
                  type="button"
                  onClick={() => setModal(r)}
                >
                  {r.available_quantity === 0 ? "Unavailable" : "Request Resource"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <RequestModal
          resourceId={modal.resource_id}
          resourceName={modal.resource_name}
          onClose={() => setModal(null)}
          onSuccess={() => void load()}
        />
      )}
    </Layout>
  );
};

export default BrowseResources;
