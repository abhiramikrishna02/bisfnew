"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const TOTAL_SECTIONS = 5;
const FRAGMENT_COUNT = 150;

// Per-section palette: primary accent + fragment colors + shape type
const SECTION_CFG = [
  { 
    primary: "#00f5ff", 
    colors: ["#00f5ff", "#7c3aed", "#0ea5e9"], 
    shape: "triangle",
    contentSide: "center",
    animSide: "center"
  },
  { 
    primary: "#818cf8", 
    colors: ["#818cf8", "#6366f1", "#06b6d4"], 
    shape: "hexagon",
    contentSide: "right",
    animSide: "left"
  },
  { 
    primary: "#34d399", 
    colors: ["#34d399", "#0ea5e9", "#a78bfa"], 
    shape: "sphere",
    contentSide: "left",
    animSide: "right"
  },
  { 
    primary: "#f9a8d4", 
    colors: ["#f9a8d4", "#c084fc", "#818cf8"], 
    shape: "diamond",
    contentSide: "right",
    animSide: "left"
  },
  { 
    primary: "#ff2ebe", 
    colors: ["#ff2ebe", "#f9a8d4", "#c084fc"], 
    shape: "infinity",
    contentSide: "left",
    animSide: "right"
  },
];

// How many scroll ticks exist within each section before zooming through
const ASSEMBLY_TICKS = 8;

// ─── Shape target calculators ─────────────────────────────────────────────────
function getTriangleTargets(frags, w, h, cx, cy) {
  const triangleR = Math.min(w, h) * 0.25;
  return frags.map((_, i) => {
    const ta = i / frags.length;
    let tx, ty;
    if (ta < 0.33) {
      const p = ta / 0.33;
      tx = cx + (-triangleR * 0.866 + p * triangleR * 0.866);
      ty = cy + (triangleR * 0.5 - p * triangleR * 1.5);
    } else if (ta < 0.66) {
      const p = (ta - 0.33) / 0.33;
      tx = cx + (p * triangleR * 0.866);
      ty = cy + (-triangleR + p * triangleR * 1.5);
    } else {
      const p = (ta - 0.66) / 0.34;
      tx = cx + (triangleR * 0.866 - p * triangleR * 1.732);
      ty = cy + triangleR * 0.5;
    }
    return { tx, ty };
  });
}

function getHexagonTargets(frags, w, h, cx, cy) {
  const hexR = Math.min(w, h) * 0.22;
  return frags.map((_, i) => {
    const angle = (i / frags.length) * Math.PI * 6;
    const r = hexR * (0.3 + Math.random() * 0.7);
    return {
      tx: cx + r * Math.cos(angle),
      ty: cy + r * Math.sin(angle)
    };
  });
}

function getSphereTargets(frags, w, h, cx, cy) {
  const sphereR = Math.min(w, h) * 0.2;
  return frags.map((_, i) => {
    const phi = Math.acos(-1 + (2 * i + 1) / frags.length * 2);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r = sphereR * (0.2 + Math.random() * 0.8);
    return {
      tx: cx + r * Math.sin(phi) * Math.cos(theta),
      ty: cy + r * Math.sin(phi) * Math.sin(theta)
    };
  });
}

function getDiamondTargets(frags, w, h, cx, cy) {
  const diamondW = Math.min(w, h) * 0.28;
  const diamondH = Math.min(w, h) * 0.2;
  return frags.map((_, i) => {
    const ta = i / frags.length;
    let tx, ty;
    if (ta < 0.25) {
      const p = ta / 0.25;
      tx = cx + (-diamondW + p * diamondW * 2);
      ty = cy + (-diamondH + p * diamondH * 2);
    } else if (ta < 0.5) {
      const p = (ta - 0.25) / 0.25;
      tx = cx + (diamondW - p * diamondW * 2);
      ty = cy + (-diamondH + p * diamondH * 2);
    } else if (ta < 0.75) {
      const p = (ta - 0.5) / 0.25;
      tx = cx + (-diamondW + p * diamondW * 2);
      ty = cy + (diamondH - p * diamondH * 2);
    } else {
      const p = (ta - 0.75) / 0.25;
      tx = cx + (diamondW - p * diamondW * 2);
      ty = cy + (diamondH - p * diamondH * 2);
    }
    return { tx, ty };
  });
}

