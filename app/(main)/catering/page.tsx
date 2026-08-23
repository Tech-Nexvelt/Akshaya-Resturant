import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { CateringHeader } from "@/components/catering/CateringHeader";
import { CateringHero } from "@/components/catering/CateringHero";
import { CateringFeatures } from "@/components/catering/CateringFeatures";
import { CateringPackages } from "@/components/catering/CateringPackages";
import { CateringMenuPreview } from "@/components/catering/CateringMenuPreview";
import { CateringEventTypes } from "@/components/catering/CateringEventTypes";
import { CateringEnquirySection } from "@/components/catering/CateringEnquirySection";
import { CateringTestimonials } from "@/components/catering/CateringTestimonials";
import { CateringGallery } from "@/components/catering/CateringGallery";
import { CateringFooter } from "@/components/catering/CateringFooter";

export const metadata: Metadata = generatePageMetadata({
  title: "Outdoor & Event Catering Services",
  description:
    "Akshaya's premier catering service for weddings, corporate events, birthday parties, and outdoor gatherings. Customized packages and authentic multi-cuisine menus.",
  path: "/catering",
});

export default function CateringPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      <CateringHeader />

      <main className="min-w-0 pb-16 lg:pb-0">
        <CateringHero />
        <CateringFeatures />
        <CateringPackages />
        <CateringMenuPreview />
        <CateringEventTypes />
        <CateringEnquirySection />
        <CateringTestimonials />
        <CateringGallery />
      </main>

      <CateringFooter />
    </div>
  );
}
