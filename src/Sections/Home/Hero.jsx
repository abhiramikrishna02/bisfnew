// Hero.jsx

"use client";

import dynamic from "next/dynamic";

// ─── Constants ────────────────────────────────────────────────────────────────
export const HERO_CFG = {
  primary: "#00f5ff",
  colors: ["#00f5ff", "#7c3aed", "#0ea5e9"],
};

const Prism = dynamic(() => import("./Prism"), { ssr: false });

// ─── Hero Content UI ──────────────────────────────────────────────────────────
function HeroContent({ color, visible }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5rem 2.5rem 2rem",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.35s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1200, textAlign: "center" }}>

        {/* ── H1 — always exactly 2 lines ── */}
        <h1 style={S.h1}>
          <span style={S.h1line1}>Bharath Innovations &amp;</span>
          <span style={S.h1line1}>Startups Facilitator</span>
        </h1>

        {/* ── TAGLINE ── */}
        <p style={S.body}>
          A Full-Stack Startup Facilitator –{" "}
          Building India's Next Generation of Entrepreneurs.
        </p>

      </div>
    </div>
  );
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
export default function Hero({
  canvasRef,
  assembleProgress,
  zoomProgress,
  fragsRef,
  internalTick,
  isVisible,
  contentVisible,
  engineEnabled,
}) {
  return (
    <>
      {/* Responsive font breakpoints — scoped to hero only */}
      <style>{`
        .hero-title-line {
          display: block;
          font-size: 7.2vw;
          font-weight: 800;
          color: #ffffff;
          white-space: nowrap;
          text-shadow: 0 2px 4px rgba(0,0,0,0.95), 0 4px 32px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.5);
        }

        /* Large desktops — cap so it doesn't get huge */
        @media (min-width: 1400px) {
          .hero-title-line { font-size: 6.4rem; }
        }

        /* Standard laptops 1024–1399px */
        @media (max-width: 1399px) and (min-width: 1024px) {
          .hero-title-line { font-size: 6.8vw; }
        }

        /* Tablets 768–1023px — allow wrap if needed */
        @media (max-width: 1023px) and (min-width: 768px) {
          .hero-title-line {
            font-size: 7.5vw;
            white-space: normal;
          }
        }

        /* Large phones 480–767px */
        @media (max-width: 767px) and (min-width: 480px) {
          .hero-title-line {
            font-size: 9.5vw;
            white-space: normal;
          }
        }

        /* Small phones <480px */
        @media (max-width: 479px) {
          .hero-title-line {
            font-size: 11.5vw;
            white-space: normal;
          }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100vh",
          overflow: "hidden",
          background: "#03030a",
          zIndex: isVisible ? 10 : -1,
          visibility: isVisible ? "visible" : "hidden",
        }}
      >
        {/* ── Prism WebGL Background ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }} aria-hidden="true">
          <div style={{ position: "absolute", inset: 0 }}>
            <Prism
              animationType="rotate"
              timeScale={0.45}
              height={3.5}
              baseWidth={5.5}
              scale={3.6}
              hueShift={0}
              colorFrequency={1}
              noise={0.4}
              glow={1.1}
              bloom={1}
              transparent={true}
              suspendWhenOffscreen={true}
            />
          </div>

          {/* Dark vignette */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(3,3,10,0.15) 0%, rgba(3,3,10,0.72) 100%)",
              pointerEvents: "none",
            }}
          />
          {/* Bottom fade */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "45%",
              background:
                "linear-gradient(to top, rgba(3,3,10,0.82) 0%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* ── Hero text overlay ── */}
        <HeroContent
          color={HERO_CFG.primary}
          visible={contentVisible && isVisible}
        />

        {/* ── Scroll hint ── */}
        <div
          style={{
            position: "absolute",
            bottom: "2.8rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity:
              isVisible && internalTick.current === 0 && contentVisible ? 0.55 : 0,
            transition: "opacity 0.6s",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
         
        </div>
      </div>
    </>
  );
}

// ─── Hero-local styles ────────────────────────────────────────────────────────
const S = {
  h1: {
    margin: "0 0 1.6rem 0",
    lineHeight: 1.05,
    letterSpacing: "-0.03em",
    padding: 0,
  },

  // Base style — responsive overrides handled by .hero-title-line media queries above
  h1line1: {
    display: "block",
    fontWeight: 800,
    color: "#ffffff",
    fontSize: "7.2vw",
    whiteSpace: "nowrap",
    textShadow:
      "0 2px 4px rgba(0,0,0,0.95), 0 4px 32px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.5)",
  },

  body: {
    fontSize: "clamp(0.95rem, 1.6vw, 1.15rem)",
    fontWeight: 400,
    lineHeight: 1.75,
    letterSpacing: "0.005em",
    color: "rgba(255,255,255,0.80)",
    margin: "0 auto 1.4rem",
    maxWidth: 560,
    textAlign: "center",
  },

  ceoLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "#00f5ff",
    textShadow: "0 0 14px rgba(0,245,255,0.5)",
    margin: "0 0 0.55rem",
    textAlign: "center",
  },

  backedBy: {
    fontSize: 13,
    fontWeight: 400,
    letterSpacing: "0.02em",
    color: "rgba(255,255,255,0.45)",
    margin: 0,
    textAlign: "center",
  },
};