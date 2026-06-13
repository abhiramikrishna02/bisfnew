"use client";

import { useRef } from "react";

const RIBBON_ITEMS = [
  ["Bharath Innovations", "Startups Facilitator", "BISF", "iQue Ventures", "Build In Bharath", "Founders First", "Bangalore, India"],
  ["Entrepreneur Education", "Venture Building", "Capital Access", "Global Expansion", "Startup Infrastructure", "Scaling & Consulting", "Market Access"],
  ["BISF", "Idea to IPO", "Validate. Build. Scale.", "Empower. Scale. Connect.", "Full-Stack Facilitation", "India to the World", "iQue Ventures"],
  ["Advisory Network", "Venture Building", "International Markets", "Global Capital", "BISF India", "Next Gen Entrepreneurs", "Startup Ecosystem"],
];

// Slowed down durations for a premium, professional feel
const RIBBON_CONFIG = [
  { top: "15%", rotate: "-6deg", duration: "50s", dir: "left" },
  { top: "35%", rotate: "4deg",  duration: "65s", dir: "right" },
  { top: "60%", rotate: "-4deg", duration: "55s", dir: "left" },
  { top: "80%", rotate: "5deg",  duration: "70s", dir: "right" },
];

function Ribbon({ items, top, rotate, duration, dir }) {
  const doubled = [...items, ...items, ...items, ...items];
  const anim = dir === "left" ? `ribbonLeft ${duration} linear infinite` : `ribbonRight ${duration} linear infinite`;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        top,
        left: "-5%",
        width: "110%",
        height: "50px", // Increased thickness
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        transform: `rotate(${rotate})`,
        background: "rgba(10, 15, 12, 0.6)", // Dark subtle ribbon BG
        borderTop: "1px solid rgba(0, 245, 255, 0.15)", // Cyan tint
        borderBottom: "1px solid rgba(0, 230, 118, 0.15)", // Green tint
        pointerEvents: "none",
        userSelect: "none",
        willChange: "transform",
      }}
    >
      <div style={{ display: "inline-flex", animation: anim, whiteSpace: "nowrap" }}>
        {doubled.map((text, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "20px", padding: "0 30px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "#ffffff" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: i % 2 === 0 ? "#00e676" : "#00f5ff", flexShrink: 0 }} />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function BISFSection() {
  return (
    <>
      <style>{`
        @keyframes ribbonLeft { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes ribbonRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }

        #bisf-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #03030a;
          overflow: hidden;
          padding: 6rem 2rem;
        }

        .bisf-content {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 680px;
          /* Removed background/backdrop-filter for a cleaner floating look */
        }

        .bisf-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: #00e676; display: block; margin: 0 0 1.5rem; }
        .bisf-headline { font-size: clamp(2.5rem, 5vw, 4.2rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; color: #ffffff; margin: 0 0 1rem; }
        .bisf-headline em { font-style: normal; color: #00f5ff; }
        .bisf-subheadline { font-size: 0.9rem; font-weight: 500; letter-spacing: 0.1em; color: rgba(255, 255, 255, 0.4); text-transform: uppercase; margin-bottom: 2rem; }
        .bisf-body { font-size: 1.1rem; line-height: 1.7; color: rgba(255, 255, 255, 0.6); margin: 0 auto 2.5rem; max-width: 540px; }

        .bisf-tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 2rem; }
        .bisf-tag { font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.1); padding: 6px 16px; border-radius: 4px; }
        
        .bisf-backed { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255, 255, 255, 0.3); }
        .bisf-backed span { color: #00e676; font-weight: 600; }

        @media (max-width: 768px) {
          #bisf-section { padding: 4rem 1rem; }
        }
      `}</style>

      <section id="bisf-section">
        {RIBBON_CONFIG.map((cfg, i) => (
          <Ribbon key={i} items={RIBBON_ITEMS[i]} {...cfg} />
        ))}

        <div className="bisf-content">
          <span className="bisf-eyebrow">● Our Mission</span>
          <h2 className="bisf-headline">
            Bharath Innovations<br />
            <em>&amp; Startups Facilitator</em>
          </h2>
          <p className="bisf-subheadline">Led by CEO Jirlo Jayan · Backed by iQue Ventures</p>
          <p className="bisf-body">
            A full-stack startup facilitator building India's next generation of entrepreneurs — 
            identifying, educating, building, and scaling startups through a practical, 
            structured approach.
          </p>
          <div className="bisf-tags">
            {["Entrepreneur Education", "Venture Building", "Startup Infrastructure", "Capital Access"].map((tag) => (
              <span className="bisf-tag" key={tag}>{tag}</span>
            ))}
          </div>
          <p className="bisf-backed">
            Backed by <span>iQue Ventures</span> · Bangalore, India
          </p>
        </div>
      </section>
    </>
  );
}