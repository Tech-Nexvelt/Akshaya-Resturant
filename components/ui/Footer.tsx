"use client";

import { usePathname } from "next/navigation";
import { brand, services } from "@/lib/data";

export function Footer() {
  const pathname = usePathname();

  // /banquet, /restaurant and /catering ship their own custom footers matching reference design
  if (pathname === "/banquet" || pathname === "/restaurant" || pathname === "/catering") return null;

  return (
    <footer id="contact" className="border-t border-gold/10 bg-void pb-safe scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="font-display text-2xl tracking-[0.1em] text-ivory">
              {brand.name.toUpperCase()}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-smoke">
              Elevating the culinary landscape of {brand.location.split(",")[0]} since {brand.since}.
            </p>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-smoke">
              {services.map((s) => (
                <li key={s.key}>
                  <span className="text-ivory/70">{s.title}: </span>
                  {/* Phone as a tappable link with 44px minimum touch target */}
                  <a
                    href={`tel:${s.phone.replace(/\s/g, "")}`}
                    className="hover:text-gold-bright transition-colors inline-block min-h-[24px]"
                  >
                    {s.phone}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Visit */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Visit</p>
            <p className="mt-4 text-sm leading-relaxed text-smoke">{brand.address}</p>
          </div>
        </div>

        <div className="mt-12 border-t border-gold/10 pt-6 text-center text-[11px] uppercase tracking-[0.2em] text-smoke/60">
          &copy; {new Date().getFullYear()} Akshaya Hospitality Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

