"use client";

// ─── Final Section: Contact + Footer ─────────────────────────────────────────
// Fully self-contained. Replace this file freely — no other section is affected.

import { useEffect, useRef } from "react";

export default function FinalSection() {
  const canvasRef = useRef(null);
  const sectionRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;
    let raf;

    function resize() {
      canvas.width = section.offsetWidth;
      canvas.height = section.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      t += 0.012; // faster tick so movement is clearly visible
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const cx = W * 0.5;
      const cy = H * 0.5;
      const R  = Math.min(W, H) * 0.40;

      // ── large circular orbit paths ────────────────────────────────────
      // orb 1 moves in a slow elliptical orbit
      const x1 = cx + Math.cos(t * 0.7) * W * 0.18;
      const y1 = cy + Math.sin(t * 0.5) * H * 0.22 - H * 0.12;

      // orb 2 moves opposite phase
      const x2 = cx + Math.cos(t * 0.7 + Math.PI) * W * 0.18;
      const y2 = cy + Math.sin(t * 0.5 + Math.PI) * H * 0.22 + H * 0.12;

      // breathing pulse
      const pulse1 = 1 + 0.06 * Math.sin(t * 1.4);
      const pulse2 = 1 + 0.06 * Math.cos(t * 1.2);

      const r1 = R * pulse1;
      const r2 = R * pulse2;

      // ── Purple orb ────────────────────────────────────────────────────
      const g1 = ctx.createRadialGradient(x1, y1, 0, x1, y1, r1);
      g1.addColorStop(0,   "rgba(210,100,255,0.75)");
      g1.addColorStop(0.4, "rgba(160,50,240,0.55)");
      g1.addColorStop(0.7, "rgba(100,15,200,0.35)");
      g1.addColorStop(1,   "rgba(60,0,140,0)");
      ctx.beginPath();
      ctx.arc(x1, y1, r1, 0, Math.PI * 2);
      ctx.fillStyle = g1;
      ctx.fill();

      // purple rim glow
      ctx.save();
      ctx.globalAlpha = 0.5 + 0.15 * Math.sin(t * 1.4);
      ctx.beginPath();
      ctx.arc(x1, y1, r1, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(200,80,255,0.9)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // ── Teal orb ──────────────────────────────────────────────────────
      const g2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, r2);
      g2.addColorStop(0,   "rgba(50,235,210,0.70)");
      g2.addColorStop(0.4, "rgba(20,185,195,0.50)");
      g2.addColorStop(0.7, "rgba(5,100,165,0.32)");
      g2.addColorStop(1,   "rgba(0,50,110,0)");
      ctx.beginPath();
      ctx.arc(x2, y2, r2, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();

      // teal rim glow
      ctx.save();
      ctx.globalAlpha = 0.45 + 0.15 * Math.cos(t * 1.2);
      ctx.beginPath();
      ctx.arc(x2, y2, r2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(40,230,215,0.85)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // ── Intersection lens (screen blend) ──────────────────────────────
      const lx = (x1 + x2) * 0.5;
      const ly = (y1 + y2) * 0.5;
      const lr = R * 0.52;
      const la = 0.30 + 0.10 * Math.sin(t * 2.2);

      const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
      lg.addColorStop(0,   `rgba(240,70,255,${la + 0.18})`);
      lg.addColorStop(0.4, `rgba(200,30,240,${la})`);
      lg.addColorStop(1,   "rgba(100,0,180,0)");

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fillStyle = lg;
      ctx.fill();
      ctx.restore();

      // ── Wide ambient haze ─────────────────────────────────────────────
      const ag = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
      ag.addColorStop(0,   "rgba(70,10,150,0.14)");
      ag.addColorStop(0.6, "rgba(0,55,120,0.08)");
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
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <section id="contact" style={S.section} ref={sectionRef}>
        <canvas ref={canvasRef} style={S.canvas} />
        <div style={S.inner}>
          <p style={S.eyebrow}>● Let's Begin</p>
          <h2 style={S.h2}>
            Ready to Build{" "}
            <span style={S.h2dim}>Something Real?</span>
          </h2>
          <p style={S.body}>
            Join hundreds of founders who turned bold ideas into global ventures.
          </p>
          <div style={S.ctas}>
            <a href="#" style={S.ctaPrimary}>Apply for Mentorship</a>
            <a href="#" style={{ ...S.ctaPrimary, color: "#ff2ebe", borderColor: "#ff2ebe" }}>
              Talk to Us
            </a>
          </div>
          <p style={S.geo}>Bangalore · Mumbai · Singapore · London</p>
        </div>
      </section>

      <footer style={S.footer}>
        <span>BISF</span>
        <span>2026</span>
      </footer>
    </>
  );
}

// ─── Section-local styles ─────────────────────────────────────────────────────
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
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
  },
  inner: {
    position: "relative",
    zIndex: 2,
    maxWidth: 620,
    width: "100%",
    padding: "0 2rem",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: "1.4rem",
    display: "block",
    color: "#ff2ebe",
  },
  h2: {
    fontSize: "clamp(1.8rem, 4vw, 3rem)",
    fontWeight: 200,
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
    marginBottom: "1rem",
    marginTop: 0,
    color: "#ffffff",
    textShadow: "0 0 40px rgba(0,0,0,0.95), 0 2px 20px rgba(0,0,0,0.9)",
  },
  h2dim: {
    display: "block",
    color: "rgba(255,255,255,0.6)",
    fontWeight: 100,
    textShadow: "0 0 30px rgba(0,0,0,0.95)",
  },
  body: {
    fontSize: "clamp(0.8rem, 1.4vw, 0.9rem)",
    color: "rgba(255,255,255,0.80)",
    maxWidth: 420,
    margin: "0 0 2rem",
    lineHeight: 1.9,
    textShadow: "0 1px 16px rgba(0,0,0,0.9)",
  },
  ctas: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(0,0,0,0.5)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "#fff",
    fontSize: 12,
    padding: "11px 26px",
    borderRadius: 9,
    cursor: "pointer",
    textDecoration: "none",
    letterSpacing: "0.05em",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
  },
  geo: {
    marginTop: "1.8rem",
    fontSize: 9,
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    textShadow: "0 1px 10px rgba(0,0,0,0.8)",
  },
  footer: {
    width: "100%",
    padding: "1.5rem 2rem",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(3,3,10,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 9,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.14)",
  },
};