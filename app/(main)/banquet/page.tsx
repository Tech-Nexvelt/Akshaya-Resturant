import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { BanquetHero } from "@/components/banquet/BanquetHero";
import { BanquetFeatures } from "@/components/banquet/BanquetFeatures";
import { BanquetHallCarousel } from "@/components/banquet/BanquetHallCarousel";
import { BanquetOccasions } from "@/components/banquet/BanquetOccasions";
import { BanquetPackagesAndForm } from "@/components/banquet/BanquetPackagesAndForm";
import { BanquetTestimonials } from "@/components/banquet/BanquetTestimonials";
import { BanquetFooter } from "@/components/banquet/BanquetFooter";
import { BanquetStickyCta } from "@/components/banquet/BanquetStickyCta";

export const metadata: Metadata = generatePageMetadata({
  title: "AC Banquet Hall Booking — Weddings, Receptions & Events",
  description:
    "Book Akshaya Banquet Hall in Hyderabad for weddings, receptions, birthdays, and corporate events. Capacity 300–800 guests. AC & Non-AC halls with catering options.",
  path: "/banquet",
});

export default function BanquetPage() {
  return (
    <main className="min-h-screen bg-[#F9FAFB] pb-20 text-[#111827]">
      {/* 1. HERO */}
      <BanquetHero />

      {/* 2. FEATURES STRIP — overlaps hero bottom */}
      <BanquetFeatures />

      {/* 3. HALL CAROUSEL */}
      <BanquetHallCarousel />

      {/* 4. OCCASIONS GRID */}
      <BanquetOccasions />

      {/* 5. PACKAGES + ENQUIRY FORM (side-by-side) */}
      <BanquetPackagesAndForm />

      {/* 6. TESTIMONIALS */}
      <BanquetTestimonials />

      {/* 7. FOOTER */}
      <BanquetFooter />

      {/* Sticky mobile CTA */}
      <BanquetStickyCta />
    </main>
  );
}
