"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Filter, ArrowUpDown } from "lucide-react";
import type { Offer } from "@/lib/restaurant-data";
import { getActiveOffers } from "@/lib/restaurant-data";
import { OffersGrid } from "./OffersGrid";

interface OffersPageClientProps {
  initialOffers: Offer[];
}

type FilterType = "all" | "dine-in" | "takeaway";
type SortType = "recommended" | "discount" | "expiry";

export function OffersPageClient({ initialOffers }: OffersPageClientProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("recommended");

  // 1. FILTERING LOGIC: Filter active & valid expiry date
  const activeOffers = useMemo(() => {
    return getActiveOffers(initialOffers);
  }, [initialOffers]);

  // 2. TYPE FILTERING + SORTING LOGIC
  const processedOffers = useMemo(() => {
    let result = activeOffers;

    // Filter by Service Type
    if (filter !== "all") {
      result = result.filter(
        (offer) => offer.type === filter || offer.type === "general"
      );
    }

    // Sort Offers
    result = [...result].sort((a, b) => {
      if (sortBy === "discount") {
        return (b.discountValue || 0) - (a.discountValue || 0);
      }
      if (sortBy === "expiry") {
        const dateA = new Date(a.expiry_date).getTime();
        const dateB = new Date(b.expiry_date).getTime();
        return dateA - dateB;
      }
      return 0; // recommended / default
    });

    return result;
  }, [activeOffers, filter, sortBy]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16 pt-6 text-slate-900 antialiased">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Navigation Back Button */}
        <div>
          <Link
            href="/restaurant"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#2563EB] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Restaurant</span>
          </Link>
        </div>

        {/* Hero Page Header */}
        <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-gradient-to-r from-[#EFF6FF] via-[#F5F9FF] to-[#DBEAFE] p-6 sm:p-10 shadow-xs">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-600/20 text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Exclusive Promotions</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
              All Offers
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Best deals available for you. Use coupon codes at checkout or present them during dine-in!
            </p>
          </div>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-[#E5E7EB] shadow-xs">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mr-1 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>

            {(["all", "dine-in", "takeaway"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all shrink-0 cursor-pointer ${
                  filter === tab
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab === "all" ? "All Deals" : tab.replace("-", " ")}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:border-[#2563EB] focus:outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="discount">Highest Discount</option>
              <option value="expiry">Expiring Soon</option>
            </select>
          </div>
        </div>

        {/* Offers Grid */}
        <OffersGrid offers={processedOffers} />
      </div>
    </main>
  );
}
