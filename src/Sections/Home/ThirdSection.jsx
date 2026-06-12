"use client";

// ─── Third Section: Impact Numbers ───────────────────────────────────────────

import { useEffect, useState } from "react";

// Color palette: black / white / green (#00f5ff cyan + #00e676 green) ONLY
const ACCENT  = "#00f5ff";  // cyan — matches Hero primary
const GREEN   = "#00e676";  // pure green

const STATS = [
  { num: "500+",    lbl: "Founders Mentored",   c: GREEN  },
  { num: "₹120Cr+", lbl: "Capital Facilitated", c: ACCENT },
  { num: "18",      lbl: "Countries Entered",   c: GREEN  },
  { num: "92%",     lbl: "Success Rate",        c: ACCENT },
];

export default function ThirdSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="impact" style={S.section}>
      <style>{`
        /* ── Background graph animations — UNTOUCHED ── */
        .bg-graph-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
          /* GPU layer so the animation never paints on the main thread */
          will-change: transform;
        }

        .animated-data-grid {
          position: absolute;
          width: 200vw;
          height: 200vh;
          top: -50vh;
          left: -50vw;
          background-image:
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          transform: perspective(1000px) rotateX(60deg) scale(2);
          animation: panGrid 4s linear infinite;
          will-change: transform;
        }

        @keyframes panGrid {
          0%   { transform: perspective(1000px) rotateX(60deg) scale(2) translateY(0); }
          100% { transform: perspective(1000px) rotateX(60deg) scale(2) translateY(60px); }
        }

        /* Data streams — green palette only */
        .data-stream {
          position: absolute;
          height: 1px;
          width: 200%;
          left: -50%;
          opacity: 0.6;
          animation: streamFlow linear infinite;
          will-change: transform;
        }
        .stream-1 {
          top: 30%;
          background: linear-gradient(90deg, transparent 0%, #00e676 50%, transparent 100%);
          animation-duration: 12s;
        }
        .stream-2 {
          top: 75%;
          background: linear-gradient(90deg, transparent 0%, #00f5ff 50%, transparent 100%);
          animation-duration: 8s;
          animation-direction: reverse;
        }

        @keyframes streamFlow {
          0%   { transform: translateX(-25%); }
          100% { transform: translateX(25%); }
        }

        /* ── Layout ── */
        .impact-container {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          padding: 0 4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4rem;
          box-sizing: border-box;
        }

        .impact-content {
          flex: 0 0 45%;
          max-width: 500px;
          position: relative;
        }

        .impact-visual {
          flex: 0 0 55%;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .growth-svg {
          width: 100%;
          max-width: 700px;
          height: auto;
          overflow: visible;
        }

        /* ── SVG animations — UNTOUCHED ── */
        .glass-bar {
          transform-origin: bottom;
          animation: barRise 6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .bar-1 { animation-delay: 0.0s; }
        .bar-2 { animation-delay: 0.2s; }
        .bar-3 { animation-delay: 0.4s; }
        .bar-4 { animation-delay: 0.6s; }

        @keyframes barRise {
          0%         { transform: scaleY(0); opacity: 0; }
          15%, 80%   { transform: scaleY(1); opacity: 1; }
          95%, 100%  { transform: scaleY(0); opacity: 0; }
        }

        .arrow-line {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawLine 6s cubic-bezier(0.65, 0, 0.15, 1) infinite;
        }

        @keyframes drawLine {
          0%, 15%    { stroke-dashoffset: 100; opacity: 0; filter: brightness(0.5); }
          20%        { opacity: 1; filter: brightness(1); }
          45%, 80%   { stroke-dashoffset: 0; opacity: 1; filter: brightness(1); }
          95%, 100%  { stroke-dashoffset: 0; opacity: 0; filter: brightness(0); }
        }

        .arrow-head {
          opacity: 0;
          transform-origin: center;
          animation: popHead 6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        @keyframes popHead {
          0%, 42%    { opacity: 0; transform: scale(0.5) translate(-10px, 10px); }
          46%, 80%   { opacity: 1; transform: scale(1) translate(0, 0); }
          95%, 100%  { opacity: 0; transform: scale(0.8); }
        }

        .radar-ring {
          animation: pulseRing 6s linear infinite;
          transform-origin: center;
        }
        .ring-1 { animation-delay: 0s; }
        .ring-2 { animation-delay: 2s; }
        .ring-3 { animation-delay: 4s; }

        @keyframes pulseRing {
          0%   { transform: scale(0.8); opacity: 0; }
          50%  { opacity: 0.3; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        /* ── Stat card hover — GPU-only transform, no backdrop repaint ── */
        .stat-card-hover {
          transition: transform 0.3s ease, border-color 0.3s ease;
          will-change: transform;
        }
        .stat-card-hover:hover {
          transform: translateY(-4px);
          border-color: rgba(255,255,255,0.10) !important;
        }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .impact-container {
            flex-direction: column;
            padding: 0 2.5rem;
            gap: 3rem;
          }
          .impact-content,
          .impact-visual {
            flex: unset;
            max-width: 100%;
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .impact-container { padding: 0 1.5rem; gap: 2rem; }
        }

        @media (max-width: 479px) {
          #impact { padding: 4rem 0; }
        }

        /* Reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .animated-data-grid,
          .data-stream,
          .glass-bar,
          .arrow-line,
          .arrow-head,
          .radar-ring { animation: none; }
        }
      `}</style>

      {/* ── Background: animated graph grid ── */}
      {mounted && (
        <div className="bg-graph-wrapper">
          <div className="animated-data-grid" />
          <div className="data-stream stream-1" />
          <div className="data-stream stream-2" />
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, transparent 10%, #03030a 80%)",
          }} />
        </div>
      )}

      <div className="impact-container">

        {/* ── Left: text + stat cards ── */}
        <div className="impact-content">

          {/* Eyebrow — cyan, uppercase, matches Hero label style */}
          <p style={S.eyebrow}>● Performance Metrics</p>

          {/* H2 — Hero weight (800) + tracking */}
          <h2 style={S.h2}>
            Engineering <br />
            <span style={S.h2Accent}>Exponential Growth</span>
          </h2>

          {/* Body — Hero body token */}
          <p style={S.body}>
            We don't just advise — we execute measurable outcomes. From
            early-stage traction to institutional rounds, our framework is
            built to scale.
          </p>

          {/* Stat grid */}
          <div style={S.grid}>
            {STATS.map((stat) => (
              <div key={stat.lbl} className="stat-card-hover" style={S.statBox}>
                <div style={{ ...S.statNum, color: stat.c }}>
                  {stat.num}
                </div>
                <div style={S.statLbl}>{stat.lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: animated SVG graph — UNTOUCHED ── */}
        <div className="impact-visual">
          {mounted && (
            <svg viewBox="0 0 800 800" className="growth-svg" preserveAspectRatio="xMidYMid meet">
              <defs>
                <filter id="premium-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4"  result="blur1" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="blur3" />
                  <feMerge>
                    <feMergeNode in="blur3" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <linearGradient id="glass-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="rgba(255,255,255,0.5)" />
                  <stop offset="40%"  stopColor="rgba(255,255,255,0.15)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
                </linearGradient>

                <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%"   stopColor="rgba(52,211,153,0.05)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>

              <circle cx="400" cy="400" r="400" fill="url(#bg-glow)" />

              <g stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none">
                <circle cx="400" cy="400" r="150" className="radar-ring ring-1" />
                <circle cx="400" cy="400" r="250" className="radar-ring ring-2" />
                <circle cx="400" cy="400" r="350" className="radar-ring ring-3" />
              </g>

              <g stroke="rgba(255,255,255,0.03)" strokeWidth="1" fill="none">
                <circle cx="400" cy="400" r="150" />
                <circle cx="400" cy="400" r="250" />
                <circle cx="400" cy="400" r="350" />
              </g>

              <g stroke="rgba(255,255,255,0.25)" strokeWidth="1">
                <rect x="180" y="550" width="70" height="150" rx="8" fill="url(#glass-gradient)" className="glass-bar bar-1" />
                <rect x="300" y="440" width="70" height="260" rx="8" fill="url(#glass-gradient)" className="glass-bar bar-2" />
                <rect x="420" y="280" width="70" height="420" rx="8" fill="url(#glass-gradient)" className="glass-bar bar-3" />
                <rect x="540" y="100" width="70" height="600" rx="8" fill="url(#glass-gradient)" className="glass-bar bar-4" />
              </g>

              <path
                d="M 120 620 C 280 600, 400 350, 600 110"
                fill="none"
                stroke="#ffffff"
                strokeWidth="8"
                strokeLinecap="round"
                filter="url(#premium-glow)"
                pathLength="100"
                className="arrow-line"
              />
              <path
                d="M 550 115 L 605 105 L 590 160"
                fill="none"
                stroke="#ffffff"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#premium-glow)"
                className="arrow-head"
              />
            </svg>
          )}
        </div>

      </div>
    </section>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  section: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    background: "#03030a",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    padding: "6rem 0",
    overflow: "hidden",
    // Promote to its own compositor layer so scroll never triggers a repaint
    isolation: "isolate",
  },

  // Eyebrow — cyan, uppercase, matches Hero label token exactly
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: "#00f5ff",
    textShadow: "0 0 14px rgba(0,245,255,0.45)",
    marginBottom: "1.2rem",
    marginTop: 0,
    display: "block",
  },

  // H2 — Hero weight (800) + tracking (-0.03em) + line-height (1.05)
  h2: {
    fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    marginBottom: "1.5rem",
    marginTop: 0,
    color: "#ffffff",
    textShadow:
      "0 2px 4px rgba(0,0,0,0.95), 0 4px 32px rgba(0,0,0,0.80)",
  },

  // Second line of H2 — white, same weight, slight opacity to match Hero "sub" pattern
  h2Accent: {
    color: "rgba(255,255,255,0.55)",
    fontWeight: 800,
  },

  // Body — Hero body token exactly
  body: {
    fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)",
    fontWeight: 400,
    lineHeight: 1.75,
    letterSpacing: "0.005em",
    color: "rgba(255,255,255,0.60)",
    marginBottom: "3rem",
    marginTop: 0,
    maxWidth: 480,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 14,
  },

  // Stat box — removed backdrop-filter (scroll jank source)
  statBox: {
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.03)",
    padding: "1.8rem 1.5rem",
    textAlign: "left",
    cursor: "default",
  },

  // Stat number — Hero weight, glow from currentColor
  statNum: {
    fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
    fontWeight: 800,
    letterSpacing: "-0.04em",
    lineHeight: 1,
    textShadow: "0 0 18px currentColor",
  },

  // Stat label — Hero uppercase label token
  statLbl: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.20em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.40)",
    marginTop: 10,
  },
};