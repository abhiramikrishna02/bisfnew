"use client";

// ─── Sixth Section: BISF About / Mission — Topographic Background ─────────────

import { useEffect, useRef } from "react";

const ACCENT = "#00f5ff";

/* ─────────────────────────────────────────────
   Lightweight topographic canvas animation
   - Uses simplex-style noise approximation (sin/cos sums) — no library needed
   - Renders ~18 contour lines per frame, very low CPU
   - 2 lines get an animated iridescent rainbow stroke (green → cyan → white)
   - All other lines: barely-visible dark-on-dark (#1a1a1a strokes)
   - Moves slowly → no jank on scroll
───────────────────────────────────────────── */
function useTopoAnimation(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let rafId = 0;
    let lastTS = null;
    let elapsed = 0;
    const MAX_DELTA = 0.05;

    // ── Pseudo-noise: cheap sum of sines, gives smooth organic curves ──
    function noise(x, y, t) {
      return (
        Math.sin(x * 1.3 + t * 0.18) * 0.35 +
        Math.sin(y * 1.1 + t * 0.12) * 0.30 +
        Math.sin((x + y) * 0.7 + t * 0.09) * 0.20 +
        Math.sin(x * 0.5 - y * 0.9 + t * 0.15) * 0.15
      );
    }

    // ── Marching squares — sample a grid, trace iso-contour for a given level ──
    function traceContour(W, H, t, level, cellSize) {
      const cols = Math.ceil(W / cellSize) + 1;
      const rows = Math.ceil(H / cellSize) + 1;

      // Build scalar field
      const field = [];
      for (let r = 0; r < rows; r++) {
        field[r] = [];
        for (let c = 0; c < cols; c++) {
          const nx = (c / cols) * 6;
          const ny = (r / rows) * 6;
          field[r][c] = noise(nx, ny, t);
        }
      }

      // Interpolate crossing point between two grid values
      function lerp(a, b, va, vb) {
        if (Math.abs(vb - va) < 0.0001) return a;
        return a + (level - va) / (vb - va) * (b - a);
      }

      const segments = [];

      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const x0 = c * cellSize, x1 = (c + 1) * cellSize;
          const y0 = r * cellSize, y1 = (r + 1) * cellSize;

          const v00 = field[r][c];
          const v10 = field[r][c + 1];
          const v01 = field[r + 1][c];
          const v11 = field[r + 1][c + 1];

          const idx =
            (v00 > level ? 8 : 0) |
            (v10 > level ? 4 : 0) |
            (v11 > level ? 2 : 0) |
            (v01 > level ? 1 : 0);

          if (idx === 0 || idx === 15) continue;

          // edge midpoints
          const top    = { x: lerp(x0, x1, v00, v10), y: y0 };
          const right  = { x: x1, y: lerp(y0, y1, v10, v11) };
          const bottom = { x: lerp(x0, x1, v01, v11), y: y1 };
          const left   = { x: x0, y: lerp(y0, y1, v00, v01) };

          const table = {
            1:  [left, bottom],   2:  [bottom, right],
            3:  [left, right],    4:  [top, right],
            5:  [top, left, bottom, right], // saddle — split into 2
            6:  [top, bottom],    7:  [top, left],
            8:  [top, left],      9:  [top, bottom],
            10: [left, bottom, top, right], // saddle
            11: [top, right],     12: [left, right],
            13: [bottom, right],  14: [left, bottom],
          };

          const pts = table[idx];
          if (!pts) continue;

          if (pts.length === 4) {
            segments.push([pts[0], pts[1]]);
            segments.push([pts[2], pts[3]]);
          } else {
            segments.push([pts[0], pts[1]]);
          }
        }
      }
      return segments;
    }

    // ── Iridescent colour cycling through green → cyan → white → cyan → green ──
    function iridescent(phase) {
      // cycle: 0→green, 0.25→cyan, 0.5→white, 0.75→cyan, 1→green
      const p = ((phase % 1) + 1) % 1;
      let r, g, b;
      if (p < 0.25) {
        const t = p / 0.25;
        r = Math.round(0   + t * 0);
        g = Math.round(200 + t * 55);
        b = Math.round(100 + t * 155);
      } else if (p < 0.5) {
        const t = (p - 0.25) / 0.25;
        r = Math.round(0   + t * 255);
        g = Math.round(255);
        b = Math.round(255);
      } else if (p < 0.75) {
        const t = (p - 0.5) / 0.25;
        r = Math.round(255 - t * 255);
        g = Math.round(255);
        b = Math.round(255 - t * 155);
      } else {
        const t = (p - 0.75) / 0.25;
        r = 0;
        g = Math.round(255 - t * 55);
        b = Math.round(255 - t * 155);
      }
      return `rgb(${r},${g},${b})`;
    }

    // Contour levels (ISO values in noise range ~-1..1)
    const LEVELS = [-0.7,-0.52,-0.38,-0.26,-0.16,-0.07,0,0.08,0.18,0.28,0.38,0.50,0.62,0.74];
    // Which level indices glow
    const GLOW_IDX = new Set([3, 8]);

    let W = 0, H = 0;
    const CELL = 38; // grid cell size — coarser = fewer polys = cheaper

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(1,0,0,1,0,0);
      ctx.scale(dpr, dpr);
    }
    resize();

    function draw(ts) {
      const delta = lastTS === null ? 0 : Math.min((ts - lastTS) / 1000, MAX_DELTA);
      lastTS = ts;
      elapsed += delta;
      const t = elapsed * 0.28; // very slow drift

      ctx.clearRect(0, 0, W, H);

      LEVELS.forEach((level, li) => {
        const isGlow = GLOW_IDX.has(li);
        const segments = traceContour(W, H, t + li * 0.4, level, CELL);

        segments.forEach(([a, b]) => {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);

          if (isGlow) {
            // Phase per-line + per-segment position for rolling shimmer
            const segPhase = elapsed * 0.12 + (a.x + a.y) / (W + H) + li * 0.3;
            const col = iridescent(segPhase);

            // Outer glow
            ctx.strokeStyle = col;
            ctx.lineWidth   = 2.8;
            ctx.shadowColor = col;
            ctx.shadowBlur  = 10;
            ctx.globalAlpha = 0.75;
            ctx.stroke();

            // Bright core
            ctx.lineWidth   = 1.2;
            ctx.strokeStyle = "#ffffff";
            ctx.shadowBlur  = 4;
            ctx.globalAlpha = 0.55;
            ctx.stroke();
          } else {
            // Subtle embossed dark lines
            ctx.strokeStyle = "rgba(255,255,255,0.055)";
            ctx.lineWidth   = 0.9;
            ctx.shadowBlur  = 0;
            ctx.globalAlpha = 1;
            ctx.stroke();
          }
        });

        ctx.shadowBlur  = 0;
        ctx.globalAlpha = 1;
      });

      rafId = requestAnimationFrame(draw);
    }

    // Pause off-screen
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          lastTS = null;
          if (!rafId) rafId = requestAnimationFrame(draw);
        } else {
          if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
        }
      },
      { rootMargin: "200px 0px" }
    );
    io.observe(canvas);

    const onVis = () => { if (document.visibilityState === "visible") lastTS = null; };
    document.addEventListener("visibilitychange", onVis);

    rafId = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [canvasRef]);
}

