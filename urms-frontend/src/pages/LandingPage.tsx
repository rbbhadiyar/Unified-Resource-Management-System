import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// ─── Icon components ──────────────────────────────────────────────────────────

const LogoIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
);

const StarIcon = () => (
  <svg className="lp-star" viewBox="0 0 20 20">
    <path d="M10 1l2.39 6.26H18.9l-5.3 3.85 2.02 6.26L10 13.5l-5.62 3.87 2.02-6.26L1.1 7.26H7.61z" />
  </svg>
);

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "12k+", label: "Resources managed" },
  { value: "340+", label: "Institutions onboarded" },
  { value: "98%",  label: "Return rate accuracy" },
  { value: "4.9★", label: "Average rating" },
];

const FEATURES = [
  {
    title: "Smart request management",
    desc: "Students and staff submit requests instantly. Admins approve, reject, and track all in one unified queue.",
    iconColor: "rgba(37,99,235,.12)",
    iconStroke: "#60a5fa",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#60a5fa" strokeWidth="1.6">
        <rect x="2" y="3" width="16" height="14" rx="2" /><path d="M6 8h8M6 12h5" />
      </svg>
    ),
  },
  {
    title: "Real-time availability",
    desc: "Live inventory tracking across all categories — hardware, software, books, and equipment.",
    iconColor: "rgba(29,158,117,.12)",
    iconStroke: "#34d399",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#34d399" strokeWidth="1.6">
        <path d="M4 10l5 5 8-8" /><circle cx="10" cy="10" r="8" />
      </svg>
    ),
  },
  {
    title: "Automated due-date alerts",
    desc: "Overdue reminders sent automatically. Fine tracking keeps accountability without manual effort.",
    iconColor: "rgba(186,117,23,.12)",
    iconStroke: "#fbbf24",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#fbbf24" strokeWidth="1.6">
        <circle cx="10" cy="10" r="8" /><path d="M10 6v4l3 2" />
      </svg>
    ),
  },
  {
    title: "Detailed analytics",
    desc: "Utilisation trends, peak demand periods, and borrowing history — all at a glance with actionable insights.",
    iconColor: "rgba(139,92,246,.12)",
    iconStroke: "#a78bfa",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#a78bfa" strokeWidth="1.6">
        <path d="M3 14l5-5 3 3 6-7" />
      </svg>
    ),
  },
  {
    title: "Role-based access",
    desc: "Student, staff, and admin roles with fine-grained permissions. The right access for every user type.",
    iconColor: "rgba(236,72,153,.12)",
    iconStroke: "#f472b6",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#f472b6" strokeWidth="1.6">
        <circle cx="7" cy="7" r="4" /><circle cx="14" cy="14" r="3" />
        <path d="M11 7h5M14 11v5" />
      </svg>
    ),
  },
  {
    title: "Export & reports",
    desc: "Monthly and custom reports exportable in seconds. Perfect for institutional audits and reviews.",
    iconColor: "rgba(6,182,212,.12)",
    iconStroke: "#22d3ee",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#22d3ee" strokeWidth="1.6">
        <rect x="3" y="11" width="5" height="6" rx="1" />
        <rect x="8" y="6" width="5" height="11" rx="1" />
        <rect x="13" y="2" width="5" height="15" rx="1" />
      </svg>
    ),
  },
];

const STEPS = [
  {
    num: "1",
    title: "Register your institution",
    desc: "Create an admin account and onboard your institution. Add your resource catalogue in one bulk upload.",
  },
  {
    num: "2",
    title: "Invite your users",
    desc: "Students and staff join via email invite or institution SSO. Roles are assigned automatically by domain.",
  },
  {
    num: "3",
    title: "Start managing",
    desc: "Browse, request, issue, and track. Everything flows through one clean dashboard — no training needed.",
  },
];

