"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    id: "t1",
    quote:
      "Akshaya Banquet Hall made our wedding absolutely perfect. The arrangements, food and service were outstanding!",
    name: "Rohit & Priya",
    location: "Hyderabad",
    rating: 5,
    avatarSrc: "/banquet/avatar-couple.png",
  },
  {
    id: "t2",
    quote:
      "Spacious hall, beautiful ambience and professional staff. Highly recommended for any big celebration.",
    name: "Karthik Reddy",
    location: "Secunderabad",
    rating: 5,
    avatarSrc: "/banquet/avatar-man.png",
  },
  {
    id: "t3",
    quote:
      "We hosted our corporate event here and everything was managed so well. Great experience!",
    name: "Ananya Devi",
    location: "Hyderabad",
    rating: 5,
    avatarSrc: "/banquet/avatar-woman.png",
  },
];

export function BanquetTestimonials() {
  const [active, setActive] = useState(0);

  function prev() {
    setActive((a) => Math.max(0, a - 1));
  }
  function next() {
    setActive((a) => Math.min(testimonials.length - 1, a + 1));
  }

  return (
    <section
      id="reviews"
      className="mt-16 md:mt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20"
    >
      <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-center text-[#111827] mb-8">
        What Our Clients Say
      </h2>

      <div className="relative flex items-center">
        {/* Prev Arrow */}
        <button
          onClick={prev}
          disabled={active === 0}
          aria-label="Previous testimonial"
          className="absolute left-0 z-20 -ml-3 sm:-ml-5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-[#111827] shadow-md hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* 3 Visible Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {testimonials.map((t, idx) => (
            <div
              key={t.id}
              onClick={() => setActive(idx)}
              className={`flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm transition-all duration-300 ${
                idx === active
                  ? "ring-2 ring-[#2563EB] shadow-md -translate-y-0.5"
                  : "hover:shadow-md"
              } ${idx !== active ? "hidden md:flex" : "flex"}`}
            >
              {/* Header: Avatar & Stars */}
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden border-2 border-[#2563EB]/20 shadow-sm">
                  <Image
                    src={t.avatarSrc}
                    alt={t.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Quote */}
              <p className="mt-4 text-xs sm:text-sm text-[#374151] italic leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Name & Location */}
              <div className="mt-5 border-t border-gray-100 pt-3">
                <p className="text-sm font-bold text-[#111827]">{t.name}</p>
                <p className="text-xs text-[#6B7280]">{t.location}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Next Arrow */}
        <button
          onClick={next}
          disabled={active === testimonials.length - 1}
          aria-label="Next testimonial"
          className="absolute right-0 z-20 -mr-3 sm:-mr-5 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-gray-200 bg-white/95 text-[#111827] shadow-md hover:bg-[#2563EB] hover:border-[#2563EB] hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="mt-6 flex justify-center items-center gap-2">
        {testimonials.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx)}
            aria-label={`Testimonial ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === active ? "w-7 bg-[#2563EB]" : "w-2 bg-[#D1D5DB] hover:bg-[#9CA3AF]"
            }`}
          />
        ))}
      </div>
    </section>
  );
}

