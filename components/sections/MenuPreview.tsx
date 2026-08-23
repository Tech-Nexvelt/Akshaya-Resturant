"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { MenuModal } from "@/components/ui/MenuModal";
import { menuCategories, menuItems, type MenuCategory, type MenuItem } from "@/lib/data";

export function MenuPreview() {
  const [active, setActive] = useState<MenuCategory>("Biryani");
  const [selected, setSelected] = useState<MenuItem | null>(null);

  const items = menuItems.filter((item) => item.category === active);

  return (
    <section id="menu" className="relative bg-void px-4 sm:px-6 py-20 sm:py-28 md:py-32">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.4em] text-gold">
            Chef&rsquo;s Selection
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-center font-display text-4xl font-medium text-ivory sm:text-5xl">
            Menu Highlights
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {menuCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`relative rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition-colors ${
                  active === cat ? "text-void" : "text-smoke hover:text-ivory"
                }`}
              >
                {active === cat && (
                  <motion.span
                    layoutId="menu-pill"
                    className="absolute inset-0 rounded-full bg-gold"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative">{cat}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {items.map((item, i) => (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                onClick={() => setSelected(item)}
                className="glass-panel group flex items-center justify-between rounded-xl px-4 sm:px-6 py-4 sm:py-5 text-left transition-all hover:border-gold/50 hover:bg-white/[0.04]"
              >
                <div>
                  <h4 className="font-display text-lg font-medium text-ivory transition-transform duration-300 group-hover:translate-x-1 sm:text-xl">
                    {item.name}
                  </h4>
                  <p className="mt-1 line-clamp-1 text-xs text-smoke">{item.description}</p>
                </div>
                <span className="ml-4 whitespace-nowrap font-display text-lg text-gold-bright">
                  &#8377;{item.price}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <Reveal delay={0.3}>
          <div className="mt-14 text-center">
            <a
              href="#booking"
              className="inline-block rounded-full border border-gold/40 px-8 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-ivory transition-colors hover:border-gold hover:text-gold-bright"
            >
              View Full Menu
            </a>
          </div>
        </Reveal>
      </div>

      <MenuModal item={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
