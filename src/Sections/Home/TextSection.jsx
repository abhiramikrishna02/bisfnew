"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Colors ───────────────────────────────────────────────────────────────────
const GREEN       = "#00c853";
const GREEN_LIGHT = "#00e676";

// ─── Word list — same structure as MANIFESTO_TEXT in About.jsx ────────────────
const WORDS = [
  { text: "We",              big: false, color: "white" },
  { text: "power",           big: true,  color: GREEN },
  { text: "bold",            big: false, color: "white" },
  { text: "ideas",           big: false, color: "white" },
  { text: "into",            big: false, color: "white" },
  { text: "reality",         big: false, color: "white" },
  { text: "through",         big: false, color: "white" },
  { text: "a",               big: false, color: "white" },
  { text: "builder-centric", big: true,  color: GREEN },
  { text: "ecosystem",       big: false, color: "white" },
  { text: "that",            big: false, color: "white" },
  { text: "transforms",      big: true,  color: GREEN_LIGHT },
  { text: "raw",             big: false, color: "white" },
  { text: "concepts",        big: false, color: "white" },
  { text: "into",            big: false, color: "white" },
  { text: "scalable,",       big: true,  color: GREEN_LIGHT },
  { text: "world-class",     big: true,  color: GREEN },
  { text: "ventures.",       big: false, color: "white" },
];

export default function TextSection() {
  const sectionRef = useRef(null);
  const wordsRef   = useRef([]);

  useEffect(() => {
    const section = sectionRef.current;
    const words   = wordsRef.current.filter(Boolean);
    if (!section || words.length === 0) return;

    // ── Exact same pattern as About.jsx manifesto block ──────────────────────
    // Set all words to near-invisible first
    gsap.set(words, { opacity: 0.06 });

    // Pin the section, scrub word opacity from 0.06 → 1, staggered
    ScrollTrigger.create({
      trigger: section,
      start:   "top top",
      end:     `+=${words.length * 80}`,   // same formula: words.length * 80
      pin:     true,
      pinSpacing: true,
      scrub:   0.35,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      animation: gsap.to(words, {
        opacity: 1,
        stagger: { each: 0.28 },
        ease: "none",
      }),
    });

    return () => {
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === section) st.kill();
      });
    };
  }, []);

  return (
    <>
      <style>{`
        /* ── Section — fills viewport, centers content ── */
        #text-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: #03030a;
          overflow: hidden;
          padding: 0;
          box-sizing: border-box;
        }

        /* ── Atmospheric glow ── */
        #text-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 70% 60% at 35% 50%,
            rgba(0, 200, 83, 0.05) 0%,
            rgba(0, 230, 118, 0.025) 50%,
            transparent 75%
          );
          pointer-events: none;
        }

        /* ── Inner wrapper ── */
        .ts-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 clamp(1.5rem, 8vw, 8rem);
          box-sizing: border-box;
        }

        /* ── Hairline dividers ── */
        .ts-divider {
          width: 100%;
          height: 1px;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255,255,255,0.07) 20%,
            rgba(255,255,255,0.07) 80%,
            transparent
          );
          margin-bottom: 3rem;
        }
        .ts-divider-bottom {
          margin-top: 3rem;
          margin-bottom: 0;
        }

        /* ── Word wrap container — matches about-manifesto-copy ── */
        .ts-copy {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem 0rem;
          align-items: baseline;
        }

        /* ── Every word span — matches .about-manifesto-word exactly ── */
        .ts-word {
          font-family: 'DM Sans', sans-serif;
          font-weight: 800;
          line-height: 1.05;
          opacity: 0.06;
          display: inline-block;
          /* color set inline */
        }

        /* Small words — body size */
        .ts-word-sm {
          font-size: clamp(1.8rem, min(4vw, 9vh), 4rem);
          margin-right: clamp(0.3rem, 1vw, 0.8rem);
        }

        /* Big/accent words — larger, matches MANIFESTO_BIG in About.jsx */
        .ts-word-lg {
          font-size: clamp(2.4rem, min(5.5vw, 11vh), 5.5rem);
          margin-right: clamp(0.3rem, 1vw, 0.8rem);
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .ts-word-sm { font-size: clamp(1.4rem, 5.5vw, 2.4rem); }
          .ts-word-lg { font-size: clamp(2rem,   7.5vw, 3.2rem); }
          .ts-copy    { gap: 0.4rem 0; }
          .ts-divider { margin-bottom: 2rem; }
          .ts-divider-bottom { margin-top: 2rem; }
        }
        @media (max-width: 480px) {
          .ts-word-sm { font-size: clamp(1.2rem, 5vw, 2rem); }
          .ts-word-lg { font-size: clamp(1.6rem, 7vw, 2.6rem); }
        }

        /* Reduced motion — show all words immediately ── */
        @media (prefers-reduced-motion: reduce) {
          .ts-word { opacity: 1 !important; }
        }
      `}</style>

      <section id="text-section" ref={sectionRef}>
        <div className="ts-inner">

          <div className="ts-divider" />

          <div className="ts-copy">
            {WORDS.map((w, i) => (
              <span
                key={i}
                className={`ts-word ${w.big ? "ts-word-lg" : "ts-word-sm"}`}
                style={{ color: w.color }}
                ref={el => { wordsRef.current[i] = el; }}
              >
                {w.text}
              </span>
            ))}
          </div>

          <div className="ts-divider ts-divider-bottom" />

        </div>
      </section>
    </>
  );
}