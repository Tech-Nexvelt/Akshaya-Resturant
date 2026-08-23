"use client";

import dynamic from "next/dynamic";
import { HeroOverlay } from "./HeroOverlay";
import { Loader } from "@/components/ui/Loader";

const Beams = dynamic(() => import("./Beams").then((m) => m.Beams), {
  ssr: false,
  loading: () => <Loader />,
});

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden bg-void">
      <div className="absolute inset-0">
        <Beams
          beamWidth={2.2}
          beamHeight={18}
          beamNumber={14}
          lightColor="#e8c37e"
          speed={1.2}
          noiseIntensity={1.6}
          scale={0.18}
          rotation={20}
        />
      </div>
      <div className="vignette" />
      <HeroOverlay />
    </section>
  );
}
