import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/layout/UserLayout";
import RequestModal from "../../components/common/RequestModal";

type ResourceType = "Hardware" | "Software" | "Book";

interface ResourceData {
  name: string;
  type: ResourceType;
  icon: string;
  available: number;
  desc: string;
  location: string;
  condition: string;
  loanPeriod: string;
  specs: { label: string; value: string }[];
}

// Simulated resource lookup — replace with real API call
const RESOURCE_MAP: Record<string, ResourceData> = {
  "1": {
    name: "Dell Laptop",
    type: "Hardware",
    icon: "💻",
    available: 3,
    desc: "High-performance laptop suitable for programming, data analysis, and general use.",
    location: "Lab C, Room 204",
    condition: "Good",
    loanPeriod: "7 days",
    specs: [
      { label: "Processor", value: "Intel Core i5-12th Gen" },
      { label: "RAM", value: "8 GB DDR4" },
      { label: "Storage", value: "256 GB SSD" },
      { label: "Display", value: "14-inch FHD" },
      { label: "OS", value: "Windows 11 Pro" },
    ],
  },
  "2": {
    name: "Operating System Book",
    type: "Book",
    icon: "📖",
    available: 7,
    desc: "Comprehensive textbook covering process management, memory, and file systems.",
    location: "Library — Shelf B-12",
    condition: "Good",
    loanPeriod: "7 days",
    specs: [
      { label: "Author", value: "Silberschatz, Galvin" },
      { label: "Edition", value: "10th Edition" },
      { label: "ISBN", value: "978-1119320098" },
      { label: "Pages", value: "944" },
    ],
  },
  "3": {
    name: "MS-Office License",
    type: "Software",
    icon: "🖥️",
    available: 10,
    desc: "Full MS-Office License with all the applications included",
    location: "Digital — Activation via IT Portal",
    condition: "N/A",
    loanPeriod: "14 days",
    specs: [
      { label: "Version", value: "R2024a" },
      { label: "License", value: "1-user floating" },
      { label: "Platform", value: "Windows / macOS" },
      { label: "Toolboxes", value: "Signal, Stats, Control" },
    ],
  },
};

const TAG_CLASS: Record<ResourceType, string> = {
  Hardware: "tag tag-hardware",
  Software: "tag tag-software",
  Book: "tag tag-book",
};

const ResourceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const resource = id ? RESOURCE_MAP[id] : undefined;

  if (!resource) {
    return (
      <Layout>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            Resource not found
          </div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
            The resource with ID "{id}" does not exist.
          </div>
          <button className="btn-primary" onClick={() => navigate("/resources")}>
            Back to Browse
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Back */}
      <button
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
        {/* Left: Details */}
        <div>
          {/* Header card */}
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
                {resource.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>{resource.name}</h1>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <span className={TAG_CLASS[resource.type]}>{resource.type}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {resource.desc}
                </p>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="panel">
            <div className="panel-header">
              <span className="panel-title">Specifications</span>
            </div>
            <div className="table-wrap">
              <table>
                <tbody>
                  {resource.specs.map((s) => (
                    <tr key={s.label}>
                      <td style={{ color: "var(--text-muted)", width: "40%" }}>{s.label}</td>
                      <td style={{ fontWeight: 500 }}>{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Summary card */}
        <div className="panel" style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: resource.available > 0 ? "var(--success)" : "var(--danger)",
              marginBottom: 4,
            }}
          >
            {resource.available}
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
            units available
          </div>

          {[
            { label: "Location", value: resource.location },
            { label: "Loan Period", value: resource.loanPeriod },
            { label: "Condition", value: resource.condition },
            { label: "Resource ID", value: `RES-${id?.padStart(4, "0")}` },
          ].map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
                fontSize: 13,
              }}
            >
              <span style={{ color: "var(--text-muted)" }}>{row.label}</span>
              <span style={{ fontWeight: 500, textAlign: "right" }}>{row.value}</span>
            </div>
          ))}

          <button
            className="btn-primary"
            disabled={resource.available === 0}
            onClick={() => setShowModal(true)}
            style={{ width: "100%", marginTop: 20, padding: "11px" }}
          >
            {resource.available === 0 ? "Currently Unavailable" : "Request Resource"}
          </button>
        </div>
      </div>

      {showModal && (
        <RequestModal
          resourceName={resource.name}
          onClose={() => setShowModal(false)}
        />
      )}
    </Layout>
  );
};

export default ResourceDetails;