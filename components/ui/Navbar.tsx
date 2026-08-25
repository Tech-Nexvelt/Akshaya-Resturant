"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, Calendar, Users, Utensils, Phone } from "lucide-react";
import { brand } from "@/lib/data";
import { clearEntryChoice } from "@/lib/analytics";
import { useCart, cartCount } from "@/store/cart";
import { serviceConfig, type ServiceType } from "@/lib/service-config";
import { navConfig, type NavItemConfig } from "@/lib/nav-config";

interface NavbarProps {
  /** Optional service override. If omitted, auto-detected from current route. */
  service?: ServiceType;
}

const serviceSwitcher: { key: ServiceType; label: string; href: string; icon: typeof Utensils }[] = [
  { key: "restaurant", label: "Restaurant", href: "/restaurant", icon: Utensils },
  { key: "banquet", label: "Banquet Hall", href: "/banquet", icon: Calendar },
  { key: "catering", label: "Catering", href: "/catering", icon: Users },
];

export function Navbar({ service }: NavbarProps) {
  const pathname = usePathname();
  // /restaurant, /catering, and /banquet ship their own dedicated headers with section anchors & service switcher
  const suppressed =
    pathname === "/restaurant" ||
    pathname === "/catering" ||
    pathname.startsWith("/banquet");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");

  const { lines } = useCart();
  const cartBadgeCount = cartCount(lines);

  // Determine active service
  const activeServiceKey: ServiceType = useMemo(() => {
    if (service) return service;
    if (pathname.startsWith("/banquet")) return "banquet";
    if (pathname.startsWith("/catering")) return "catering";
    return "restaurant";
  }, [service, pathname]);

  const navItems: NavItemConfig[] = useMemo(() => {
    return navConfig[activeServiceKey] || navConfig.restaurant;
  }, [activeServiceKey]);

  const currentServiceMeta = serviceConfig[activeServiceKey];

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const sectionIds = navItems.map((item) => item.id);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-20% 0px -50% 0px",
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));

    const handleTopScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection("home");
      }
    };
    window.addEventListener("scroll", handleTopScroll, { passive: true });

    return () => {
      elements.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      window.removeEventListener("scroll", handleTopScroll);
    };
  }, [navItems]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, item: NavItemConfig) => {
      const targetId = item.href.replace(/^#/, "");
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({ behavior: "smooth" });
        setActiveSection(targetId);
        setMobileOpen(false);
      } else {
        setMobileOpen(false);
      }
    },
    []
  );

  const handleCartOpen = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-cart"));
    }
  }, []);

  if (suppressed) return null;

  return (
    <header
      className={`sticky top-0 z-50 inset-x-0 transition-all duration-200 border-b border-[#E5E7EB] pt-safe ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-white/90 backdrop-blur-md"
      }`}
    >
      <nav
        aria-label="Main Navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-18"
      >
        {/* Brand Logo & Active Service Switcher */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/?reset=true"
            onClick={clearEntryChoice}
            aria-label="Return to Service Selection Gate"
            className="group flex items-center gap-2 font-display text-xl sm:text-2xl font-bold tracking-tight text-[#111827] hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
          >
            <Image
              src="/akshaya-logo.png"
              alt="Akshaya Logo"
              width={140}
              height={40}
              className="h-9 sm:h-10 w-auto object-contain"
              priority
            />
          </Link>

          {/* Service Switcher Pills */}
          <div className="hidden items-center gap-1 rounded-full bg-[#F9FAFB] p-1 border border-[#E5E7EB] md:flex">
            {serviceSwitcher.map((srv) => {
              const isActive = activeServiceKey === srv.key;
              const Icon = srv.icon;
              return (
                <Link
                  key={srv.key}
                  href={srv.href}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-xs font-bold"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F3F4F6] font-semibold"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">{srv.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Section Navigation Links (Desktop md+) */}
        <ul className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const isCta = item.isCta;

            if (isCta) {
              return (
                <li key={item.id} className="ml-2">
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#1D4ED8] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                  >
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            }

            return (
              <li key={item.id}>
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`relative text-xs font-semibold tracking-wide transition-colors px-3 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                    isActive
                      ? "text-[#2563EB] font-bold bg-[#DBEAFE]"
                      : "text-[#6B7280] hover:text-[#111827] hover:bg-[#DBEAFE]/40"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#2563EB] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Cart Icon for Restaurant */}
          {activeServiceKey === "restaurant" && (
            <button
              onClick={handleCartOpen}
              aria-label={`View Cart (${cartBadgeCount} items)`}
              className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[#E5E7EB] text-[#111827] hover:bg-[#DBEAFE] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartBadgeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#2563EB] px-1 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {cartBadgeCount}
                </span>
              )}
            </button>
          )}

          {/* Phone number for banquet/catering */}
          {activeServiceKey !== "restaurant" && (
            <a
              href={`tel:+${currentServiceMeta.phone}`}
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-[#111827] hover:text-[#2563EB] transition-colors focus-visible:outline-none"
              aria-label="Call us"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>+91 {activeServiceKey === "banquet" ? "98765 43210" : "96668 78787"}</span>
            </a>
          )}

          {/* Primary Service Action Button */}
          <div className="hidden lg:flex items-center">
            <a
              href={currentServiceMeta.showMenu ? "#menu" : "#enquiry-form"}
              onClick={(e) =>
                handleNavClick(e, {
                  id: currentServiceMeta.showMenu ? "menu" : "enquiry",
                  label: currentServiceMeta.ctaText,
                  href: currentServiceMeta.showMenu ? "#menu" : "#enquiry-form",
                })
              }
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1D4ED8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <span>{currentServiceMeta.ctaText}</span>
            </a>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            className="flex h-11 w-11 items-center justify-center rounded-xl text-[#111827] md:hidden hover:bg-[#DBEAFE]/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Full-screen Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-[calc(64px+env(safe-area-inset-top,0px))] z-50 bg-white md:hidden overflow-y-auto flex flex-col justify-between"
          >
            <div className="p-4 sm:p-6 space-y-6">
              {/* Service Switcher */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                  Select Service
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {serviceSwitcher.map((srv) => {
                    const isActive = activeServiceKey === srv.key;
                    const Icon = srv.icon;
                    return (
                      <Link
                        key={srv.key}
                        href={srv.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-2 text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-[#2563EB] text-white font-bold shadow-md"
                            : "bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{srv.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Section Links */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-2">
                  On This Page
                </p>
                <ul className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <a
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item)}
                          className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                            isActive
                              ? "bg-[#DBEAFE] text-[#2563EB] font-bold border-l-4 border-[#2563EB]"
                              : "text-[#111827] hover:bg-[#F9FAFB]"
                          }`}
                        >
                          <span>{item.label}</span>
                          {isActive && <span className="text-xs font-bold text-[#2563EB]">● Active</span>}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>

            {/* Mobile Footer Action */}
            <div className="p-4 sm:p-6 border-t border-[#E5E7EB] bg-[#F9FAFB] pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
              <a
                href={currentServiceMeta.showMenu ? "#menu" : "#enquiry-form"}
                onClick={(e) =>
                  handleNavClick(e, {
                    id: currentServiceMeta.showMenu ? "menu" : "enquiry",
                    label: currentServiceMeta.ctaText,
                    href: currentServiceMeta.showMenu ? "#menu" : "#enquiry-form",
                  })
                }
                className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3.5 text-center text-sm font-bold text-white shadow-md hover:bg-[#1D4ED8]"
              >
                <span>{currentServiceMeta.ctaText}</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
