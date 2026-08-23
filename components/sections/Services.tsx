"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { services } from "@/lib/data";

export function Services() {
  return (
    <section id="services" className="relative bg-void-soft px-4 sm:px-6 py-20 sm:py-28 md:py-32">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.4em] text-gold">
            Beyond Dining
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-center font-display text-4xl font-medium text-ivory sm:text-5xl">
            Our Exquisite Services
          </h2>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {services.map((service, i) => (
            <Reveal key={service.key} delay={i * 0.08}>
              <GlassCard className="group relative overflow-hidden p-5 sm:p-8">
                <motion.div
                  initial={false}
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/10 blur-3xl transition-all duration-500 group-hover:bg-gold/20"
                />
                <div className="relative">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold-bright/80">
                    {service.meta}
                  </span>
                  <h3 className="mt-3 font-display text-2xl font-medium text-ivory sm:text-3xl">
                    {service.title}
                  </h3>
                  {/* Description: always visible on mobile (touch devices have no hover), animates in on desktop hover */}
                  <p className="mt-4 text-sm leading-relaxed text-smoke md:max-h-0 md:overflow-hidden md:opacity-0 md:transition-all md:duration-500 md:ease-out md:group-hover:max-h-32 md:group-hover:opacity-100">
                    {service.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-gold/10 pt-5">
                    <a
                      href={`tel:${service.phone.replace(/\s/g, "")}`}
                      className="text-sm font-medium tracking-wide text-gold-bright transition-colors hover:text-gold"
                    >
                      {service.phone}
                    </a>
                    <span className="text-lg text-gold/60 transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