function getInfinityTargets(frags, w, h, cx, cy) {
  const loopR = Math.min(w, h) * 0.2;
  return frags.map((_, i) => {
    const t = (i / frags.length) * Math.PI * 4;
    const a = loopR * 0.6;
    const b = loopR * 0.3;
    const denom = 1 + Math.cos(t) * 0.5;
    const tx = cx + (a * Math.sin(t)) / denom;
    const ty = cy + (b * Math.sin(t) * Math.cos(t)) / denom;
    return { tx, ty };
  });
}

function getShapeTargets(shape, frags, w, h, cx, cy) {
  switch (shape) {
    case "triangle": return getTriangleTargets(frags, w, h, cx, cy);
    case "hexagon": return getHexagonTargets(frags, w, h, cx, cy);
    case "sphere": return getSphereTargets(frags, w, h, cx, cy);
    case "diamond": return getDiamondTargets(frags, w, h, cx, cy);
    case "infinity": return getInfinityTargets(frags, w, h, cx, cy);
    default: return getTriangleTargets(frags, w, h, cx, cy);
  }
}

// ─── Fragment factory ─────────────────────────────────────────────────────────
function makeFragments(w, h, cfg) {
  const frags = [];
  for (let i = 0; i < FRAGMENT_COUNT; i++) {
    const colorIdx = Math.floor(Math.random() * cfg.colors.length);
    frags.push({
      x: Math.random() * w,
      y: Math.random() * h,
      homeX: Math.random() * w,
      homeY: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      size: 3 + Math.random() * 12,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.006,
      color: cfg.colors[colorIdx],
      alpha: 0.2 + Math.random() * 0.5,
      type: cfg.shape === "sphere"
        ? (Math.random() > 0.5 ? "wireTri" : "wireRect")
        : (Math.random() > 0.6 ? "tri" : Math.random() > 0.5 ? "quad" : "line"),
      phase: Math.random() * Math.PI * 2,
      depth: 0.4 + Math.random() * 0.6,
    });
  }
  return frags;
}

// ─── Draw a single fragment ───────────────────────────────────────────────────
function drawFragment(ctx, f, assembleT, sectionColor, glowStrength) {
  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.rotate(f.rotation);

  const glow = glowStrength * assembleT;
  if (glow > 0.01) {
    ctx.shadowBlur = 8 + glow * 24;
    ctx.shadowColor = sectionColor;
  }

  const alpha = f.alpha * (0.4 + 0.6 * assembleT + (1 - assembleT) * 0.6);
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.strokeStyle = f.color;
  ctx.lineWidth = 0.6 + assembleT * 0.8;

  const s = f.size;
  ctx.beginPath();

  if (f.type === "tri") {
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.866, s * 0.5);
    ctx.lineTo(-s * 0.866, s * 0.5);
    ctx.closePath();
    ctx.stroke();
    if (assembleT > 0.3) {
      ctx.globalAlpha = assembleT * 0.08;
      ctx.fillStyle = f.color;
      ctx.fill();
    }
  } else if (f.type === "quad") {
    const h = s * 0.6;
    ctx.moveTo(0, -s);
    ctx.lineTo(h, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-h, 0);
    ctx.closePath();
    ctx.stroke();
  } else if (f.type === "line") {
    ctx.moveTo(-s, 0);
    ctx.lineTo(s, 0);
    ctx.moveTo(0, -s * 0.5);
    ctx.lineTo(0, s * 0.5);
    ctx.stroke();
  } else if (f.type === "wireTri") {
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.866, s * 0.5);
    ctx.lineTo(-s * 0.866, s * 0.5);
    ctx.closePath();
    ctx.moveTo(0, -s * 0.5);
    ctx.lineTo(s * 0.43, s * 0.25);
    ctx.lineTo(-s * 0.43, s * 0.25);
    ctx.closePath();
    ctx.stroke();
  } else if (f.type === "wireRect") {
    ctx.rect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2);
    ctx.moveTo(-s * 0.3, -s * 0.3);
    ctx.rect(-s * 0.3, -s * 0.3, s * 0.6, s * 0.6);
    ctx.stroke();
  }

  ctx.restore();
}

