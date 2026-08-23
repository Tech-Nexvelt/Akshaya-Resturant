import type { Metadata } from "next";
import { EntryCards } from "@/components/landing/EntryCards";
import { HeroBeamsBackground } from "@/components/landing/HeroBeamsBackground";
import { brand } from "@/lib/data";
import { generatePageMetadata, getStructuredData } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Welcome — Select Your Service",
  description:
    "Akshaya Family Restaurant, Siddipet — Select Restaurant Dining & Online Ordering, AC Banquet Hall Reservations, or Outdoor Catering.",
  path: "/",
});

export default function LandingGate() {
  const jsonLd = getStructuredData();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#F8FAFC]">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ===== LAYER 1 & 2: LIGHTPILLAR + LIGHT CONTRAST OVERLAY ===== */}
      <HeroBeamsBackground />

      {/* ===== LAYER 3: CONTENT ===== */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-8 text-center">
        <header className="mb-8 text-center sm:mb-10">
          <p className="text-sm font-medium tracking-wide text-blue-600 sm:text-base">
            SIDDIPET&rsquo;S FINEST &middot; SINCE {brand.since}
          </p>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            {brand.name}
          </h1>
          <p className="mt-3 text-base text-gray-600 max-w-md mx-auto">
            Select your preferred service to continue
          </p>
        </header>

        <section aria-label="Service Selection" className="w-full max-w-5xl">
          <EntryCards />
        </section>
      </div>
    </div>
  );
}
