"use client";

// ─── Third Section: Impact Numbers ───────────────────────────────────────────
// Fully self-contained. Replace this file freely — no other section is affected.

import { useEffect, useState } from "react";

const STATS = [
  { num: "500+",    lbl: "Founders Mentored",   c: "#34d399" }, // Mint
  { num: "₹120Cr+", lbl: "Capital Facilitated", c: "#818cf8" }, // Indigo
  { num: "18",      lbl: "Countries Entered",   c: "#06b6d4" }, // Cyan
  { num: "92%",     lbl: "Success Rate",        c: "#ff2ebe" }, // Neon Pink
];

export default function ThirdSection() {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch for keyframe animations
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section id="impact" style={S.section}>
      <style>{`
        /* ── Continuous Background Graph Animations ── */
        .bg-graph-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .animated-data-grid {
          position: absolute;
          width: 200vw;
          height: 200vh;
          top: -50vh;
          left: -50vw;
          /* Premium Graph Grid Lines */
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          /* 3D Perspective Tilt */
          transform: perspective(1000px) rotateX(60deg) scale(2);
          /* Continuous forward movement: travels exactly one grid cell (60px) to loop perfectly */
          animation: panGrid 4s linear infinite;
        }

        @keyframes panGrid {
          0% { transform: perspective(1000px) rotateX(60deg) scale(2) translateY(0); }
          100% { transform: perspective(1000px) rotateX(60deg) scale(2) translateY(60px); }
        }

        /* Glowing Horizontal Data Streams */
        .data-stream {
          position: absolute;
          height: 1px;
          width: 200%;
          left: -50%;
          opacity: 0.6;
          animation: streamFlow linear infinite;
        }
        .stream-1 {
          top: 30%;
          background: linear-gradient(90deg, transparent 0%, #34d399 50%, transparent 100%);
          animation-duration: 12s;
        }
        .stream-2 {
          top: 75%;
          background: linear-gradient(90deg, transparent 0%, #818cf8 50%, transparent 100%);
          animation-duration: 8s;
          animation-direction: reverse;
        }

        @keyframes streamFlow {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(25%); }
        }

        /* ── Core Layout Responsiveness ── */
        .impact-container {
          position: relative;
          z-index: 10; /* Keeps content above the moving background */
          max-width: 1280px;
          margin: 0 auto;
          width: 100%;
          padding: 0 4rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4rem;
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

        @media (max-width: 960px) {
          .impact-container {
            flex-direction: column;
            padding: 0 2rem;
            gap: 3rem;
          }
          .impact-content, .impact-visual {
            flex: unset;
            max-width: 100%;
            width: 100%;
          }
        }

        /* ── Premium SVG Animations ── */
        .glass-bar {
          transform-origin: bottom;
          animation: barRise 6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        .bar-1 { animation-delay: 0.0s; }
        .bar-2 { animation-delay: 0.2s; }
        .bar-3 { animation-delay: 0.4s; }
        .bar-4 { animation-delay: 0.6s; }

        @keyframes barRise {
          0% { transform: scaleY(0); opacity: 0; }
          15%, 80% { transform: scaleY(1); opacity: 1; }
          95%, 100% { transform: scaleY(0); opacity: 0; }
        }

        .arrow-line {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawLine 6s cubic-bezier(0.65, 0, 0.15, 1) infinite;
        }

        @keyframes drawLine {
          0%, 15% { stroke-dashoffset: 100; opacity: 0; filter: brightness(0.5); }
          20% { opacity: 1; filter: brightness(1); }
          45%, 80% { stroke-dashoffset: 0; opacity: 1; filter: brightness(1); }
          95%, 100% { stroke-dashoffset: 0; opacity: 0; filter: brightness(0); }
        }

        .arrow-head {
          opacity: 0;
          transform-origin: center;
          animation: popHead 6s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        @keyframes popHead {
          0%, 42% { opacity: 0; transform: scale(0.5) translate(-10px, 10px); }
          46%, 80% { opacity: 1; transform: scale(1) translate(0, 0); }
          95%, 100% { opacity: 0; transform: scale(0.8); }
        }

        .radar-ring {
          animation: pulseRing 6s linear infinite;
          transform-origin: center;
        }
        .ring-1 { animation-delay: 0s; }
        .ring-2 { animation-delay: 2s; }
        .ring-3 { animation-delay: 4s; }

        @keyframes pulseRing {
          0% { transform: scale(0.8); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: scale(1.2); opacity: 0; }
        }

        /* Hover Effect for Stats */
        .stat-card-hover {
          transition: transform 0.3s ease, background 0.3s ease, border-color 0.3s ease;
        }
        .stat-card-hover:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>

      {/* ── Background Layer: Continuous Data Graph ── */}
      {mounted && (
        <div className="bg-graph-wrapper">
          <div className="animated-data-grid"></div>
          <div className="data-stream stream-1"></div>
          <div className="data-stream stream-2"></div>
          {/* Vignette to fade grid out at edges smoothly */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 10%, #03030a 80%)',
          }}></div>
        </div>
      )}

      <div className="impact-container">
        
        {/* ── Left Content: Typography & Cards ── */}
        <div className="impact-content">
          <p style={S.eyebrow}>● Performance Metrics</p>
          <h2 style={S.h2}>
            Engineering <br/>
            <span style={S.h2Gradient}>Exponential Growth</span>
          </h2>
          <p style={S.body}>
            We don’t just advise; we execute measurable outcomes. From early-stage traction to institutional rounds, our framework is mathematically structured to scale.
          </p>
          
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

        {/* ── Right Content: 3D-Style Animated SVG Graph ── */}
        <div className="impact-visual">
          {mounted && (
            <svg viewBox="0 0 800 800" className="growth-svg" preserveAspectRatio="xMidYMid meet">
              <defs>
                <filter id="premium-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
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
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.5)" />
                  <stop offset="40%" stopColor="rgba(255, 255, 255, 0.15)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.0)" />
                </linearGradient>

                <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(52, 211, 153, 0.05)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                </radialGradient>
              </defs>

              <circle cx="400" cy="400" r="400" fill="url(#bg-glow)" />

              <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" fill="none">
                <circle cx="400" cy="400" r="150" className="radar-ring ring-1" />
                <circle cx="400" cy="400" r="250" className="radar-ring ring-2" />
                <circle cx="400" cy="400" r="350" className="radar-ring ring-3" />
              </g>

              <g stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" fill="none">
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

// ─── Section-local styles ─────────────────────────────────────────────────────
const S = {
  section: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    background: "#03030a", // Deep space black
    borderTop: "1px solid rgba(255,255,255,0.04)",
    padding: "6rem 0",
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    marginBottom: "1.2rem",
    display: "block",
    color: "#34d399",
    fontWeight: 700,
  },
  h2: {
    fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
    fontWeight: 300,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    marginBottom: "1.5rem",
    marginTop: 0,
    color: "#ffffff",
  },
  h2Gradient: {
    background: "linear-gradient(90deg, #ffffff 0%, #818cf8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontWeight: 500,
  },
  body: {
    fontSize: "clamp(1rem, 1.2vw, 1.1rem)",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "3rem",
    lineHeight: 1.7,
    fontWeight: 300,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
  },
  statBox: {
    border: "1px solid rgba(255,255,255,0.04)",
    borderRadius: 16,
    // Deeper glassmorphism to contrast the moving grid
    background: "rgba(10, 10, 15, 0.4)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    padding: "2rem 1.6rem",
    textAlign: "left",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    cursor: "default",
  },
  statNum: {
    fontSize: "clamp(2rem, 3.5vw, 2.6rem)",
    fontWeight: 400,
    letterSpacing: "-0.04em",
    lineHeight: 1,
    textShadow: "0 0 16px currentColor", // Makes the numbers softly glow
  },
  statLbl: {
    fontSize: 11,
    color: "rgba(255,255,255,0.4)",
    marginTop: 12,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    fontWeight: 600,
  },
};