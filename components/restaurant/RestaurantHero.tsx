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

              <h1 className="mt-4 font-serif text-3xl font-bold leading-[1.12] tracking-tight text-[#111827] sm:text-4xl lg:text-5xl">
                A Legacy of Flavor
                <br />
                Served Fresh Daily
              </h1>

              <p className="mt-4 max-w-md text-xs sm:text-sm leading-relaxed text-[#6B7280]">
                Hand-picked spices, time-honored recipes, and signature Telangana biryanis.
                Dine in or order directly for fast delivery.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#menu"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-[#1D4ED8] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  <ShoppingBag className="h-4 w-4" aria-hidden="true" />
                  <span>Order Online Now &rarr;</span>
                </a>
                <div className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#BFDBFE] bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-[#2563EB]">
                  <span>&bull;</span>
                  <span>Fast Delivery &bull; 30&ndash;40 min</span>
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
