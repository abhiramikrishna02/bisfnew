import { ArrowUpRight } from "lucide-react";

const navLinks = [
  { label: "Vision", href: "#vision" },
  { label: "Services", href: "#services" },
  { label: "Connect", href: "#connect" },
];

const companyLinks = [
  { label: "About", href: "#" },
  { label: "Advisory Board", href: "#" },
  { label: "Global Presence", href: "#" },
];

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/bisf.ventures" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/bisf-ventures/" },
  { label: "Facebook", href: "https://www.facebook.com/share/1FV3hKDa2c/" },
];

export default function HomeFinal() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-white">
      <div className="w-full max-w-4xl">

        {/* Final CTA block */}
        <div className="relative mb-20 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] px-8 py-16 text-center sm:px-16">

          {/* Ambient glow ring */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/10"
            style={{ width: 520, height: 520 }}
          />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/5"
            style={{ width: 720, height: 720 }}
          />

          <p className="mb-4 text-xs uppercase tracking-widest text-cyan-400/70">
            Bharath Innovations & Startups Facilitator
          </p>

          <h2 className="mb-6 text-4xl font-normal leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
            Ready to build{" "}
            <span className="text-white/30">India's next</span>
            <br />
            global success story?
          </h2>

          <p className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-white/40">
            Join the full-stack ecosystem built for Bharath. Whether you're a
            first-time founder or a seasoned builder — BISF is your launchpad
            to the world.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="mailto:info@bisf-india.com"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-md hover:bg-white/15 transition-colors"
            >
              Send an Inquiry
              <ArrowUpRight size={15} />
            </a>
            <a
              href="tel:+919036154395"
              className="inline-flex items-center gap-2 rounded-xl border border-transparent px-7 py-3.5 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              +91 90361 54395
              <ArrowUpRight size={14} className="opacity-60" />
            </a>
          </div>

          {/* Contact strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-white/[0.06] pt-8 text-xs text-white/25">
            <span>📧 info@bisf-india.com</span>
            <span>📍 Bangalore, India</span>
            <span>🤝 Backed by iQue Ventures</span>
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-1 gap-10 border-t border-white/[0.06] pt-12 sm:grid-cols-3">

          {/* Brand */}
          <div>
            <p className="mb-3 text-sm font-medium text-white">BISF</p>
            <p className="mb-4 text-xs leading-relaxed text-white/30">
              Strengthening India's global position in the startup ecosystem.
            </p>
            <div className="flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/40 hover:text-cyan-300 hover:border-cyan-400/30 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="mb-4 text-xs uppercase tracking-widest text-white/25">
              Explore
            </p>
            <ul className="flex flex-col gap-2.5">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="mb-4 text-xs uppercase tracking-widest text-white/25">
              Company
            </p>
            <ul className="flex flex-col gap-2.5">
              {companyLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-white/15 sm:flex-row">
          <p>© 2026 Bharath Innovations & Startups Facilitator LLP</p>
          <p>A Venture Backed by iQue Ventures</p>
        </div>

      </div>
    </section>
  );
}