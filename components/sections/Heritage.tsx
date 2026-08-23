"use client";

import { Reveal } from "@/components/ui/Reveal";
import { brand } from "@/lib/data";

export function Heritage() {
  return (
    <section id="heritage" className="relative overflow-hidden bg-void px-4 sm:px-6 py-20 sm:py-28 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gold/5 blur-[160px]"
      />
      <div className="relative mx-auto max-w-4xl text-center">
        <Reveal>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.4em] text-gold">
            The Akshaya Heritage
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="font-display text-3xl font-medium leading-tight text-ivory sm:text-4xl md:text-5xl lg:text-6xl">
            Crafting memories since {brand.since}
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <blockquote className="mx-auto mt-10 max-w-2xl font-display text-xl italic text-gold-bright/90 sm:text-2xl">
            &ldquo;Our kitchen is a temple &mdash; tradition is the only law we follow.&rdquo;
          </blockquote>
        </Reveal>

        <Reveal delay={0.3}>
          <p className="mx-auto mt-10 max-w-xl text-balance text-sm leading-relaxed text-smoke sm:text-base">
            Established to redefine family dining in {brand.location}, Akshaya has grown into a
            byword for authentic hospitality. Every spice is hand-picked, every recipe carried
            forward with care, and every guest welcomed like family.
          </p>
        </Reveal>

        <Reveal delay={0.4}>
          <div className="mx-auto mt-12 sm:mt-16 grid max-w-2xl grid-cols-3 gap-4 sm:gap-6 border-t border-gold/15 pt-8 sm:pt-10">
            {brand.stats.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-3xl font-medium text-gold-gradient sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-smoke sm:text-xs">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
