import { ArrowUpRight } from "lucide-react";

const heroStyles = `
  *, *::before, *::after { box-sizing: border-box; }
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:#000510}
  ::-webkit-scrollbar-thumb{background:rgba(80,120,255,0.3);border-radius:2px}
  ::selection{background:rgba(80,120,255,0.3);color:#fff}
`;

export default function Hero() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: heroStyles }} />
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden text-white">
        <div className="relative z-20 mx-auto max-w-4xl px-4 text-center sm:px-6">

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-cyan-300 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            Led by CEO Jirlo Jayan · Backed by iQue Ventures
          </div>

          {/* Heading */}
          <h1 className="mb-6 bg-gradient-to-b from-red-200 via-blue-200 to-white bg-clip-text text-5xl font-normal leading-[1.1] tracking-tighter text-transparent md:text-6xl">
            Bharath Innovations &amp; Startups Facilitator
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-gray-400">
            A Full-Stack Startup Facilitator – Building India's Next Generation
            of Entrepreneurs. Bridging the gap between raw ideas and global success.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="#services"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur-md"
            >
              Explore Services
              <ArrowUpRight size={18} />
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-transparent px-6 py-3 text-base text-gray-400"
            >
              Connect with Us
              <ArrowUpRight size={16} className="opacity-60" />
            </a>
          </div>

          {/* Stats / Pillars */}
          <div className="mt-16 grid grid-cols-1 gap-px rounded-2xl border border-white/10 bg-white/5 p-1 shadow-[0_0_80px_rgba(80,120,255,0.15)] backdrop-blur-sm sm:grid-cols-3">
            {[
              {
                label: "Educate & Empower",
                desc: "Workshops for foundational startup knowledge",
              },
              {
                label: "Capital Access",
                desc: "Connecting founders with global funding networks",
              },
              {
                label: "Global Expansion",
                desc: "Facilitating entry into international markets",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center rounded-xl border border-white/5 bg-[#0a0f1e] px-6 py-8 gap-2"
              >
                <p className="text-sm font-medium text-cyan-300">{item.label}</p>
                <p className="text-xs text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Tagline */}
          <p className="mt-8 text-xs uppercase tracking-widest text-white/20">
            Empower · Scale · Connect — Bangalore, India
          </p>
        </div>
      </section>
    </>
  );
}