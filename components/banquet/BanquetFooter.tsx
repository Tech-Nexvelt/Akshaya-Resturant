import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export function BanquetFooter() {
  return (
    <footer
      id="contact"
      className="mt-20 border-t border-[#E5E7EB] bg-white scroll-mt-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Column 1: Contact Us */}
          <div>
            <h3 className="text-base font-bold text-[#2563EB] mb-4">Contact Us</h3>
            <ul className="space-y-3 text-xs sm:text-sm text-[#374151]">
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#2563EB] shrink-0" />
                <a href="tel:+919876543210" className="hover:text-[#2563EB] transition-colors font-medium">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#2563EB] shrink-0" />
                <a href="mailto:info@akshaya.com" className="hover:text-[#2563EB] transition-colors font-medium">
                  info@akshaya.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Plot No. 12, Main Road,<br />
                  Hyderabad, Telangana - 500001
                </span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="mt-6 flex items-center gap-3">
              {/* Facebook */}
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB] transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:border-[#E1306C] hover:bg-[#FDF2F8] hover:text-[#E1306C] transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href="https://wa.me/919876543210"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:border-[#25D366] hover:bg-[#DCFCE7] hover:text-[#25D366] transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.979-1.404A9.942 9.942 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.942 7.942 0 01-4.275-1.247l-.306-.183-3.195.9.845-3.254-.2-.318A7.949 7.949 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="#"
                aria-label="YouTube"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] text-[#6B7280] hover:border-[#FF0000] hover:bg-[#FEE2E2] hover:text-[#FF0000] transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Opening Hours */}
          <div>
            <h3 className="text-base font-bold text-[#2563EB] mb-4">Opening Hours</h3>
            <div className="flex items-start gap-3 text-xs sm:text-sm text-[#374151]">
              <Clock className="h-4 w-4 text-[#2563EB] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[#111827]">Mon – Sun</p>
                <p className="text-xs text-[#6B7280]">9:00 AM – 10:00 PM</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
              <p className="text-xs font-bold text-[#111827]">We&rsquo;re Here to Help</p>
              <p className="mt-1 text-xs text-[#6B7280] leading-relaxed">
                Our team is ready to assist you with your event enquiry and venue walkthrough.
              </p>
            </div>
          </div>

          {/* Column 3: Find Us Map */}
          <div>
            <h3 className="text-base font-bold text-[#2563EB] mb-4">Find Us</h3>
            <div className="relative h-44 rounded-2xl overflow-hidden border border-[#E5E7EB] bg-[#E2E8F0] shadow-inner">
              {/* Map Graphic Background */}
              <div className="absolute inset-0 bg-[#E8F4F8]" />
              <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#94A3B8" strokeWidth="0.8" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <path d="M -10 80 Q 80 40 160 110 T 320 90" fill="none" stroke="#60A5FA" strokeWidth="4" />
                <path d="M 40 -10 Q 90 90 220 180" fill="none" stroke="#F59E0B" strokeWidth="3" />
              </svg>

              {/* Pin Centered */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center animate-bounce duration-1000">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xl ring-4 ring-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="mt-1.5 rounded-lg bg-white px-2.5 py-1 shadow-md text-[11px] font-bold text-[#111827] border border-[#E5E7EB]">
                    Akshaya Banquet Hall
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E5E7EB] pt-6 text-xs text-[#6B7280]">
          <p>
            &copy; 2025 Akshaya. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="hover:text-[#2563EB] transition-colors">Privacy Policy</Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-[#2563EB] transition-colors">Terms &amp; Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

