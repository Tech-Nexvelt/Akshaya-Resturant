"use client";

import { memo } from "react";
import { Check, Utensils, Edit3, ShieldCheck, UserCheck } from "lucide-react";
import { cateringPackages, cateringPills } from "@/lib/catering-data";

const pillIcons: Record<string, typeof Utensils> = {
  Utensils,
  Edit3,
  ShieldCheck,
  UserCheck,
};

export const CateringPackages = memo(function CateringPackages() {
  return (
    <section id="packages" className="scroll-mt-20 bg-[#F9FAFB] py-14 border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          Our Catering Packages
        </p>
        <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
          Packages for Every Celebration
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
          Delicious food, perfect portions, memorable moments.
        </p>

        {/* 3-Column Packages Grid */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
          {cateringPackages.map((pkg) => {
            const isPopular = Boolean(pkg.isPopular);
            return (
              <div
                key={pkg.id}
                className={`relative flex flex-col justify-between rounded-xl p-6 transition-all duration-200 ${
                  isPopular
                    ? "border-2 border-[#2563EB] bg-white shadow-md hover:shadow-lg scale-[1.02]"
                    : "border border-[#E5E7EB] bg-white shadow-xs hover:shadow-md"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#2563EB] px-4 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-xs">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold text-[#111827]">{pkg.title}</h3>
                  <p className="mt-0.5 text-xs text-[#6B7280]">{pkg.subtitle}</p>

                  {/* Price */}
                  <div className="my-5 flex items-baseline justify-center gap-1">
                    <span className="font-display text-3xl sm:text-4xl font-bold text-[#2563EB] tabular-nums">
                      ₹{pkg.price}
                    </span>
                    <span className="text-xs text-[#6B7280] font-medium">/ per plate</span>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2.5 text-left text-xs sm:text-sm text-[#374151] border-t border-[#F3F4F6] pt-4">
                    {pkg.features.map((feat) => (
                      <li key={feat} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <a
                    href="#enquiry-form"
                    className={`flex w-full min-h-[44px] items-center justify-center rounded-xl px-5 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 ${
                      isPopular
                        ? "bg-[#2563EB] text-white shadow-md hover:bg-[#1D4ED8]"
                        : "border border-[#BFDBFE] bg-white text-[#2563EB] hover:bg-[#EFF6FF]"
                    }`}
                  >
                    Select Package
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Pills Strip */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {cateringPills.map((pill) => {
            const Icon = pillIcons[pill.icon] || Utensils;
            return (
              <div
                key={pill.label}
                className="flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-semibold text-[#111827] shadow-2xs"
              >
                <Icon className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                <span>{pill.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
