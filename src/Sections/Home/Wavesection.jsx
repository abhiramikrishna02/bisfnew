"use client";

// ─── Fifth Section: Why BISF / Results & Impact ───────────────────────────────

import { useEffect, useRef } from "react";

const ACCENT = "#00f5ff";

const STATS = [
  {
    value: "94%",
    label: "Founder Success Rate",
    desc: "Of BISF-backed founders reach Series A or profitability within 18 months.",
  },
  {
    value: "3.2×",
    label: "Faster to Market",
    desc: "Average time from idea to first paying customer vs. going it alone.",
  },
  {
    value: "$40M+",
    label: "Capital Facilitated",
    desc: "Total funding unlocked for portfolio founders through our network.",
  },
  {
    value: "200+",
    label: "Ventures Launched",
    desc: "Businesses built across fintech, SaaS, health, and consumer verticals.",
  },
];

function useWaveAnimation(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let rafId = 0;
    let lastTS = null;
    let elapsedSecs = 0;
    const MAX_DELTA = 0.05;

    // Bar configuration — density scales with viewport width
    // Fewer bars on narrow screens so they stay visible and don't crush together
    const BAR_GAP = 2;
    function getBarCount() {
      const w = canvas.offsetWidth;
      if (w < 480)  return 36;
      if (w < 768)  return 52;
      if (w < 1280) return 68;
      return 88; // large / 4K screens
    }
    let BAR_COUNT = getBarCount();

    // Pre-compute per-bar phase/speed so the envelope shape is stable
    let bars = makeBars(BAR_COUNT);

    function makeBars(count) {
      return Array.from({ length: count }, (_, i) => ({
        phase: (i / count) * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.5,
        noise: Math.random() * 0.18,
      }));
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset before re-scaling
      ctx.scale(dpr, dpr);
      // Recalculate bar count on orientation / size change
      const newCount = getBarCount();
      if (newCount !== BAR_COUNT) {
        BAR_COUNT = newCount;
        bars = makeBars(BAR_COUNT);
      }
    }
    resize();

    function envelope(norm) {
      // Gaussian-ish bell centred at 0.5 → tall middle, short edges (like screenshot)
      const x = norm - 0.5;
      return Math.exp(-(x * x) / 0.06);
    }

    function draw(ts) {
      const delta = lastTS === null ? 0 : Math.min((ts - lastTS) / 1000, MAX_DELTA);
      lastTS = ts;
      elapsedSecs += delta;
      const t = elapsedSecs;

      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;

      ctx.clearRect(0, 0, W, H);

      const totalBarW = W / BAR_COUNT;
      const barW = Math.max(totalBarW - BAR_GAP, 1);

      for (let i = 0; i < BAR_COUNT; i++) {
        const norm = i / (BAR_COUNT - 1);
        const b = bars[i];

        // Compound oscillation: slow drift + fast shimmer + noise
        const wave =
          Math.sin(t * b.speed + b.phase) * 0.45 +
          Math.sin(t * 1.8 + b.phase * 2.1) * 0.25 +
          Math.sin(t * 3.1 + b.phase * 0.7) * 0.15 +
          b.noise * Math.sin(t * 5 + b.phase);

        const amplitude = ((wave + 1) / 2) * 0.82 + 0.05; // 0.05 … 0.87
        const env = envelope(norm);
        const barH = H * amplitude * env * 0.88;

        const x = i * totalBarW + (totalBarW - barW) / 2;
        const y = (H - barH) / 2;

        // Brightness follows height — brighter near centre/peak
        const brightness = 0.35 + env * amplitude * 0.65;
        const alpha = 0.55 + brightness * 0.45;

        // Vertical gradient: white-ish tip → cyan mid → dark base (like screenshot)
        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0,    `rgba(255,255,255,${alpha * 0.95})`);
        grad.addColorStop(0.18, `rgba(200,245,255,${alpha * 0.90})`);
        grad.addColorStop(0.45, `rgba(0,245,255,${alpha * 0.70})`);
        grad.addColorStop(0.75, `rgba(0,180,220,${alpha * 0.35})`);
        grad.addColorStop(1,    `rgba(0,80,120,0)`);

        // Subtle horizontal glow
        const glowAlpha = env * amplitude * 0.18;
        if (glowAlpha > 0.02) {
          ctx.shadowColor = `rgba(0,245,255,${glowAlpha})`;
          ctx.shadowBlur = 8;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, barW * 0.25);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      rafId = requestAnimationFrame(draw);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
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

export default function WaveSection() {
  const canvasRef = useRef(null);
  useWaveAnimation(canvasRef);

  return (
    <>
      <style>{`
        #wave-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #03030a;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 6rem 0;
          overflow: hidden;
          isolation: isolate;
        }

        /* ── Canvas sits behind everything ── */
        #wave-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          opacity: 0.72;
        }

        /* ── Radial + top/bottom vignette so text stays readable ── */
        #wave-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 55% 55% at 50% 50%, rgba(3,3,10,0.55) 20%, transparent 100%),
            linear-gradient(to bottom,
              rgba(3,3,10,0.80) 0%,
              rgba(3,3,10,0.28) 28%,
              rgba(3,3,10,0.28) 72%,
              rgba(3,3,10,0.80) 100%
            );
          z-index: 1;
          pointer-events: none;
        }

        /* ── Subtle cyan radial pulse centred on wave ── */
        #wave-section::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 40% at 50% 50%, rgba(0,245,255,0.04) 0%, transparent 70%);
          z-index: 1;
          pointer-events: none;
          animation: wavePulse 4s ease-in-out infinite;
        }
        @keyframes wavePulse {
          0%, 100% { opacity: 0.6; }
          50%       { opacity: 1;   }
        }

        /* ── Content layer ── */
        #wave-inner {
          position: relative;
          z-index: 2;
          max-width: 860px;
          width: 100%;
          padding: 0 2rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-sizing: border-box;
        }

        /* ── Eyebrow ── */
        .ws-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${ACCENT};
          text-shadow: 0 0 14px rgba(0,245,255,0.45);
          margin: 0 0 1.8rem 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ws-eyebrow::before,
        .ws-eyebrow::after {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: ${ACCENT};
          box-shadow: 0 0 8px rgba(0,245,255,0.5);
          flex-shrink: 0;
        }

        /* ── Headline ── */
        .ws-h2 {
          font-weight: 800;
          font-size: clamp(2.8rem, 5vw, 4.6rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0 0 1.2rem 0;
          text-shadow:
            0 2px 4px  rgba(0,0,0,0.95),
            0 4px 32px rgba(0,0,0,0.80);
        }
        .ws-h2-dim {
          display: block;
          color: rgba(255,255,255,0.42);
          margin-top: 0.12em;
        }

        /* ── Sub-copy ── */
        .ws-sub {
          font-size: clamp(0.95rem, 1.8vw, 1.1rem);
          font-weight: 400;
          color: rgba(255,255,255,0.58);
          line-height: 1.75;
          max-width: 520px;
          margin: 0 0 3.2rem 0;
        }

        .ws-rule {
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${ACCENT}, transparent);
          box-shadow: 0 0 10px rgba(0,245,255,0.35);
          border-radius: 1px;
          margin-bottom: 3.2rem;
        }

        /* ── Stats grid ── */
        .ws-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          width: 100%;
        }

        .ws-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          padding: 24px 22px;
          border: 1px solid rgba(0,245,255,0.10);
          border-radius: 16px;
          background: rgba(3,3,10,0.78);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          will-change: transform;
          box-sizing: border-box;
        }
        .ws-card:hover {
          transform: translateY(-4px);
          border-color: rgba(0,245,255,0.30);
          box-shadow: 0 12px 40px rgba(0,245,255,0.06);
        }

        .ws-value {
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #ffffff;
          line-height: 1;
          margin-bottom: 6px;
          /* Cyan shimmer on the number */
          background: linear-gradient(135deg, #ffffff 40%, ${ACCENT} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .ws-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${ACCENT};
          text-shadow: 0 0 10px rgba(0,245,255,0.40);
          margin-bottom: 10px;
        }

        .ws-desc {
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.55);
          line-height: 1.75;
          margin: 0;
        }

        /* ── CTA row ── */
        .ws-cta {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 3rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .ws-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          border-radius: 10px;
          border: none;
          background: ${ACCENT};
          color: #03030a;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 0 20px rgba(0,245,255,0.30);
          text-decoration: none;
        }
        .ws-btn-primary:hover {
          opacity: 0.88;
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(0,245,255,0.50);
        }

        .ws-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          border-radius: 10px;
          border: 1px solid rgba(0,245,255,0.28);
          background: transparent;
          color: rgba(255,255,255,0.80);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
          text-decoration: none;
        }
        .ws-btn-ghost:hover {
          border-color: ${ACCENT};
          color: ${ACCENT};
          transform: translateY(-2px);
        }

        /* ════════════════════════════════════════
           RESPONSIVE — mobile-first, full range
           320px · 480px · 640px · 768px · 1024px · 1280px · 1536px · 2560px+
           ════════════════════════════════════════ */

        /* ── 320 – 479 px  (small phones) ── */
        @media (max-width: 479px) {
          #wave-section {
            padding: 3.5rem 0;
            min-height: auto;
          }
          #wave-inner {
            padding: 0 1.1rem;
          }
          .ws-eyebrow {
            font-size: 9px;
            letter-spacing: 0.18em;
            margin-bottom: 1.2rem;
          }
          .ws-eyebrow::before,
          .ws-eyebrow::after { width: 16px; }
          .ws-h2 {
            font-size: clamp(1.85rem, 10vw, 2.4rem);
            margin-bottom: 0.9rem;
            letter-spacing: -0.025em;
          }
          .ws-sub {
            font-size: 0.875rem;
            margin-bottom: 2rem;
          }
          .ws-rule { margin-bottom: 2rem; }
          .ws-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .ws-card {
            padding: 16px 14px;
            border-radius: 12px;
          }
          .ws-value { font-size: clamp(1.9rem, 8vw, 2.4rem); }
          .ws-label { font-size: 9px; }
          .ws-desc  { font-size: 12px; }
          .ws-cta {
            flex-direction: column;
            gap: 10px;
            margin-top: 2rem;
          }
          .ws-btn-primary,
          .ws-btn-ghost {
            width: 100%;
            justify-content: center;
            padding: 13px 20px;
            font-size: 12px;
          }
        }

        /* ── 480 – 639 px  (large phones / small phablets) ── */
        @media (min-width: 480px) and (max-width: 639px) {
          #wave-section { padding: 4rem 0; min-height: auto; }
          #wave-inner   { padding: 0 1.4rem; }
          .ws-h2        { font-size: clamp(2.1rem, 8vw, 2.8rem); }
          .ws-grid      { grid-template-columns: 1fr; gap: 12px; }
          .ws-card      { padding: 18px 16px; }
          .ws-value     { font-size: clamp(2rem, 7vw, 2.6rem); }
          .ws-cta       { flex-direction: column; gap: 10px; margin-top: 2.2rem; }
          .ws-btn-primary,
          .ws-btn-ghost {
            width: 100%;
            justify-content: center;
          }
        }

        /* ── 640 – 767 px  (tablets portrait / large phablets) ── */
        @media (min-width: 640px) and (max-width: 767px) {
          #wave-section { padding: 4.5rem 0; }
          #wave-inner   { padding: 0 2rem; }
          .ws-h2        { font-size: clamp(2.4rem, 6vw, 3.2rem); }
          .ws-grid      {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .ws-card  { padding: 20px 18px; }
          .ws-value { font-size: clamp(2.1rem, 5vw, 2.8rem); }
        }

        /* ── 768 – 1023 px  (tablets landscape / small laptops) ── */
        @media (min-width: 768px) and (max-width: 1023px) {
          #wave-section { padding: 5rem 0; }
          #wave-inner   {
            max-width: 720px;
            padding: 0 2.5rem;
          }
          .ws-grid  { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .ws-card  { padding: 22px 20px; }
          .ws-value { font-size: clamp(2.4rem, 4.5vw, 3rem); }
        }

        /* ── 1024 – 1279 px  (laptops) ── */
        @media (min-width: 1024px) and (max-width: 1279px) {
          #wave-section { padding: 5.5rem 0; }
          #wave-inner   { max-width: 820px; }
          .ws-grid      { gap: 16px; }
        }

        /* ── 1280 – 1535 px  (desktop) ── */
        @media (min-width: 1280px) and (max-width: 1535px) {
          #wave-section { padding: 6rem 0; }
          #wave-inner   { max-width: 880px; }
        }

        /* ── 1536 – 2559 px  (large / wide monitors) ── */
        @media (min-width: 1536px) and (max-width: 2559px) {
          #wave-section { padding: 7rem 0; }
          #wave-inner   { max-width: 1000px; }
          .ws-grid      { gap: 18px; }
          .ws-card      { padding: 28px 26px; border-radius: 18px; }
          .ws-value     { font-size: 3.4rem; }
          .ws-label     { font-size: 11px; }
          .ws-desc      { font-size: 14px; }
          .ws-sub       { font-size: 1.15rem; max-width: 580px; }
          .ws-btn-primary,
          .ws-btn-ghost { padding: 15px 34px; font-size: 14px; }
        }

        /* ── 2560 px+  (4K / ultra-wide) ── */
        @media (min-width: 2560px) {
          #wave-section { padding: 9rem 0; }
          #wave-inner   { max-width: 1280px; }
          .ws-h2        { font-size: 5.5rem; }
          .ws-sub       { font-size: 1.3rem; max-width: 700px; }
          .ws-grid      { gap: 22px; }
          .ws-card      { padding: 36px 32px; border-radius: 22px; }
          .ws-value     { font-size: 4rem; }
          .ws-label     { font-size: 12px; }
          .ws-desc      { font-size: 15px; }
          .ws-eyebrow   { font-size: 13px; }
          .ws-btn-primary,
          .ws-btn-ghost { padding: 17px 40px; font-size: 15px; border-radius: 12px; }
        }

        /* ── Touch-device safe: no hover transforms ── */
        @media (hover: none) and (pointer: coarse) {
          .ws-card:hover       { transform: none; box-shadow: none; border-color: rgba(0,245,255,0.10); }
          .ws-btn-primary:hover { transform: none; }
          .ws-btn-ghost:hover  { transform: none; }
        }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .ws-card,
          .ws-btn-primary,
          .ws-btn-ghost      { transition: none; }
          #wave-section::after { animation: none; }
        }
      `}</style>

      <section id="wave-section">
        {/* Animated waveform canvas */}
        <canvas id="wave-canvas" ref={canvasRef} />

        <div id="wave-inner">
          <p className="ws-eyebrow">Proven Results</p>

          <h2 className="ws-h2">
            Numbers That
            <span className="ws-h2-dim">Speak for Themselves</span>
          </h2>

          <p className="ws-sub">
            Every metric below comes from real founders who went through the
            BISF framework. Not projections — outcomes.
          </p>

          <div className="ws-rule" />

          <div className="ws-grid">
            {STATS.map((s) => (
              <div key={s.label} className="ws-card">
                <div className="ws-value">{s.value}</div>
                <div className="ws-label">{s.label}</div>
                <p className="ws-desc">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="ws-cta">
            <a href="#contact" className="ws-btn-primary">
              Start Your Journey →
            </a>
            <a href="#process" className="ws-btn-ghost">
              See How It Works
            </a>
          </div>
        </div>
      </section>
    </>
  );
}