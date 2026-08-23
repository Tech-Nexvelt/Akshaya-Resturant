"use client";

import { useState, memo } from "react";
import { Send, ShieldCheck, UtensilsCrossed, Clock, CheckCircle2 } from "lucide-react";
import { cateringContact } from "@/lib/catering-data";

/** Where a lead goes if the database cannot take it. Same number as the page CTA. */
const WHATSAPP_NUMBER = "919876543210";

const emptyForm = {
  fullName: "",
  mobileNumber: "",
  eventType: "",
  eventLocation: "",
  eventDate: "",
  guestCount: "",
  selectedPackage: "",
  budgetRange: "",
  specialRequirements: "",
};

export const CateringEnquirySection = memo(function CateringEnquirySection() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * A catering lead is worth too much to lose to a backend outage, so this has two
   * independent paths: persist through `/api/enquiry/catering`, and if that fails
   * for ANY reason, hand off to WhatsApp so the enquiry still reaches a human.
   * The visitor is never shown a success state for a lead that went nowhere —
   * which is exactly what the previous version did (it only set `submitted`).
   */
  function whatsappHandoff() {
    const lines = [
      `Name: ${formData.fullName}`,
      `Mobile: ${formData.mobileNumber}`,
      `Event Type: ${formData.eventType || "N/A"}`,
      `Location: ${formData.eventLocation}`,
      `Event Date: ${formData.eventDate || "TBD"}`,
      `Guests: ${formData.guestCount || "N/A"}`,
      `Package: ${formData.selectedPackage || "N/A"}`,
      `Budget: ${formData.budgetRange || "N/A"}`,
      `Requirements: ${formData.specialRequirements || "None"}`,
    ].join("\n");
    const msg = `Hi Akshaya Catering, I would like a quote:\n${lines}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/enquiry/catering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.mobileNumber,
          eventType: formData.eventType || "Catering Enquiry",
          location: formData.eventLocation,
          guestCount: formData.guestCount || null,
          eventDate: formData.eventDate || null,
          requirements: [
            formData.selectedPackage && `Package: ${formData.selectedPackage}`,
            formData.budgetRange && `Budget: ${formData.budgetRange}`,
            formData.specialRequirements,
          ]
            .filter(Boolean)
            .join(" | "),
        }),
      });

      const data = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit enquiry");
      }

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setFormData(emptyForm);
    } catch {
      // Never a silent loss: tell the visitor plainly and open the fallback.
      setErrorMessage(
        "We couldn't reach our booking system. Opening WhatsApp so your enquiry still reaches us."
      );
      whatsappHandoff();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="enquiry-form" className="scroll-mt-20 bg-white py-14 border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-stretch">
          {/* LEFT: Enquiry Form */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Enquire Now</p>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              Get Your Catering Quote
            </h2>

            {submitted && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Thank you! Your catering enquiry has been submitted. We will contact you shortly.</span>
              </div>
            )}

            {errorMessage && (
              <div
                role="alert"
                className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-900"
              >
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold text-[#111827]">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="mt-1 h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>

                <div>
                  <label htmlFor="mobileNumber" className="block text-xs font-bold text-[#111827]">Mobile Number</label>
                  <input
                    id="mobileNumber"
                    type="tel"
                    required
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="Your mobile number"
                    className="mt-1 h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="eventType" className="block text-xs font-bold text-[#111827]">Event Type</label>
                  <select
                    id="eventType"
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    className="mt-1 h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                  >
                    <option value="">Select Event Type</option>
                    <option value="wedding">Wedding / Reception</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="birthday">Birthday Party</option>
                    <option value="outdoor">Outdoor Party / Gathering</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="eventDate" className="block text-xs font-bold text-[#111827]">Event Date</label>
                  <input
                    id="eventDate"
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="mt-1 h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="eventLocation" className="block text-xs font-bold text-[#111827]">
                  Event Location
                </label>
                <input
                  id="eventLocation"
                  type="text"
                  required
                  name="eventLocation"
                  value={formData.eventLocation}
                  onChange={handleChange}
                  placeholder="Venue address in or near Hyderabad"
                  className="mt-1 h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="guestCount" className="block text-xs font-bold text-[#111827]">Number of Guests</label>
                  <input
                    id="guestCount"
                    type="text"
                    name="guestCount"
                    value={formData.guestCount}
                    onChange={handleChange}
                    placeholder="Approx. number of guests"
                    className="mt-1 h-10 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>

                <div>
                  <label htmlFor="selectedPackage" className="block text-xs font-bold text-[#111827]">Selected Package</label>
                  <select
                    id="selectedPackage"
                    name="selectedPackage"
                    value={formData.selectedPackage}
                    onChange={handleChange}
                    className="mt-1 h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                  >
                    <option value="">Select Package</option>
                    <option value="basic">Basic Package (₹249/plate)</option>
                    <option value="standard">Standard Package (₹349/plate)</option>
                    <option value="premium">Premium Package (₹499/plate)</option>
                    <option value="custom">Customized Menu</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="budgetRange" className="block text-xs font-bold text-[#111827]">Budget Range</label>
                <select
                  id="budgetRange"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className="mt-1 h-10 w-full appearance-none rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 cursor-pointer"
                >
                  <option value="">Select Budget Range</option>
                  <option value="50k-1L">₹50,000 - ₹1,00,000</option>
                  <option value="1L-2.5L">₹1,00,000 - ₹2,50,000</option>
                  <option value="2.5L-5L">₹2,50,000 - ₹5,00,000</option>
                  <option value="5L+">₹5,00,000+</option>
                </select>
              </div>

              <div>
                <label htmlFor="specialRequirements" className="block text-xs font-bold text-[#111827]">Special Requirements</label>
                <textarea
                  id="specialRequirements"
                  name="specialRequirements"
                  rows={2}
                  value={formData.specialRequirements}
                  onChange={handleChange}
                  placeholder="Tell us about your requirements..."
                  className="mt-1 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-[#1D4ED8] active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{isSubmitting ? "Sending…" : "Get Catering Quote"}</span>
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>

          {/* RIGHT: Photo & Badges */}
          <div className="relative overflow-hidden rounded-2xl border border-[#E5E7EB] bg-[#111827] shadow-sm flex flex-col justify-end">
            <img
              src="/Images/catering/quote-outdoor.png"
              alt="Outdoor catering setup"
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />

            {/* Overlay Badges Strip */}
            <div className="relative z-10 m-4 rounded-xl border border-white/20 bg-black/75 p-3.5 backdrop-blur-md">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-white">
                <div className="flex items-center gap-1.5">
                  <UtensilsCrossed className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  <span>Delicious Food</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  <span>Hygienic Preparation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#2563EB]" aria-hidden="true" />
                  <span>Timely Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
