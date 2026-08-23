import { memo } from "react";
import { ArrowRight } from "lucide-react";
import { DishImage } from "@/components/restaurant/DishImage";
import { cateringGalleryShots } from "@/lib/catering-data";

export const CateringGallery = memo(function CateringGallery() {
  return (
    <section id="contact-gallery" className="bg-white py-14 border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Our Gallery</p>
          </div>

          <a
            href="#overview"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
          >
            View Full Gallery
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {cateringGalleryShots.map((s) => (
            <li key={s.id}>
              <DishImage
                src={s.image}
                tint="from-slate-100 to-slate-200"
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
