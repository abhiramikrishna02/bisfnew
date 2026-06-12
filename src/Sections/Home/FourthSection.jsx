"use client";

// ─── Fourth Section: Process / How It Works ───────────────────────────────────

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Color palette: black / white / cyan-green ONLY
const ACCENT = "#00f5ff";

const STEPS = [
  {
    step: "I",
    title: "Discovery Session",
    desc: "We map your idea, market, and readiness in a focused 2-hour session.",
  },
  {
    step: "II",
    title: "Build Your Foundation",
    desc: "Legal entity, brand identity, MVP scope — all handled systematically.",
  },
  {
    step: "III",
    title: "Capital & Growth",
    desc: "Investor intros, pitch deck refinement, and growth strategy execution.",
  },
];

// ─── Dollar sign shape — UNTOUCHED ───────────────────────────────────────────
function createDollarShape() {
  const shape = new THREE.Shape();
  shape.moveTo(0.28, 0.55);
  shape.bezierCurveTo(0.60, 0.55,  0.75, 0.35,  0.75, 0.18);
  shape.bezierCurveTo(0.75, 0.02,  0.60,-0.08,  0.28,-0.10);
  shape.lineTo(-0.28, -0.10);
  shape.bezierCurveTo(-0.60,-0.10, -0.75,-0.22, -0.75,-0.38);
  shape.bezierCurveTo(-0.75,-0.55, -0.60,-0.70, -0.28,-0.70);
  shape.bezierCurveTo(0.60,-0.70,  0.75,-0.50,  0.75,-0.38);
  shape.lineTo(0.42, -0.38);
  shape.bezierCurveTo(0.42,-0.48,  0.28,-0.52, -0.10,-0.52);
  shape.bezierCurveTo(-0.42,-0.52, -0.55,-0.42, -0.55,-0.36);
  shape.bezierCurveTo(-0.55,-0.22, -0.40,-0.14, -0.10,-0.12);
  shape.lineTo(0.14, -0.12);
  shape.bezierCurveTo(0.42, -0.08,  0.55, 0.02,  0.55, 0.18);
  shape.bezierCurveTo(0.55, 0.36,  0.42, 0.46,  0.10, 0.46);
  shape.bezierCurveTo(-0.22, 0.46, -0.55, 0.32, -0.55, 0.18);
  shape.lineTo(-0.42, 0.18);
  shape.bezierCurveTo(-0.42, 0.38, -0.14, 0.55,  0.28, 0.55);
  return shape;
}

