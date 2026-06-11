"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const FRAGMENT_COUNT = 150;
const ASSEMBLY_TICKS = 8;

const HERO_CFG = {
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

// ─── Fragment factory — spawns fragments drifting randomly across canvas ──────
function makeFragments(w, h) {
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
  // When aT=0 fragments are bright and visible; as aT rises they sharpen toward assembled glow
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

// ─── Canvas Engine ────────────────────────────────────────────────────────────
function useCanvasEngine(canvasRef, fragsRef, assembleProgress, zoomProgress, enabled) {
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
          // Pure idle drift — no assembly pull at all
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

// ─── Section content components ───────────────────────────────────────────────
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
    </div>
  );
}

function ServicesSection() {
  return (
    <section id="services" style={S.section}>
      <div style={S.sectionInner}>
        <p style={{ ...S.eyebrow, color: "#818cf8" }}>● Our Services</p>
        <h2 style={S.h2}>What We Build <span style={S.h2dim}>With Founders</span></h2>
        <p style={{ ...S.body }}>End-to-end support from ideation to international scale.</p>
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
    </section>
  );
}

function ImpactSection() {
  return (
    <section id="impact" style={S.section}>
      <div style={S.sectionInner}>
        <p style={{ ...S.eyebrow, color: "#34d399" }}>● Impact Numbers</p>
        <h2 style={S.h2}>Proven at Scale</h2>
        <p style={{ ...S.body }}>Our portfolio tells the story — from seed-stage ideas to global enterprises.</p>
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
    </section>
  );
}

function ProcessSection() {
  return (
    <section id="process" style={S.section}>
      <div style={S.sectionInner}>
        <p style={{ ...S.eyebrow, color: "#f9a8d4" }}>● How It Works</p>
        <h2 style={S.h2}>Your Journey <span style={S.h2dim}>Our Framework</span></h2>
        <div style={S.timeline}>
          {[
            { step: "I",   c: "#00f5ff", title: "Discovery Session",    desc: "We map your idea, market, and readiness in a focused 2-hour session." },
            { step: "II",  c: "#818cf8", title: "Build Your Foundation", desc: "Legal entity, brand identity, MVP scope — all handled systematically." },
            { step: "III", c: "#34d399", title: "Capital & Growth",      desc: "Investor intros, pitch deck refinement, and growth strategy execution." },
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
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" style={{ ...S.section, minHeight: "100vh" }}>
      <div style={{ ...S.sectionInner, textAlign: "center", alignItems: "center" }}>
        <p style={{ ...S.eyebrow, color: "#ff2ebe" }}>● Let's Begin</p>
        <h2 style={S.h2}>Ready to Build <span style={S.h2dim}>Something Real?</span></h2>
        <p style={{ ...S.body, marginBottom: "2rem" }}>Join hundreds of founders who turned bold ideas into global ventures.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="#" style={S.ctaPrimary}>Apply for Mentorship</a>
          <a href="#" style={{ ...S.ctaPrimary, color: "#ff2ebe", borderColor: "#ff2ebe" }}>Talk to Us</a>
        </div>
        <p style={S.geo}>Bangalore · Mumbai · Singapore · London</p>
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  // phase: "hero" | "forward-transition" | "scrollable" | "back-flash"
  const [phase, setPhase]               = useState("hero");
  const [contentVisible, setContentVisible] = useState(true);
  const [activeSection, setActiveSection]   = useState("hero");
  // Force re-render when needed
  const [, forceRender] = useState(0);

  // Animation values — refs so RAF loop reads them without stale closures
  const assembleProgress = useRef(0); // 0 = idle drift, 1 = fully assembled
  const zoomProgress     = useRef(0); // 0 = normal, 1 = zoomed in (black fills screen)
  const assembleTarget   = useRef(0);
  const zoomTarget       = useRef(0);
  const internalTick     = useRef(0);
  const isTransitioning  = useRef(false);

  // Fragments live here — we own them so we can reset on back-navigation
  const fragsRef    = useRef([]);
  const canvasRef   = useRef(null);

  // Scroll intercept state
  const scrollAccum = useRef(0);
  const lastScroll  = useRef(0);
  const touchStart  = useRef(null);

  // ── Canvas resize ──────────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const c = canvasRef.current;
      if (c) {
        c.width  = window.innerWidth;
        c.height = window.innerHeight;
        // Re-seed fragments on resize so they fill the new dimensions
        if (assembleProgress.current < 0.005) {
          fragsRef.current = makeFragments(c.width, c.height);
        }
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // ── Initialise fragments once canvas is ready ──────────────────────────────
  useEffect(() => {
    const c = canvasRef.current;
    if (c && fragsRef.current.length === 0) {
      fragsRef.current = makeFragments(c.width, c.height);
    }
  }, []);

  // ── Canvas engine (only runs during "hero" and "forward-transition" phases) ──
  const engineEnabled = phase === "hero" || phase === "forward-transition";
  useCanvasEngine(canvasRef, fragsRef, assembleProgress, zoomProgress, engineEnabled);

  // ── Smooth interpolation loop for assembly / zoom values ──────────────────
  useEffect(() => {
    let raf;
    function tick() {
      const aD = assembleTarget.current - assembleProgress.current;
      const zD = zoomTarget.current     - zoomProgress.current;
      // Hard-snap to zero so idle drift activates cleanly
      if (assembleTarget.current === 0 && Math.abs(assembleProgress.current) < 0.003) {
        assembleProgress.current = 0;
      } else if (Math.abs(aD) > 0.0005) {
        assembleProgress.current += aD * 0.075;
      }
      if (Math.abs(zD) > 0.0005) {
        zoomProgress.current += zD * 0.12;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ── FORWARD: hero → services (portal zoom-through) ────────────────────────
  const doForwardTransition = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setPhase("forward-transition");
    setContentVisible(false);
    zoomTarget.current = 1;

    setTimeout(() => {
      // Switch to scrollable world
      zoomProgress.current  = 0;
      zoomTarget.current    = 0;
      assembleProgress.current = 0;
      assembleTarget.current   = 0;
      internalTick.current     = 0;

      setPhase("scrollable");
      setActiveSection("services");

      requestAnimationFrame(() => {
        const el = document.getElementById("services");
        if (el) window.scrollTo({ top: el.offsetTop, behavior: "instant" });
        setTimeout(() => {
          isTransitioning.current = false;
          setContentVisible(true);
        }, 100);
      });
    }, 520);
  }, []);

  // ── BACK: services → hero (instant cut, no portal animation) ─────────────
  // Behaviour: black flash → cut to hero → fragments already doing idle drift
  const doBackToHero = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    // Show black flash overlay
    setPhase("back-flash");

    setTimeout(() => {
      // Reset all animation state to pure idle
      assembleProgress.current = 0;
      assembleTarget.current   = 0;
      zoomProgress.current     = 0;
      zoomTarget.current       = 0;
      internalTick.current     = 0;

      // Re-seed fresh fragments so they're spread all over the canvas drifting
      const c = canvasRef.current;
      if (c) fragsRef.current = makeFragments(c.width, c.height);

      window.scrollTo({ top: 0, behavior: "instant" });
      setPhase("hero");
      setActiveSection("hero");
      setContentVisible(true);

      setTimeout(() => {
        isTransitioning.current = false;
        forceRender(n => n + 1); // ensure scroll hint re-renders
      }, 50);
    }, 280); // short enough to feel snappy, long enough for the flash to register
  }, []);

  // ── Hero scroll handler ────────────────────────────────────────────────────
  const handleHeroScroll = useCallback((direction) => {
    if (isTransitioning.current) return;
    if (direction > 0) {
      if (internalTick.current < ASSEMBLY_TICKS) {
        internalTick.current++;
        assembleTarget.current = internalTick.current / ASSEMBLY_TICKS;
        forceRender(n => n + 1); // update scroll-hint opacity
        if (internalTick.current === ASSEMBLY_TICKS) {
          setTimeout(doForwardTransition, 300);
        }
      }
    } else {
      if (internalTick.current > 0) {
        internalTick.current--;
        assembleTarget.current = internalTick.current / ASSEMBLY_TICKS;
        forceRender(n => n + 1);
      }
    }
  }, [doForwardTransition]);

  // ── Scrollable-section scroll-up interceptor ──────────────────────────────
  const handleServicesUp = useCallback(() => {
    if (isTransitioning.current) return;
    if (window.scrollY < 10) doBackToHero();
  }, [doBackToHero]);

  // ── Event listeners ────────────────────────────────────────────────────────
  useEffect(() => {
    const THRESH = 50;

    const onWheel = (e) => {
      if (isTransitioning.current) { e.preventDefault(); return; }

      if (phase === "hero" || phase === "forward-transition") {
        e.preventDefault();
        const now = Date.now();
        if (now - lastScroll.current > 700) scrollAccum.current = 0;
        lastScroll.current = now;
        scrollAccum.current += e.deltaY;
        if      (scrollAccum.current >  THRESH) { scrollAccum.current = 0; handleHeroScroll(1);  }
        else if (scrollAccum.current < -THRESH) { scrollAccum.current = 0; handleHeroScroll(-1); }
        return;
      }

      if (phase === "scrollable" && e.deltaY < 0 && window.scrollY < 10) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastScroll.current > 700) scrollAccum.current = 0;
        lastScroll.current = now;
        scrollAccum.current += e.deltaY;
        if (scrollAccum.current < -THRESH) { scrollAccum.current = 0; handleServicesUp(); }
        return;
      }

      scrollAccum.current = 0;
    };

    const onTouchStart = (e) => {
      if (phase === "hero" || (phase === "scrollable" && window.scrollY < 10)) {
        touchStart.current = e.touches[0].clientY;
      }
    };
    const onTouchEnd = (e) => {
      if (touchStart.current === null || isTransitioning.current) return;
      const dy = touchStart.current - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) {
        if (phase === "hero")                                      handleHeroScroll(dy > 0 ? 1 : -1);
        else if (phase === "scrollable" && dy < 0 && window.scrollY < 10) handleServicesUp();
      }
      touchStart.current = null;
    };

    const onKey = (e) => {
      if (isTransitioning.current) return;
      if (phase === "hero") {
        if      (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); handleHeroScroll(1);  }
        else if (e.key === "ArrowUp"   || e.key === "PageUp")   { e.preventDefault(); handleHeroScroll(-1); }
      } else if (phase === "scrollable" && window.scrollY < 10) {
        if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); handleServicesUp(); }
      }
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true  });
    window.addEventListener("keydown",    onKey);
    return () => {
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("keydown",    onKey);
    };
  }, [phase, handleHeroScroll, handleServicesUp]);

  // ── IntersectionObserver for dot highlights in scrollable phase ───────────
  useEffect(() => {
    if (phase !== "scrollable") return;
    const ids = ["services", "impact", "process", "contact"];
    const observers = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) setActiveSection(id);
      }, { threshold: 0.4 });
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, [phase]);

  // ── Nav helpers ────────────────────────────────────────────────────────────
  const jumpTo = useCallback((id) => {
    if (id === "hero") {
      if (phase === "scrollable") { doBackToHero(); return; }
    } else {
      if (phase === "hero") { doForwardTransition(); return; }
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [phase, doForwardTransition, doBackToHero]);

  const NAV_DOTS   = ["hero", "services", "impact", "process", "contact"];
  const DOT_COLORS = ["#00f5ff", "#818cf8", "#34d399", "#f9a8d4", "#ff2ebe"];
  const isHero     = phase === "hero" || phase === "forward-transition";

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>

      {/* ── BLACK FLASH overlay for back-navigation ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 900,
        background: "#03030a",
        opacity: phase === "back-flash" ? 1 : 0,
        pointerEvents: phase === "back-flash" ? "all" : "none",
        transition: "opacity 0.18s ease",
      }} />

      {/* ── HERO canvas + content ── */}
      <div style={{
        position: "fixed", inset: 0,
        width: "100%", height: "100vh",
        overflow: "hidden",
        background: "#03030a",
        zIndex: isHero ? 10 : -1,
        visibility: isHero ? "visible" : "hidden",
      }}>
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, zIndex: 0, display: "block" }}
        />

        <HeroContent color={HERO_CFG.primary} visible={contentVisible && isHero} />

        {/* Scroll hint — visible only when tick=0 (idle drift state) */}
        <div style={{
          position: "absolute", bottom: "5rem", left: "50%", transform: "translateX(-50%)",
          zIndex: 200, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          opacity: isHero && internalTick.current === 0 && contentVisible ? 0.4 : 0,
          transition: "opacity 0.6s",
          pointerEvents: "none", userSelect: "none",
        }}>
          <span style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Scroll</span>
          <div style={{ width: 1, height: 28, background: `linear-gradient(to bottom, transparent, ${HERO_CFG.primary})` }} />
        </div>
      </div>

      {/* ── SCROLLABLE SECTIONS ── */}
      <div style={{
        background: "#03030a",
        minHeight: "100vh",
        // Hidden (but in DOM) while on hero so IDs are always accessible
        visibility: isHero ? "hidden" : "visible",
        pointerEvents: isHero ? "none" : "auto",
      }}>
        <ServicesSection />
        <ImpactSection />
        <ProcessSection />
        <ContactSection />
        <footer style={{
          width: "100%", padding: "1.5rem 2rem",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          background: "rgba(3,3,10,0.9)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.14)",
        }}>
          <span>BISF</span><span>2026</span>
        </footer>
      </div>

      {/* ── NAVBAR ── */}
      <header style={{
        position: "fixed", top: 0, left: 0, width: "100%", zIndex: 800,
        height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(3,3,10,0.7)",
        backdropFilter: "blur(16px)",
      }}>
        <span style={{ fontSize: 13, letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 500 }}>BISF</span>
        <div style={{ display: "flex", gap: 32 }}>
          {[["Home", "hero"], ["Services", "services"], ["Contact", "contact"]].map(([label, id]) => (
            <button key={label} onClick={() => jumpTo(id)}
              style={{
                fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                color: activeSection === id ? "#fff" : "rgba(255,255,255,0.32)",
                transition: "color 0.4s",
              }}>
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── NAV DOTS ── */}
      <div style={{
        position: "fixed", right: "1.6rem", top: "50%", transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: 12, zIndex: 800,
      }}>
        {NAV_DOTS.map((id, i) => (
          <button key={id} onClick={() => jumpTo(id)}
            style={{
              width: 6, height: 6, borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
              background: activeSection === id ? DOT_COLORS[i] : "rgba(255,255,255,0.18)",
              boxShadow: activeSection === id ? `0 0 8px ${DOT_COLORS[i]}` : "none",
              transition: "background 0.4s, box-shadow 0.4s",
            }} />
        ))}
      </div>

    </div>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const S = {
  wrap:         { width: "100%" },
  eyebrow:      { fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "1.4rem", display: "block" },
  h1:           { fontSize: "clamp(2.2rem, 5.5vw, 4rem)", fontWeight: 200, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: "1.2rem", marginTop: 0, color: "#fff" },
  h1dim:        { color: "rgba(255,255,255,0.3)", fontWeight: 100 },
  h2:           { fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 200, lineHeight: 1.05, letterSpacing: "-0.04em", marginBottom: "1rem", marginTop: 0, color: "#fff" },
  h2dim:        { display: "block", color: "rgba(255,255,255,0.2)", fontWeight: 100 },
  body:         { fontSize: "clamp(0.8rem, 1.4vw, 0.9rem)", color: "rgba(255,255,255,0.3)", maxWidth: 420, margin: "0 0 1.6rem", lineHeight: 1.9 },
  section:      { minHeight: "100vh", display: "flex", alignItems: "center", background: "#03030a", borderTop: "1px solid rgba(255,255,255,0.04)", padding: "6rem 0" },
  sectionInner: { maxWidth: 620, width: "100%", padding: "0 2rem", margin: "0 auto", display: "flex", flexDirection: "column" },
  cardRow:      { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: "1.6rem" },
  card:         { padding: "1.2rem 1rem", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, background: "rgba(255,255,255,0.025)", textAlign: "left" },
  cardAccent:   { width: 20, height: 1, marginBottom: 12 },
  cardLabel:    { fontSize: 10, fontWeight: 500, marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" },
  cardDesc:     { fontSize: 11, color: "rgba(255,255,255,0.22)", lineHeight: 1.75 },
  grid3:        { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 9, marginTop: "1.6rem" },
  serviceItem:  { padding: "1rem 0.8rem", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, background: "rgba(255,255,255,0.018)", textAlign: "left" },
  tag:          { fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" },
  grid2:        { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginTop: "1.4rem" },
  statBox:      { border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, background: "rgba(255,255,255,0.025)", padding: "1.6rem 1rem", textAlign: "center" },
  statNum:      { fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 200, letterSpacing: "-0.04em", lineHeight: 1 },
  statLbl:      { fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 8, letterSpacing: "0.1em", textTransform: "uppercase" },
  timeline:     { display: "flex", flexDirection: "column", gap: 9, marginTop: "1.4rem" },
  tItem:        { display: "flex", alignItems: "flex-start", gap: 16, padding: "14px 16px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 11, background: "rgba(255,255,255,0.016)" },
  tStep:        { fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", border: "1px solid", borderRadius: 5, padding: "3px 8px", minWidth: 32, textAlign: "center", flexShrink: 0 },
  tTitle:       { fontSize: 13, fontWeight: 500, marginBottom: 5, color: "rgba(255,255,255,0.85)", letterSpacing: "0.02em" },
  tDesc:        { fontSize: 11, color: "rgba(255,255,255,0.28)", lineHeight: 1.8 },
  ctaPrimary:   { display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.13)", color: "#fff", fontSize: 12, padding: "11px 26px", borderRadius: 9, cursor: "pointer", textDecoration: "none", letterSpacing: "0.05em" },
  geo:          { marginTop: "1.8rem", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.1)", textTransform: "uppercase" },
};