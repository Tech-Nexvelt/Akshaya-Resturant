"use client";

import { useState } from "react";
import { Check, Send, Calendar, ChevronDown, CheckCircle2 } from "lucide-react";

const packages = [
  {
    id: "basic",
    name: "Basic Package",
    subtitle: "Best for Small Gatherings",
    features: [
      "Hall for 4 Hours",
      "Basic Decoration",
      "Standard Catering",
      "Up to 300 Guests",
    ],
    highlight: false,
  },
  {
    id: "standard",
    name: "Standard Package",
    subtitle: "Best for Medium Gatherings",
    features: [
      "Hall for 6 Hours",
      "Premium Decoration",
      "Multi-cuisine Catering",
      "Up to 500 Guests",
    ],
    highlight: true,
  },
  {
    id: "premium",
    name: "Premium Package",
    subtitle: "Best for Grand Celebrations",
    features: [
      "Hall for 6 Hours",
      "Royal Decoration",
      "Multi-cuisine Catering",
      "Up to 500 Guests",
    ],
    highlight: false,
  },
];

const eventTypes = [
  "Weddings", "Receptions", "Birthday Parties",
  "Corporate Events", "Engagement", "Anniversary", "Other",
];

const budgetRanges = [
  "Under ₹50,000", "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,00,000", "₹2,00,000 – ₹5,00,000", "Above ₹5,00,000",
];

