// Navbar.jsx
"use client";

const ACCENT = "#00f5ff";

const NAV_LINKS = [
  ["Home",     "hero"],
  ["Services", "services"],
  ["Contact",  "contact"],
];

export default function Navbar({ activeSection, jumpTo }) {
  return (
    <>
      <style>{`
        /* ── Shell ── */
        #site-nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 800;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 3.5rem;
          box-sizing: border-box;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(3,3,10,0.80);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* ── Brand ── */
        .nav-brand {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: #ffffff;
          text-decoration: none;
          cursor: pointer;
          text-shadow: 0 0 20px rgba(0,245,255,0.30);
          transition: text-shadow 0.3s ease, letter-spacing 0.3s ease;
        }
        .nav-brand:hover {
          text-shadow: 0 0 28px rgba(0,245,255,0.65);
          letter-spacing: 0.38em;
        }

        /* ── Links wrapper ── */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Each nav button ── */
        .nav-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.20em;
          text-transform: uppercase;
          padding: 8px 18px;
          border-radius: 7px;
          color: rgba(255,255,255,0.38);
          transition: color 0.3s ease, background 0.3s ease;
        }

        /* Active state */
        .nav-btn.is-active {
          color: #ffffff;
        }

        /* Active underline — cyan bar */
        .nav-btn.is-active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 22px;
          height: 2px;
          border-radius: 1px;
          background: ${ACCENT};
          box-shadow: 0 0 10px rgba(0,245,255,0.80);
        }

        .nav-btn:hover:not(.is-active) {
          color: rgba(255,255,255,0.80);
          background: rgba(255,255,255,0.05);
        }

        /* ── CTA pill — "Get Started" ── */
        .nav-cta {
          margin-left: 20px;
          background: rgba(0,245,255,0.07);
          border: 1px solid rgba(0,245,255,0.38);
          color: ${ACCENT};
          font-family: inherit;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 10px 24px;
          border-radius: 24px;
          cursor: pointer;
          text-shadow: 0 0 12px rgba(0,245,255,0.40);
          transition:
            background   0.3s ease,
            border-color 0.3s ease,
            box-shadow   0.3s ease,
            transform    0.3s ease;
          will-change: transform;
        }
        .nav-cta:hover {
          background: rgba(0,245,255,0.14);
          border-color: rgba(0,245,255,0.75);
          box-shadow: 0 0 22px rgba(0,245,255,0.28);
          transform: translateY(-2px);
        }

        /* ── Mobile ── */
        @media (max-width: 600px) {
          .nav-links { gap: 0; }
          .nav-btn   { display: none; }
          .nav-cta   { margin-left: 0; padding: 9px 20px; }
          #site-nav  { padding: 0 1.8rem; height: 64px; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .nav-brand,
          .nav-btn,
          .nav-cta { transition: none; }
        }
      `}</style>

      <header id="site-nav">

        {/* Brand */}
        <span className="nav-brand" onClick={() => jumpTo("hero")}>
          BISF
        </span>

        {/* Links + CTA */}
        <nav className="nav-links" aria-label="Main navigation">
          {NAV_LINKS.map(([label, id]) => (
            <button
              key={id}
              className={`nav-btn${activeSection === id ? " is-active" : ""}`}
              onClick={() => jumpTo(id)}
              aria-current={activeSection === id ? "page" : undefined}
            >
              {label}
            </button>
          ))}
          <button className="nav-cta" onClick={() => jumpTo("contact")}>
            Get Started
          </button>
        </nav>

      </header>
    </>
  );
}