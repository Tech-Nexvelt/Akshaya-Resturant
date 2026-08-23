"use client";

import { memo } from "react";
import { DishImage } from "./DishImage";
import type { Offer } from "@/lib/restaurant-data";

interface OfferCardProps {
  offer: Offer;
}

export const OfferCard = memo(function OfferCard({ offer }: OfferCardProps) {
  const getBadgeStyle = (badge: string) => {
    if (badge.includes("20%") || badge.includes("15%")) {
      return "bg-red-600 text-white";
    }
    if (badge.includes("COMBO")) {
      return "bg-amber-600 text-white";
    }
    if (badge.includes("FREE")) {
      return "bg-emerald-600 text-white";
    }
    return "bg-[#2563EB] text-white";
  };

  return (
    <div
      className={`flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-[#E5E7EB] p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${offer.wash}`}
    >
      <div className="min-w-0 flex-1">
        {offer.badge && (
          <span
            className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-xs ${getBadgeStyle(
              offer.badge
            )}`}
          >
            {offer.badge}
          </span>
        )}
        <h3 className="mt-2 text-sm font-bold text-[#111827]">{offer.title}</h3>
        <p className="mt-0.5 text-xs text-[#6B7280] leading-snug">{offer.subtitle}</p>
        {offer.code && (
          <p className="mt-1.5 text-xs text-[#6B7280]">
            Use: <span className="font-mono font-bold text-[#111827]">{offer.code}</span>
          </p>
        )}
      </div>

      <DishImage
        src={offer.image}
        tint={offer.tint}
        alt={offer.title}
        className="h-20 w-20 shrink-0 shadow-xs"
      />
    </div>
  );
});
