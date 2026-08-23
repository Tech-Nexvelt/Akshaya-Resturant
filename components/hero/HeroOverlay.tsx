"use client";

import { motion } from "framer-motion";
import { brand } from "@/lib/data";
import { ServicePickerTiles } from "./ServicePickerTiles";

export function HeroOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="mb-5 text-[11px] font-medium uppercase tracking-[0.45em] text-gold-bright/80"
      >
        Siddipet&rsquo;s Finest &middot; Since {brand.since}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="font-display text-5xl font-medium leading-[1.05] text-ivory sm:text-6xl md:text-7xl lg:text-8xl"
      >
        A Legacy of
        <br />
        <span className="text-gold-gradient italic">Flavor</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 max-w-md text-sm font-light tracking-wide text-smoke sm:text-base"
      >
        Authentic Telangana dining, crafted since {brand.since}, in the heart of {brand.location}.
      </motion.p>

      {/* 3-Service Picker Header */}
      <ServicePickerTiles />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-smoke/70"
      >
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-gold/60 to-transparent" />
        Scroll
      </motion.div>
    </div>
  );
}
