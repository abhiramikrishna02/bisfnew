// Home.jsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Section imports ──────────────────────────────────────────────────────────
import Hero,         { HERO_CFG } from "./Hero";
import SecondSection from "./SecondSection";
import ThirdSection  from "./ThirdSection";
import FourthSection from "./FourthSection";
import TextSection from "./TextSection";
import FinalSection  from "./FinalSection";
import Navbar        from "./Navbar";

// ─── Constants ────────────────────────────────────────────────────────────────
const ASSEMBLY_TICKS = 2;

const NAV_DOTS   = ["hero", "services", "impact", "process", "contact"];
const DOT_COLORS = ["#00f5ff", "#00f5ff", "#00e676", "#00f5ff", "#00e676"];

// ─── Home (Orchestrator) ──────────────────────────────────────────────────────
export default function Home() {
  const [phase,          setPhase]          = useState("hero");
  const [contentVisible, setContentVisible] = useState(true);
  const [activeSection,  setActiveSection]  = useState("hero");
  const [, forceRender] = useState(0);

  const assembleProgress = useRef(0);
  const zoomProgress     = useRef(0);
  const assembleTarget   = useRef(0);
  const zoomTarget       = useRef(0);
  const internalTick     = useRef(0);
  const isTransitioning  = useRef(false);

  const canvasRef = useRef(null);
  const fragsRef  = useRef([]);

  const scrollAccum = useRef(0);
  const lastScroll  = useRef(0);
  const touchStart  = useRef(null);
  const forwardTransitionTimer = useRef(null);
  const backTransitionTimer = useRef(null);

  // ── Smooth interpolation loop ─────────────────────────────────────────────
  useEffect(() => {
    let raf;
    function tick() {
      const aD = assembleTarget.current - assembleProgress.current;
      const zD = zoomTarget.current     - zoomProgress.current;
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

  // ── FORWARD: hero → services ──────────────────────────────────────────────
  const doForwardTransition = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    setPhase("forward-transition");
    setContentVisible(false);
    zoomTarget.current = 1;

    if (forwardTransitionTimer.current) {
      clearTimeout(forwardTransitionTimer.current);
      forwardTransitionTimer.current = null;
    }

    setTimeout(() => {
      zoomProgress.current     = 0;
      zoomTarget.current       = 0;
      assembleProgress.current = 0;
      assembleTarget.current   = 0;
      internalTick.current     = 0;

      setPhase("scrollable");
      setActiveSection("services");

      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
        setTimeout(() => {
          isTransitioning.current = false;
          setContentVisible(true);
        }, 100);
      });
    }, 520);
  }, []);

  // ── BACK: services → hero ─────────────────────────────────────────────────
  const doBackToHero = useCallback(() => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;

    if (forwardTransitionTimer.current) {
      clearTimeout(forwardTransitionTimer.current);
      forwardTransitionTimer.current = null;
    }

    setPhase("back-flash");

    setTimeout(() => {
      assembleProgress.current = 0;
      assembleTarget.current   = 0;
      zoomProgress.current     = 0;
      zoomTarget.current       = 0;
      internalTick.current     = 0;

      window.scrollTo({ top: 0, behavior: "auto" });
      setPhase("hero");
      setActiveSection("hero");
      setContentVisible(true);

      setTimeout(() => {
        isTransitioning.current = false;
        forceRender(n => n + 1);
      }, 50);
    }, 280);
  }, []);

  // ── Hero scroll step handler ──────────────────────────────────────────────
  const handleHeroScroll = useCallback((direction) => {
    if (isTransitioning.current) return;
    if (direction > 0) {
      if (internalTick.current < ASSEMBLY_TICKS) {
        internalTick.current++;
        assembleTarget.current = internalTick.current / ASSEMBLY_TICKS;
        forceRender(n => n + 1);
        if (internalTick.current === ASSEMBLY_TICKS) {
          if (!forwardTransitionTimer.current) {
            forwardTransitionTimer.current = setTimeout(() => {
              forwardTransitionTimer.current = null;
              doForwardTransition();
            }, 220);
          }
        }
      }
    } else {
      if (forwardTransitionTimer.current) {
        clearTimeout(forwardTransitionTimer.current);
        forwardTransitionTimer.current = null;
      }
      if (internalTick.current > 0) {
        internalTick.current--;
        assembleTarget.current = internalTick.current / ASSEMBLY_TICKS;
        forceRender(n => n + 1);
      }
    }
  }, [doForwardTransition]);

  // ── Scrollable-section scroll-to-top interceptor ──────────────────────────
  const handleServicesUp = useCallback(() => {
    if (isTransitioning.current) return;
    if (window.scrollY < 10) doBackToHero();
  }, [doBackToHero]);

  // ── Event listeners ───────────────────────────────────────────────────────
  useEffect(() => {
    const THRESH = 18;

    const normalizeWheelDelta = (e) => {
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      else if (e.deltaMode === 2) delta *= window.innerHeight || 800;
      return delta;
    };

    const isAtTop = () =>
      (window.scrollY || document.documentElement.scrollTop || 0) <= 2;

    const onWheel = (e) => {
      if (isTransitioning.current) { e.preventDefault(); return; }

      if (phase === "hero" || phase === "forward-transition") {
        e.preventDefault();
        const now = Date.now();
        if (now - lastScroll.current > 300) scrollAccum.current = 0;
        lastScroll.current = now;
        scrollAccum.current += normalizeWheelDelta(e);
        while (scrollAccum.current > THRESH) {
          scrollAccum.current -= THRESH;
          handleHeroScroll(1);
        }
        while (scrollAccum.current < -THRESH) {
          scrollAccum.current += THRESH;
          handleHeroScroll(-1);
        }
        return;
      }

      if (phase === "scrollable" && e.deltaY < 0 && isAtTop()) {
        e.preventDefault();
        const now = Date.now();
        if (now - lastScroll.current > 300) scrollAccum.current = 0;
        lastScroll.current = now;
        scrollAccum.current += normalizeWheelDelta(e);
        while (scrollAccum.current < -THRESH) {
          scrollAccum.current += THRESH;
          handleServicesUp();
        }
        return;
      }

      scrollAccum.current = 0;
    };

    const onTouchStart = (e) => {
      if (phase === "hero" || (phase === "scrollable" && isAtTop())) {
        touchStart.current = e.touches[0].clientY;
      }
    };
    const onTouchEnd = (e) => {
      if (touchStart.current === null || isTransitioning.current) return;
      const dy = touchStart.current - e.changedTouches[0].clientY;
        if (Math.abs(dy) > 24) {
          if (phase === "hero")
            handleHeroScroll(dy > 0 ? 1 : -1);
          else if (phase === "scrollable" && dy < 0 && isAtTop())
            handleServicesUp();
        }
      touchStart.current = null;
    };

    const onKey = (e) => {
      if (isTransitioning.current) return;
      if (phase === "hero") {
        if      (e.key === "ArrowDown" || e.key === "PageDown") { e.preventDefault(); handleHeroScroll(1);  }
        else if (e.key === "ArrowUp"   || e.key === "PageUp")   { e.preventDefault(); handleHeroScroll(-1); }
      } else if (phase === "scrollable" && isAtTop()) {
        if (e.key === "ArrowUp" || e.key === "PageUp") { e.preventDefault(); handleServicesUp(); }
      }
    };

    window.addEventListener("wheel",      onWheel,      { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true  });
    window.addEventListener("touchend",   onTouchEnd,   { passive: true  });
    window.addEventListener("keydown",    onKey);
    return () => {
      if (forwardTransitionTimer.current) {
        clearTimeout(forwardTransitionTimer.current);
        forwardTransitionTimer.current = null;
      }
      if (backTransitionTimer.current) {
        clearTimeout(backTransitionTimer.current);
        backTransitionTimer.current = null;
      }
      window.removeEventListener("wheel",      onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend",   onTouchEnd);
      window.removeEventListener("keydown",    onKey);
    };
  }, [phase, handleHeroScroll, handleServicesUp]);

  // ── IntersectionObserver for dot highlights ───────────────────────────────
  useEffect(() => {
    if (phase !== "scrollable") return;
    const ids = ["services", "impact", "process", "contact"];
    const observers = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach(o => o && o.disconnect());
  }, [phase]);

  // ── Nav jump helper ───────────────────────────────────────────────────────
  const jumpTo = useCallback((id) => {
    if (id === "hero") {
      if (phase === "scrollable") { doBackToHero(); return; }
    } else {
      if (phase === "hero") { doForwardTransition(); return; }
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [phase, doForwardTransition, doBackToHero]);

  const isHero = phase === "hero" || phase === "forward-transition";

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>

      {/* ── BLACK FLASH overlay ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 900,
        background: "#03030a",
        opacity: phase === "back-flash" ? 1 : 0,
        pointerEvents: phase === "back-flash" ? "all" : "none",
        transition: "opacity 0.18s ease",
      }} />

      {/* ── HERO ── */}
      <Hero
        canvasRef={canvasRef}
        fragsRef={fragsRef}
        assembleProgress={assembleProgress}
        zoomProgress={zoomProgress}
        internalTick={internalTick}
        isVisible={isHero}
        contentVisible={contentVisible}
        engineEnabled={isHero}
      />

      {/* ── SCROLLABLE SECTIONS ──
          KEY FIX: use opacity:0 + pointerEvents:none instead of visibility:hidden.
          visibility:hidden causes browsers to suspend requestAnimationFrame for
          elements that aren't being painted, which freezes Three.js animations.
          opacity:0 keeps the element fully rendered (RAF stays alive) but invisible.
      ── */}
      <div style={{
        background: "#03030a",
        minHeight: "100vh",
        opacity: isHero ? 0 : 1,
        pointerEvents: isHero ? "none" : "auto",
        transition: "opacity 0s",  // instant — transitions handled by phase logic above
      }}>
        <SecondSection />
        <ThirdSection />
        <FourthSection />
        <TextSection/>
        <FinalSection />
      </div>

      {/* ── NAVBAR (extracted component) ── */}
      <Navbar activeSection={activeSection} jumpTo={jumpTo} />

      {/* ── NAV DOTS ── */}
      <div style={S.dots}>
        {NAV_DOTS.map((id, i) => (
          <button
            key={id}
            onClick={() => jumpTo(id)}
            aria-label={`Go to ${id}`}
            style={{
              ...S.dot,
              background: activeSection === id ? DOT_COLORS[i] : "rgba(255,255,255,0.18)",
              boxShadow:  activeSection === id ? `0 0 8px ${DOT_COLORS[i]}` : "none",
            }}
          />
        ))}
      </div>

    </div>
  );
}

// ─── Home-local styles (dots only — navbar moved to Navbar.jsx) ───────────────
const S = {
  dots: {
    position: "fixed",
    right: "1.6rem",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
    zIndex: 800,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    border: "none",
    padding: 0,
    cursor: "pointer",
    transition: "background 0.4s, box-shadow 0.4s",
  },
};
