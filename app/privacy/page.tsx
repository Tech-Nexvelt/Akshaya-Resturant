import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/lib/data";

export const metadata: Metadata = {
  title: "Privacy Policy | Akshaya Family Restaurant",
  description: "Privacy Policy for Akshaya Family Restaurant Siddipet.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-12 text-gray-900 md:py-20">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link href="/restaurant" className="inline-block text-xs font-semibold uppercase tracking-wider text-blue-600 hover:text-blue-700">
          &larr; Back to Restaurant
        </Link>

        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-xs text-gray-500">Last updated: August 21, 2026</p>
        </div>

        <section className="space-y-4 text-sm leading-relaxed text-gray-700">
          <p>
            At <strong>{brand.name}</strong> (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;), respecting your privacy is a foundational principle of our service. This Privacy Policy outlines how we collect, use, and protect your information when you visit our website or use our dining, banquet, and catering services in Siddipet.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-4">1. Information We Collect</h2>
          <p>We collect information you directly provide to us when placing an order or submitting an enquiry:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Contact Details:</strong> Your name, phone number, and delivery or event address.</li>
            <li><strong>Order & Enquiry History:</strong> Selected dishes, banquet dates, guest counts, and special notes.</li>
            <li><strong>Payment Information:</strong> Online transactions are handled via PCI-DSS compliant payment gateways (such as Razorpay). We do not store credit card numbers or banking passwords on our servers.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">2. How We Use Your Information</h2>
          <p>Your details are strictly used to fulfill your food orders and event enquiries:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Processing and delivering your restaurant orders.</li>
            <li>Communicating order status or confirming banquet/catering bookings via call or WhatsApp.</li>
            <li>Improving our menu offerings and customer experience in Siddipet.</li>
          </ul>

          <h2 className="text-lg font-bold text-gray-900 pt-4">3. Data Security & Sharing</h2>
          <p>
            We do not sell, rent, or trade your personal information to third parties for marketing purposes. Data is shared only with operational partners (such as delivery personnel or payment processors) strictly to complete your transaction.
          </p>

          <h2 className="text-lg font-bold text-gray-900 pt-4">4. Contact Us</h2>
          <p>
            For any questions or privacy concerns, please reach out to us at:
            <br />
            <strong>{brand.name}</strong>
            <br />
            Main Road, Siddipet, Telangana 502103
            <br />
            Phone: +91 98490 12345
          </p>
        </section>
      </div>
    </main>
  );
}