const TESTIMONIALS = [
  {
    quote: '"We replaced three spreadsheets and a Google Form with URMS. Approval time dropped from days to minutes. It\'s become essential infrastructure."',
    name: "Dr. Rekha Nair",
    role: "Library Head, IIT Bombay",
    initials: "DR",
    avatarBg: "#1e3a5f",
    avatarColor: "#93c5fd",
  },
  {
    quote: '"The fine tracking alone saved us hours of admin work every month. Students actually return things on time because they get automatic reminders."',
    name: "Suresh Mehta",
    role: "IT Admin, VIT University",
    initials: "SM",
    avatarBg: "#1a3a2a",
    avatarColor: "#34d399",
  },
  {
    quote: '"Clean interface, no bloat. Our students adopted it in the first week without any training sessions. The dashboard gives exactly the info you need."',
    name: "Ananya Pillai",
    role: "Student Coordinator, BITS Pilani",
    initials: "AP",
    avatarBg: "#2d1a3a",
    avatarColor: "#c084fc",
  },
];

const FOOTER_LINKS = {
  Product:   ["Features", "How it works", "Pricing", "Changelog"],
  Resources: ["Documentation", "API reference", "Guides", "Support"],
  Company:   ["About", "Blog", "Careers", "Contact"],
};

// ─── Component ────────────────────────────────────────────────────────────────

