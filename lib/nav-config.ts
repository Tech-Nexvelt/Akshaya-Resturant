import { ServiceType } from "./service-config";

export interface NavItemConfig {
  id: string;
  label: string;
  href: string;
  isCta?: boolean;
  isCart?: boolean;
}

/**
 * Section anchors per service, consumed by `components/ui/Navbar.tsx`.
 *
 * EVERY `href` here MUST correspond to an element id that actually exists on that
 * service's page — a nav link to a missing anchor silently does nothing when
 * clicked, which is invisible in code review and obvious to a visitor.
 *
 * These had drifted badly against the real markup:
 *   banquet  — `#gallery` did not exist (page has home/halls/facilities/packages/
 *              enquiry-form/reviews/contact); now points at `#facilities`.
 *   catering — five of eight links were dead: `#home`, `#services`, `#menu`,
 *              `#gallery`, `#enquiry`. The page's actual sections are overview /
 *              packages / menu-preview / event-types / enquiry-form / reviews /
 *              contact. `#gallery` is dropped outright — catering has no gallery.
 *
 * If you add or rename a section, update it here in the same change.
 */
export const navConfig: Record<ServiceType, NavItemConfig[]> = {
  restaurant: [
    { id: "home", label: "Home", href: "#home" },
    { id: "menu", label: "Menu", href: "#menu" },
    { id: "offers", label: "Offers", href: "#offers" },
    { id: "reviews", label: "Reviews", href: "#reviews" },
    { id: "gallery", label: "Gallery", href: "#gallery" },
    { id: "contact", label: "Contact", href: "#contact" },
  ],
  banquet: [
    { id: "home", label: "Home", href: "#home" },
    { id: "halls", label: "Halls", href: "#halls" },
    { id: "facilities", label: "Facilities", href: "#facilities" },
    { id: "packages", label: "Packages", href: "#packages" },
    { id: "reviews", label: "Reviews", href: "#reviews" },
    { id: "contact", label: "Contact", href: "#contact" },
  ],
  catering: [
    { id: "overview", label: "Overview", href: "#overview" },
    { id: "event-types", label: "Services", href: "#event-types" },
    { id: "menu-preview", label: "Menu", href: "#menu-preview" },
    { id: "packages", label: "Packages", href: "#packages" },
    { id: "reviews", label: "Reviews", href: "#reviews" },
    { id: "enquiry-form", label: "Enquiry", href: "#enquiry-form", isCta: true },
    { id: "contact", label: "Contact", href: "#contact" },
  ],
};