export function BanquetPackagesAndForm() {
  const [values, setValues] = useState({
    fullName: "",
    mobile: "",
    eventType: "",
    eventDate: "",
    guests: "",
    budget: "",
    requirements: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function set(key: string, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
    if (errorMessage) setErrorMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage("");

    const lines = [
      `Name: ${values.fullName}`,
      `Mobile: ${values.mobile}`,
      `Event Type: ${values.eventType}`,
      `Event Date: ${values.eventDate || "TBD"}`,
      `Guests: ${values.guests || "N/A"}`,
      `Budget: ${values.budget || "N/A"}`,
      `Requirements: ${values.requirements || "None"}`,
    ].join("\n");

    function openWhatsApp(intro: string) {
      const msg = `${intro}\n${lines}`;
      window.open(`https://wa.me/919876543210?text=${encodeURIComponent(msg)}`, "_blank");
    }

    // The persistence attempt gets its OWN try/catch. Previously a non-OK response
    // threw straight past the WhatsApp handoff below, so the "fallback" only ever
    // ran when the write had already succeeded — i.e. exactly never when it was
    // needed, and every lead was lost whenever Supabase was unreachable.
    let persisted = false;
    try {
      const res = await fetch("/api/enquiry/banquet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.fullName,
          phone: values.mobile,
          eventType: values.eventType || "Event Enquiry",
          eventDate: values.eventDate || null,
          guestCount: values.guests ? parseInt(values.guests, 10) : null,
          budgetRange: values.budget || null,
          notes: values.requirements || null,
        }),
      });

      const data = await res.json().catch(() => ({ success: false }));
      persisted = res.ok && Boolean(data.success);
    } catch {
      persisted = false;
    }

    if (persisted) {
      setSubmitted(true);
      setTimeout(() => openWhatsApp("Hi Akshaya Banquet Hall, I have submitted an enquiry via website:"), 1000);
    } else {
      setErrorMessage(
        "We couldn't reach our booking system. Opening WhatsApp so your enquiry still reaches us."
      );
      openWhatsApp("Hi Akshaya Banquet Hall, I would like to enquire about the hall:");
    }

    setIsSubmitting(false);
  }

  const inputCls =
    "w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all min-h-[44px]";

  const selectCls =
    "w-full appearance-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 text-xs text-[#111827] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all min-h-[44px] pr-8 cursor-pointer";

  return (
    <section
      id="packages"
      className="mt-14 md:mt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-stretch">
        {/* LEFT: Our Packages (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-6">
              Our Packages
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-300 ${
                    pkg.highlight
                      ? "border-[#2563EB] bg-white shadow-xl ring-2 ring-[#2563EB] -translate-y-1 z-10"
                      : "border-[#E5E7EB] bg-white shadow-sm hover:shadow-md"
                  }`}
                >
                  {pkg.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-block rounded-full bg-[#2563EB] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div>
                    <div className={pkg.highlight ? "mt-2" : ""}>
                      <h3 className={`text-base font-bold ${pkg.highlight ? "text-[#2563EB]" : "text-[#111827]"}`}>
                        {pkg.name}
                      </h3>
                      <p className="mt-1 text-xs text-[#6B7280]">{pkg.subtitle}</p>
                    </div>

                    <p className="mt-4 text-sm font-bold text-[#2563EB]">
                      Contact for Pricing
                    </p>

                    <ul className="mt-4 space-y-2.5">
                      {pkg.features.map((feat) => (
                        <li key={feat} className="flex items-center gap-2 text-xs text-[#374151]">
                          <Check
                            className="h-4 w-4 shrink-0 text-[#2563EB]"
                            strokeWidth={2.5}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#enquiry-form"
                    className={`mt-6 flex min-h-[42px] items-center justify-center rounded-xl text-xs font-bold transition-all duration-200 ${
                      pkg.highlight
                        ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md"
                        : "border border-[#2563EB] bg-white text-[#2563EB] hover:bg-[#2563EB] hover:text-white"
                    }`}
                  >
                    Enquire Now
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Enquiry Form (5 cols) */}
        <div id="enquiry-form" className="lg:col-span-5 scroll-mt-20 flex flex-col">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-7 shadow-md flex-1 flex flex-col justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#111827]">Enquire Now</h2>
              <p className="mt-1 text-xs text-[#6B7280]">
                Fill the form and our team will get in touch with you.
              </p>
            </div>

            {submitted ? (
              <div className="my-auto flex flex-col items-center gap-3 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#111827]">Enquiry Submitted Successfully!</h3>
                <p className="max-w-xs text-xs text-[#6B7280] leading-relaxed">
                  Thank you! Your event enquiry has been saved. Our banquet team will call you back shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold text-[#2563EB] hover:underline"
                >
                  Submit another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
                {errorMessage && (
                  <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium border border-red-200">
                    {errorMessage}
                  </div>
                )}

                {/* Row 1: Full Name / Mobile Number */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="pkg-fullName" className="text-[11px] font-semibold text-[#111827]">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="pkg-fullName"
                      name="fullName"
                      autoComplete="name"
                      required
                      type="text"
                      placeholder="Your full name"
                      value={values.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="pkg-mobile" className="text-[11px] font-semibold text-[#111827]">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="pkg-mobile"
                      name="mobile"
                      autoComplete="tel"
                      required
                      type="tel"
                      placeholder="Your mobile number"
                      value={values.mobile}
                      onChange={(e) => set("mobile", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Row 2: Event Type / Event Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="pkg-eventType" className="text-[11px] font-semibold text-[#111827]">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="pkg-eventType"
                        name="eventType"
                        required
                        value={values.eventType}
                        onChange={(e) => set("eventType", e.target.value)}
                        className={selectCls}
                      >
                        <option value="" disabled>Select Event Type</option>
                        {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="pkg-eventDate" className="text-[11px] font-semibold text-[#111827]">
                      Event Date
                    </label>
                    <div className="relative">
                      <input
                        id="pkg-eventDate"
                        name="eventDate"
                        type="date"
                        value={values.eventDate}
                        onChange={(e) => set("eventDate", e.target.value)}
                        className={inputCls + " pr-8"}
                      />
                      <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                    </div>
                  </div>
                </div>

                {/* Row 3: Number of Guests / Budget Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="pkg-guests" className="text-[11px] font-semibold text-[#111827]">
                      Number of Guests
                    </label>
                    <input
                      id="pkg-guests"
                      name="guests"
                      type="number"
                      placeholder="Approx. number of guests"
                      value={values.guests}
                      onChange={(e) => set("guests", e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label htmlFor="pkg-budget" className="text-[11px] font-semibold text-[#111827]">
                      Budget Range
                    </label>
                    <div className="relative">
                      <select
                        id="pkg-budget"
                        name="budget"
                        value={values.budget}
                        onChange={(e) => set("budget", e.target.value)}
                        className={selectCls}
                      >
                        <option value="" disabled>Select Budget Range</option>
                        {budgetRanges.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="pkg-requirements" className="text-[11px] font-semibold text-[#111827]">
                    Special Requirements
                  </label>
                  <textarea
                    id="pkg-requirements"
                    name="requirements"
                    rows={3}
                    placeholder="Tell us about your requirements..."
                    value={values.requirements}
                    onChange={(e) => set("requirements", e.target.value)}
                    className="w-full resize-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3.5 py-2.5 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#1D4ED8] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <span>{isSubmitting ? "Submitting Enquiry..." : "Submit Enquiry ✈"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

