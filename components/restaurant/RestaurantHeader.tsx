"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, memo } from "react";
import { ShoppingBag, Menu as MenuIcon, X, UtensilsCrossed, Building2, ChefHat } from "lucide-react";
import { useCart, cartCount } from "@/store/cart";
import { restaurantNav } from "@/lib/restaurant-data";

const services = [
  { key: "restaurant", label: "Restaurant", href: "/restaurant", Icon: UtensilsCrossed },
  { key: "banquet", label: "Banquet Hall", href: "/banquet", Icon: Building2 },
  { key: "catering", label: "Catering", href: "/catering", Icon: ChefHat },
];

export const RestaurantHeader = memo(function RestaurantHeader() {
  const lines = useCart((s) => s.lines);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("Menu");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const count = mounted ? cartCount(lines) : 0;

  useEffect(() => {
    const ids = restaurantNav.map((n) => n.href.slice(1));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const match = restaurantNav.find((n) => n.href.slice(1) === visible.target.id);
          if (match) setActive(match.label);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const openCart = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-cart"));
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand & Service Switcher */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link
            href="/"
            className="flex items-center gap-1 font-serif text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl"
          >
            <span>Akshaya</span>
          </Link>

          {/* Service Switch Pills */}
          <nav aria-label="Services" className="hidden items-center gap-1.5 rounded-full bg-[#F9FAFB] p-1 border border-[#E5E7EB] md:flex">
            {services.map(({ key, label, href, Icon }) => {
              const isActive = key === "restaurant";
              return (
                <Link
                  key={key}
                  href={href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all duration-150 ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-xs font-bold"
                      : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] font-semibold"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Section Navigation Links (Desktop) */}
        <nav aria-label="Sections" className="hidden items-center gap-6 lg:flex">
          {restaurantNav.map((item) => {
            const isActive = active === item.label;
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={isActive ? "true" : undefined}
                className={`relative py-1 text-xs sm:text-sm transition-colors ${
                  isActive
                    ? "font-bold text-[#2563EB]"
                    : "font-semibold text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-[#2563EB]" />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={openCart}
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#111827] transition-all hover:bg-[#F9FAFB] hover:border-[#2563EB] hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#2563EB] px-1 text-[10px] font-bold text-white shadow-xs">
                {count}
              </span>
            )}
          </button>

          <a
            href="#menu"
            className="hidden rounded-xl bg-[#2563EB] px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition-all hover:bg-[#1D4ED8] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] sm:inline-flex"
          >
            Order Online Now
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

      {/* Mobile Drawer Navigation */}
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
                    key === "restaurant"
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
              {restaurantNav.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg px-3 py-2.5 text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>

            <a
              href="#menu"
              onClick={() => setMobileOpen(false)}
              className="mt-4 flex w-full min-h-[44px] items-center justify-center rounded-xl bg-[#2563EB] px-5 py-3 text-center text-xs font-bold text-white shadow-sm hover:bg-[#1D4ED8] sm:hidden"
            >
              Order Online Now
            </a>
          </nav>
        </div>
      )}
    </header>
  );
});
