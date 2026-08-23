import { memo } from "react";
import { ArrowRight } from "lucide-react";
import { DishImage } from "./DishImage";
import { galleryShots } from "@/lib/restaurant-data";

export const GalleryStrip = memo(function GalleryStrip() {
  return (
    <section id="gallery" className="scroll-mt-20 bg-white py-14 border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Gallery</p>
            <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              From Our Kitchen
            </h2>
          </div>

          <a
            href="#gallery"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            View Gallery
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
          {galleryShots.map((s) => (
            <li key={s.id}>
              <DishImage
                src={s.image}
                tint={s.tint}
                alt={s.alt}
                className="aspect-[4/3] w-full rounded-xl shadow-xs transition-all duration-200 hover:shadow-md hover:scale-[1.03]"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});
