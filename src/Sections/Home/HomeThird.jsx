import { ArrowUpRight } from "lucide-react";

const pillars = [
  {
    step: "01",
    title: "Empower",
    desc: "Equipping founders with the knowledge, tools, and mentorship to turn ideas into businesses.",
    color: "text-cyan-400",
  },
  {
    step: "02",
    title: "Scale",
    desc: "Providing infrastructure, consulting, and capital access to grow startups from local to global.",
    color: "text-blue-400",
  },
  {
    step: "03",
    title: "Connect",
    desc: "Linking India's brightest entrepreneurs to international markets, investors, and partners.",
    color: "text-indigo-400",
  },
];

const contactItems = [
  {
    icon: "📧",
    label: "Email",
    value: "info@bisf-india.com",
    href: "mailto:info@bisf-india.com",
  },
  {
    icon: "📞",
    label: "Phone",
    value: "+91 90361 54395",
    href: "tel:+919036154395",
  },
  {
    icon: "📍",
    label: "Location",
    value: "Bangalore, India",
    href: null,
  },
];

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/bisf.ventures",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/bisf-ventures/",
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1FV3hKDa2c/",
  },
];

export default function HomeThird() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-white">
      <div className="w-full max-w-4xl">

        {/* Section label */}
        <p className="mb-3 text-center text-xs uppercase tracking-widest text-cyan-400/70">
          Connecting India to the World
        </p>

        {/* Heading */}
        <h2 className="mb-4 text-center text-4xl font-normal tracking-tight text-white md:text-5xl">
          Empower.{" "}
          <span className="text-white/40">Scale.</span>{" "}
          <span className="text-white/20">Connect.</span>
        </h2>

        <p className="mx-auto mb-16 max-w-xl text-center text-base leading-relaxed text-white/40">
          Bharath Innovations & Startups Facilitator LLP — strengthening India's
          global position in the startup ecosystem, one founder at a time.
        </p>

        {/* Three pillars */}
        <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {pillars.map((p) => (
            <div
              key={p.step}
              className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-6"
            >
              <p className={`mb-3 text-3xl font-light ${p.color}`}>{p.step}</p>
              <p className="mb-2 text-base font-medium text-white">{p.title}</p>
              <p className="text-xs leading-relaxed text-white/40">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Contact + CTA row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* Contact details */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="mb-5 text-xs uppercase tracking-widest text-cyan-400/70">
              Get in touch
            </p>
            <div className="flex flex-col gap-4">
              {contactItems.map((c) => (
                <div key={c.label} className="flex items-center gap-3">
                  <span className="text-lg">{c.icon}</span>
                  <div>
                    <p className="text-xs text-white/30">{c.label}</p>
                    {c.href ? (
                      <a
                        href={c.href}
                        className="text-sm text-white/80 hover:text-cyan-300 transition-colors"
                      >
                        {c.value}
                      </a>
                    ) : (
                      <p className="text-sm text-white/80">{c.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="mt-6 flex gap-3 border-t border-white/10 pt-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 hover:text-cyan-300 hover:border-cyan-400/30 transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* CTA card */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <div>
              <p className="mb-5 text-xs uppercase tracking-widest text-cyan-400/70">
                Join the ecosystem
              </p>
              <p className="mb-3 text-xl font-normal leading-snug text-white">
                Scaling India's potential starts with you.
              </p>
              <p className="text-sm leading-relaxed text-white/40">
                Whether you're a founder, investor, or institution — BISF's
                full-stack ecosystem is built for Bharath's next chapter.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:info@bisf-india.com"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-md hover:bg-white/15 transition-colors"
              >
                Send Inquiry
                <ArrowUpRight size={15} />
              </a>
              <a
                href="https://www.linkedin.com/company/bisf-ventures/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-5 py-3 text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                Follow on LinkedIn
                <ArrowUpRight size={14} className="opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer line */}
        <p className="mt-12 text-center text-xs text-white/15">
          © 2026 Bharath Innovations & Startups Facilitator LLP · A venture backed by iQue Ventures
        </p>
      </div>
    </section>
  );
}