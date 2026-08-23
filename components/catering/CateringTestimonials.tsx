"use client";

import { useState, memo } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cateringReviews } from "@/lib/catering-data";

export const CateringTestimonials = memo(function CateringTestimonials() {
  const [active, setActive] = useState(0);

  const prev = () => setActive((a) => Math.max(0, a - 1));
  const next = () => setActive((a) => Math.min(cateringReviews.length - 1, a + 1));

  return (
    <section id="reviews" className="scroll-mt-20 bg-[#F9FAFB] py-14 border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          What Our Clients Say
        </p>
        <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
          Trusted by Hundreds of Happy Customers
        </h2>

        <div className="relative mt-8 flex items-center">
          <button
            onClick={prev}
            disabled={active === 0}
            aria-label="Previous testimonial"
            className="absolute left-0 z-10 -ml-2 sm:-ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] shadow-sm transition-all hover:bg-[#2563EB] hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {cateringReviews.map((r, i) => (
              <figure
                key={r.id}
                className={`flex flex-col justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 text-left shadow-xs transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${
                  i === active ? "ring-2 ring-[#2563EB]" : ""
                } ${i !== active ? "hidden md:flex" : "flex"}`}
              >
                <div>
                  <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                    {Array.from({ length: r.rating }).map((_, s) => (
                      <Star
                        key={s}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  <blockquote className="mt-3 text-xs sm:text-sm leading-relaxed text-[#374151]">
                    &ldquo;{r.quote}&rdquo;
                  </blockquote>
                </div>

                <figcaption className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-3">
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#2563EB]/20 bg-[#F3F4F6]">
                    <img
                      src={r.avatar}
                      alt={r.name}
                      width={36}
                      height={36}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="block text-xs sm:text-sm font-bold text-[#111827]">{r.name}</span>
                    <span className="block text-[11px] text-[#6B7280]">{r.subtext}</span>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <button
            onClick={next}
            disabled={active === cateringReviews.length - 1}
            aria-label="Next testimonial"
            className="absolute right-0 z-10 -mr-2 sm:-mr-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] shadow-sm transition-all hover:bg-[#2563EB] hover:text-white disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="mt-6 flex justify-center gap-1.5">
          {cateringReviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                i === active ? "w-6 bg-[#2563EB]" : "w-2 bg-[#E5E7EB]"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
});