// ─── Draw assembled shape portal ──────────────────────────────────────────────
function drawPortal(ctx, w, h, assembleT, shape, color, zoomT) {
  if (assembleT < 0.01 && zoomT < 0.01) return;

  const cx = w / 2;
  const cy = h / 2;
  const baseSize = Math.min(w, h) * 0.3;
  const size = baseSize * (0.3 + assembleT * 0.7) * (1 + zoomT * 6);

  ctx.save();
  ctx.translate(cx, cy);

  const gAlpha = assembleT * (1 - zoomT * 0.5);
  if (gAlpha < 0.01) { ctx.restore(); return; }

  // Outer glow rings
  for (let ring = 3; ring >= 1; ring--) {
    ctx.beginPath();
    ctx.shadowBlur = 40 * ring;
    ctx.shadowColor = color;
    ctx.globalAlpha = gAlpha * 0.15 / ring;
    ctx.strokeStyle = color;
    ctx.lineWidth = ring * 2;
    const rs = size * (1 + ring * 0.08);
    
    if (shape === "triangle") {
      ctx.moveTo(0, -rs);
      ctx.lineTo(rs * 0.866, rs * 0.5);
      ctx.lineTo(-rs * 0.866, rs * 0.5);
    } else if (shape === "hexagon") {
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = rs * Math.cos(angle);
        const y = rs * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (shape === "sphere") {
      ctx.arc(0, 0, rs, 0, Math.PI * 2);
    } else if (shape === "diamond") {
      ctx.moveTo(0, -rs);
      ctx.lineTo(rs * 0.7, 0);
      ctx.lineTo(0, rs);
      ctx.lineTo(-rs * 0.7, 0);
    } else if (shape === "infinity") {
      ctx.arc(-rs * 0.3, 0, rs * 0.4, 0, Math.PI * 2);
      ctx.arc(rs * 0.3, 0, rs * 0.4, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Main shape fill
  ctx.beginPath();
  if (shape === "triangle") {
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.866, size * 0.5);
    ctx.lineTo(-size * 0.866, size * 0.5);
  } else if (shape === "hexagon") {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  } else if (shape === "sphere") {
    ctx.arc(0, 0, size, 0, Math.PI * 2);
  } else if (shape === "diamond") {
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.7, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.7, 0);
  } else if (shape === "infinity") {
    ctx.arc(-size * 0.3, 0, size * 0.4, 0, Math.PI * 2);
    ctx.arc(size * 0.3, 0, size * 0.4, 0, Math.PI * 2);
  }
  ctx.closePath();

  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 1.1);
  grad.addColorStop(0, color + "30");
  grad.addColorStop(0.5, color + "10");
  grad.addColorStop(1, color + "05");
  ctx.globalAlpha = gAlpha;
  ctx.fillStyle = grad;
  ctx.fill();

  // Main shape edge
  ctx.beginPath();
  if (shape === "triangle") {
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.866, size * 0.5);
    ctx.lineTo(-size * 0.866, size * 0.5);
  } else if (shape === "hexagon") {
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = size * Math.cos(angle);
      const y = size * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  } else if (shape === "sphere") {
    ctx.arc(0, 0, size, 0, Math.PI * 2);
  } else if (shape === "diamond") {
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.7, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size * 0.7, 0);
  } else if (shape === "infinity") {
    ctx.arc(-size * 0.3, 0, size * 0.4, 0, Math.PI * 2);
    ctx.arc(size * 0.3, 0, size * 0.4, 0, Math.PI * 2);
  }
  ctx.closePath();
  ctx.globalAlpha = gAlpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5 + assembleT * 1.5;
  ctx.shadowBlur = 20 + assembleT * 30;
  ctx.shadowColor = color;
  ctx.stroke();

  // Zoom portal
  if (zoomT > 0) {
    ctx.beginPath();
    const zs = size * (1 + zoomT * 8);
    if (shape === "triangle") {
      ctx.moveTo(0, -zs);
      ctx.lineTo(zs * 0.866, zs * 0.5);
      ctx.lineTo(-zs * 0.866, zs * 0.5);
    } else if (shape === "hexagon") {
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = zs * Math.cos(angle);
        const y = zs * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    } else if (shape === "sphere") {
      ctx.arc(0, 0, zs, 0, Math.PI * 2);
    } else if (shape === "diamond") {
      ctx.moveTo(0, -zs);
      ctx.lineTo(zs * 0.7, 0);
      ctx.lineTo(0, zs);
      ctx.lineTo(-zs * 0.7, 0);
    } else if (shape === "infinity") {
      ctx.arc(-zs * 0.3, 0, zs * 0.4, 0, Math.PI * 2);
      ctx.arc(zs * 0.3, 0, zs * 0.4, 0, Math.PI * 2);
    }
    ctx.closePath();
    ctx.globalAlpha = Math.min(1, zoomT * 1.5);
    ctx.fillStyle = "#03030a";
    ctx.fill();
  }

  ctx.restore();
}

