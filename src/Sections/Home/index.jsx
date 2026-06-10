"use client";

import ColorBends from "@/components/ColorBends";
import Hero from "./Hero";
import HomeFinal from "./HomeFinal";
import HomeFourth from "./HomeFourth";
import HomeSecond from "./HomeSecond";
import HomeThird from "./HomeThird";

export default function Home() {
  return (
    <main className="relative isolate overflow-hidden bg-[#030510]">
      <div className="fixed inset-0 -z-20">
        <ColorBends
          className="h-full w-full"
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={90}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={0.6}
          noise={0.12}
          parallax={0.35}
          iterations={2}
          intensity={1.35}
          bandWidth={6}
          transparent={false}
        />
      </div>
      <div className="fixed inset-0 -z-10 bg-black/45" />

      <div className="relative z-10">
        <Hero />
        <HomeSecond />
        <HomeThird />
        <HomeFourth />
        <HomeFinal />
      </div>
    </main>
  );
}
