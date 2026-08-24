"use client";

import React, { memo, useState } from "react";
import { Copy, Check, Tag, Clock } from "lucide-react";
import { DishImage } from "./DishImage";
import type { Offer } from "@/lib/restaurant-data";

interface OfferCardProps {
  offer: Offer;
}

export const OfferCard = memo(function OfferCard({ offer }: OfferCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (offer.code) {
      navigator.clipboard.writeText(offer.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getBadgeStyle = (badge: string) => {
    if (badge.includes("20%") || badge.includes("25%") || badge.includes("OFF")) {
      return "bg-[#2563EB] text-white";
    }
    if (badge.includes("15%") || badge.includes("COMBO")) {
      return "bg-amber-600 text-white";
    }
    if (badge.includes("FREE") || badge.includes("COMPLIMENTARY")) {
      return "bg-emerald-600 text-white";
    }
    return "bg-slate-800 text-white";
  };

  const formatExpiry = (expiryDateStr?: string) => {
    if (!expiryDateStr) return null;
    const expiry = new Date(expiryDateStr);
    if (isNaN(expiry.getTime())) return null;

    const diffDays = Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Expired";
    if (diffDays <= 7) return `Expires in ${diffDays} day${diffDays > 1 ? "s" : ""}`;

    return `Valid until ${expiry.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })}`;
  };

  const expiryText = formatExpiry(offer.expiry_date);

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5E7EB] p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-blue-200 ${
        offer.wash || "bg-white"
      }`}
    >
      {/* Top Banner Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-block rounded-lg px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-xs ${getBadgeStyle(
              offer.badge
            )}`}
          >
            {offer.badge}
          </span>

          {offer.type && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 capitalize border border-slate-200">
              <Tag className="w-2.5 h-2.5" />
              <span>{offer.type.replace("-", " ")}</span>
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors leading-snug">
              {offer.title}
            </h3>
            <p className="mt-1 text-xs text-[#6B7280] font-medium leading-relaxed">
              {offer.subtitle}
            </p>
          </div>

          <DishImage
            src={offer.image}
            tint={offer.tint}
            alt={offer.title}
            className="h-16 w-16 rounded-xl shrink-0 shadow-xs border border-white"
          />
        </div>

        {offer.description && (
          <p className="mt-3 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {offer.description}
          </p>
        )}
      </div>

      {/* Footer Area: Code & Copy CTA */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        {offer.code ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[11px] text-slate-400 font-medium shrink-0">Code:</span>
            <code className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-900 tracking-wide truncate">
              {offer.code}
            </code>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            {expiryText && (
              <>
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{expiryText}</span>
              </>
            )}
          </div>
        )}

        {offer.code ? (
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
              copied
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-blue-50 text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
            }`}
            title="Copy promo code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Use Code</span>
              </>
            )}
          </button>
        ) : null}
      </div>
    </div>
  );
});