// ─── Canvas Animation Engine ──────────────────────────────────────────────────
function useCanvasEngine(canvasRef, currentSection, assembleProgress, zoomProgress) {
  const fragsRef    = useRef([]);
  const timeRef     = useRef(0);
  const rafRef      = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const cfg = SECTION_CFG[currentSection];
    fragsRef.current = makeFragments(w, h, cfg);
  }, [canvasRef, currentSection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function frame(ts) {
      timeRef.current = ts * 0.001;
      const t = timeRef.current;
      const w = canvas.width;
      const h = canvas.height;
      const cfg = SECTION_CFG[currentSection];
      const aT = assembleProgress.current;
      const zT = zoomProgress.current;

      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = "#03030a";
      ctx.fillRect(0, 0, w, h);

      // Subtle grid
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,0.012)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      ctx.restore();

      // Update + draw fragments
      const cx = w / 2, cy = h / 2;
      const frags = fragsRef.current;
      const targets = getShapeTargets(cfg.shape, frags, w, h, cx, cy);

      for (let i = 0; i < frags.length; i++) {
        const f = frags[i];
        const target = targets[i];

        if (aT < 0.01) {
          // Idle drift
          f.x += f.vx + Math.sin(t * 0.3 + f.phase) * 0.08 * f.depth;
          f.y += f.vy + Math.cos(t * 0.2 + f.phase) * 0.06 * f.depth;
          f.rotation += f.rotSpeed;
          // Wrap edges
          if (f.x < -30) f.x = w + 20;
          if (f.x > w + 30) f.x = -20;
          if (f.y < -30) f.y = h + 20;
          if (f.y > h + 30) f.y = -20;
        } else {
          // Lerp toward target
          const ease = aT * aT * (3 - 2 * aT);
          f.x += (target.tx - f.x) * 0.04 * (1 + ease * 2);
          f.y += (target.ty - f.y) * 0.04 * (1 + ease * 2);
          f.rotation += f.rotSpeed * (1 - aT * 0.8);
        }

        // During zoom, fragments fly away
        if (zT > 0) {
          const dx = f.x - cx, dy = f.y - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          f.x += (dx / dist) * zT * 8;
          f.y += (dy / dist) * zT * 8;
        }

        // Draw fragment
        const fragAlpha = 1 - zT;
        if (fragAlpha > 0.01) {
          ctx.globalAlpha = fragAlpha;
          drawFragment(ctx, f, aT, cfg.primary, aT);
          ctx.globalAlpha = 1;
        }
      }

      // Draw portal shape
      drawPortal(ctx, w, h, aT, cfg.shape, cfg.primary, zT);

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [canvasRef, currentSection, assembleProgress, zoomProgress]);
}

// ─── Section Content Components ───────────────────────────────────────────────
function HeroContent({ color }) {
  return (
    <div style={{ ...S.wrap, maxWidth: 620 }}>
      <p style={{ ...S.eyebrow, color }}>● Led by CEO Jirlo Jayan · Backed by iQue Ventures</p>
      <h1 style={S.h1}>Bharath Innovations<br /><span style={S.h1dim}>& Startups Facilitator</span></h1>
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
  );
}

