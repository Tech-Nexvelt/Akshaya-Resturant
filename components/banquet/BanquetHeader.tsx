"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, memo } from "react";
import { UtensilsCrossed, Building2, ChefHat, Phone, Menu as MenuIcon, X } from "lucide-react";
import { serviceConfig } from "@/lib/service-config";

const services = [
  { key: "restaurant", label: "Restaurant", href: "/restaurant", Icon: UtensilsCrossed },
  { key: "banquet", label: "Banquet Hall", href: "/banquet", Icon: Building2 },
  { key: "catering", label: "Catering", href: "/catering", Icon: ChefHat },
];

const banquetNav = [
  { name: "Overview", href: "#overview" },
  { name: "Halls", href: "#halls" },
  { name: "Occasions", href: "#occasions" },
  { name: "Packages", href: "#packages" },
  { name: "Gallery", href: "#gallery" },
  { name: "Testimonials", href: "#testimonials" },
];

export const BanquetHeader = memo(function BanquetHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("Overview");

  useEffect(() => {
    const handleScroll = () => {
      const sections = banquetNav.map((n) => n.href.replace("#", ""));
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActive(banquetNav.find((n) => n.href === `#${id}`)?.name || "Overview");
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const phoneNum = serviceConfig.banquet?.phone || "919055646464";

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand & Service Switcher */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1 font-serif text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl"
          >
            <NextImage
              src="/akshaya-logo.png"
              alt="Akshaya Banquet Logo"
              width={140}
              height={40}
              className="h-9 w-auto shrink-0 object-contain sm:h-10"
              priority
            />
          </Link>

          {/* Service Switcher Pills */}
          <nav aria-label="Services" className="hidden shrink-0 items-center gap-1.5 md:flex">
            {services.map(({ key, label, href, Icon }) => {
              const isActive = key === "banquet";
              return (
                <Link
                  key={key}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs whitespace-nowrap shrink-0 transition-all duration-150 ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-xs font-bold"
                      : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] font-semibold"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="whitespace-nowrap">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section Navigation Links (Desktop) */}
        <nav aria-label="Sections" className="hidden items-center gap-6 lg:flex">
          {banquetNav.map((item) => {
            const isActive = active === item.name;
            return (
              <a
                key={item.name}
                href={item.href}
                aria-current={isActive ? "true" : undefined}
                className={`relative py-1 text-xs sm:text-sm transition-colors ${
                  isActive
                    ? "font-bold text-[#2563EB]"
                    : "font-semibold text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-[#2563EB]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Phone & Reserve Button */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={`tel:+${phoneNum}`}
            className="hidden items-center gap-1.5 text-xs font-semibold text-[#111827] hover:text-[#2563EB] transition-colors whitespace-nowrap shrink-0 2xl:flex"
          >
            <Phone className="h-3.5 w-3.5 text-[#2563EB] shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">+91 90556 46464</span>
          </a>

          <a
            href="#enquiry-form"
            className="hidden rounded-xl bg-[#2563EB] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all hover:bg-[#1D4ED8] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] whitespace-nowrap shrink-0 sm:inline-flex"
          >
            <span className="whitespace-nowrap">Reserve Banquet Hall</span>
          </a>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] text-[#111827] lg:hidden cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#E5E7EB] bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="flex flex-wrap gap-2 pb-3 md:hidden">
              {services.map(({ key, label, href, Icon }) => (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    key === "banquet"
                      ? "bg-[#2563EB] text-white font-bold"
                      : "bg-[#F3F4F6] text-[#6B7280]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>

            <ul className="grid grid-cols-2 gap-1.5">
              {banquetNav.map((item) => (
                <li key={item.name}>
                  <a
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6]"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#enquiry-form"
              onClick={() => setMobileOpen(false)}
              className="mt-4 flex w-full min-h-[44px] items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-center text-xs font-bold text-white shadow-sm hover:bg-[#1D4ED8] sm:hidden"
            >
              Reserve Banquet Hall
            </a>
          </nav>
        </div>
      )}
    </header>
  );
});
