import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { offers, getActiveOffers } from "@/lib/restaurant-data";
import { OfferCard } from "./OfferCard";

export function OffersSection() {
  const activeOffers = getActiveOffers(offers).slice(0, 4);

  return (
    <section id="offers" className="scroll-mt-20 bg-[#EFF6FF] py-14 border-t border-[#DBEAFE]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              OFFERS FOR YOU
            </p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              Great Food, Great Deals!
            </h2>
          </div>

          <Link
            href="/offers"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors group"
          >
            <span>View All Offers</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activeOffers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </div>
    </section>
  );
}
