"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { testimonials } from "@/lib/data";

export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  const current = testimonials[index];

  return (
    <section className="relative bg-void px-4 sm:px-6 py-20 sm:py-28 md:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-gold">
            Testimonials
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-4xl font-medium text-ivory sm:text-5xl">
            What our guests say
          </h2>
        </Reveal>

        <div className="relative mt-10 sm:mt-16 flex min-h-[200px] sm:min-h-[220px] items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <blockquote className="font-display text-xl italic leading-snug text-ivory sm:text-2xl md:text-3xl">
                &ldquo;{current.quote}&rdquo;
              </blockquote>
              <div className="mt-8 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 font-display text-sm text-gold-bright">
                  {current.name.charAt(0)}
                </span>
                <div className="text-left">
                  <p className="text-sm font-medium text-ivory">{current.name}</p>
                  <p className="text-xs text-smoke">{current.context}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex justify-center gap-2">
          {testimonials.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 min-h-[44px] min-w-[12px] flex items-end pb-1 ${
                i === index ? "w-8 bg-gold" : "w-1.5 bg-ivory/15"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
