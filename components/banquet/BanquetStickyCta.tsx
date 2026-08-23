"use client";

import { Calendar } from "lucide-react";

export function BanquetStickyCta() {
  const scrollToForm = (e: React.MouseEvent) => {
    e.preventDefault();
    const form = document.getElementById("enquiry-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href="#enquiry-form"
        onClick={scrollToForm}
        aria-label="Enquire Now"
        className="flex items-center gap-2.5 rounded-full bg-[#2563EB] px-5 py-3.5 text-xs font-bold text-white shadow-xl hover:bg-[#1D4ED8] hover:scale-105 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer ring-4 ring-white/50"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
          <Calendar className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="font-bold tracking-wide">Enquire Now</span>
      </a>
    </div>
  );
}