// ─── Three.js Scene — UNTOUCHED ──────────────────────────────────────────────
function useDollarRain(mountRef) {
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let W = mount.clientWidth;
    let H = mount.clientHeight;
    if (!W || !H) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 60);
    camera.position.set(0, 0, 14);

    scene.add(new THREE.AmbientLight(0x021108, 1.2));

    const key = new THREE.DirectionalLight(0xffffff, 22);
    key.position.set(-5, 8, 6);
    scene.add(key);

    const key2 = new THREE.DirectionalLight(0xa7f3d0, 14);
    key2.position.set(7, 5, 5);
    scene.add(key2);

    const rim = new THREE.DirectionalLight(0x059669, 18);
    rim.position.set(0, -4, -7);
    scene.add(rim);

    const fill = new THREE.DirectionalLight(0x064e3b, 6);
    fill.position.set(0, -8, 3);
    scene.add(fill);

    const greenMat = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color(0x0f763e),
      emissive:           new THREE.Color(0x042412),
      emissiveIntensity:  0.35,
      metalness:          0.85,
      roughness:          0.28,
      clearcoat:          0.6,
      clearcoatRoughness: 0.3,
      reflectivity:       0.9,
    });

    const dollarShape = createDollarShape();

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
    dollarGeo.center();
    strokeGeo.center();

    const COUNT = 38;
    const symbols = [];

    const vFOV   = (camera.fov * Math.PI) / 180;
    const vH     = 2 * Math.tan(vFOV / 2) * camera.position.z;
    const vW     = vH * (W / H);
    const SPAWN_W     = vW * 0.6;
    const SPAWN_H     = vH * 0.7;
    const DEPTH_RANGE = 10;

    for (let i = 0; i < COUNT; i++) {
      const group = new THREE.Group();
      group.add(new THREE.Mesh(dollarGeo, greenMat));
      group.add(new THREE.Mesh(strokeGeo, greenMat));

      const s = 0.20 + Math.random() * 0.55;
      group.scale.setScalar(s);

      group.position.set(
        (Math.random() - 0.5) * SPAWN_W,
        (Math.random() - 0.5) * SPAWN_H + SPAWN_H * 0.5,
        (Math.random() - 0.5) * DEPTH_RANGE
      );

      group.rotation.set(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      group.userData = {
        fallSpeed: 0.012 + Math.random() * 0.022,
        tumbleX:   (Math.random() - 0.5) * 0.022,
        tumbleY:   (Math.random() - 0.5) * 0.018,
        tumbleZ:   (Math.random() - 0.5) * 0.010,
        driftX:    (Math.random() - 0.5) * 0.004,
        spawnY:    SPAWN_H * 0.6 + Math.random() * 1.5,
        resetY:   -SPAWN_H * 0.55,
        resetX:    (Math.random() - 0.5) * SPAWN_W,
        phase:     Math.random() * Math.PI * 2,
      };

      scene.add(group);
      symbols.push(group);
    }

    let rafId;
    const clock = new THREE.Clock();

    function animate() {
      rafId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      symbols.forEach((mesh) => {
        const d = mesh.userData;
        mesh.position.y -= d.fallSpeed;
        mesh.position.x += d.driftX + Math.sin(t * 0.4 + d.phase) * 0.003;
        mesh.rotation.x += d.tumbleX;
        mesh.rotation.y += d.tumbleY;
        mesh.rotation.z += d.tumbleZ;
        if (mesh.position.y < d.resetY) {
          mesh.position.y = d.spawnY;
          mesh.position.x = d.resetX;
          mesh.position.z = (Math.random() - 0.5) * DEPTH_RANGE;
        }
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
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      dollarGeo.dispose();
      strokeGeo.dispose();
      greenMat.dispose();
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
        /* ── Section shell ── */
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
          /* own compositor layer — prevents scroll repaints */
          isolation: isolate;
        }

        /* ── 3D canvas — pointer-events off so it never blocks scroll ── */
        #process-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        /* ── Centre vignette — keeps text readable ── */
        #process::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 50%, rgba(3,3,10,0.60) 30%, transparent 100%),
            linear-gradient(to bottom,
              rgba(3,3,10,0.72) 0%,
              rgba(3,3,10,0.32) 30%,
              rgba(3,3,10,0.32) 70%,
              rgba(3,3,10,0.72) 100%
            );
          z-index: 1;
          pointer-events: none;
        }

        /* ── Foreground content ── */
        #process-inner {
          position: relative;
          z-index: 2;
          max-width: 620px;
          width: 100%;
          padding: 0 2rem;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }

        /* ── Eyebrow — cyan, matches Hero label token ── */
        .ps-eyebrow {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${ACCENT};
          text-shadow: 0 0 14px rgba(0,245,255,0.45);
          margin: 0 0 1.8rem 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        /* Decorative rule — cyan */
        .ps-eyebrow::before {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: ${ACCENT};
          box-shadow: 0 0 8px rgba(0,245,255,0.5);
          flex-shrink: 0;
        }

        /* ── H2 — Hero weight (800) + tracking (-0.03em) ── */
        .ps-h2 {
          font-weight: 800;
          font-size: clamp(2.8rem, 5vw, 4.6rem);
          line-height: 1.05;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0 0 2.2rem 0;
          text-shadow:
            0 2px 4px  rgba(0,0,0,0.95),
            0 4px 32px rgba(0,0,0,0.80);
        }
        /* Second line — dimmed white, same pattern as Hero/SecondSection */
        .ps-h2-dim {
          display: block;
          color: rgba(255,255,255,0.45);
          margin-top: 0.12em;
        }

        /* ── Accent rule below headline — cyan ── */
        .ps-rule {
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, ${ACCENT}, rgba(0,245,255,0.15), transparent);
          box-shadow: 0 0 10px rgba(0,245,255,0.35);
          border-radius: 1px;
          margin-bottom: 2.2rem;
        }

        /* ── Timeline list ── */
        .ps-timeline {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* Card — NO backdrop-filter (scroll jank source removed) */
        .ps-item {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          padding: 18px 20px;
          border: 1px solid rgba(0,245,255,0.10);
          border-radius: 14px;
          background: rgba(3,3,10,0.80);
          /* GPU-only transitions — no paint on hover */
          transition: transform 0.3s ease, border-color 0.3s ease;
          will-change: transform;
          box-sizing: border-box;
        }
        .ps-item:hover {
          transform: translateY(-3px);
          border-color: rgba(0,245,255,0.28);
        }

        /* Step badge — cyan border + text */
        .ps-step {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          border: 1px solid rgba(0,245,255,0.40);
          border-radius: 6px;
          padding: 4px 9px;
          min-width: 34px;
          text-align: center;
          flex-shrink: 0;
          margin-top: 2px;
          color: ${ACCENT};
          text-shadow: 0 0 10px rgba(0,245,255,0.40);
        }

        /* Step title — Hero body weight, full white */
        .ps-title {
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.01em;
          color: #ffffff;
          margin: 0 0 7px 0;
          line-height: 1.3;
        }

        /* Step description — Hero body token opacity (0.60) */
        .ps-desc {
          font-size: 13px;
          font-weight: 400;
          color: rgba(255,255,255,0.60);
          line-height: 1.75;
          letter-spacing: 0.005em;
          margin: 0;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          #process        { padding: 4.5rem 0; }
          #process-inner  { padding: 0 1.5rem; }
          .ps-h2          { font-size: clamp(2.2rem, 9vw, 3rem); }
          .ps-item        { padding: 14px 14px; gap: 14px; }
        }

        @media (max-width: 479px) {
          #process { padding: 4rem 0; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .ps-item { transition: none; }
        }
      `}</style>

      <section id="process">

        {/* ── 3D Background — UNTOUCHED ── */}
        <div id="process-canvas" ref={mountRef} />

        {/* ── Foreground ── */}
        <div id="process-inner">

          {/* Eyebrow */}
          <p className="ps-eyebrow">How It Works</p>

          {/* H2 — two lines matching Hero pattern */}
          <h2 className="ps-h2">
            Your Journey
            <span className="ps-h2-dim">Our Framework</span>
          </h2>

          {/* Cyan accent rule */}
          <div className="ps-rule" />

          {/* Timeline steps */}
          <div className="ps-timeline">
            {STEPS.map((t) => (
              <div key={t.step} className="ps-item">
                <div className="ps-step">{t.step}</div>
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