function ServicesContent({ color }) {
  return (
    <div style={{ ...S.wrap, maxWidth: 620 }}>
      <p style={{ ...S.eyebrow, color }}>● Our Services</p>
      <h2 style={S.h2}>What We Build <span style={S.h2dim}>With Founders</span></h2>
      <p style={S.body}>End-to-end support from ideation to international scale.</p>
      <div style={S.grid3}>
        {[
          { label: "Startup Education",    c: "#00f5ff" },
          { label: "Fundraising Strategy", c: "#818cf8" },
          { label: "Market Entry",         c: "#34d399" },
          { label: "Mentor Network",       c: "#f9a8d4" },
          { label: "Legal & Compliance",   c: "#ff2ebe" },
          { label: "Product Launchpad",    c: "#06b6d4" },
        ].map(s => (
          <div key={s.label} style={S.serviceItem}>
            <div style={{ ...S.cardAccent, background: s.c }} />
            <span style={{ ...S.tag, color: s.c }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImpactContent({ color }) {
  return (
    <div style={{ ...S.wrap, maxWidth: 620 }}>
      <p style={{ ...S.eyebrow, color }}>● Impact Numbers</p>
      <h2 style={S.h2}>Proven at Scale</h2>
      <p style={S.body}>Our portfolio tells the story — from seed-stage ideas to global enterprises.</p>
      <div style={S.grid2}>
        {[
          { num: "500+",    lbl: "Founders Mentored",   c: "#34d399" },
          { num: "₹120Cr+", lbl: "Capital Facilitated", c: "#818cf8" },
          { num: "18",      lbl: "Countries Entered",   c: "#06b6d4" },
          { num: "92%",     lbl: "Success Rate",        c: "#ff2ebe" },
        ].map(s => (
          <div key={s.lbl} style={S.statBox}>
            <div style={{ ...S.statNum, color: s.c }}>{s.num}</div>
            <div style={S.statLbl}>{s.lbl}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProcessContent({ color }) {
  return (
    <div style={{ ...S.wrap, maxWidth: 620 }}>
      <p style={{ ...S.eyebrow, color }}>● How It Works</p>
      <h2 style={S.h2}>Your Journey <span style={S.h2dim}>Our Framework</span></h2>
      <div style={S.timeline}>
        {[
          { step: "I",   c: "#00f5ff", title: "Discovery Session",    desc: "We map your idea, market, and readiness in a focused 2-hour session." },
          { step: "II",  c: "#818cf8", title: "Build Your Foundation", desc: "Legal entity, brand identity, MVP scope — all handled systematically." },
          { step: "III", c: "#34d399", title: "Capital & Growth",     desc: "Investor intros, pitch deck refinement, and growth strategy execution." },
        ].map(t => (
          <div key={t.step} style={S.tItem}>
            <div style={{ ...S.tStep, color: t.c, borderColor: t.c }}>{t.step}</div>
            <div>
              <div style={S.tTitle}>{t.title}</div>
              <div style={S.tDesc}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactContent({ color }) {
  return (
    <div style={{ ...S.wrap, maxWidth: 620, textAlign: "center" }}>
      <p style={{ ...S.eyebrow, color }}>● Let's Begin</p>
      <h2 style={S.h2}>Ready to Build <span style={S.h2dim}>Something Real?</span></h2>
      <p style={{ ...S.body, marginBottom: "2rem" }}>Join hundreds of founders who turned bold ideas into global ventures.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="#" style={S.ctaPrimary}>Apply for Mentorship</a>
        <a href="#" style={{ ...S.ctaPrimary, color, borderColor: color }}>Talk to Us</a>
      </div>
      <p style={S.geo}>Bangalore · Mumbai · Singapore · London</p>
    </div>
  );
}

const CONTENT_MAP = { hero: HeroContent, services: ServicesContent, impact: ImpactContent, process: ProcessContent, contact: ContactContent };
const SECTION_IDS = ["hero", "services", "impact", "process", "contact"];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [currentSection, setCurrentSection]   = useState(0);
  const [contentVisible, setContentVisible]   = useState(true);

  const assembleProgress = useRef(0);
  const zoomProgress     = useRef(0);
  const isTransitioning  = useRef(false);
  const currentSectionRef = useRef(0);
  const internalTick     = useRef(0);

  const canvasRef   = useRef(null);
  const scrollAccum = useRef(0);
  const lastScroll  = useRef(0);
  const touchStart  = useRef(null);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Run canvas engine
  useCanvasEngine(canvasRef, currentSection, assembleProgress, zoomProgress);

  // Animate assemble progress smoothly
  const assembleTarget = useRef(0);
  const zoomTarget     = useRef(0);

  useEffect(() => {
    let raf;
    function tick() {
      const aSpeed = 0.025;
      const zSpeed = 0.04;
      const aD = assembleTarget.current - assembleProgress.current;
      const zD = zoomTarget.current     - zoomProgress.current;
      if (Math.abs(aD) > 0.001) assembleProgress.current += aD * aSpeed * 3;
      if (Math.abs(zD) > 0.001) zoomProgress.current     += zD * zSpeed * 3;
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Trigger full section transition
  const doSectionTransition = useCallback((from, to) => {
    if (isTransitioning.current) return;
    if (to < 0 || to >= TOTAL_SECTIONS) return;
    isTransitioning.current = true;

    // Phase 1: zoom in
    zoomTarget.current = 1;
    setContentVisible(false);

    setTimeout(() => {
      currentSectionRef.current = to;
      setCurrentSection(to);
      assembleProgress.current = 0;
      assembleTarget.current   = 0;
      zoomProgress.current     = 1;
      internalTick.current     = 0;

      // Phase 2: zoom out
      setTimeout(() => {
        zoomTarget.current   = 0;
        zoomProgress.current = 0;
        setContentVisible(true);

        setTimeout(() => {
          isTransitioning.current = false;
        }, 600);
      }, 80);
    }, 500);
  }, []);

  // Handle scroll tick
  const handleScrollTick = useCallback((direction) => {
    if (isTransitioning.current) return;
    const cur = currentSectionRef.current;

    if (direction > 0) {
      if (internalTick.current < ASSEMBLY_TICKS) {
        internalTick.current++;
        assembleTarget.current = internalTick.current / ASSEMBLY_TICKS;
      } else {
        if (cur < TOTAL_SECTIONS - 1) {
          doSectionTransition(cur, cur + 1);
        }
      }
    } else {
      if (internalTick.current > 0) {
        internalTick.current--;
        assembleTarget.current = internalTick.current / ASSEMBLY_TICKS;
      } else {
        if (cur > 0) {
          doSectionTransition(cur, cur - 1);
        }
      }
    }
  }, [doSectionTransition]);

  // Jump to section
  const jumpToSection = useCallback((to) => {
    const cur = currentSectionRef.current;
    if (to === cur || isTransitioning.current) return;
    internalTick.current   = 0;
    assembleTarget.current = 0;
    doSectionTransition(cur, to);
  }, [doSectionTransition]);

  // Event listeners
  useEffect(() => {
    const THRESH = 50;

    const onWheel = (e) => {
      e.preventDefault();
      if (isTransitioning.current) return;
      const now = Date.now();
      if (now - lastScroll.current > 700) scrollAccum.current = 0;
      lastScroll.current = now;
      scrollAccum.current += e.deltaY;
      if (scrollAccum.current > THRESH) {
        scrollAccum.current = 0;
        handleScrollTick(1);
      } else if (scrollAccum.current < -THRESH) {
        scrollAccum.current = 0;
        handleScrollTick(-1);
      }
    };

    const onTouchStart = (e) => { touchStart.current = e.touches[0].clientY; };
    const onTouchEnd   = (e) => {
      if (touchStart.current === null || isTransitioning.current) return;
      const dy = touchStart.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) handleScrollTick(dy > 0 ? 1 : -1);
      touchStart.current = null;
    };

    const onKey = (e) => {
      if (isTransitioning.current) return;
      if (e.key === "ArrowDown" || e.key === "PageDown") handleScrollTick(1);
      else if (e.key === "ArrowUp" || e.key === "PageUp") handleScrollTick(-1);
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true });
    window.addEventListener("keydown",    onKey);
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("keydown",    onKey);
    };
  }, [handleScrollTick]);

  const color   = SECTION_CFG[currentSection].primary;
  const cfg     = SECTION_CFG[currentSection];
  const Content = CONTENT_MAP[SECTION_IDS[currentSection]];

  // Determine layout based on section
  const contentSide = cfg.contentSide;
  const animSide = cfg.animSide;

  const getContentPosition = () => {
    if (contentSide === "center") return { left: "50%", transform: "translateX(-50%)" };
    if (contentSide === "left") return { left: "8%", right: "auto" };
    return { right: "8%", left: "auto" };
  };

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", background: "#03030a", fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>

      {/* Canvas — fullscreen */}
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, zIndex: 0, display: "block" }}
      />

      {/* Navbar */}
      <header style={{
        position: "fixed", top: 0, left: 0, width: "100%", zIndex: 200,
        height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(3,3,10,0.7)",
        backdropFilter: "blur(16px)",
      }}>
        <span style={{ fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500 }}>BISF</span>
        <div style={{ display: "flex", gap: 32 }}>
          {[["Home", 0], ["Services", 1], ["Contact", 4]].map(([label, idx]) => (
            <button key={label} onClick={() => jumpToSection(idx)}
              style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                color: currentSection === idx ? "#fff" : "rgba(255,255,255,0.32)",
                transition: "color 0.4s" }}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Section Content — positioned based on layout */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        display: "flex", alignItems: "center",
        padding: "5rem 2rem 2rem",
        ...getContentPosition(),
        maxWidth: contentSide === "center" ? 620 : "45%",
        opacity: contentVisible ? 1 : 0,
        transition: "opacity 0.35s ease",
        pointerEvents: contentVisible ? "auto" : "none",
      }}>
        <Content color={color} />
      </div>

      {/* Nav dots */}
      <div style={{ position: "fixed", right: "1.6rem", top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 12, zIndex: 200 }}>
        {SECTION_IDS.map((_, i) => (
          <button key={i} onClick={() => jumpToSection(i)}
            style={{
              width: 6, height: 6, borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
              background: i === currentSection ? color : "rgba(255,255,255,0.18)",
              boxShadow: i === currentSection ? `0 0 8px ${color}` : "none",
              transition: "background 0.4s, box-shadow 0.4s",
            }} />
        ))}
      </div>

      {/* Assembly progress hint */}
      <div style={{
        position: "fixed", bottom: "5rem", left: "50%", transform: "translateX(-50%)",
        zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        opacity: contentVisible && internalTick.current === 0 ? 0.35 : 0,
        transition: "opacity 0.8s",
        pointerEvents: "none",
        userSelect: "none",
      }}>
        <span style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Scroll</span>
        <div style={{ width: 1, height: 28, background: `linear-gradient(to bottom, transparent, ${color})` }} />
      </div>

      {/* Footer */}
      <footer style={{
        position: "fixed", bottom: 0, left: 0, width: "100%", zIndex: 200, height: 40,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", borderTop: "1px solid rgba(255,255,255,0.04)",
        background: "rgba(3,3,10,0.7)",
        fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.14)",
      }}>
        <span>BISF</span>
        <span>2026</span>
      </footer>

    </div>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  wrap:       { width: "100%" },
  eyebrow:    { fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1.4rem", display: "block" },
  h1:         { fontSize: "clamp(2.2rem, 5.5vw, 4rem)", fontWeight: 200, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: "1.2rem", marginTop: 0, color: "#fff" },
  h1dim:      { color: "rgba(255,255,255,0.3)", fontWeight: 100 },
  h2:         { fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 200, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: "1rem", marginTop: 0, color: "#fff" },
  h2dim:      { display: "block", color: "rgba(255,255,255,0.2)", fontWeight: 100 },
  body:       { fontSize: "clamp(0.8rem, 1.4vw, 0.9rem)", color: "rgba(255,255,255,0.3)", maxWidth: 420, margin: "0 auto 1.6rem", lineHeight: 1.9 },
  cardRow:    { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: "1.6rem" },
  card:       { padding: "1.2rem 1rem", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, background: "rgba(255,255,255,0.025)", textAlign: "left" },
  cardAccent: { width: 20, height: 1, marginBottom: 12 },
  cardLabel:  { fontSize: 10, fontWeight: 500, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" },
  cardDesc:   { fontSize: 11, color: "rgba(255,255,255,0.22)", lineHeight: 1.75 },
  grid3:      { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9, marginTop: "1.6rem" },
  serviceItem:{ padding: "1rem 0.8rem", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, background: "rgba(255,255,255,0.018)", textAlign: "left" },
  tag:        { fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" },
  grid2:      { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: "1.4rem" },
  statBox:    { border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, background: "rgba(255,255,255,0.025)", padding: "1.6rem 1rem", textAlign: "center" },
  statNum:    { fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 200, letterSpacing: "-0.04em", lineHeight: 1 },
  statLbl:    { fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 8, letterSpacing: "0.1em", textTransform: "uppercase" },
  timeline:   { display: "flex", flexDirection: "column", gap: 9, marginTop: "1.4rem" },
  tItem:      { display: "flex", alignItems: "flex-start", gap: 16, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 11, background: "rgba(255,255,255,0.016)" },
  tStep:      { fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", border: "1px solid", borderRadius: 5, padding: "3px 8px", minWidth: 32, textAlign: "center", flexShrink: 0 },
  tTitle:     { fontSize: 13, fontWeight: 500, marginBottom: 5, color: "rgba(255,255,255,0.85)", letterSpacing: "0.02em" },
  tDesc:      { fontSize: 11, color: "rgba(255,255,255,0.28)", lineHeight: 1.8 },
  ctaPrimary: { display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.13)", color: "#fff", fontSize: 12, padding: "11px 26px", borderRadius: 9, cursor: "pointer", textDecoration: "none", letterSpacing: "0.05em" },
  geo:        { marginTop: "1.8rem", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.1)", textTransform: "uppercase" },
};