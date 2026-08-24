import { ShoppingBag, ChevronDown, BadgeCheck } from "lucide-react";
import { heroImage } from "@/lib/restaurant-data";

export function RestaurantHero() {
  return (
    <section id="home" className="scroll-mt-20 bg-[#F9FAFB] pt-6 pb-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-br from-[#EFF6FF] via-[#F5F9FF] to-[#E0ECFF] shadow-xs">
          <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.05fr]">
            <div className="px-6 py-10 sm:px-10 sm:py-12 lg:py-16">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563EB]">
                <span>AUTHENTIC MULTI-CUISINE &middot; SINCE 2007</span>
              </p>

              <h1 className="mt-3 md:mt-4 font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.15] tracking-tight text-[#111827]">
                A Legacy of Flavor
                <br />
                Served Fresh Daily
              </h1>

              <p className="mt-3 md:mt-4 max-w-md text-xs sm:text-sm md:text-base leading-relaxed text-[#6B7280]">
                Hand-picked spices, time-honored recipes, and signature Telangana biryanis.
                Dine in or order directly for takeaway & dining.
              </p>

              <div className="mt-5 md:mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <a
                  href="#menu"
                  className="inline-flex h-10 md:h-12 items-center justify-center gap-2 rounded-lg md:rounded-xl bg-[#2563EB] px-4 md:px-6 text-sm md:text-base font-bold text-white shadow-md transition-all hover:bg-[#1D4ED8] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
                  <span>Order Online Now &rarr;</span>
                </a>
                <div className="inline-flex h-10 md:h-12 items-center justify-center gap-1.5 rounded-lg md:rounded-xl border border-[#BFDBFE] bg-white px-3 md:px-4 text-xs md:text-sm font-semibold text-[#2563EB]">
                  <span>&bull;</span>
                  <span>Dine-In &bull; Takeaway &bull; Pickup</span>
                </div>
              </div>
            </div>

            <div className="relative flex flex-col items-center justify-center p-4 lg:p-6">
              <div className="relative h-56 w-full sm:h-72 lg:h-[340px] overflow-hidden rounded-xl">
                <img
                  src={heroImage.src}
                  alt={heroImage.alt}
                  fetchPriority="high"
                  decoding="async"
                  draggable={false}
                  className="h-full w-full object-cover rounded-xl"
                />
              </div>
              {/* Carousel Dots */}
              <div className="mt-3 flex items-center justify-center gap-1.5" aria-hidden="true">
                <span className="h-2 w-6 rounded-full bg-[#2563EB]" />
                <span className="h-2 w-2 rounded-full bg-[#D1D5DB]" />
                <span className="h-2 w-2 rounded-full bg-[#D1D5DB]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
