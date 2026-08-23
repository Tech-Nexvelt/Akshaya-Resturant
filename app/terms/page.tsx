import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/data";

export const metadata: Metadata = {
  title: "Terms & Cancellation Policy | Akshaya Family Restaurant",
  description: "Terms of Service and Refund/Cancellation Policy for Akshaya Family Restaurant Siddipet.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900 md:py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link href="/restaurant" className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-700">
          &larr; Back to Restaurant
        </Link>

        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Terms & Refund Policy</h1>
          <p className="mt-2 text-xs text-gray-500">Last updated: August 21, 2026</p>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>
            Welcome to <strong>{brand.name}</strong> (&ldquo;Akshaya&rdquo;). By accessing our website, placing an order, or booking our banquet halls or catering services, you agree to comply with the following Terms and Conditions.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-4">1. Restaurant Orders & Pricing</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>All prices listed on the website are in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise.</li>
            <li>Menu items are subject to availability. In case an ordered dish is out of stock, our team will notify you promptly to offer a substitute or refund.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">2. Cancellation & Refund Policy</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Restaurant Orders:</strong> Food orders can be cancelled prior to kitchen preparation (within 5 minutes of order placement). Once preparation has commenced, orders cannot be cancelled or refunded.</li>
            <li><strong>Banquet & Catering Bookings:</strong> Banquet hall advance deposits are refundable up to 7 days prior to the event date. Cancellations made within 7 days of the event are non-refundable due to reserved hall dates and pre-procured ingredients.</li>
            <li><strong>Refund Processing:</strong> Approved online refunds will be credited back to the original payment method within 5–7 business days.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">3. Governing Law</h2>
          <p>
            These terms are governed by the laws of India and subject to the exclusive jurisdiction of the courts in Siddipet / Hyderabad, Telangana.
          </p>
        </section>
      </div>
    </main>
  );
}
