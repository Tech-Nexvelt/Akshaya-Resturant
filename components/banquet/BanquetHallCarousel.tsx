"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const halls = [
  { id: "mandap", src: "/banquet/hall-1-mandap.png", alt: "Traditional Indian wedding mandap stage backdrop in deep red and gold" },
  { id: "lounge", src: "/banquet/hall-2-lounge.png", alt: "Modern black-and-gold banquet hall with curved sofa lounge seating" },
  { id: "dinner", src: "/banquet/hall-3-dinner.png", alt: "Formal gala dinner setup with gold charger plates and crystal chandeliers" },
  { id: "violet", src: "/banquet/hall-4-violet.png", alt: "Evening reception setup with rich violet mood uplighting" },
];

export function BanquetHallCarousel() {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  function scrollTo(idx: number) {
    const clamped = Math.max(0, Math.min(idx, halls.length - 1));
    setActive(clamped);
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[clamped] as HTMLElement;
    if (child) {
      el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
    }
  }

  return (
    <section id="halls" className="mt-14 md:mt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-6">
        Our Halls
      </h2>

      <div className="relative group">
        {/* Prev Arrow Button */}
        <button
          onClick={() => scrollTo(active - 1)}
          disabled={active === 0}
          aria-label="Previous hall"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -ml-3 sm:-ml-5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-[#111827] shadow-md hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* 4 Cards Track */}
        <div
          ref={scrollRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto scrollbar-none snap-x-tabs py-1"
        >
          {halls.map((hall, idx) => (
            <div
              key={hall.id}
              onClick={() => setActive(idx)}
              className={`relative flex-shrink-0 sm:flex-shrink rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
                idx === active
                  ? "ring-2 ring-[#2563EB] shadow-md scale-[1.01]"
                  : "opacity-90 hover:opacity-100 hover:shadow-md"
              }`}
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={hall.src}
                  alt={hall.alt}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Next Arrow Button */}
        <button
          onClick={() => scrollTo(active + 1)}
          disabled={active === halls.length - 1}
          aria-label="Next hall"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 -mr-3 sm:-mr-5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-[#111827] shadow-md hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Pagination Dots (active dot = elongated blue pill) */}
      <div className="mt-6 flex justify-center items-center gap-2">
        {halls.map((_, idx) => (
          <button
            key={idx}
            onClick={() => scrollTo(idx)}
            aria-label={`Go to hall ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === active ? "w-7 bg-[#2563EB]" : "w-2 bg-[#D1D5DB] hover:bg-[#9CA3AF]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

