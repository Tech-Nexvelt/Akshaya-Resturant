"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, ArrowRight } from "lucide-react";

export function BanquetHero() {
  const [date, setDate] = useState("");

  const handleDateSelect = (selectedDate: string) => {
    setDate(selectedDate);
    // Smooth scroll to enquiry form and set the date
    const formEl = document.getElementById("enquiry-form");
    if (formEl) {
      formEl.scrollIntoView({ behavior: "smooth" });
      const dateInput = document.getElementById("eventDate") as HTMLInputElement;
      if (dateInput) {
        dateInput.value = selectedDate;
        dateInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-[560px] md:min-h-[640px] flex items-center overflow-hidden scroll-mt-16"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/banquet/hero-bg.png"
          alt="Akshaya Banquet Hall grand luxury interior with crystal chandeliers"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Dark gradient overlay — left-heavy for white text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Eyebrow */}
        <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#3B82F6] mb-3">
          CELEBRATE LIFE&rsquo;S BIG MOMENTS
        </p>

        {/* Heading */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] max-w-2xl">
          Host Unforgettable<br />
          Celebrations at Akshaya
        </h1>

        {/* Subtext */}
        <p className="mt-4 text-sm sm:text-base md:text-lg text-white/90 font-medium tracking-wide">
          Weddings &bull; Receptions &bull; Corporate Events &bull; Parties
        </p>

        {/* Button Row */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#enquiry-form"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#1D4ED8] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Calendar className="h-4 w-4" />
            <span>Check Availability</span>
          </a>
          <a
            href="#enquiry-form"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#111827] shadow-lg hover:bg-gray-100 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>Enquire Now</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {/* Input Field: White rounded input field with calendar icon */}
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-md w-full max-w-xs transition-shadow hover:shadow-lg">
          <Calendar className="h-5 w-5 text-[#6B7280] shrink-0" />
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateSelect(e.target.value)}
            placeholder="Select Event Date"
            aria-label="Select Event Date"
            className="bg-transparent text-sm font-medium text-[#111827] placeholder:text-[#9CA3AF] outline-none w-full cursor-pointer"
          />
        </div>
      </div>
    </section>
  );
}

