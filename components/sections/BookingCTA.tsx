"use client";

import { Reveal } from "@/components/ui/Reveal";
import { brand, services } from "@/lib/data";

export function BookingCTA() {
  return (
    <section id="booking" className="relative overflow-hidden bg-void-soft px-4 sm:px-6 py-20 sm:py-28 md:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[180px]"
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-gold">
            Reserve Your Table
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="font-display text-4xl font-medium leading-tight text-ivory sm:text-5xl md:text-6xl">
            Your seat at the table
            <br />
            is waiting
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-md text-sm text-smoke sm:text-base">
            Dining, banquets, or catering &mdash; reach us directly and we&rsquo;ll take care of
            the rest.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href={`https://wa.me/91${services[0].phone.replace(/\s/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] rounded-full bg-gold px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-void transition-transform hover:scale-[1.03] sm:w-auto flex items-center justify-center"
            >
              Book via WhatsApp
            </a>
            <a
              href={`tel:${services[0].phone.replace(/\s/g, "")}`}
              className="w-full min-h-[48px] rounded-full border border-gold/40 px-10 py-4 text-xs font-bold uppercase tracking-[0.25em] text-ivory transition-colors hover:border-gold hover:text-gold-bright sm:w-auto flex items-center justify-center"
            >
              Call {services[0].phone}
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <p className="mt-10 text-xs uppercase tracking-[0.2em] text-smoke">{brand.address}</p>
        </Reveal>
      </div>
    </section>
  );
}
