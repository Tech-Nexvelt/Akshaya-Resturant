"use client";

import { useState } from "react";
import { Send, Calendar, ChevronDown } from "lucide-react";

const eventTypes = [
  "Wedding",
  "Reception",
  "Birthday Party",
  "Corporate Event",
  "Engagement",
  "Anniversary",
  "Other",
];

const budgetRanges = [
  "Under ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,00,000",
  "₹2,00,000 – ₹5,00,000",
  "Above ₹5,00,000",
];

export function BanquetEnquiryForm() {
  const [values, setValues] = useState({
    fullName: "",
    mobile: "",
    eventType: "",
    eventDate: "",
    guests: "",
    budget: "",
    requirements: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function set(key: string, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lines = [
      `Name: ${values.fullName}`,
      `Mobile: ${values.mobile}`,
      `Event Type: ${values.eventType}`,
      `Event Date: ${values.eventDate}`,
      `Guests: ${values.guests}`,
      `Budget: ${values.budget}`,
      `Requirements: ${values.requirements}`,
    ].join("\n");
    const msg = `Hi Akshaya Banquet Hall, I have an enquiry:\n${lines}`;
    window.open(`https://wa.me/919055646464?text=${encodeURIComponent(msg)}`, "_blank");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#DBEAFE] text-[#2563EB]">
          <Send className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-[#111827]">Enquiry Sent!</h3>
        <p className="max-w-xs text-sm text-[#6B7280]">
          We&rsquo;ve opened WhatsApp with your details. Our team will get back to you shortly.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-colors min-h-[40px]";

  const selectCls =
    "w-full appearance-none rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-xs text-[#111827] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-colors min-h-[40px] pr-8";

  return (
    <section
      id="enquiry-form"
      className="mt-12 md:mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Packages (already shown above — this creates balanced layout on desktop) */}
        {/* The packages are rendered separately in a sibling component for stacked mobile */}
        {/* On desktop the form appears on the right; on mobile it stacks below packages */}
        {/* We wrap everything in a single-column form card */}
        <div className="lg:col-start-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[#111827]">Enquire Now</h2>
            <p className="mt-0.5 text-xs text-[#6B7280]">Fill the form and our team will get in touch with you.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="bq-fullName" className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Full Name
                  </label>
                  <input
                    id="bq-fullName"
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
                  <label htmlFor="bq-mobile" className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Mobile Number
                  </label>
                  <input
                    id="bq-mobile"
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

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="bq-eventType" className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Event Type
                  </label>
                  <div className="relative">
                    <select
                      id="bq-eventType"
                      name="eventType"
                      value={values.eventType}
                      onChange={(e) => set("eventType", e.target.value)}
                      className={selectCls}
                    >
                      <option value="" disabled>Select Event Type</option>
                      {eventTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="bq-eventDate" className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Event Date
                  </label>
                  <div className="relative">
                    <input
                      id="bq-eventDate"
                      name="eventDate"
                      type="date"
                      value={values.eventDate}
                      onChange={(e) => set("eventDate", e.target.value)}
                      className={inputCls + " pr-8"}
                    />
                    <Calendar className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="bq-guests" className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Number of Guests
                  </label>
                  <input
                    id="bq-guests"
                    name="guests"
                    type="number"
                    placeholder="Approx. number of guests"
                    value={values.guests}
                    onChange={(e) => set("guests", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label htmlFor="bq-budget" className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                    Budget Range
                  </label>
                  <div className="relative">
                    <select
                      id="bq-budget"
                      name="budget"
                      value={values.budget}
                      onChange={(e) => set("budget", e.target.value)}
                      className={selectCls}
                    >
                      <option value="" disabled>Select Budget Range</option>
                      {budgetRanges.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#9CA3AF]" />
                  </div>
                </div>
              </div>

              {/* Special Requirements */}
              <div className="flex flex-col gap-1">
                <label htmlFor="bq-requirements" className="text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  Special Requirements
                </label>
                <textarea
                  id="bq-requirements"
                  name="requirements"
                  rows={3}
                  placeholder="Tell us about your requirements..."
                  value={values.requirements}
                  onChange={(e) => set("requirements", e.target.value)}
                  className="w-full resize-none rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2.5 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB] transition-colors"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-1 flex w-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#1D4ED8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Enquiry
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
