// SecondSection.jsx

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SERVICES = [
  { label: "Startup Education",    c: "#00f5ff" },
  { label: "Fundraising Strategy", c: "#818cf8" },
  { label: "Market Entry",         c: "#34d399" },
  { label: "Mentor Network",       c: "#f9a8d4" },
  { label: "Legal & Compliance",   c: "#ff2ebe" },
  { label: "Product Launchpad",    c: "#06b6d4" },
];

// ─── Three.js Scene Setup ─────────────────────────────────────────────────────
function useThreeScene(mountRef) {
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = mount.clientWidth;
    let H = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.6; 
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    scene.add(new THREE.AmbientLight(0x0a0d26, 0.8));

    const frontLight = new THREE.DirectionalLight(0xffffff, 12);
    frontLight.position.set(0, 0, 6);
    scene.add(frontLight);

    const keyLight = new THREE.DirectionalLight(0xdbeafe, 20);
    keyLight.position.set(5, 8, 4);
    scene.add(keyLight);

    const rimLight1 = new THREE.DirectionalLight(0x3b82f6, 30);
    rimLight1.position.set(-6, 3, -4);
    scene.add(rimLight1);

    const rimLight2 = new THREE.DirectionalLight(0xd946ef, 25);
    rimLight2.position.set(6, -3, -4);
    scene.add(rimLight2);

    const glassMat = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color(0x121e5c), 
      emissive:           new THREE.Color(0x160c2e), 
      emissiveIntensity:  0.6,                      
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

    const PIECE_COUNT = 10;
    // Enhanced proportions to act as a wide structural backdrop
    const RADIUS_X = 2.6; 
    const RADIUS_Y = 2.0;

    const ring = new THREE.Group();
    scene.add(ring);

    const geometry = new THREE.CylinderGeometry(0.58, 0.58, 0.09, 64);
    geometry.rotateX(Math.PI / 2);

    const pieces = [];
    for (let i = 0; i < PIECE_COUNT; i++) {
      const angle = (i / PIECE_COUNT) * Math.PI * 2;
      const mesh = new THREE.Mesh(geometry, glassMat);

      mesh.position.x = Math.cos(angle) * RADIUS_X;
      mesh.position.y = Math.sin(angle) * RADIUS_Y;
      mesh.position.z = -1; // Positioned slightly back into the deep background layer

      mesh.rotation.x = 0.4 * Math.sin(angle);
      mesh.rotation.y = 0.4 * Math.cos(angle);
      mesh.rotation.z = angle;

      mesh.userData = {
        rotSpeedX: 0.8 + (i % 3) * 0.25,
        rotSpeedY: 1.1 + (i % 2) * 0.35,
        rotSpeedZ: 0.5 + (i % 4) * 0.15,
        phase: angle,
      };

      ring.add(mesh);
      pieces.push(mesh);
    }

    // Dynamic scale adjustments based on screen dimensions
    function adjustLayout() {
      if (W < 768) {
        ring.position.set(0, -0.5, -2);
        ring.scale.set(0.75, 0.75, 0.75);
      } else if (W < 1200) {
        ring.position.set(1.5, 0, -1);
        ring.scale.set(0.9, 0.9, 0.9);
      } else {
        ring.position.set(2.2, 0, 0); // Elegantly offsets ring to peak perfectly under the text block
        ring.scale.set(1.1, 1.1, 1.1);
      }
    }
    adjustLayout();

    let rafId;
    const clock = new THREE.Clock();

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      ring.rotation.z = -t * (Math.PI * 2 / 60);

      pieces.forEach((mesh) => {
        const { rotSpeedX, rotSpeedY, rotSpeedZ, phase } = mesh.userData;
        mesh.rotation.x = (0.4 * Math.sin(phase)) + t * rotSpeedX * 0.6;
        mesh.rotation.y = (0.4 * Math.cos(phase)) + t * rotSpeedY * 0.6;
        mesh.rotation.z = phase + t * rotSpeedZ * 0.35;
      });

      renderer.render(scene, camera);
    }
    animate();

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
      cancelAnimationFrame(rafId);
      ro.disconnect();
      geometry.dispose();
      glassMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);
}

