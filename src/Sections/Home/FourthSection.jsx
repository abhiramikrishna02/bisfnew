"use client";

// ─── Fourth Section: Process / How It Works ───────────────────────────────────
// Background: 3D gold dollar signs falling/tumbling across the screen (Three.js).
// Foreground: Timeline content centered, fully readable above the animation.

import { useEffect, useRef } from "react";
import * as THREE from "three";

const STEPS = [
  {
    step: "I",
    c: "#f59e0b",
    title: "Discovery Session",
    desc: "We map your idea, market, and readiness in a focused 2-hour session.",
  },
  {
    step: "II",
    c: "#fbbf24",
    title: "Build Your Foundation",
    desc: "Legal entity, brand identity, MVP scope — all handled systematically.",
  },
  {
    step: "III",
    c: "#f59e0b",
    title: "Capital & Growth",
    desc: "Investor intros, pitch deck refinement, and growth strategy execution.",
  },
];

// ─── Build extruded dollar sign geometry ──────────────────────────────────────
// We construct the "$" shape from a THREE.Shape path, then extrude it.
function createDollarShape() {
  const shape = new THREE.Shape();

  // Outer S-curve of the dollar sign (simplified, readable at small scale)
  // We'll use a series of curves + lines to approximate the $ glyph
  // Top arc of S (upper bowl)
  shape.moveTo(0.28, 0.55);
  shape.bezierCurveTo(0.60, 0.55,  0.75, 0.35,  0.75, 0.18);
  shape.bezierCurveTo(0.75, 0.02,  0.60,-0.08,  0.28,-0.10);
  // Middle crossover
  shape.lineTo(-0.28, -0.10);
  shape.bezierCurveTo(-0.60,-0.10, -0.75,-0.22, -0.75,-0.38);
  shape.bezierCurveTo(-0.75,-0.55, -0.60,-0.70, -0.28,-0.70);
  // Bottom arc close
  shape.bezierCurveTo(0.60,-0.70,  0.75,-0.50,  0.75,-0.38);
  // Back up (outer shape — we'll subtract inner holes manually via extrude)
  shape.lineTo(0.42, -0.38);
  shape.bezierCurveTo(0.42,-0.48,  0.28,-0.52, -0.10,-0.52);
  shape.bezierCurveTo(-0.42,-0.52, -0.55,-0.42, -0.55,-0.36);
  shape.bezierCurveTo(-0.55,-0.22, -0.40,-0.14, -0.10,-0.12);
  // Middle bar
  shape.lineTo(0.14, -0.12);
  shape.bezierCurveTo(0.42, -0.08,  0.55, 0.02,  0.55, 0.18);
  shape.bezierCurveTo(0.55, 0.36,  0.42, 0.46,  0.10, 0.46);
  shape.bezierCurveTo(-0.22, 0.46, -0.55, 0.32, -0.55, 0.18);
  shape.lineTo(-0.42, 0.18);
  shape.bezierCurveTo(-0.42, 0.38, -0.14, 0.55,  0.28, 0.55);

  return shape;
}

