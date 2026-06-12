// SecondSection.jsx

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// ─── Color palette: black / white / green ONLY ────────────────────────────────
const ACCENT = "#00f5ff";

const SERVICES = [
  { label: "Startup Education",    c: ACCENT },
  { label: "Fundraising Strategy", c: "#00e676" },
  { label: "Market Entry",         c: ACCENT },
  { label: "Mentor Network",       c: "#00e676" },
  { label: "Legal & Compliance",   c: ACCENT },
  { label: "Product Launchpad",    c: "#00e676" },
];

// ─── Three.js Scene Setup ─────────────────────────────────────────────────────
function useThreeScene(mountRef) {
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = mount.clientWidth;
    let H = mount.clientHeight;
    if (!W || !H) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.4;
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 0, 7.5);

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

    const glassMat = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color(0x0a3d1f),
      emissive:           new THREE.Color(0x0a2e10),
      emissiveIntensity:  0.55,
      metalness:          0.05,
      roughness:          0.01,
      ior:                1.95,
      transmission:       0.7,
      thickness:          0.5,
      clearcoat:          1.0,
      clearcoatRoughness: 0.0,
      reflectivity:       1.0,
      opacity:            0.9,
      transparent:        true,
      side:               THREE.DoubleSide,
    });

    const PIECE_COUNT = 9;
    const RADIUS_X    = 1.8;
    const RADIUS_Y    = 1.5;

    const ring     = new THREE.Group();
    const geometry = new THREE.CylinderGeometry(0.58, 0.58, 0.09, 64);
    geometry.rotateX(Math.PI / 2);

    const pieces = [];
    for (let i = 0; i < PIECE_COUNT; i++) {
      const angle = (i / PIECE_COUNT) * Math.PI * 2;
      const mesh  = new THREE.Mesh(geometry, glassMat);

      mesh.position.x = Math.cos(angle) * RADIUS_X;
      mesh.position.y = Math.sin(angle) * RADIUS_Y;
      mesh.position.z = -1;

      mesh.rotation.x = 0.4 * Math.sin(angle);
      mesh.rotation.y = 0.4 * Math.cos(angle);
      mesh.rotation.z = angle;

      mesh.userData = {
        rotSpeedX: 0.8  + (i % 3) * 0.25,
        rotSpeedY: 1.1  + (i % 2) * 0.35,
        rotSpeedZ: 0.5  + (i % 4) * 0.15,
        phase: angle,
      };

      ring.add(mesh);
      pieces.push(mesh);
    }
    scene.add(ring);

    function adjustLayout() {
      if (W < 768) {
        ring.position.set(0, 0.5, -2);
        ring.scale.set(0.7, 0.7, 0.7);
      } else if (W < 1024) {
        ring.position.set(0, -0.2, -1);
        ring.scale.set(0.85, 0.85, 0.85);
      } else if (W < 1200) {
        ring.position.set(1.8, 0, -1);
        ring.scale.set(0.95, 0.95, 0.95);
      } else {
        ring.position.set(2.4, 0, 0);
        ring.scale.set(1.1, 1.1, 1.1);
      }
    }
    adjustLayout();

    let rafId = 0;
    // ── Use elapsed seconds tracked manually via RAF timestamp ───────────────
    // This avoids THREE.Clock which uses wall-clock time and accumulates during
    // any pause (visibility:hidden, tab switch, etc.) causing position jumps.
    let elapsedSecs   = 0;
    let lastTS        = null;
    const MAX_DELTA   = 0.05; // cap at 50ms — prevents any jump after pauses

    function animate(ts) {
      const delta = lastTS === null ? 0 : Math.min((ts - lastTS) / 1000, MAX_DELTA);
      lastTS = ts;
      elapsedSecs += delta;

      const t = elapsedSecs;
      ring.rotation.z = -t * (Math.PI * 2 / 60);

      pieces.forEach((mesh) => {
        const { rotSpeedX, rotSpeedY, rotSpeedZ, phase } = mesh.userData;
        mesh.rotation.x = 0.4 * Math.sin(phase) + t * rotSpeedX * 0.6;
        mesh.rotation.y = 0.4 * Math.cos(phase) + t * rotSpeedY * 0.6;
        mesh.rotation.z = phase + t * rotSpeedZ * 0.35;
      });

      renderer.render(scene, camera);

      rafId = requestAnimationFrame(animate);
    }

    // Reset lastTS on visibility restore so first resumed frame = 0 delta
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") lastTS = null;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    const startRAF = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(animate);
    };
    const stopRAF = () => {
      if (!rafId) return;
      cancelAnimationFrame(rafId);
      rafId = 0;
    };

    const io = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible) {
        lastTS = null;
        startRAF();
      } else {
        stopRAF();
      }
    }, { rootMargin: "200px 0px" });
    io.observe(mount);

    startRAF();

    const ro = new ResizeObserver(() => {
      W = mount.clientWidth;
      H = mount.clientHeight;
      if (!W || !H) return;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
      adjustLayout();
    });
    ro.observe(mount);

    return () => {
      stopRAF();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      geometry.dispose();
      glassMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [mountRef]);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SecondSection() {
  const mountRef = useRef(null);
  useThreeScene(mountRef);

  return (
    <>
      <style>{`
        #services {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: #03030a;
          overflow: hidden;
          padding: 6rem 0;
          box-sizing: border-box;
        }

        .ss-bg-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        .ss-canvas {
          width: 100%;
          height: 100%;
        }

        .ss-light-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              to right,
              rgba(3,3,10,0.88) 0%,
              rgba(3,3,10,0.68) 28%,
              rgba(3,3,10,0.28) 52%,
              rgba(3,3,10,0.42) 100%
            ),
            rgba(3,3,10,0.38);
          z-index: 2;
          pointer-events: none;
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

        .ss-content-wrapper {
          max-width: 640px;
        }

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
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          background: rgba(255,255,255,0.02);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          box-sizing: border-box;
          transition:
            transform     0.45s cubic-bezier(0.16, 1, 0.3, 1),
            border-color  0.45s cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow    0.45s cubic-bezier(0.16, 1, 0.3, 1),
            background    0.45s ease;
          will-change: transform;
          cursor: default;
        }

        .ss-card:hover {
          transform: translateY(-4px);
          border-color: var(--c);
          background: rgba(255,255,255,0.035);
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

        @media (max-width: 1023px) {
          #services { padding: 5rem 0; }
          .ss-foreground { padding: 0 2.5rem; }
          .ss-content-wrapper { max-width: 100%; }
          .ss-light-overlay {
            background:
              linear-gradient(
                to bottom,
                rgba(3,3,10,0.88) 0%,
                rgba(3,3,10,0.55) 45%,
                rgba(3,3,10,0.38) 100%
              ),
              rgba(3,3,10,0.32);
          }
        }

        @media (max-width: 767px) {
          #services { padding: 4.5rem 0; }
          .ss-foreground { padding: 0 1.5rem; }
          .ss-grid {
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-top: 2.5rem;
          }
        }

        @media (max-width: 479px) {
          .ss-grid { grid-template-columns: 1fr; gap: 12px; }
          .ss-headline { letter-spacing: -0.02em; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ss-card { transition: none; }
        }
      `}</style>

      <section id="services">
        <div className="ss-bg-container">
          <div ref={mountRef} className="ss-canvas" />
          <div className="ss-light-overlay" />
        </div>

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

            <div className="ss-grid">
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
