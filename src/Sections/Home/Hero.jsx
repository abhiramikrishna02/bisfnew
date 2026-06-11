"use client";

import { useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const FRAGMENT_COUNT = 150;

export const HERO_CFG = {
  primary: "#00f5ff",
  colors: ["#00f5ff", "#7c3aed", "#0ea5e9"],
};

// ─── Triangle target positions ────────────────────────────────────────────────
function getTriangleTargets(frags, w, h, cx, cy) {
  const r = Math.min(w, h) * 0.25;
  return frags.map((_, i) => {
    const ta = i / frags.length;
    let tx, ty;
    if (ta < 0.33) {
      const p = ta / 0.33;
      tx = cx + (-r * 0.866 + p * r * 0.866);
      ty = cy + (r * 0.5 - p * r * 1.5);
    } else if (ta < 0.66) {
      const p = (ta - 0.33) / 0.33;
      tx = cx + p * r * 0.866;
      ty = cy + (-r + p * r * 1.5);
    } else {
      const p = (ta - 0.66) / 0.34;
      tx = cx + (r * 0.866 - p * r * 1.732);
      ty = cy + r * 0.5;
    }
    return { tx, ty };
  });
}

// ─── Fragment factory ─────────────────────────────────────────────────────────
export function makeFragments(w, h) {
  const frags = [];
  for (let i = 0; i < FRAGMENT_COUNT; i++) {
    const colorIdx = Math.floor(Math.random() * HERO_CFG.colors.length);
    frags.push({
      x:        Math.random() * w,
      y:        Math.random() * h,
      vx:       (Math.random() - 0.5) * 0.25,
      vy:       (Math.random() - 0.5) * 0.25,
      size:     3 + Math.random() * 12,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.006,
      color:    HERO_CFG.colors[colorIdx],
      alpha:    0.2 + Math.random() * 0.5,
      type:     ["tri", "quad", "line"][Math.floor(Math.random() * 3)],
      phase:    Math.random() * Math.PI * 2,
      depth:    0.4 + Math.random() * 0.6,
    });
  }
  return frags;
}

// ─── Draw one fragment ────────────────────────────────────────────────────────
function drawFragment(ctx, f, aT) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.rotation);
  if (aT > 0.01) {
    ctx.shadowBlur  = 8 + aT * 24;
    ctx.shadowColor = HERO_CFG.primary;
  }
  ctx.globalAlpha = Math.min(1, f.alpha * (0.6 + 0.4 * aT));
  ctx.strokeStyle = f.color;
  ctx.lineWidth   = 0.6 + aT * 0.8;
  const s = f.size;
  ctx.beginPath();
  if (f.type === "tri") {
    ctx.moveTo(0, -s); ctx.lineTo(s * 0.866, s * 0.5); ctx.lineTo(-s * 0.866, s * 0.5);
    ctx.closePath(); ctx.stroke();
    if (aT > 0.3) { ctx.globalAlpha = aT * 0.08; ctx.fillStyle = f.color; ctx.fill(); }
  } else if (f.type === "quad") {
    const h = s * 0.6;
    ctx.moveTo(0, -s); ctx.lineTo(h, 0); ctx.lineTo(0, s); ctx.lineTo(-h, 0);
    ctx.closePath(); ctx.stroke();
  } else {
    ctx.moveTo(-s, 0); ctx.lineTo(s, 0);
    ctx.moveTo(0, -s * 0.5); ctx.lineTo(0, s * 0.5);
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Draw assembled triangle portal ──────────────────────────────────────────
function drawPortal(ctx, w, h, aT, zT) {
  if (aT < 0.01 && zT < 0.01) return;
  const cx = w / 2, cy = h / 2;
  const baseSize = Math.min(w, h) * 0.3;
  const size     = baseSize * (0.3 + aT * 0.7) * (1 + zT * 6);
  const gAlpha   = aT * (1 - zT * 0.5);

  ctx.save();
  ctx.translate(cx, cy);
  if (gAlpha < 0.01) { ctx.restore(); return; }

  const tri = (s) => {
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.866, s * 0.5);
    ctx.lineTo(-s * 0.866, s * 0.5);
    ctx.closePath();
  };

  // Glow rings
  for (let ring = 3; ring >= 1; ring--) {
    ctx.beginPath(); tri(size * (1 + ring * 0.08));
    ctx.shadowBlur   = 40 * ring;
    ctx.shadowColor  = HERO_CFG.primary;
    ctx.globalAlpha  = gAlpha * 0.15 / ring;
    ctx.strokeStyle  = HERO_CFG.primary;
    ctx.lineWidth    = ring * 2;
    ctx.stroke();
  }

  // Fill gradient
  ctx.beginPath(); tri(size);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.1);
  grad.addColorStop(0,   HERO_CFG.primary + "30");
  grad.addColorStop(0.5, HERO_CFG.primary + "10");
  grad.addColorStop(1,   HERO_CFG.primary + "05");
  ctx.globalAlpha = gAlpha;
  ctx.fillStyle   = grad;
  ctx.fill();

  // Edge stroke
  ctx.beginPath(); tri(size);
  ctx.globalAlpha  = gAlpha;
  ctx.strokeStyle  = HERO_CFG.primary;
  ctx.lineWidth    = 1.5 + aT * 1.5;
  ctx.shadowBlur   = 20 + aT * 30;
  ctx.shadowColor  = HERO_CFG.primary;
  ctx.stroke();

  // Zoom black fill (swallows screen as you enter portal)
  if (zT > 0) {
    ctx.beginPath(); tri(size * (1 + zT * 8));
    ctx.globalAlpha = Math.min(1, zT * 1.5);
    ctx.fillStyle   = "#03030a";
    ctx.fill();
  }

  ctx.restore();
}

