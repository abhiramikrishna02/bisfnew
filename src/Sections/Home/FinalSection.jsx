"use client";

// ─── Final Section: Contact + Footer ─────────────────────────────────────────
// Fully self-contained. Replace this file freely — no other section is affected.

export default function FinalSection() {
  return (
    <>
      <section id="contact" style={S.section}>
        <div style={S.inner}>
          <p style={S.eyebrow}>● Let's Begin</p>
          <h2 style={S.h2}>
            Ready to Build{" "}
            <span style={S.h2dim}>Something Real?</span>
          </h2>
          <p style={S.body}>
            Join hundreds of founders who turned bold ideas into global ventures.
          </p>
          <div style={S.ctas}>
            <a href="#" style={S.ctaPrimary}>Apply for Mentorship</a>
            <a href="#" style={{ ...S.ctaPrimary, color: "#ff2ebe", borderColor: "#ff2ebe" }}>
              Talk to Us
            </a>
          </div>
          <p style={S.geo}>Bangalore · Mumbai · Singapore · London</p>
        </div>
      </section>

      <footer style={S.footer}>
        <span>BISF</span>
        <span>2026</span>
      </footer>
    </>
  );
}

// ─── Section-local styles ─────────────────────────────────────────────────────
const S = {
  section: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    background: "#03030a",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    padding: "6rem 0",
  },
  inner: {
    maxWidth: 620,
    width: "100%",
    padding: "0 2rem",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    marginBottom: "1.4rem",
    display: "block",
    color: "#ff2ebe",
  },
  h2: {
    fontSize: "clamp(1.8rem, 4vw, 3rem)",
    fontWeight: 200,
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
    marginBottom: "1rem",
    marginTop: 0,
    color: "#fff",
  },
  h2dim: {
    display: "block",
    color: "rgba(255,255,255,0.2)",
    fontWeight: 100,
  },
  body: {
    fontSize: "clamp(0.8rem, 1.4vw, 0.9rem)",
    color: "rgba(255,255,255,0.3)",
    maxWidth: 420,
    margin: "0 0 2rem",
    lineHeight: 1.9,
  },
  ctas: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  ctaPrimary: {
    display: "inline-flex",
    alignItems: "center",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.13)",
    color: "#fff",
    fontSize: 12,
    padding: "11px 26px",
    borderRadius: 9,
    cursor: "pointer",
    textDecoration: "none",
    letterSpacing: "0.05em",
  },
  geo: {
    marginTop: "1.8rem",
    fontSize: 9,
    letterSpacing: "0.2em",
    color: "rgba(255,255,255,0.1)",
    textTransform: "uppercase",
  },
  footer: {
    width: "100%",
    padding: "1.5rem 2rem",
    borderTop: "1px solid rgba(255,255,255,0.04)",
    background: "rgba(3,3,10,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 9,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.14)",
  },
};