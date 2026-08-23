"use client";

import { memo, useState } from "react";
import { Users, ChevronDown } from "lucide-react";

export const CateringHero = memo(function CateringHero() {
  const [guests, setGuests] = useState("");

  return (
    <section id="overview" className="scroll-mt-20 bg-[#F9FAFB] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          {/* Left Content */}
          <div className="flex flex-col items-start">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#2563EB]">
              EXCEPTIONAL TASTE. MEMORABLE EXPERIENCES.
            </p>

            <h1 className="mt-3 font-display text-3xl font-bold leading-[1.12] tracking-tight text-[#111827] sm:text-4xl lg:text-5xl">
              Delicious Catering
              <br />
              for Every Occasion
            </h1>

            <p className="mt-3 text-xs sm:text-sm font-medium text-[#6B7280]">
              Weddings • Corporate Events • Parties • Outdoor Catering
            </p>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#packages"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#2563EB] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-[#1D4ED8] active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                View Packages
              </a>
              <a
                href="#enquiry-form"
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-[#BFDBFE] bg-white px-6 py-3 text-xs sm:text-sm font-bold text-[#2563EB] shadow-2xs transition-all hover:bg-[#EFF6FF] active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                Enquire Now
              </a>
            </div>

            {/* Guest Selector Dropdown */}
            <div className="mt-6 w-full max-w-xs rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280]">
                <Users className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                <span>Number of Guests</span>
              </div>
              <div className="relative mt-1.5">
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full appearance-none rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] py-2 pl-3 pr-8 text-xs font-bold text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] cursor-pointer"
                  aria-label="Select guest count"
                >
                  <option value="">Select guests</option>
                  <option value="50-100">50 - 100 Guests</option>
                  <option value="100-250">100 - 250 Guests</option>
                  <option value="250-500">250 - 500 Guests</option>
                  <option value="500+">500+ Guests</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm aspect-[4/3] lg:aspect-auto lg:h-[380px]">
            <img
              src="/Images/catering/hero-buffet.png"
              alt="Delicious catering buffet spread with chafing dishes"
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </div>
        </div>
      </div>
    </section>
  );
});
