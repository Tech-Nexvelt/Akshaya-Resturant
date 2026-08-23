"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Utensils, Calendar, Users } from "lucide-react";

const services = [
  {
    id: "order",
    title: "Order Online",
    subtitle: "5-Click Instant Checkout",
    badge: "Fast Delivery",
    href: "/order",
    icon: Utensils,
    primary: true,
  },
  {
    id: "banquet",
    title: "Book Banquet",
    subtitle: "AC Hall & Celebrations",
    badge: "Up to 500 Guests",
    href: "/banquet",
    icon: Calendar,
    primary: false,
  },
  {
    id: "catering",
    title: "Outdoor Catering",
    subtitle: "Custom Event Menus",
    badge: "Bulk Catering",
    href: "/catering",
    icon: Users,
    primary: false,
  },
];

export function ServicePickerTiles() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="pointer-events-auto mt-8 grid w-full max-w-4xl grid-cols-1 gap-4 px-4 sm:grid-cols-3"
    >
      {services.map((s) => {
        const Icon = s.icon;
        return (
          <Link
            key={s.id}
            href={s.href}
            className={`group relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all duration-300 ${
              s.primary
                ? "border-gold/60 bg-void/80 shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:border-gold hover:bg-void/90 hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] backdrop-blur-md"
                : "border-white/10 bg-void/60 hover:border-gold/40 hover:bg-void/80 backdrop-blur-md"
            }`}
          >
            {/* Top Badge */}
            <span
              className={`mb-3 rounded-full px-2.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase ${
                s.primary
                  ? "bg-gold/20 text-gold-bright border border-gold/30"
                  : "bg-white/5 text-smoke border border-white/10"
              }`}
            >
              {s.badge}
            </span>

            {/* Icon */}
            <div
              className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 ${
                s.primary ? "bg-gold/20 text-gold-bright" : "bg-white/5 text-ivory group-hover:text-gold"
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* Title */}
            <h3 className="font-display text-lg font-medium text-ivory group-hover:text-gold-bright transition-colors">
              {s.title}
            </h3>

            {/* Subtitle */}
            <p className="mt-1 text-xs text-smoke font-light">
              {s.subtitle}
            </p>

            {/* CTA Arrow */}
            <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gold-bright opacity-80 group-hover:opacity-100">
              <span>{s.primary ? "Order Now" : "Explore"}</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
            </div>
          </Link>
        );
      })}
    </motion.div>
  );
}
