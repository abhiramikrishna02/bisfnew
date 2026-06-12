"use client";

// ─── Final Section: Contact + Footer ─────────────────────────────────────────

import { useEffect, useRef } from "react";

const ACCENT = "#00f5ff";
const GREEN  = "#00e676";

export default function FinalSection() {
  const canvasRef  = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const canvas  = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t   = 0;
    let raf;

    function resize() {
      canvas.width  = section.offsetWidth;
      canvas.height = section.offsetHeight;
    }
    resize();

    // ResizeObserver instead of window resize — no global listener leak
    const ro = new ResizeObserver(resize);
    ro.observe(section);

    function frame() {
      t += 0.012;
      const W  = canvas.width;
      const H  = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.5;
      const cy = H * 0.5;
      const R  = Math.min(W, H) * 0.40;

      // Orb positions — same orbital math, untouched
      const x1 = cx + Math.cos(t * 0.7) * W * 0.18;
      const y1 = cy + Math.sin(t * 0.5) * H * 0.22 - H * 0.12;

      const x2 = cx + Math.cos(t * 0.7 + Math.PI) * W * 0.18;
      const y2 = cy + Math.sin(t * 0.5 + Math.PI) * H * 0.22 + H * 0.12;

      const pulse1 = 1 + 0.06 * Math.sin(t * 1.4);
      const pulse2 = 1 + 0.06 * Math.cos(t * 1.2);

      const r1 = R * pulse1;
      const r2 = R * pulse2;

      // ── Orb 1: cyan (#00f5ff) ─────────────────────────────────────────
      const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      g1.addColorStop(0,   "rgba(0,245,255,0.55)");
      g1.addColorStop(0.4, "rgba(0,200,210,0.35)");
      g1.addColorStop(0.7, "rgba(0,80,90,0.18)");
      g1.addColorStop(1,   "rgba(0,20,25,0)");
      ctx.beginPath();
      ctx.arc(x1, y1, r1, 0, Math.PI * 2);
      ctx.fillStyle = g1;
      ctx.fill();

      // Cyan rim glow
      ctx.save();
      ctx.globalAlpha = 0.45 + 0.15 * Math.sin(t * 1.4);
      ctx.beginPath();
      ctx.arc(x1, y1, r1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,245,255,0.70)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // ── Orb 2: green (#00e676) ────────────────────────────────────────
      const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
      g2.addColorStop(0,   "rgba(0,230,118,0.55)");
      g2.addColorStop(0.4, "rgba(0,180,90,0.35)");
      g2.addColorStop(0.7, "rgba(0,70,35,0.18)");
      g2.addColorStop(1,   "rgba(0,15,8,0)");
      ctx.beginPath();
      ctx.arc(x2, y2, r2, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();

      // Green rim glow
      ctx.save();
      ctx.globalAlpha = 0.40 + 0.15 * Math.cos(t * 1.2);
      ctx.beginPath();
      ctx.arc(x2, y2, r2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,230,118,0.65)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // ── Intersection lens — soft cyan-green screen blend ──────────────
      const lx = (x1 + x2) * 0.5;
      const ly = (y1 + y2) * 0.5;
      const lr = R * 0.52;
      const la = 0.22 + 0.08 * Math.sin(t * 2.2);

      const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
      lg.addColorStop(0,   `rgba(0,245,200,${la + 0.15})`);
      lg.addColorStop(0.4, `rgba(0,210,160,${la})`);
      lg.addColorStop(1,   "rgba(0,40,30,0)");

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fillStyle = lg;
      ctx.fill();
      ctx.restore();

      // ── Wide ambient haze — deep green ────────────────────────────────
      const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
      ag.addColorStop(0,   "rgba(0,80,50,0.10)");
      ag.addColorStop(0.6, "rgba(0,40,25,0.06)");
      ag.addColorStop(1,   "rgba(0,0,0,0)");
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = ag;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      raf = requestAnimationFrame(frame);
    }

    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <>
      <style>{`
        /* ── Section shell ── */
        #contact {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: #03030a;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 6rem 0;
          overflow: hidden;
          isolation: isolate;
          box-sizing: border-box;
        }

        /* ── Canvas — pointer-events off, never blocks scroll ── */
        #contact-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        /* ── Content wrapper ── */
        #contact-inner {
          position: relative;
          z-index: 2;
          max-width: 620px;
          width: 100%;
          padding: 0 2rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-sizing: border-box;
        }

        /* ── Eyebrow — cyan, Hero label token ── */
        .fs-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${ACCENT};
          text-shadow: 0 0 14px rgba(0,245,255,0.45);
          margin: 0 0 1.4rem;
          display: block;
        }

        /* ── H2 — Hero weight/tracking/leading ── */
        .fs-h2 {
          font-size: clamp(2.4rem, 4.5vw, 3.8rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0 0 1.2rem;
          text-shadow:
            0 2px 4px  rgba(0,0,0,0.95),
            0 4px 32px rgba(0,0,0,0.80);
        }

        /* Second H2 line — dimmed white, same Hero "sub" pattern */
        .fs-h2-dim {
          display: block;
          color: rgba(255,255,255,0.45);
          margin-top: 0.10em;
        }

        /* ── Body — Hero body token ── */
        .fs-body {
          font-size: clamp(0.95rem, 1.4vw, 1.1rem);
          font-weight: 400;
          line-height: 1.75;
          letter-spacing: 0.005em;
          color: rgba(255,255,255,0.60);
          max-width: 420px;
          margin: 0 0 2.4rem;
          text-shadow: 0 1px 16px rgba(0,0,0,0.80);
        }

        /* ── CTA buttons ── */
        .fs-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Primary button — green fill */
        .fs-btn-primary {
          display: inline-flex;
          align-items: center;
          background: rgba(0,230,118,0.12);
          border: 1px solid rgba(0,230,118,0.35);
          color: ${GREEN};
          font-size: 12px;
          font-weight: 600;
          padding: 11px 28px;
          border-radius: 9px;
          cursor: pointer;
          text-decoration: none;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
          will-change: transform;
        }
        .fs-btn-primary:hover {
          background: rgba(0,230,118,0.20);
          border-color: rgba(0,230,118,0.60);
          transform: translateY(-2px);
        }

        /* Secondary button — cyan outline */
        .fs-btn-secondary {
          display: inline-flex;
          align-items: center;
          background: rgba(0,245,255,0.06);
          border: 1px solid rgba(0,245,255,0.28);
          color: ${ACCENT};
          font-size: 12px;
          font-weight: 600;
          padding: 11px 28px;
          border-radius: 9px;
          cursor: pointer;
          text-decoration: none;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
          will-change: transform;
        }
        .fs-btn-secondary:hover {
          background: rgba(0,245,255,0.12);
          border-color: rgba(0,245,255,0.55);
          transform: translateY(-2px);
        }

        /* ── Geo line ── */
        .fs-geo {
          margin-top: 2rem;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: rgba(255,255,255,0.28);
          text-transform: uppercase;
          text-shadow: 0 1px 10px rgba(0,0,0,0.80);
        }

        /* ── Footer ── */
        #site-footer {
          width: 100%;
          padding: 1.5rem 2.5rem;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(3,3,10,0.95);
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.20em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          box-sizing: border-box;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          #contact        { padding: 5rem 0; }
          #contact-inner  { padding: 0 1.5rem; }
          .fs-ctas        { flex-direction: column; align-items: center; }
          .fs-btn-primary,
          .fs-btn-secondary { width: 100%; max-width: 280px; justify-content: center; }
        }

        @media (max-width: 479px) {
          #contact { padding: 4rem 0; }
          #site-footer { padding: 1.2rem 1.5rem; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .fs-btn-primary,
          .fs-btn-secondary { transition: none; }
        }
      `}</style>

      <section id="contact" ref={sectionRef}>
        {/* Canvas background */}
        <canvas id="contact-canvas" ref={canvasRef} />

        {/* Foreground content */}
        <div id="contact-inner">

          {/* Eyebrow */}
          <span className="fs-eyebrow">● Let's Begin</span>

          {/* H2 — two lines, Hero pattern */}
          <h2 className="fs-h2">
            Ready to Build
            <span className="fs-h2-dim">Something Real?</span>
          </h2>

          {/* Body */}
          <p className="fs-body">
            Join hundreds of founders who turned bold ideas into global ventures.
          </p>

          {/* CTAs */}
          <div className="fs-ctas">
            <a href="#" className="fs-btn-primary">Apply for Mentorship</a>
            <a href="#" className="fs-btn-secondary">Talk to Us</a>
          </div>

          {/* Geo */}
          <p className="fs-geo">Bangalore · Mumbai · Singapore · London</p>

        </div>
      </section>

      {/* Footer */}
      <footer id="site-footer">
        <span>BISF</span>
        <span>2026</span>
      </footer>
    </>
  );
}