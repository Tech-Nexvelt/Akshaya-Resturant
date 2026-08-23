"use client";

import { memo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DishImage } from "@/components/restaurant/DishImage";
import { cateringCategories } from "@/lib/catering-data";

export const CateringMenuPreview = memo(function CateringMenuPreview() {
  const [scrollIndex, setScrollIndex] = useState(0);

  const prev = () => setScrollIndex((i) => Math.max(0, i - 1));
  const next = () => setScrollIndex((i) => Math.min(cateringCategories.length - 1, i + 1));

  return (
    <section id="menu-preview" className="scroll-mt-20 bg-white py-14 border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Menu Preview</p>
        <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
          A Glimpse of Our Flavors
        </h2>

        {/* Carousel / Row */}
        <div className="relative mt-8 flex items-center">
          <button
            onClick={prev}
            disabled={scrollIndex === 0}
            aria-label="Previous menu categories"
            className="absolute left-0 z-10 -ml-2 sm:-ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] shadow-sm transition-all hover:bg-[#2563EB] hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 w-full">
            {cateringCategories.map((cat) => (
              <div
                key={cat.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <DishImage
                    src={cat.image}
                    tint={cat.tint}
                    alt={cat.title}
                    rounded="rounded-none"
                    className="h-full w-full"
                  />
                </div>
                <div className="p-3.5">
                  <h3 className="text-sm font-bold text-[#111827]">{cat.title}</h3>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{cat.count}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={next}
            disabled={scrollIndex === cateringCategories.length - 1}
            aria-label="Next menu categories"
            className="absolute right-0 z-10 -mr-2 sm:-mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] shadow-sm transition-all hover:bg-[#2563EB] hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
});
