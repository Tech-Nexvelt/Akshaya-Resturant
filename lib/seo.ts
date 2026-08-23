import type { Metadata } from "next";
import { brand, services } from "./data";

export const SITE_URL = "https://akshayarestaurant.in";

export interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  ogImage?: string;
  noIndex?: boolean;
}

export function generatePageMetadata({
  title,
  description,
  path = "",
  ogImage = "/images/og-image.jpg",
  noIndex = false,
}: SEOProps = {}): Metadata {
  const metaTitle = title
    ? `${title} | ${brand.name}`
    : `${brand.fullName} | Restaurant, Banquet Hall & Catering in Siddipet`;

  const metaDescription =
    description ||
    `${brand.fullName} in Siddipet — authentic Telangana dining, AC banquet halls for 50–200 guests, and outdoor catering within 50km. A legacy of flavor since ${brand.since}.`;

  const canonicalUrl = `${SITE_URL}${path}`;

  return {
    title: metaTitle,
    description: metaDescription,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: brand.fullName,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: brand.fullName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
          },
        },
  };
}

/**
 * Enterprise-grade JSON-LD combining Restaurant + LocalBusiness schema
 */
export function getStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Restaurant",
        "@id": `${SITE_URL}/#restaurant`,
        name: brand.fullName,
        alternateName: brand.name,
        description:
          "Authentic Telangana dining, multi-cuisine family restaurant, AC banquet halls, and outdoor catering in Siddipet since 2007.",
        url: SITE_URL,
        telephone: "+91-9876543210",
        priceRange: "₹₹",
        servesCuisine: ["Indian", "Telangana", "Hyderabadi", "South Indian", "North Indian", "Chinese"],
        acceptsReservations: "True",
        hasMenu: `${SITE_URL}/order`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "Opp. New Bus Stand",
          addressLocality: "Siddipet",
          addressRegion: "Telangana",
          postalCode: "502103",
          addressCountry: "IN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 18.1018,
          longitude: 78.8520,
        },
        areaServed: [
          {
            "@type": "AdministrativeArea",
            name: "Siddipet",
          },
          {
            "@type": "AdministrativeArea",
            name: "Telangana",
          },
        ],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "11:00",
            closes: "23:00",
          },
        ],
        makesOffer: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "AC Banquet Hall Booking",
              description: services.find((s) => s.key === "banquet")?.description,
              url: `${SITE_URL}/banquet`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Outdoor Catering Services",
              description: services.find((s) => s.key === "catering")?.description,
              url: `${SITE_URL}/catering`,
            },
          },
        ],
      },
    ],
  };
}
