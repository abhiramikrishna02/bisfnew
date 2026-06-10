import { ArrowUpRight } from "lucide-react";

const stats = [
  { value: "6+", label: "Core Services" },
  { value: "1", label: "Venture Backer" },
  { value: "∞", label: "Founders Supported" },
  { value: "🌍", label: "Global Reach" },
];

const reasons = [
  {
    icon: "⚙️",
    title: "iQue Ventures Backbone",
    desc: "Built on the foundation of iQue Ventures — bringing proven venture-building experience, strategic consulting, and a powerful investor network to every startup we support.",
  },
  {
    icon: "🧭",
    title: "Structured Approach",
    desc: "A practical, step-by-step methodology — from idea validation and product development all the way to scaling, fundraising, and international market entry.",
  },
  {
    icon: "🤝",
    title: "Expert Panel",
    desc: "Guided by a curated panel of industry experts and business strategists who ensure market access, product-market fit, and sustainable growth at every stage.",
  },
  {
    icon: "🚀",
    title: "End-to-End Support",
    desc: "From co-working spaces and workshops to capital connections and global expansion — BISF handles the full stack so founders can focus on building.",
  },
];

const journey = [
  { phase: "Identify", desc: "Spot high-potential founders and ideas across India." },
  { phase: "Educate", desc: "Equip them with startup fundamentals and business skills." },
  { phase: "Build", desc: "Validate ideas and develop products with expert support." },
  { phase: "Scale", desc: "Grow revenue, team, and market presence." },
  { phase: "Connect", desc: "Unlock global capital and international markets." },
];

export default function HomeFourth() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-white">
      <div className="w-full max-w-4xl">

        {/* Section label */}
        <p className="mb-3 text-center text-xs uppercase tracking-widest text-cyan-400/70">
          Why BISF
        </p>

        {/* Heading */}
        <h2 className="mb-4 text-center text-4xl font-normal tracking-tight text-white md:text-5xl">
          India's next startup hub{" "}
          <span className="text-white/30">starts here.</span>
        </h2>

        <p className="mx-auto mb-16 max-w-xl text-center text-base leading-relaxed text-white/40">
          A full-stack ecosystem engineered to take a raw idea from zero to
          global — backed by capital, expertise, and the iQue Ventures network.
        </p>

        {/* Stats row */}
        <div className="mb-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 sm:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center gap-1 bg-white/[0.04] px-4 py-7"
            >
              <span className="text-3xl font-light text-white">{s.value}</span>
              <span className="text-xs uppercase tracking-widest text-white/30">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Reasons grid */}
        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-colors hover:bg-white/[0.07]"
            >
              <span className="mb-3 block text-2xl">{r.icon}</span>
              <p className="mb-2 text-sm font-medium text-white">{r.title}</p>
              <p className="text-xs leading-relaxed text-white/40">{r.desc}</p>
            </div>
          ))}
        </div>

        {/* Startup journey timeline */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
          <p className="mb-6 text-xs uppercase tracking-widest text-cyan-400/70">
            The BISF Journey
          </p>
          <div className="flex flex-col gap-0">
            {journey.map((j, i) => (
              <div key={j.phase} className="flex items-start gap-4">
                {/* Timeline spine */}
                <div className="flex flex-col items-center">
                  <div className="h-2.5 w-2.5 rounded-full border border-cyan-400/60 bg-cyan-400/20 mt-1" />
                  {i < journey.length - 1 && (
                    <div className="w-px flex-1 bg-white/10 my-1 min-h-[2rem]" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-6">
                  <p className="text-sm font-medium text-white">{j.phase}</p>
                  <p className="text-xs leading-relaxed text-white/40">{j.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="mailto:info@bisf-india.com"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-md hover:bg-white/15 transition-colors"
          >
            Join the Ecosystem
            <ArrowUpRight size={15} />
          </a>
          <a
            href="https://www.linkedin.com/company/bisf-ventures/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-transparent px-6 py-3 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            Learn about iQue Ventures
            <ArrowUpRight size={14} className="opacity-60" />
          </a>
        </div>

      </div>
    </section>
  );
}