// ─── Canvas Engine Hook ───────────────────────────────────────────────────────
export function useCanvasEngine(canvasRef, fragsRef, assembleProgress, zoomProgress, enabled) {
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function frame(ts) {
      const t  = ts * 0.001;
      const w  = canvas.width;
      const h  = canvas.height;
      const aT = assembleProgress.current;
      const zT = zoomProgress.current;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#03030a";
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.012)";
      ctx.lineWidth   = 0.5;
      for (let x = 0; x < w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      ctx.restore();

      const cx      = w / 2, cy = h / 2;
      const frags   = fragsRef.current;
      const targets = getTriangleTargets(frags, w, h, cx, cy);

      for (let i = 0; i < frags.length; i++) {
        const f      = frags[i];
        const target = targets[i];

        if (aT < 0.005) {
          // Pure idle drift
          f.x += f.vx + Math.sin(t * 0.3 + f.phase) * 0.08 * f.depth;
          f.y += f.vy + Math.cos(t * 0.2 + f.phase) * 0.06 * f.depth;
          f.rotation += f.rotSpeed;
          if (f.x < -30) f.x = w + 20;
          if (f.x > w + 30) f.x = -20;
          if (f.y < -30) f.y = h + 20;
          if (f.y > h + 30) f.y = -20;
        } else {
          // Pull toward triangle formation
          const ease = aT * aT * (3 - 2 * aT);
          f.x += (target.tx - f.x) * 0.04 * (1 + ease * 2);
          f.y += (target.ty - f.y) * 0.04 * (1 + ease * 2);
          f.rotation += f.rotSpeed * (1 - aT * 0.8);
        }

        // Fly outward during zoom
        if (zT > 0) {
          const dx   = f.x - cx, dy = f.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          f.x += (dx / dist) * zT * 8;
          f.y += (dy / dist) * zT * 8;
        }

        const fa = 1 - zT;
        if (fa > 0.01) {
          ctx.globalAlpha = fa;
          drawFragment(ctx, f, aT);
          ctx.globalAlpha = 1;
        }
      }

      drawPortal(ctx, w, h, aT, zT);
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; } };
  }, [canvasRef, fragsRef, assembleProgress, zoomProgress, enabled]);
}

