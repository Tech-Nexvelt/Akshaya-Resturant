import type { Metadata } from "next";
import Image from "next/image";
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
        <header className="mb-8 text-center sm:mb-10 flex flex-col items-center">
          <p className="text-sm font-medium tracking-wide text-blue-600 sm:text-base">
            SIDDIPET&rsquo;S FINEST &middot; SINCE {brand.since}
          </p>
          <div className="mt-4 flex items-center justify-center">
            <Image
              src="/akshaya-logo.png"
              alt="Akshaya Restaurant Logo"
              width={340}
              height={100}
              className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-md"
              priority
            />
          </div>
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