// ─── Main Structural Component ────────────────────────────────────────────────
export default function SecondSection() {
  const mountRef = useRef(null);
  useThreeScene(mountRef);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;700;800&display=swap');

        #services {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          background: #020205;
          font-family: 'Plus Jakarta Sans', sans-serif;
          overflow: hidden;
          padding: 6rem 0;
          box-sizing: border-box;
        }

        /* Full bleed integrated background viewport */
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

        /* High-end architectural light overlay for flawless text legibility */
        .ss-light-overlay {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 40%, rgba(2, 2, 5, 0.4) 0%, rgba(2, 2, 5, 0.85) 60%, #020205 100%);
          z-index: 2;
          pointer-events: none;
        }

        /* Unified Foreground Layer over the 3D Background */
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
          max-width: 680px; /* Aligns perfectly on the left side while background extends wide */
        }

        .ss-headline {
          font-size: clamp(2.8rem, 5.5vw, 5rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.04em;
          margin-bottom: 2rem;
          margin-top: 0;
          color: #ffffff;
          display: flex;
          flex-direction: column;
        }

        .ss-gradient-text {
          background: linear-gradient(135deg, #ffffff 30%, rgba(255, 255, 255, 0.5) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .ss-dim-text {
          background: linear-gradient(90deg, #818cf8 0%, #d946ef 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
          margin-top: 0.4rem;
        }

        .ss-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 4rem;
        }

        /* Transformed Card Layout: Minimalist, transparent background, interactive neon borders */
        .ss-card {
          position: relative;
          padding: 1.75rem 1.5rem; 
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px; 
          background: transparent; /* No more heavy black boxes */
          text-align: left;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          box-sizing: border-box;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), 
                      border-color 0.5s cubic-bezier(0.16, 1, 0.3, 1),
                      box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ss-card:hover {
          transform: translateY(-5px);
          border-color: var(--hover-glow-color);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 
                      0 0 20px var(--hover-shadow-color);
        }

        @media (max-width: 990px) {
          #services { padding: 4rem 0; }
          .ss-foreground { padding: 0 2rem; }
          .ss-content-wrapper { max-width: 100%; }
          .ss-light-overlay {
            background: radial-gradient(circle at 50% 30%, rgba(2, 2, 5, 0.2) 0%, rgba(2, 2, 5, 0.88) 50%, #020205 100%);
          }
        }

        @media (max-width: 640px) {
          .ss-grid { grid-template-columns: 1fr; gap: 16px; }
          .ss-foreground { padding: 0 1.5rem; }
        }
      `}</style>

      <section id="services">
        
        {/* ── Background Elements Layer ── */}
        <div className="ss-bg-container">
          <div ref={mountRef} className="ss-canvas" />
          <div className="ss-light-overlay" />
        </div>

        {/* ── Integrated Foreground Content Layer ── */}
        <div className="ss-foreground">
          <div className="ss-content-wrapper">
            <p style={T.eyebrow}>● Creative Execution</p>
            <h2 className="ss-headline">
              <span className="ss-gradient-text">What We Build</span>
              <span className="ss-dim-text">With Founders</span>
            </h2>
            <p style={T.body}>
              An ultra-responsive architectural environment tailored for enterprise execution, engineering deep technical pipelines from genesis to global delivery.
            </p>
            
            <div className="ss-grid">
              {SERVICES.map((svc) => (
                <div 
                  key={svc.label} 
                  className="ss-card" 
                  style={{ 
                    '--hover-glow-color': svc.c,
                    '--hover-shadow-color': `${svc.c}22`
                  }}
                >
                  <div style={{ ...T.accent, background: svc.c, boxShadow: `0 0 12px ${svc.c}` }} />
                  <span style={{ ...T.tag, color: "#ffffff" }}>{svc.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>
    </>
  );
}

// ─── Typography & Design Tokens ───────────────────────────────────────────────
const T = {
  eyebrow: {
    fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase",
    marginBottom: "1.75rem", display: "block", color: "#818cf8", fontWeight: 700
  },
  body: {
    fontSize: "clamp(1rem, 1.4vw, 1.125rem)", color: "rgba(255,255,255,0.6)",
    maxWidth: 520, margin: "0", lineHeight: 1.75, fontWeight: 400
  },
  accent: { width: 20, height: 2.5, marginBottom: 14, borderRadius: 2, transition: "transform 0.4s ease" },
  tag:    { fontSize: 14, letterSpacing: "0.02em", fontWeight: 600, display: "block" },
};