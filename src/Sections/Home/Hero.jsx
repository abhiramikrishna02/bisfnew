// Hero.jsx

"use client";

import dynamic from "next/dynamic";

// ─── Constants ────────────────────────────────────────────────────────────────
export const HERO_CFG = {
  primary: "#00f5ff",
  colors: ["#00f5ff", "#7c3aed", "#0ea5e9"],
};

// Dynamically import Prism to avoid SSR issues (WebGL requires browser)
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
      <div style={{ width: "100%", maxWidth: 720 }}>

        {/* ── EYEBROW ── */}
        <div style={S.eyebrowRow}>
          <span style={S.eyebrowDot} />
          <span style={S.eyebrow}>
            Led by CEO Jirlo Jayan · Backed by iQue Ventures
          </span>
        </div>

        {/* ── H1 ── */}
        <h1 style={S.h1}>
          <span style={S.h1line1}>Bharath Innovations</span>
          <br />
          <span style={S.h1line2}>&amp; Startups Facilitator</span>
        </h1>

        {/* ── TAGLINE ── */}
        <p style={S.body}>
          A Full-Stack Startup Facilitator —{" "}
          <br />
          Building India's Next Generation of Entrepreneurs.
        </p>

        {/* ── PILLAR CARDS ── */}
        <div style={S.cardRow}>
          {[
            {
              label: "Educate & Empower",
              desc: "Workshops for foundational startup knowledge",
              c: "#00f5ff",
            },
            {
              label: "Capital Access",
              desc: "Connecting founders with global funding networks",
              c: "#a78bfa",
            },
            {
              label: "Global Expansion",
              desc: "Facilitating entry into international markets",
              c: "#ff2ebe",
            },
          ].map((card) => (
            <div key={card.label} style={S.card}>
              <div style={{ ...S.cardAccent, background: card.c }} />
              <div style={{ ...S.cardLabel, color: card.c }}>{card.label}</div>
              <div style={S.cardDesc}>{card.desc}</div>
            </div>
          ))}
        </div>

        {/* ── GEO TAG ── */}
        <p style={S.geo}>Empower · Scale · Connect · Bangalore, India</p>
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
        aria-hidden="true"
      >
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

        {/* Dark vignette — heavier at edges so text is always legible */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, rgba(3,3,10,0.15) 0%, rgba(3,3,10,0.72) 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Extra bottom darkening so pillar cards don't float on bright prism */}
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
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: 1,
            height: 28,
            background: `linear-gradient(to bottom, transparent, ${HERO_CFG.primary})`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Hero-local styles ────────────────────────────────────────────────────────
const S = {

  // Eyebrow row with glowing dot
  eyebrowRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: "1.6rem",
  },
  eyebrowDot: {
    display: "inline-block",
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#00f5ff",
    boxShadow: "0 0 8px #00f5ff, 0 0 18px #00f5ffaa",
    flexShrink: 0,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontWeight: 500,
    color: "#00f5ff",
    // Subtle shadow so it reads over any background colour
    textShadow: "0 0 20px rgba(0,245,255,0.4)",
  },

  // H1 — large, confident, strongly readable
  h1: {
    margin: "0 0 1.4rem 0",
    lineHeight: 1.02,
    letterSpacing: "-0.03em",
  },
  h1line1: {
    display: "block",
    fontSize: "clamp(2.6rem, 6vw, 5rem)",
    fontWeight: 800,
    color: "#ffffff",
    // Heavy shadow lifts white text off the colourful prism
    textShadow:
      "0 2px 4px rgba(0,0,0,0.95), 0 4px 32px rgba(0,0,0,0.8), 0 0 80px rgba(0,0,0,0.5)",
  },
  h1line2: {
    display: "block",
    fontSize: "clamp(2.6rem, 6vw, 5rem)",
    fontWeight: 800,
    // Gradient fades second line to a coloured accent instead of invisible grey
    background:
      "linear-gradient(95deg, rgba(255,255,255,0.72) 0%, rgba(167,139,250,0.55) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    filter: "drop-shadow(0 2px 16px rgba(0,0,0,0.9))",
  },

  // Body / tagline — frosted pill so it's always readable
  body: {
    fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
    fontWeight: 300,
    lineHeight: 1.8,
    letterSpacing: "0.01em",
    color: "rgba(255,255,255,0.92)",
    background: "rgba(3,3,10,0.45)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderRadius: 8,
    padding: "10px 16px",
    display: "inline-block",
    margin: "0 0 1.8rem",
    maxWidth: 440,
    // Subtle left border as a visual accent
    borderLeft: "2px solid rgba(0,245,255,0.35)",
  },

  // Pillar card row
  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
    marginTop: "0.4rem",
  },
  card: {
    padding: "1.2rem 1rem",
    // Frosted glass — ensures text is readable regardless of prism colour underneath
    background: "rgba(3,3,10,0.55)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 14,
    textAlign: "left",
    transition: "border-color 0.3s",
  },
  cardAccent: {
    width: 22,
    height: 2,
    borderRadius: 2,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 7,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    // No extra opacity — colour alone carries the hierarchy
  },
  cardDesc: {
    fontSize: 11.5,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.7,
  },

  // Footer geo tag
  geo: {
    marginTop: "1.6rem",
    fontSize: 9,
    letterSpacing: "0.22em",
    color: "rgba(255,255,255,0.22)",
    textTransform: "uppercase",
  },
};