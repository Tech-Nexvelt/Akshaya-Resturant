"use client";

import dynamic from "next/dynamic";

const LightPillar = dynamic(() => import("@/components/ui/LightPillar"), {
  ssr: false,
});

export function HeroBeamsBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {/* WebGL LightPillar Core Shader */}
      <LightPillar
        topColor="#60A5FA"
        bottomColor="#3B82F6"
        intensity={2.5}
        rotationSpeed={0.5}
        glowAmount={0.03}
        pillarWidth={5}
        pillarHeight={1}
        noiseIntensity={0.5}
        pillarRotation={0}
        interactive={false}
        mixBlendMode="screen"
        quality="medium"
      />

      {/* Ambient Pulsing Light Beams */}
      <div className="absolute left-1/2 top-0 h-full w-[400px] -translate-x-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent blur-[120px] opacity-70 animate-pulse" />
      <div className="absolute left-1/3 top-0 h-full w-[300px] bg-gradient-to-b from-transparent via-blue-400/20 to-transparent blur-[140px] opacity-60 animate-pulse delay-200" />
    </div>
  );
}
