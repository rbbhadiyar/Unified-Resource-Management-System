import { useState } from "react";
import Layout from "../../components/layout/UserLayout";
import RequestModal from "../../components/common/RequestModal";

type ResourceType = "Hardware" | "Software" | "Book";

interface Resource {
  name: string;
  type: ResourceType;
  icon: string;
  available: number;
  desc: string;
}

const allResources: Resource[] = [
  { name: "Dell Laptop", type: "Hardware", icon: "💻", available: 3, desc: "14-inch, i5, 8GB RAM, Windows 11" },
  { name: "HP Laptop", type: "Hardware", icon: "💻", available: 2, desc: "15-inch, i7, 16GB RAM, Windows 11" },
  { name: "Arduino Kit", type: "Hardware", icon: "🔧", available: 5, desc: "Starter kit with sensors and modules" },
  { name: "Operating System Book", type: "Book", icon: "📖", available: 7, desc: "Silberschatz, 10th Edition" },
  { name: "C++ Programming", type: "Book", icon: "📗", available: 4, desc: "Bjarne Stroustrup, 4th Edition" },
  { name: "Data Structures", type: "Book", icon: "📘", available: 6, desc: "Cormen, Introduction to Algorithms" },
  { name: "MS-Office License", type: "Software", icon: "🖥️", available: 10, desc: "R2024a, 1-user floating license" },
  { name: "AutoCAD License", type: "Software", icon: "📐", available: 8, desc: "2024 version, 30-day loan" },
  { name: "Adobe Suite", type: "Software", icon: "🎨", available: 3, desc: "Creative Cloud, all apps" },
];

const TAG_CLASS: Record<ResourceType, string> = {
  Hardware: "tag tag-hardware",
  Software: "tag tag-software",
  Book: "tag tag-book",
};

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--text-hint)" }}>
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
);

const BrowseResources = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ResourceType | "">("");
  const [modalResource, setModalResource] = useState<string | null>(null);

  const filtered = allResources.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "" || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <Layout>
      <div className="page-header">
        <h1>Browse Resources</h1>
        <p>Find and request available resources from the inventory.</p>
      </div>

      {/* Filter Bar */}
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

      {/* Resource Cards */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)", fontSize: 14 }}>
          No resources found matching your search.
        </div>
      ) : (
        <div className="resource-grid">
          {filtered.map((r) => (
            <div key={r.name} className="resource-card">
              <div className="resource-card-icon">{r.icon}</div>
              <div>
                <div className="resource-card-name">{r.name}</div>
                <div className="resource-card-desc">{r.desc}</div>
              </div>
              <div>
                <span className={TAG_CLASS[r.type]}>{r.type}</span>
              </div>
              <div className="resource-card-avail">
                Available: <strong>{r.available}</strong>
              </div>
              <button
                className="btn-primary"
                disabled={r.available === 0}
                onClick={() => setModalResource(r.name)}
              >
                {r.available === 0 ? "Unavailable" : "Request Resource"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {modalResource && (
        <RequestModal
          resourceName={modalResource}
          onClose={() => setModalResource(null)}
        />
      )}
    </Layout>
  );
};

export default BrowseResources;