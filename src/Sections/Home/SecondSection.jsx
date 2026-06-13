"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const ACCENT = "#00f5ff";

const SERVICES = [
  { label: "Startup Education",    c: ACCENT },
  { label: "Fundraising Strategy", c: "#00e676" },
  { label: "Market Entry",         c: ACCENT },
  { label: "Mentor Network",       c: "#00e676" },
  { label: "Legal & Compliance",   c: ACCENT },
  { label: "Product Launchpad",    c: "#00e676" },
];

// ─── Three.js hook ────────────────────────────────────────────────────────────
function useThreeScene(mountRef) {
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = mount.clientWidth;
    let H = mount.clientHeight;
    if (!W || !H) return;

    const isMobile = () => W < 768;
    const getDPR   = () => isMobile() ? 1.0 : Math.min(window.devicePixelRatio, 1.5);

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias:       false,
      alpha:           true,
      powerPreference: "high-performance",
      precision:       "mediump",
    });
    renderer.setPixelRatio(getDPR());
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.NoToneMapping; 
    renderer.sortObjects = false;

    const canvas = renderer.domElement;
    canvas.style.pointerEvents = "none";
    canvas.style.display       = "block";
    mount.appendChild(canvas);

    // ── Scene + camera ────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // ── Lights ────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x03030a, 0.6));

    const frontLight = new THREE.DirectionalLight(0xffffff, 10);
    frontLight.position.set(0, 0, 6);
    scene.add(frontLight);

    const keyLight = new THREE.DirectionalLight(0xe0ffe0, 18);
    keyLight.position.set(5, 8, 4);
    scene.add(keyLight);

    const rimLight1 = new THREE.DirectionalLight(0x00f5ff, 28);
    rimLight1.position.set(-6, 3, -4);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0x00e676, 22);
    rimLight2.position.set(6, -3, -4);
    scene.add(rimLight2);

    // ── Material ──────────────────────────────────────────────────────────
    const glassMat = new THREE.MeshStandardMaterial({
      color:             new THREE.Color(0x0a3d1f),
      emissive:          new THREE.Color(0x0a2e10),
      emissiveIntensity: 0.65,
      metalness:         0.55,
      roughness:         0.22,
      transparent:       false, 
      opacity:           1.0,
    });

    // ── Ring of cylinders ─────────────────────────────────────────────────
    const PIECE_COUNT = 9;
    const RADIUS_X    = 1.8;
    const RADIUS_Y    = 1.5;

    const geometry = new THREE.CylinderGeometry(0.58, 0.58, 0.09, 16);
    geometry.rotateX(Math.PI / 2);

    const ring   = new THREE.Group();
    const pieces = [];

    for (let i = 0; i < PIECE_COUNT; i++) {
      const angle = (i / PIECE_COUNT) * Math.PI * 2;
      const mesh  = new THREE.Mesh(geometry, glassMat);

      mesh.position.set(
        Math.cos(angle) * RADIUS_X,
        Math.sin(angle) * RADIUS_Y,
        -1
      );
      
      mesh.rotation.set(
        0.55,  
        0.35,  
        angle  
      );

      ring.add(mesh);
      pieces.push(mesh);
    }
    scene.add(ring);

    // ── Responsive ring position/scale ────────────────────────────────────
    function adjustLayout() {
      if (W < 768) {
        ring.position.set(0, 0.5, -2);
        ring.scale.setScalar(0.7);
      } else if (W < 1024) {
        ring.position.set(0, 0, -2);
        ring.scale.setScalar(0.9);
      } else {
        ring.position.set(0.6, 0, -2.5);
        ring.scale.setScalar(1.4);
      }
    }
    adjustLayout();

    // ── RAF loop ──────────────────────────────────────────────────────────
    let rafId = 0;
    let lastTime;
    
    function animate(ts) {
      if (lastTime === undefined) {
        lastTime = ts;
      }
      
      const delta = Math.min((ts - lastTime) * 0.001, 0.1);
      lastTime = ts;

      ring.rotation.z -= delta * 0.35;

      for (let i = 0; i < pieces.length; i++) {
        pieces[i].rotation.z += delta * 0.25; 
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    }

    // ── Pause when tab hidden ─────────────────────────────────────────────
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        stopRAF();
      } else {
        startRAF();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    // ── IntersectionObserver: pause when off-screen ───────────────────────
    const startRAF = () => {
      if (!rafId) {
        lastTime = undefined; 
        rafId = requestAnimationFrame(animate);
      }
    };
    const stopRAF = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const io = new IntersectionObserver(
      (entries) => entries.some(e => e.isIntersecting) ? startRAF() : stopRAF(),
      { rootMargin: "200px 0px" }
    );
    io.observe(mount);

    // ── ResizeObserver (Debounced for smooth scrolling) ───────────────────
    let resizeTimeout;
    const ro = new ResizeObserver(() => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      
      // Debouncing prevents layout thrashing which causes "sticky" scroll lag
      resizeTimeout = setTimeout(() => {
        W = mount.clientWidth;
        H = mount.clientHeight;
        if (!W || !H) return;
        renderer.setPixelRatio(getDPR());
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
        adjustLayout();
      }, 150); 
    });
    ro.observe(mount);

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      stopRAF();
      if (resizeTimeout) clearTimeout(resizeTimeout);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      geometry.dispose();
      glassMat.dispose();
      renderer.dispose();
      if (mount.contains(canvas)) mount.removeChild(canvas);
    };
  }, []);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function SecondSection() {
  const mountRef = useRef(null);
  const gridRef  = useRef(null);
  useThreeScene(mountRef);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const add = (e) => { if (e.target.classList.contains("ss-card")) e.target.style.willChange = "transform"; };
    const rem = (e) => { if (e.target.classList.contains("ss-card")) e.target.style.willChange = ""; };
    grid.addEventListener("mouseenter", add, true);
    grid.addEventListener("mouseleave", rem, true);
    return () => {
      grid.removeEventListener("mouseenter", add, true);
      grid.removeEventListener("mouseleave", rem, true);
    };
  }, []);

  return (
    <>
      <style>{`
        #services {
          position: relative;
          /* Removed min-height: 100vh to eliminate the unnatural scroll trap */
          padding: 8rem 0; 
          display: flex;
          align-items: center;
          background: #03030a;
          overflow: hidden;
          box-sizing: border-box;
        }

        .ss-bg-container {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          contain: strict;
        }

        .ss-canvas {
          width: 100%;
          height: 100%;
        }

        .ss-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background: rgba(0, 0, 0, 0.65); 
        }

        .ss-foreground {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          padding: 0 4rem;
          box-sizing: border-box;
        }

        .ss-content-wrapper { max-width: 640px; }

        .ss-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${ACCENT};
          text-shadow: 0 0 14px rgba(0,245,255,0.45);
          margin: 0 0 1.6rem;
          display: block;
        }

        .ss-headline {
          font-size: clamp(2.6rem, 5vw, 4.8rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin: 0 0 1.8rem;
          color: #ffffff;
          text-shadow:
            0 2px 4px  rgba(0,0,0,0.95),
            0 4px 32px rgba(0,0,0,0.80),
            0 0 80px   rgba(0,0,0,0.50);
        }

        .ss-headline span { display: block; }

        .ss-headline-sub {
          color: rgba(255,255,255,0.50);
          margin-top: 0.35rem;
        }

        .ss-body {
          font-size: clamp(0.95rem, 1.4vw, 1.1rem);
          font-weight: 400;
          line-height: 1.75;
          letter-spacing: 0.005em;
          color: rgba(255,255,255,0.60);
          margin: 0;
          max-width: 500px;
        }

        .ss-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          margin-top: 3.5rem;
        }

        .ss-card {
          position: relative;
          padding: 1.6rem 1.4rem;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          background: rgba(10,10,18,0.82);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          box-sizing: border-box;
          cursor: default;
          transition:
            transform    0.45s cubic-bezier(0.16, 1, 0.3, 1),
            border-color 0.45s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow   0.45s cubic-bezier(0.16, 1, 0.3, 1),
            background   0.45s ease;
        }

        .ss-card:hover {
          transform: translateY(-4px);
          border-color: var(--c);
          background: rgba(14,14,24,0.90);
          box-shadow:
            0 14px 32px rgba(0,0,0,0.55),
            0 0 18px var(--glow);
        }

        .ss-card-bar {
          width: 22px;
          height: 2px;
          border-radius: 2px;
          margin-bottom: 14px;
          background: var(--c);
          box-shadow: 0 0 10px var(--glow);
          transition: width 0.4s ease;
        }

        .ss-card:hover .ss-card-bar { width: 36px; }

        .ss-card-label {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #ffffff;
          display: block;
          line-height: 1.4;
        }

        /* ── Responsive ───────────────────────────────────────────────────── */
        @media (max-width: 1023px) {
          #services      { padding: 6rem 0; }
          .ss-foreground { padding: 0 2.5rem; }
          .ss-content-wrapper { max-width: 100%; }
        }

        @media (max-width: 767px) {
          #services      { padding: 5rem 0; }
          .ss-foreground { padding: 0 1.5rem; }
          .ss-grid {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-top: 2.5rem;
          }
        }

        @media (max-width: 479px) {
          .ss-grid     { grid-template-columns: 1fr; gap: 12px; }
          .ss-headline { letter-spacing: -0.02em; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ss-card { transition: none; }
        }

        @media (hover: none) and (pointer: coarse) {
          .ss-card:hover {
            transform: none;
            box-shadow: none;
            border-color: rgba(255,255,255,0.08);
          }
        }
      `}</style>

      <section id="services">
        <div className="ss-bg-container">
          <div ref={mountRef} className="ss-canvas" />
        </div>

        <div className="ss-overlay" aria-hidden="true" />

        <div className="ss-foreground">
          <div className="ss-content-wrapper">
            <span className="ss-eyebrow">● What We Do</span>

            <h2 className="ss-headline">
              <span>What We Build</span>
              <span className="ss-headline-sub">With Founders</span>
            </h2>

            <p className="ss-body">
              A full-stack facilitation environment built for India&apos;s next
              generation of entrepreneurs — from ideation to investor-ready
              execution.
            </p>

            <div className="ss-grid" ref={gridRef}>
              {SERVICES.map((svc) => (
                <div
                  key={svc.label}
                  className="ss-card"
                  style={{ "--c": svc.c, "--glow": `${svc.c}33` }}
                >
                  <div className="ss-card-bar" />
                  <span className="ss-card-label">{svc.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}