/* ─────────────────────────────────────────────
   Content
───────────────────────────────────────────── */
const PILLARS = [
  {
    icon: "◈",
    title: "Capital Access",
    desc: "Direct pathways to verified HNI investors, family offices, and institutional funds across India.",
  },
  {
    icon: "◉",
    title: "Deal Structuring",
    desc: "Expert guidance on term sheets, valuations, and equity frameworks that protect founders and attract capital.",
  },
  {
    icon: "◎",
    title: "Portfolio Growth",
    desc: "Active post-investment support — hiring, market expansion, and strategic partnerships.",
  },
];

export default function TopoSection() {
  const canvasRef = useRef(null);
  useTopoAnimation(canvasRef);

  return (
    <>
      <style>{`
        /* ══════════════════════════════════════
           TOPO SECTION — base styles
           ══════════════════════════════════════ */
        #topo-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080808;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 6rem 0;
          overflow: hidden;
          isolation: isolate;
        }

        #topo-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        /* Centre vignette keeps text readable over the busy lines */
        #topo-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 70% at 50% 50%, rgba(8,8,8,0.72) 15%, transparent 100%),
            linear-gradient(to bottom,
              rgba(8,8,8,0.85) 0%,
              rgba(8,8,8,0.20) 25%,
              rgba(8,8,8,0.20) 75%,
              rgba(8,8,8,0.85) 100%
            );
          z-index: 1;
          pointer-events: none;
        }

        /* ── Content ── */
        #topo-inner {
          position: relative;
          z-index: 2;
          max-width: 820px;
          width: 100%;
          padding: 0 2rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-sizing: border-box;
        }

        /* Eyebrow */
        .ts-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: ${ACCENT};
          text-shadow: 0 0 14px rgba(0,245,255,0.50);
          margin: 0 0 1.8rem 0;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .ts-eyebrow::before,
        .ts-eyebrow::after {
          content: '';
          display: inline-block;
          width: 28px;
          height: 1px;
          background: linear-gradient(90deg, transparent, ${ACCENT});
          flex-shrink: 0;
        }
        .ts-eyebrow::after {
          background: linear-gradient(90deg, ${ACCENT}, transparent);
        }

        /* Headline */
        .ts-h2 {
          font-weight: 800;
          font-size: clamp(2.8rem, 5vw, 4.6rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0 0 1rem 0;
          text-shadow:
            0 2px 4px  rgba(0,0,0,0.95),
            0 4px 32px rgba(0,0,0,0.80);
        }
        .ts-h2-accent {
          display: block;
          /* Iridescent gradient on the accent line */
          background: linear-gradient(100deg, #00ff87 0%, ${ACCENT} 40%, #ffffff 70%, ${ACCENT} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: tsShimmer 5s linear infinite;
        }
        @keyframes tsShimmer {
          0%   { background-position: 0%   center; }
          100% { background-position: 200% center; }
        }

        .ts-sub {
          font-size: clamp(0.92rem, 1.8vw, 1.05rem);
          font-weight: 400;
          color: rgba(255,255,255,0.55);
          line-height: 1.78;
          max-width: 540px;
          margin: 0 0 1rem 0;
        }

        /* BISF URL badge */
        .ts-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 3rem 0;
          padding: 7px 16px;
          border: 1px solid rgba(0,245,255,0.22);
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: rgba(0,245,255,0.80);
          background: rgba(0,245,255,0.04);
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .ts-badge:hover {
          border-color: rgba(0,245,255,0.50);
          background: rgba(0,245,255,0.08);
        }
        .ts-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00ff87;
          box-shadow: 0 0 6px rgba(0,255,135,0.70);
          animation: tsPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes tsPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.7); }
        }

        .ts-rule {
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${ACCENT}, transparent);
          box-shadow: 0 0 10px rgba(0,245,255,0.30);
          border-radius: 1px;
          margin-bottom: 3rem;
        }

        /* Pillar cards */
        .ts-pillars {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          width: 100%;
          margin-bottom: 3.2rem;
        }

        .ts-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 22px 18px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          background: rgba(8,8,8,0.75);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: border-color 0.3s ease, transform 0.3s ease;
          will-change: transform;
          box-sizing: border-box;
        }
        .ts-card:hover {
          border-color: rgba(0,245,255,0.25);
          transform: translateY(-4px);
        }

        .ts-icon {
          font-size: 22px;
          color: ${ACCENT};
          text-shadow: 0 0 12px rgba(0,245,255,0.50);
          margin-bottom: 12px;
          line-height: 1;
        }

        .ts-card-title {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: #ffffff;
          margin: 0 0 8px 0;
        }

        .ts-card-desc {
          font-size: 12.5px;
          font-weight: 400;
          color: rgba(255,255,255,0.52);
          line-height: 1.75;
          margin: 0;
        }

        /* CTA */
        .ts-cta {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .ts-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 30px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(120deg, #00ff87 0%, ${ACCENT} 100%);
          color: #080808;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 24px rgba(0,245,255,0.28);
        }
        .ts-btn-primary:hover {
          opacity: 0.88;
          transform: translateY(-2px);
          box-shadow: 0 0 36px rgba(0,245,255,0.45);
        }

        .ts-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 30px;
          border-radius: 10px;
          border: 1px solid rgba(0,245,255,0.26);
          background: transparent;
          color: rgba(255,255,255,0.78);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s, transform 0.2s;
        }
        .ts-btn-ghost:hover {
          border-color: ${ACCENT};
          color: ${ACCENT};
          transform: translateY(-2px);
        }

        /* ══════════════════════════════════════
           RESPONSIVE — all breakpoints
           ══════════════════════════════════════ */

        /* 320–479px small phones */
        @media (max-width: 479px) {
          #topo-section  { padding: 3.5rem 0; min-height: auto; }
          #topo-inner    { padding: 0 1.1rem; }
          .ts-eyebrow    { font-size: 9px; letter-spacing: 0.18em; margin-bottom: 1.2rem; }
          .ts-eyebrow::before, .ts-eyebrow::after { width: 14px; }
          .ts-h2         { font-size: clamp(1.85rem, 10vw, 2.4rem); }
          .ts-sub        { font-size: 0.875rem; margin-bottom: 0.8rem; }
          .ts-badge      { font-size: 10px; margin-bottom: 2rem; }
          .ts-rule       { margin-bottom: 2rem; }
          .ts-pillars    { grid-template-columns: 1fr; gap: 10px; margin-bottom: 2rem; }
          .ts-card       { padding: 16px 14px; border-radius: 12px; }
          .ts-icon       { font-size: 18px; }
          .ts-card-title { font-size: 13px; }
          .ts-card-desc  { font-size: 12px; }
          .ts-cta        { flex-direction: column; gap: 10px; }
          .ts-btn-primary,
          .ts-btn-ghost  { width: 100%; justify-content: center; padding: 13px 20px; font-size: 12px; }
        }

        /* 480–639px large phones */
        @media (min-width: 480px) and (max-width: 639px) {
          #topo-section { padding: 4rem 0; min-height: auto; }
          #topo-inner   { padding: 0 1.4rem; }
          .ts-h2        { font-size: clamp(2.1rem, 8vw, 2.8rem); }
          .ts-pillars   { grid-template-columns: 1fr; gap: 10px; margin-bottom: 2.2rem; }
          .ts-cta       { flex-direction: column; gap: 10px; }
          .ts-btn-primary,
          .ts-btn-ghost { width: 100%; justify-content: center; }
        }

        /* 640–767px tablets portrait */
        @media (min-width: 640px) and (max-width: 767px) {
          #topo-section { padding: 4.5rem 0; }
          #topo-inner   { padding: 0 2rem; }
          .ts-h2        { font-size: clamp(2.4rem, 6vw, 3.2rem); }
          .ts-pillars   { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .ts-card:last-child { grid-column: 1 / -1; max-width: 340px; margin: 0 auto; width: 100%; }
        }

        /* 768–1023px tablet landscape */
        @media (min-width: 768px) and (max-width: 1023px) {
          #topo-section { padding: 5rem 0; }
          #topo-inner   { max-width: 700px; padding: 0 2.5rem; }
          .ts-pillars   { grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .ts-card      { padding: 20px 16px; }
        }

        /* 1024–1279px laptops */
        @media (min-width: 1024px) and (max-width: 1279px) {
          #topo-section { padding: 5.5rem 0; }
          #topo-inner   { max-width: 800px; }
        }

        /* 1536px+ large monitors */
        @media (min-width: 1536px) and (max-width: 2559px) {
          #topo-section { padding: 7rem 0; }
          #topo-inner   { max-width: 960px; }
          .ts-card      { padding: 26px 22px; border-radius: 16px; }
          .ts-card-desc { font-size: 13.5px; }
          .ts-sub       { font-size: 1.1rem; }
          .ts-btn-primary,
          .ts-btn-ghost { padding: 15px 36px; font-size: 14px; }
        }

        /* 4K */
        @media (min-width: 2560px) {
          #topo-section { padding: 9rem 0; }
          #topo-inner   { max-width: 1240px; }
          .ts-h2        { font-size: 5.5rem; }
          .ts-sub       { font-size: 1.25rem; max-width: 660px; }
          .ts-card      { padding: 34px 28px; border-radius: 20px; }
          .ts-icon      { font-size: 28px; }
          .ts-card-title { font-size: 17px; }
          .ts-card-desc  { font-size: 15px; }
          .ts-eyebrow    { font-size: 13px; }
          .ts-btn-primary,
          .ts-btn-ghost { padding: 17px 42px; font-size: 15px; border-radius: 12px; }
        }

        /* Touch — no hover lifts */
        @media (hover: none) and (pointer: coarse) {
          .ts-card:hover        { transform: none; border-color: rgba(255,255,255,0.07); }
          .ts-btn-primary:hover { transform: none; }
          .ts-btn-ghost:hover   { transform: none; }
          .ts-badge:hover       { background: rgba(0,245,255,0.04); border-color: rgba(0,245,255,0.22); }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .ts-h2-accent          { animation: none; }
          .ts-badge-dot          { animation: none; }
          .ts-card,
          .ts-btn-primary,
          .ts-btn-ghost,
          .ts-badge              { transition: none; }
        }
      `}</style>

      <section id="topo-section">
        <canvas id="topo-canvas" ref={canvasRef} />

        <div id="topo-inner">
          <p className="ts-eyebrow">About BISF</p>

          <h2 className="ts-h2">
            Bridging Capital
            <span className="ts-h2-accent">with Innovation</span>
          </h2>

          <p className="ts-sub">
            Barad Innovation Services &amp; Finance connects high-potential
            founders with the right investors, tools, and frameworks to turn
            ideas into investable, scalable businesses.
          </p>

          <a
            href="https://bisf-india.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ts-badge"
          >
            <span className="ts-badge-dot" />
            bisf-india.com
          </a>

          <div className="ts-rule" />

          <div className="ts-pillars">
            {PILLARS.map((p) => (
              <div key={p.title} className="ts-card">
                <div className="ts-icon">{p.icon}</div>
                <p className="ts-card-title">{p.title}</p>
                <p className="ts-card-desc">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="ts-cta">
            <a
              href="https://bisf-india.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ts-btn-primary"
            >
              Explore BISF →
            </a>
            <a href="#process" className="ts-btn-ghost">
              Our Process
            </a>
          </div>
        </div>
      </section>
    </>
  );
}