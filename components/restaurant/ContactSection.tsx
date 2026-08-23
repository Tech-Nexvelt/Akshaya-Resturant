"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, Mail, CheckCircle2 } from "lucide-react";
import { contactInfo } from "@/lib/restaurant-data";

export function ContactSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");

  /**
   * This used to set `subscribed` and drop the address on the floor — the visitor
   * was told they were on a list that did not exist. It now posts to
   * /api/newsletter, and only claims success when the row was actually written.
   */
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribing) return;

    const value = email.trim();
    if (!value) return;

    setSubscribeError("");
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "restaurant_contact" }),
      });
      const data = await res.json().catch(() => ({ success: false }));

      if (!res.ok || !data.success) {
        setSubscribeError(data.error || "We couldn't save your email. Please try again.");
        return;
      }

      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    } catch {
      setSubscribeError("We couldn't reach our server. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  const mapQuery = encodeURIComponent(contactInfo.mapQuery);

  return (
    <footer id="contact" className="scroll-mt-20 bg-[#F9FAFB] border-t border-[#E5E7EB]">
      {/* Top Contact & Newsletter Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
          {/* LEFT: Visit Us Details */}
          <div>
            <h3 className="text-base font-bold text-[#111827]">Visit Us</h3>
            <ul className="mt-4 space-y-3.5 text-xs sm:text-sm text-[#6B7280]">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />
                <span>{contactInfo.address[0]}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}
                  className="hover:text-[#2563EB] font-medium transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-[#2563EB] shrink-0" aria-hidden="true" />
                <span>{contactInfo.hours}</span>
              </li>
            </ul>
          </div>

          {/* CENTER: Map Preview Card */}
          <div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex min-h-[160px] items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-gradient-to-br from-[#EBF3FF] to-[#DCE9FF] p-6 shadow-2xs hover:shadow-md transition-all"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(90deg, #2563EB 1px, transparent 1px)",
                  backgroundSize: "28px 28px",
                }}
              />
              <div className="relative flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-md group-hover:scale-110 transition-transform">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="text-xs font-bold text-[#111827]">View Map Preview</span>
                <span className="text-[11px] text-[#6B7280]">{contactInfo.address[0]}</span>
              </div>
            </a>
          </div>

          {/* RIGHT: Stay Updated Newsletter */}
          <div>
            <h3 className="text-base font-bold text-[#111827]">Stay Updated</h3>
            <p className="mt-1 text-xs text-[#6B7280]">Get latest offers and updates</p>

            <form onSubmit={handleSubscribe} className="mt-4 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  aria-label="Email address for newsletter"
                  className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>
              <button
                type="submit"
                disabled={subscribing}
                className="h-10 shrink-0 cursor-pointer rounded-xl bg-[#2563EB] px-5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#1D4ED8] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {subscribed ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Subscribed
                  </span>
                ) : subscribing ? (
                  "Saving…"
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>

            {subscribeError && (
              <p role="alert" className="mt-2 text-xs font-medium text-red-600">
                {subscribeError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER BAR */}
      <div className="border-t border-[#E5E7EB] bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8 text-xs text-[#6B7280]">
          {/* Copyright */}
          <p>© 2024 Akshaya Restaurant. All rights reserved.</p>

          {/* Links */}
          <div className="flex items-center gap-4 font-medium">
            <a href="/privacy" className="hover:text-[#2563EB] transition-colors">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-[#2563EB] transition-colors">
              Terms & Conditions
            </a>
            <span>•</span>
            <a href="/terms#refund" className="hover:text-[#2563EB] transition-colors">
              Refund Policy
            </a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z"/>
              </svg>
            </a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
            >
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
