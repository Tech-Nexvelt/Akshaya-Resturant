"use client";

import React from "react";
import Link from "next/link";
import { Tag, Utensils } from "lucide-react";
import type { Offer } from "@/lib/restaurant-data";
import { OfferCard } from "@/components/restaurant/OfferCard";

interface OffersGridProps {
  offers: Offer[];
}

export function OffersGrid({ offers }: OffersGridProps) {
  if (offers.length === 0) {
    return (
      <div className="w-full my-12 p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2563EB] flex items-center justify-center shadow-xs">
          <Tag className="w-8 h-8" />
        </div>
        <div className="max-w-md">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            No active offers right now
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Check back soon for new promo codes, seasonal discounts, and special combo deals!
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/restaurant#menu"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
          >
            <Utensils className="w-4 h-4" />
            <span>Explore Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} />
      ))}
    </div>
  );
}
