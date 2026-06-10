const offerings = [
  {
    icon: "🎓",
    title: "Entrepreneur Education",
    desc: "Workshops for foundational startup knowledge to empower aspiring founders.",
  },
  {
    icon: "🏗️",
    title: "Venture Building",
    desc: "End-to-end support for idea validation, product development and go-to-market.",
  },
  {
    icon: "🏢",
    title: "Startup Infrastructure",
    desc: "Collaborative and physical innovation spaces built for modern teams.",
  },
  {
    icon: "📈",
    title: "Scaling & Consulting",
    desc: "Expert guidance for sales, marketing, and business expansion.",
  },
  {
    icon: "💰",
    title: "Capital Access",
    desc: "Connecting founders with global funding networks and venture capital.",
  },
  {
    icon: "🌍",
    title: "Global Expansion",
    desc: "Facilitating entry into international markets and attracting global capital.",
  },
];

export default function HomeSecond() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-24 text-white">
      <div className="w-full max-w-4xl">

        {/* Section label */}
        <p className="mb-3 text-center text-xs uppercase tracking-widest text-cyan-400/70">
          The Core Strategy
        </p>

        {/* Heading */}
        <h2 className="mb-4 text-center text-4xl font-normal tracking-tight text-white md:text-5xl">
          Bridging raw ideas &amp;{" "}
          <span className="text-white/40">global success.</span>
        </h2>

        {/* Subtext */}
        <p className="mx-auto mb-16 max-w-2xl text-center text-base leading-relaxed text-white/40">
          BISF is a full-stack facilitator — backed by the experience and network
          of iQue Ventures — to identify, educate, build, and scale startups into
          viable businesses on the world stage.
        </p>

        {/* Vision + Mission cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="mb-2 text-xs uppercase tracking-widest text-cyan-400/70">
              The Vision
            </p>
            <p className="text-base leading-relaxed text-white/80">
              To establish India as a dominant global startup hub by providing
              knowledge, infrastructure, and capital.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="mb-2 text-xs uppercase tracking-widest text-cyan-400/70">
              The Mission
            </p>
            <p className="text-base leading-relaxed text-white/80">
              To identify, educate, build, and scale startups through a practical,
              structured approach — transforming ideas into viable businesses.
            </p>
          </div>
        </div>

        {/* Offerings grid */}
        <p className="mb-5 text-center text-xs uppercase tracking-widest text-white/25">
          Full-Stack Facilitation
        </p>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 sm:grid-cols-2 md:grid-cols-3">
          {offerings.map((item) => (
            <div
              key={item.title}
              className="flex flex-col gap-2 bg-white/[0.03] p-6 transition-colors hover:bg-white/[0.07]"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="text-xs leading-relaxed text-white/40">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom tagline */}
        <p className="mt-10 text-center text-xs uppercase tracking-widest text-white/20">
          Guided by a panel of industry experts and business strategists
        </p>
      </div>
    </section>
  );
}