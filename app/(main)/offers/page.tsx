import type { Metadata } from "next";
import { offers } from "@/lib/restaurant-data";
import { generatePageMetadata } from "@/lib/seo";
import { OffersPageClient } from "@/components/offers/OffersPageClient";

export const metadata: Metadata = generatePageMetadata({
  title: "All Offers & Deals — Exclusive Restaurant Coupons",
  description:
    "Explore exclusive discounts, coupon codes, dine-in specials, and takeaway deals at Akshaya Family Restaurant Siddipet.",
  path: "/offers",
});

export default function OffersPage() {
  return <OffersPageClient initialOffers={offers} />;
}
