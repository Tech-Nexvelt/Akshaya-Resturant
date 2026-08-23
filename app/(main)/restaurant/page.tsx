import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { RestaurantHeader } from "@/components/restaurant/RestaurantHeader";
import { RestaurantHero } from "@/components/restaurant/RestaurantHero";
import { MenuExplorer } from "@/components/restaurant/MenuExplorer";
import { OffersSection } from "@/components/restaurant/OffersSection";
import { ReviewsCarousel } from "@/components/restaurant/ReviewsCarousel";
import { GalleryStrip } from "@/components/restaurant/GalleryStrip";
import { ContactSection } from "@/components/restaurant/ContactSection";
import { RestaurantCartDrawer } from "@/components/restaurant/RestaurantCartDrawer";

export const metadata: Metadata = generatePageMetadata({
  title: "Restaurant — Menu & Online Ordering",
  description:
    "Explore Akshaya Family Restaurant's menu. Order authentic Telangana biryanis, starters, tandoori and curries online for fast delivery or pickup.",
  path: "/restaurant",
});

export default function RestaurantPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      <RestaurantHeader />

      <main className="min-w-0">
        <RestaurantHero />
        <MenuExplorer />
        <OffersSection />
        <ReviewsCarousel />
        <GalleryStrip />
        <ContactSection />
      </main>

      <RestaurantCartDrawer />
    </div>
  );
}