const LandingPage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="lp-page">

      {/* ── Navbar ── */}
      <nav className={`lp-nav${scrolled ? " lp-nav--scrolled" : ""}`}>
        <div className="lp-brand">
          <div className="lp-logo-box"><LogoIcon /></div>
          <div>
            <div className="lp-brand-name">URMS</div>
            <div className="lp-brand-sub">Resource Management</div>
          </div>
        </div>
        <div className="lp-nav-btns">
          <button className="lp-theme-btn" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <button className="lp-btn-ghost" onClick={() => navigate("/login")}>Log in</button>
          <button className="lp-btn-solid" onClick={() => navigate("/register")}>Register</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-badge">
          <span className="lp-badge-dot" />
          Now available for universities &amp; institutions
        </div>
        <h1 className="lp-h1">
          Manage every resource.<br />
          <span className="lp-h1-accent">Effortlessly.</span>
        </h1>
        <p className="lp-hero-sub">
          URMS is the unified platform for institutions to track, issue, and manage
          physical and digital resources — all in one place.
        </p>
        <div className="lp-hero-ctas">
          <button className="lp-cta-primary" onClick={() => navigate("/register")}>Get started free →</button>
          <button className="lp-cta-secondary" onClick={() => navigate("/how-it-works")}>See how it works</button>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="lp-stats-bar">
        {STATS.map((s) => (
          <div key={s.label} className="lp-stat-item">
            <div className="lp-stat-n">{s.value}</div>
            <div className="lp-stat-l">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Dashboard mockup ── */}
      <section className="lp-mockup-section">
        <div className="lp-mockup-shell">
          {/* Browser chrome */}
          <div className="lp-mockup-bar">
            <span className="lp-mock-dot" style={{ background: "#ff5f57" }} />
            <span className="lp-mock-dot" style={{ background: "#ffbd2e" }} />
            <span className="lp-mock-dot" style={{ background: "#28ca41" }} />
            <div className="lp-mock-url">urms.institution.edu/dashboard</div>
          </div>
          {/* App shell */}
          <div className="lp-mock-body">
            {/* Sidebar */}
            <div className="lp-mock-sidebar">
              <div className="lp-mock-brand">
                <span className="lp-mock-brand-dot" />URMS
              </div>
              {[
                { label: "Dashboard", active: true },
                { label: "Browse resources", active: false },
                { label: "My resources", active: false },
                { label: "Requests", active: false },
              ].map((item) => (
                <div key={item.label} className={`lp-mock-item${item.active ? " lp-mock-item-active" : ""}`}>
                  {item.label}
                </div>
              ))}
            </div>
            {/* Main content */}
            <div className="lp-mock-main">
              <div className="lp-mock-heading">Good morning, Admin</div>
              <div className="lp-mock-stats">
                {[
                  { v: "120", l: "Total",     accent: "#2563eb" },
                  { v: "75",  l: "Available", accent: "#1D9E75" },
                  { v: "45",  l: "Issued",    accent: "#BA7517" },
                  { v: "3",   l: "Overdue",   accent: "#ef4444", danger: true },
                ].map((s) => (
                  <div key={s.l} className="lp-mock-stat">
                    <div className="lp-mock-sv" style={s.danger ? { color: "#ef4444" } : {}}>{s.v}</div>
                    <div className="lp-mock-sl">{s.l}</div>
                    <div className="lp-mock-accent" style={{ background: s.accent }} />
                  </div>
                ))}
              </div>
              <div className="lp-mock-row">
                <div className="lp-mock-card">
                  <div className="lp-mock-ct">Recent activity</div>
                  {[
                    { color: "#1D9E75", text: "Laptop issued to Ram Kumar" },
                    { color: "#2563eb", text: "OS Book returned by Aditi" },
                    { color: "#BA7517", text: "New: Projector added" },
                  ].map((a) => (
                    <div key={a.text} className="lp-mock-act-item">
                      <div className="lp-mock-dot" style={{ background: a.color }} />
                      <div className="lp-mock-act-text">{a.text}</div>
                    </div>
                  ))}
                </div>
                <div className="lp-mock-card">
                  <div className="lp-mock-ct">Utilisation</div>
                  {[
                    { label: "Hardware", pct: 75, color: "#2563eb" },
                    { label: "Software", pct: 60, color: "#1D9E75" },
                    { label: "Books",    pct: 38, color: "#BA7517" },
                  ].map((u) => (
                    <div key={u.label} className="lp-mock-util-row">
                      <div className="lp-mock-util-label">{u.label}</div>
                      <div className="lp-mock-util-track">
                        <div className="lp-mock-util-fill" style={{ width: `${u.pct}%`, background: u.color }} />
                      </div>
                      <div className="lp-mock-util-pct">{u.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="lp-features">
        <div className="lp-section-label">Why URMS</div>
        <h2 className="lp-section-h">Everything your institution needs</h2>
        <p className="lp-section-sub">
          A complete toolkit to manage resources from request to return — built for speed and clarity.
        </p>
        <div className="lp-feat-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-feat-card">
              <div className="lp-feat-icon" style={{ background: f.iconColor }}>
                {f.icon}
              </div>
              <div className="lp-feat-title">{f.title}</div>
              <div className="lp-feat-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="lp-how">
        <div className="lp-how-inner">
          <div className="lp-section-label">How it works</div>
          <h2 className="lp-section-h">Up and running in minutes</h2>
          <p className="lp-section-sub">
            Three simple steps — no complex setup, no IT tickets, no waiting.
          </p>
          <div className="lp-steps">
            {STEPS.map((step) => (
              <div key={step.num} className="lp-step">
                <div className="lp-step-num">{step.num}</div>
                <div className="lp-step-title">{step.title}</div>
                <div className="lp-step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="lp-testimonials">
        <div className="lp-section-label">Testimonials</div>
        <h2 className="lp-section-h">Trusted by institutions</h2>
        <p className="lp-section-sub">From small colleges to large universities — teams love URMS.</p>
        <div className="lp-testi-grid">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="lp-testi-card">
              <div className="lp-stars">
                {[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} />)}
              </div>
              <p className="lp-testi-quote">{t.quote}</p>
              <div className="lp-testi-author">
                <div className="lp-testi-ava" style={{ background: t.avatarBg, color: t.avatarColor }}>
                  {t.initials}
                </div>
                <div>
                  <div className="lp-testi-name">{t.name}</div>
                  <div className="lp-testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <div className="lp-cta-banner">
        <div>
          <h2 className="lp-banner-h">Ready to bring order to your resources?</h2>
          <p className="lp-banner-sub">Join 340+ institutions already using URMS. Free to start, no credit card required.</p>
        </div>
        <div className="lp-banner-btns">
          <button className="lp-cta-primary" onClick={() => navigate("/register")}>Get started free →</button>
          <button className="lp-cta-secondary" onClick={() => navigate("/demo")}>Book a demo</button>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-top">
          <div className="lp-footer-brand-col">
            <div className="lp-brand">
              <div className="lp-logo-box"><LogoIcon /></div>
              <div>
                <div className="lp-brand-name">URMS</div>
                <div className="lp-brand-sub">Resource Management</div>
              </div>
            </div>
            <p className="lp-footer-brand-text">
              A unified platform for institutions to track, issue, and manage all
              physical and digital resources seamlessly.
            </p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <div className="lp-footer-col-title">{heading}</div>
              {links.map((link) => (
                <div key={link} className="lp-footer-link">{link}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="lp-footer-bottom">
          <div>© 2025 URMS. All rights reserved.</div>
          <div className="lp-footer-badges">
            {["Privacy policy", "Terms of service", "Security"].map((b) => (
              <div key={b} className="lp-fbadge">{b}</div>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;