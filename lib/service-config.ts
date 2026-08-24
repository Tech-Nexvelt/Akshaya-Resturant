/**
 * Centralized Service Configuration Matrix for Akshaya Hospitality Platform.
 * Standardizes metadata, routing parameters, and component display flags across
 * Restaurant, Banquet, and Catering services.
 */

export type ServiceType = "restaurant" | "banquet" | "catering";

export interface ServiceConfigItem {
  key: ServiceType;
  title: string;
  subtitle: string;
  description: string;
  phone: string;
  meta: string;
  href: string;
  ctaText: string;
  showMenu?: boolean;
  showEnquiryForm?: boolean;
  showPackages?: boolean;
  heroTagline: string;
}

export const serviceConfig: Record<ServiceType, ServiceConfigItem> = {
  restaurant: {
    key: "restaurant",
    title: "Restaurant",
    subtitle: "Authentic Telangana dining & online ordering",
    description:
      "Hand-picked spices, time-honored recipes, and signature Telangana biryanis. Dine in or order directly for takeaway and dining across Siddipet.",
    phone: "919666878787",
    meta: "Authentic Multi-Cuisine · Dine-In & Takeaway",
    href: "/restaurant",
    ctaText: "Order Online Now",
    showMenu: true,
    heroTagline: "Authentic Multi-Cuisine · Since 2007",
  },
  banquet: {
    key: "banquet",
    title: "Banquet Hall",
    subtitle: "Air-conditioned event halls for 50 to 200 guests",
    description:
      "Designed for engagements, birthdays, anniversaries, and corporate events with complete catering, acoustic sound, and stage amenities.",
    phone: "919055646464",
    meta: "50–200 PAX Capacity · AC Hall",
    href: "/banquet",
    ctaText: "Reserve Banquet Hall",
    showEnquiryForm: true,
    heroTagline: "Premium Event Space · Siddipet",
  },
  catering: {
    key: "catering",
    title: "Outdoor Catering",
    subtitle: "Weddings, receptions & large events within 50km",
    description:
      "The full Akshaya kitchen at your venue. We cater weddings, grand receptions, and family ceremonies with live counter setups.",
    phone: "919666878787",
    meta: "Weddings & Ceremonies · Up to 5,000 Guests",
    href: "/catering",
    ctaText: "Book Outdoor Catering",
    showPackages: true,
    heroTagline: "Full-Service Event Catering",
  },
};

export function isValidService(key: string): key is ServiceType {
  return key in serviceConfig;
}
