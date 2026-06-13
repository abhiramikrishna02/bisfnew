"use client";

import { useCallback, useEffect, useState } from "react";

import Hero from "./Hero";
import SecondSection from "./SecondSection";
import ThirdSection from "./ThirdSection";
import FourthSection from "./FourthSection";
import Wavesection from "./Wavesection";
import Toposection  from "./Toposection";
import TextSection from "./TextSection";
import FinalSection from "./FinalSection";
import Navbar from "./Navbar";

const NAV_DOTS = ["hero", "services", "impact", "process", "contact"];
const DOT_COLORS = ["#00f5ff", "#00f5ff", "#00e676", "#00f5ff", "#00e676"];

export default function Home() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const ids = ["hero", "services", "impact", "process", "contact"];
    const observed = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!observed.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best = null;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        }

        if (best?.target?.id) {
          setActiveSection(best.target.id);
        }
      },
      {
        threshold: [0.25, 0.4, 0.55, 0.7],
        rootMargin: "-10% 0px -45% 0px",
      }
    );

    observed.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const jumpTo = useCallback((id) => {
    if (id === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#fff" }}>
      <Hero isVisible={true} contentVisible={true} engineEnabled={true} />

      <div style={{ background: "#03030a" }}>
        <SecondSection />
        <ThirdSection />
        <FourthSection />
        <Wavesection />
        <Toposection />
        <TextSection />
        <FinalSection />
      </div>

      <Navbar activeSection={activeSection} jumpTo={jumpTo} />

      <div style={S.dots}>
        {NAV_DOTS.map((id, i) => (
          <button
            key={id}
            onClick={() => jumpTo(id)}
            aria-label={`Go to ${id}`}
            style={{
              ...S.dot,
              background:
                activeSection === id ? DOT_COLORS[i] : "rgba(255,255,255,0.18)",
              boxShadow:
                activeSection === id ? `0 0 8px ${DOT_COLORS[i]}` : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}

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