// ─── Hero Content UI ──────────────────────────────────────────────────────────
function HeroContent({ color, visible }) {
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 10,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "5rem 2rem 2rem",
      opacity: visible ? 1 : 0,
      transition: "opacity 0.35s ease",
      pointerEvents: visible ? "auto" : "none",
    }}>
      <div style={{ width: "100%", maxWidth: 620 }}>
        <p style={S.eyebrow(color)}>● Led by CEO Jirlo Jayan · Backed by iQue Ventures</p>
        <h1 style={S.h1}>
          Bharath Innovations<br />
          <span style={S.h1dim}>& Startups Facilitator</span>
        </h1>
        <p style={S.body}>A Full-Stack Startup Facilitator — Building India's Next Generation of Entrepreneurs.</p>
        <div style={S.cardRow}>
          {[
            { label: "Educate & Empower",  desc: "Workshops for foundational startup knowledge",    c: "#00f5ff" },
            { label: "Capital Access",     desc: "Connecting founders with global funding networks", c: "#a78bfa" },
            { label: "Global Expansion",   desc: "Facilitating entry into international markets",    c: "#ff2ebe" },
          ].map(card => (
            <div key={card.label} style={S.card}>
              <div style={{ ...S.cardAccent, background: card.c }} />
              <div style={{ ...S.cardLabel, color: card.c }}>{card.label}</div>
              <div style={S.cardDesc}>{card.desc}</div>
            </div>
          ))}
        </div>
        <p style={S.geo}>Empower · Scale · Connect · Bangalore, India</p>
      </div>
    </div>
  );
}

// ─── Hero Section (canvas + overlay content + scroll hint) ───────────────────
/**
 * Props:
 *   canvasRef        — ref forwarded from Home, attached to <canvas>
 *   assembleProgress — ref (number 0–1) read by canvas engine each frame
 *   zoomProgress     — ref (number 0–1) read by canvas engine each frame
 *   internalTick     — ref (number) current scroll step (0 = show hint)
 *   isVisible        — bool: whether hero layer is on top (phase === "hero" | "forward-transition")
 *   contentVisible   — bool: fade hero text in/out
 *   engineEnabled    — bool: start/stop the RAF loop
 */
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
  useCanvasEngine(canvasRef, fragsRef, assembleProgress, zoomProgress, engineEnabled);

  return (
    <div style={{
      position: "fixed", inset: 0,
      width: "100%", height: "100vh",
      overflow: "hidden",
      background: "#03030a",
      zIndex: isVisible ? 10 : -1,
      visibility: isVisible ? "visible" : "hidden",
    }}>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, zIndex: 0, display: "block" }}
      />

      {/* Hero text overlay */}
      <HeroContent color={HERO_CFG.primary} visible={contentVisible && isVisible} />

      {/* Scroll hint — only shown when idle (tick === 0) */}
      <div style={{
        position: "absolute", bottom: "5rem", left: "50%", transform: "translateX(-50%)",
        zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        opacity: isVisible && internalTick.current === 0 && contentVisible ? 0.4 : 0,
        transition: "opacity 0.6s",
        pointerEvents: "none", userSelect: "none",
      }}>
        <span style={{
          fontSize: 9, letterSpacing: "0.22em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.5)",
        }}>
          Scroll
        </span>
        <div style={{
          width: 1, height: 28,
          background: `linear-gradient(to bottom, transparent, ${HERO_CFG.primary})`,
        }} />
      </div>
    </div>
  );
}

// ─── Hero-local styles ────────────────────────────────────────────────────────
const S = {
  eyebrow: (color) => ({
    fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase",
    marginBottom: "1.4rem", display: "block", color,
  }),
  h1: {
    fontSize: "clamp(2.2rem, 5.5vw, 4rem)", fontWeight: 200, lineHeight: 1.05,
    letterSpacing: "-0.04em", marginBottom: "1.2rem", marginTop: 0, color: "#fff",
  },
  h1dim: { color: "rgba(255,255,255,0.3)", fontWeight: 100 },
  body: {
    fontSize: "clamp(0.8rem, 1.4vw, 0.9rem)", color: "rgba(255,255,255,0.3)",
    maxWidth: 420, margin: "0 0 1.6rem", lineHeight: 1.9,
  },
  cardRow: {
    display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: "1.6rem",
  },
  card: {
    padding: "1.2rem 1rem", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 12, background: "rgba(255,255,255,0.025)", textAlign: "left",
  },
  cardAccent: { width: 20, height: 1, marginBottom: 12 },
  cardLabel: {
    fontSize: 10, fontWeight: 500, marginBottom: 6,
    letterSpacing: "0.08em", textTransform: "uppercase",
  },
  cardDesc: { fontSize: 11, color: "rgba(255,255,255,0.22)", lineHeight: 1.75 },
  geo: {
    marginTop: "1.8rem", fontSize: 9, letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.1)", textTransform: "uppercase",
  },
};