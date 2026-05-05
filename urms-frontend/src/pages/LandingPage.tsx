import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

type IconName = "grid" | "spark" | "clock" | "chart" | "shield" | "report";

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const ThemeIcon = ({ dark }: { dark: boolean }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    {dark ? (
      <>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </>
    ) : (
      <path d="M21 12.8A8.6 8.6 0 1 1 11.2 3a6.7 6.7 0 0 0 9.8 9.8Z" />
    )}
  </svg>
);

const FeatureIcon = ({ name }: { name: IconName }) => {
  const paths: Record<IconName, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </>
    ),
    spark: (
      <>
        <path d="M12 2l1.5 6 5.5 2-5.5 2L12 22l-1.5-10L5 10l5.5-2L12 2Z" />
        <path d="M4 3v4M2 5h4M20 17v4M18 19h4" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7v5l3.5 2" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M7 15l3.5-4 3 2.5L19 7" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3l7 3v5.5c0 4.2-2.7 7.6-7 9.5-4.3-1.9-7-5.3-7-9.5V6l7-3Z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
    report: (
      <>
        <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M14 3v5h5M8.5 13h7M8.5 17h5" />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

const STATS = [
  { value: "12k+", label: "Resources tracked", tone: "blue" },
  { value: "340+", label: "Campuses onboarded", tone: "green" },
  { value: "98%", label: "Return accuracy", tone: "amber" },
  { value: "4.9", label: "Admin satisfaction", tone: "rose" },
];

const FEATURES: Array<{ title: string; desc: string; icon: IconName; tag: string }> = [
  {
    title: "Smart request queues",
    desc: "Approve, reject, and issue from one focused queue.",
    icon: "grid",
    tag: "Flow",
  },
  {
    title: "Live availability",
    desc: "See what is available, issued, or overdue instantly.",
    icon: "spark",
    tag: "Live",
  },
  {
    title: "Automatic reminders",
    desc: "Send due-date nudges without manual follow-up.",
    icon: "clock",
    tag: "Alerts",
  },
  {
    title: "Usage analytics",
    desc: "Spot demand trends and busy categories quickly.",
    icon: "chart",
    tag: "Insights",
  },
  {
    title: "Role-based access",
    desc: "Clean access for students, staff, and admins.",
    icon: "shield",
    tag: "Secure",
  },
  {
    title: "Audit-ready reports",
    desc: "Export movement history and summaries fast.",
    icon: "report",
    tag: "Reports",
  },
];

const ACTIVITY = [
  { text: "MacBook Pro issued to Aditi Sharma", time: "2 min ago", tone: "blue" },
  { text: "Projector returned by Seminar Hall B", time: "12 min ago", tone: "green" },
  { text: "Database Systems book marked overdue", time: "31 min ago", tone: "red" },
];

const CATEGORIES = [
  { label: "Hardware", value: 78, count: "482 items" },
  { label: "Books", value: 64, count: "2,840 items" },
  { label: "Lab kits", value: 43, count: "156 items" },
];

const WORKFLOW = [
  { title: "Catalogue", desc: "Add resources, categories, owners, and rules." },
  { title: "Request", desc: "Users search, reserve, and track status." },
  { title: "Control", desc: "Admins issue, receive, remind, and report." },
];

const TESTIMONIALS = [
  {
    quote: "Approval time dropped from days to minutes. URMS became the single place our team trusts.",
    name: "Dr. Rekha Nair",
    role: "Library Head, IIT Bombay",
  },
  {
    quote: "The reminders and return flow saved our admin desk hours every week.",
    name: "Suresh Mehta",
    role: "IT Admin, VIT University",
  },
  {
    quote: "Students picked it up instantly. It feels clean, fast, and made for real campus work.",
    name: "Ananya Pillai",
    role: "Student Coordinator, BITS Pilani",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="lp-page">
      <div className="lp-ambient lp-ambient-one" />
      <div className="lp-ambient lp-ambient-two" />

      <nav className={`lp-nav${scrolled ? " lp-nav--scrolled" : ""}`}>
        <button className="lp-brand" onClick={() => scrollTo("top")} aria-label="Go to top">
          <span className="lp-logo-box"><LogoIcon /></span>
          <span>
            <span className="lp-brand-name">URMS</span>
            <span className="lp-brand-sub">Unified Resource Management</span>
          </span>
        </button>

        <div className="lp-nav-links" aria-label="Landing page sections">
          <button onClick={() => scrollTo("features")}>Features</button>
          <button onClick={() => scrollTo("workflow")}>Workflow</button>
          <button onClick={() => scrollTo("proof")}>Proof</button>
        </div>

        <div className="lp-nav-btns">
          <button className="lp-icon-btn" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle theme">
            <ThemeIcon dark={theme === "dark"} />
          </button>
          <button className="lp-btn-ghost" onClick={() => navigate("/login")}>Log in</button>
          <button className="lp-btn-solid" onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      <main id="top">
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <div className="lp-hero-badge">
              <span className="lp-badge-dot" />
              Campus-ready operations for 2026
            </div>
            <h1 className="lp-h1">Manage campus resources beautifully.</h1>
            <p className="lp-hero-sub">
              URMS brings inventory, requests, returns, reminders, and reports into one modern workspace.
            </p>
            <div className="lp-hero-ctas">
              <button className="lp-cta-primary" onClick={() => navigate("/register")}>Start managing</button>
              <button className="lp-cta-secondary" onClick={() => scrollTo("workflow")}>View workflow</button>
            </div>
            <div className="lp-trust-row" aria-label="Supported resource categories">
              {["Books", "Hardware", "Software", "Lab kits", "Rooms"].map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </div>

          <div className="lp-hero-visual" aria-label="URMS product preview">
            <div className="lp-orbit lp-orbit-one">Live</div>
            <div className="lp-orbit lp-orbit-two">98%</div>
            <div className="lp-dashboard">
              <div className="lp-dash-top">
                <div>
                  <span className="lp-dash-eyebrow">Admin overview</span>
                  <strong>Resource Pulse</strong>
                </div>
                <span className="lp-live-pill"><span /> Live sync</span>
              </div>

              <div className="lp-dash-grid">
                {STATS.map((stat) => (
                  <div key={stat.label} className={`lp-dash-stat lp-tone-${stat.tone}`}>
                    <span>{stat.label}</span>
                    <strong>{stat.value}</strong>
                  </div>
                ))}
              </div>

              <div className="lp-dash-panel">
                <div className="lp-panel-head">
                  <span>Issue activity</span>
                  <small>Today</small>
                </div>
                {ACTIVITY.map((item) => (
                  <div key={item.text} className="lp-activity-item">
                    <span className={`lp-activity-dot lp-tone-${item.tone}`} />
                    <div>
                      <strong>{item.text}</strong>
                      <small>{item.time}</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="lp-category-panel">
                {CATEGORIES.map((item) => (
                  <div key={item.label} className="lp-category-row">
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.count}</small>
                    </div>
                    <div className="lp-meter" aria-hidden="true">
                      <span style={{ width: `${item.value}%` }} />
                    </div>
                    <b>{item.value}%</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="lp-stats-bar" aria-label="URMS statistics">
          {STATS.map((s) => (
            <div key={s.label} className="lp-stat-item">
              <div className="lp-stat-n">{s.value}</div>
              <div className="lp-stat-l">{s.label}</div>
            </div>
          ))}
        </section>

        <section className="lp-section lp-features" id="features">
          <div className="lp-section-kicker">Why URMS</div>
          <h2 className="lp-section-h">Built for busy institutions.</h2>
          <p className="lp-section-sub">
            A cleaner way to track ownership, availability, and approvals.
          </p>
          <div className="lp-feat-grid">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="lp-feat-card">
                <div className="lp-feat-top">
                  <span className="lp-feat-icon"><FeatureIcon name={feature.icon} /></span>
                  <span className="lp-feat-tag">{feature.tag}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-workflow" id="workflow">
          <div className="lp-workflow-copy">
            <div className="lp-section-kicker">Workflow</div>
            <h2 className="lp-section-h">Request to return, simplified.</h2>
            <p className="lp-section-sub">
              Every resource stays visible through its full lifecycle.
            </p>
          </div>
          <div className="lp-timeline">
            {WORKFLOW.map((step, index) => (
              <article key={step.title} className="lp-step">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-proof" id="proof">
          <div className="lp-proof-card">
            <div>
              <div className="lp-section-kicker">Impact</div>
              <h2 className="lp-section-h">Less admin work. More clarity.</h2>
            </div>
            <div className="lp-proof-grid">
              <div><strong>72%</strong><span>faster request handling</span></div>
              <div><strong>41%</strong><span>fewer overdue escalations</span></div>
              <div><strong>3x</strong><span>better audit visibility</span></div>
            </div>
          </div>
          <div className="lp-testi-grid">
            {TESTIMONIALS.map((item) => (
              <article className="lp-testi-card" key={item.name}>
                <div className="lp-stars" aria-label="5 star rating">
                  {Array.from({ length: 5 }).map((_, index) => <span key={index}>*</span>)}
                </div>
                <p>"{item.quote}"</p>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.role}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-cta-banner">
          <div>
            <span className="lp-section-kicker">Get started</span>
            <h2>Bring every resource into one system.</h2>
            <p>Launch a cleaner, faster way to manage institutional resources.</p>
          </div>
          <div className="lp-banner-btns">
            <button className="lp-cta-primary" onClick={() => navigate("/register")}>Create account</button>
            <button className="lp-cta-secondary" onClick={() => navigate("/login")}>Log in</button>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-brand">
          <span className="lp-logo-box"><LogoIcon /></span>
          <span>
            <span className="lp-brand-name">URMS</span>
            <span className="lp-brand-sub">Unified Resource Management</span>
          </span>
        </div>
        <div className="lp-footer-links">
          <button onClick={() => scrollTo("features")}>Features</button>
          <button onClick={() => scrollTo("workflow")}>Workflow</button>
          <button onClick={() => scrollTo("proof")}>Proof</button>
        </div>
        <p>© 2026 URMS. Built for clarity at scale.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