// ─── Three.js Scene ───────────────────────────────────────────────────────────
function useDollarRain(mountRef) {
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = mount.clientWidth;
    let H = mount.clientHeight;

    // ── Renderer ────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0); // Transparent — section bg shows
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    mount.appendChild(renderer.domElement);

    // ── Scene & Camera ──────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 60);
    camera.position.set(0, 0, 14);

    // ── Lighting — warm gold studio look ────────────────────────────────────
    // Ambient — warm dim base so shadow sides are dark amber, not black
    scene.add(new THREE.AmbientLight(0x1a0d00, 1.2));

    // Primary key — bright warm-white from upper left (creates the gold sheen)
    const key = new THREE.DirectionalLight(0xffd97a, 22);
    key.position.set(-5, 8, 6);
    scene.add(key);

    // Secondary key — slightly cooler highlight from upper right
    const key2 = new THREE.DirectionalLight(0xffe4a0, 14);
    key2.position.set(7, 5, 5);
    scene.add(key2);

    // Warm rim backlight — gives the dark gold edge glow
    const rim = new THREE.DirectionalLight(0xc05a00, 18);
    rim.position.set(0, -4, -7);
    scene.add(rim);

    // Subtle warm fill from below
    const fill = new THREE.DirectionalLight(0xb07020, 6);
    fill.position.set(0, -8, 3);
    scene.add(fill);

    // ── Gold Material ────────────────────────────────────────────────────────
    // Dark warm gold — matches reference: rich amber-brown in shadows,
    // bright gold-yellow on specular highlights
    const goldMat = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color(0x9a6200),  // Deep amber-gold base
      emissive:           new THREE.Color(0x3d1f00),  // Warm glow in dark areas
      emissiveIntensity:  0.35,
      metalness:          0.85,   // Metallic for clean specular
      roughness:          0.28,   // Slightly rough = warm matte-gold look
      clearcoat:          0.6,
      clearcoatRoughness: 0.3,
      reflectivity:       0.9,
    });

    // ── Dollar Sign Geometry ─────────────────────────────────────────────────
    const dollarShape = createDollarShape();

    // Vertical stroke (the | line through the $)
    const strokeShape = new THREE.Shape();
    strokeShape.moveTo(-0.07, -1.0);
    strokeShape.lineTo( 0.07, -1.0);
    strokeShape.lineTo( 0.07,  1.0);
    strokeShape.lineTo(-0.07,  1.0);
    strokeShape.closePath();

    const extrudeSettings = {
      depth: 0.28,
      bevelEnabled: true,
      bevelThickness: 0.06,
      bevelSize: 0.04,
      bevelSegments: 4,
    };

    const dollarGeo = new THREE.ExtrudeGeometry(dollarShape, extrudeSettings);
    const strokeGeo = new THREE.ExtrudeGeometry(strokeShape, extrudeSettings);

    // Center both geometries independently — no manual merge needed
    dollarGeo.center();
    strokeGeo.center();

    // ── Scatter dollar signs across the scene ────────────────────────────────
    const COUNT = 38;
    const symbols = [];

    // Calculate visible bounds from camera FOV
    const vFOV  = (camera.fov * Math.PI) / 180;
    const vH    = 2 * Math.tan(vFOV / 2) * camera.position.z;
    const vW    = vH * (W / H);

    const SPAWN_W = vW  * 0.6;
    const SPAWN_H = vH  * 0.7;
    const DEPTH_RANGE = 10; // Z spread for depth-of-field feel

    for (let i = 0; i < COUNT; i++) {
      // Use a Group with two child meshes — avoids any index merging entirely
      const group = new THREE.Group();
      group.add(new THREE.Mesh(dollarGeo, goldMat));
      group.add(new THREE.Mesh(strokeGeo, goldMat));

      // Random uniform scale — variety in "near" vs "far" coins
      const s = 0.20 + Math.random() * 0.55;
      group.scale.setScalar(s);

      // Random position spread across the viewport
      group.position.set(
        (Math.random() - 0.5) * SPAWN_W,
        (Math.random() - 0.5) * SPAWN_H + SPAWN_H * 0.5, // Start above center
        (Math.random() - 0.5) * DEPTH_RANGE
      );

      // Random initial rotation
      group.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      // Per-symbol animation data
      group.userData = {
        fallSpeed:  0.012 + Math.random() * 0.022,
        tumbleX:    (Math.random() - 0.5) * 0.022,
        tumbleY:    (Math.random() - 0.5) * 0.018,
        tumbleZ:    (Math.random() - 0.5) * 0.010,
        driftX:     (Math.random() - 0.5) * 0.004,
        spawnY:     SPAWN_H * 0.6 + Math.random() * 1.5,
        resetY:    -SPAWN_H * 0.55,
        resetX:     (Math.random() - 0.5) * SPAWN_W,
        phase:      Math.random() * Math.PI * 2,
      };

      scene.add(group);
      symbols.push(group);
    }

    // ── Animation Loop ───────────────────────────────────────────────────────
    let rafId;
    const clock = new THREE.Clock();

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      symbols.forEach((mesh) => {
        const d = mesh.userData;

        // Fall downward
        mesh.position.y -= d.fallSpeed;

        // Sinusoidal horizontal drift (lazy sway)
        mesh.position.x += d.driftX + Math.sin(t * 0.4 + d.phase) * 0.003;

        // Local tumble on all axes
        mesh.rotation.x += d.tumbleX;
        mesh.rotation.y += d.tumbleY;
        mesh.rotation.z += d.tumbleZ;

        // Recycle when off-screen bottom — respawn at top
        if (mesh.position.y < d.resetY) {
          mesh.position.y = d.spawnY;
          mesh.position.x = d.resetX;
          mesh.position.z = (Math.random() - 0.5) * DEPTH_RANGE;
        }
      });

      renderer.render(scene, camera);
    }
    animate();

    // ── Resize ───────────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      W = mount.clientWidth;
      H = mount.clientHeight;
      if (!W || !H) return;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
    ro.observe(mount);

    // ── Cleanup ──────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      dollarGeo.dispose();
      strokeGeo.dispose();
      goldMat.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function FourthSection() {
  const mountRef = useRef(null);
  useDollarRain(mountRef);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Inter:wght@300;400;500&display=swap');

        #process {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #03030a;
          border-top: 1px solid rgba(255,255,255,0.04);
          padding: 6rem 0;
          overflow: hidden;
        }

        /* Three.js canvas fills the entire section background */
        #process-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        /* Dark vignette overlay — dials back the 3D so text stays legible */
        #process::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 50%, rgba(3,3,10,0.55) 30%, transparent 100%),
            linear-gradient(to bottom, rgba(3,3,10,0.7) 0%, rgba(3,3,10,0.3) 30%, rgba(3,3,10,0.3) 70%, rgba(3,3,10,0.7) 100%);
          z-index: 1;
          pointer-events: none;
        }

        /* Content lives above canvas + vignette */
        #process-inner {
          position: relative;
          z-index: 2;
          max-width: 620px;
          width: 100%;
          padding: 0 2rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
        }

        /* ── Eyebrow ─────────────────────────────────────── */
        .ps-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: #f59e0b;
          margin: 0 0 1.8rem 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ps-eyebrow::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: #f59e0b;
          flex-shrink: 0;
        }

        /* ── Headline ─────────────────────────────────────── */
        .ps-h2 {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: clamp(2.8rem, 5vw, 4.6rem);
          line-height: 0.94;
          letter-spacing: -0.04em;
          color: #ffffff;
          margin: 0 0 2.2rem 0;
        }
        .ps-h2-dim {
          display: block;
          color: rgba(255,255,255,0.14);
          margin-top: 0.15em;
        }

        /* ── Timeline ─────────────────────────────────────── */
        .ps-timeline {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ps-item {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          padding: 18px 20px;
          border: 1px solid rgba(245,158,11,0.12);
          border-radius: 14px;
          background: rgba(3,3,10,0.72);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: background 0.3s ease, border-color 0.3s ease;
        }
        .ps-item:hover {
          background: rgba(10,8,2,0.88);
          border-color: rgba(245,158,11,0.26);
        }

        .ps-step {
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          border: 1px solid;
          border-radius: 6px;
          padding: 4px 9px;
          min-width: 34px;
          text-align: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .ps-title {
          font-family: 'Syne', sans-serif;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: rgba(255,255,255,0.90);
          margin: 0 0 7px 0;
        }

        .ps-desc {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.32);
          line-height: 1.8;
          margin: 0;
        }

        /* ── Gold shimmer rule below headline ─────────────── */
        .ps-rule {
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, #f59e0b, #fbbf24, transparent);
          border-radius: 1px;
          margin-bottom: 2.2rem;
        }

        @media (max-width: 640px) {
          #process { padding: 4rem 0; }
          .ps-h2   { font-size: clamp(2.4rem, 9vw, 3.2rem); }
          .ps-item { padding: 14px 14px; gap: 14px; }
        }
      `}</style>

      <section id="process">

        {/* ── 3D Background Canvas ─────────────────────────────────────────── */}
        <div id="process-canvas" ref={mountRef} />

        {/* ── Foreground Content ───────────────────────────────────────────── */}
        <div id="process-inner">

          <p className="ps-eyebrow">How It Works</p>

          <h2 className="ps-h2">
            Your Journey
            <span className="ps-h2-dim">Our Framework</span>
          </h2>

          <div className="ps-rule" />

          <div className="ps-timeline">
            {STEPS.map((t) => (
              <div key={t.step} className="ps-item">
                <div
                  className="ps-step"
                  style={{ color: t.c, borderColor: `${t.c}55` }}
                >
                  {t.step}
                </div>
                <div>
                  <p className="ps-title">{t.title}</p>
                  <p className="ps-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

      </section>
    </>
  );
}