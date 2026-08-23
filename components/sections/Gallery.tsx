"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { Lightbox } from "@/components/ui/Lightbox";
import { galleryItems, type GalleryItem } from "@/lib/data";

const spans = ["row-span-2", "", "", "row-span-2", "", ""];

export function Gallery() {
  const [selected, setSelected] = useState<GalleryItem | null>(null);

  return (
    <section id="gallery" className="relative bg-void-soft px-4 sm:px-6 py-20 sm:py-28 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.4em] text-gold">
            A Visual Journey
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-center font-display text-4xl font-medium text-ivory sm:text-5xl">
            Gallery of Excellence
          </h2>
        </Reveal>

        <div className="mt-12 sm:mt-16 grid auto-rows-[130px] grid-cols-2 gap-3 sm:auto-rows-[180px] sm:grid-cols-3 sm:gap-4 md:auto-rows-[200px]">
          {galleryItems.map((item, i) => (
            <Reveal key={item.id} delay={i * 0.06} className={spans[i]}>
              <motion.button
                layoutId={`gallery-${item.id}`}
                onClick={() => setSelected(item)}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="group relative h-full w-full overflow-hidden rounded-2xl text-left"
                style={{
                  background: `linear-gradient(150deg, ${item.tone[0]}, ${item.tone[1]}18)`,
                }}
              >
                <div className="absolute inset-0 bg-void/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div
                  aria-hidden
                  className="absolute inset-0 scale-100 opacity-40 mix-blend-overlay transition-transform duration-700 group-hover:scale-110"
                  style={{
                    background: `radial-gradient(circle at 30% 20%, ${item.tone[1]}, transparent 60%)`,
                  }}
                />
                <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 transition-all duration-500 translate-y-2 group-hover:translate-y-0 group-hover:opacity-100">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gold-bright/80">
                    {item.category}
                  </p>
                  <h3 className="mt-1 font-display text-xl text-ivory">{item.title}</h3>
                </div>
              </motion.button>
            </Reveal>
          ))}
        </div>
      </div>

      <Lightbox item={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
