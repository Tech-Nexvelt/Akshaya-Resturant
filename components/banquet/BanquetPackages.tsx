import { Check } from "lucide-react";

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
      "Hall for 8 Hours",
      "Royal Decoration",
      "Multi-cuisine Catering",
      "Up to 800 Guests",
    ],
    highlight: false,
  },
];

export function BanquetPackages() {
  return (
    <section id="packages" className="mt-12 md:mt-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <h2 className="text-xl sm:text-2xl font-bold text-[#111827] mb-6">Our Packages</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-start">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative flex flex-col rounded-xl border p-5 sm:p-6 transition-all duration-200 ${
              pkg.highlight
                ? "border-[#2563EB] bg-white shadow-xl ring-1 ring-[#2563EB]"
                : "border-[#E5E7EB] bg-white shadow-sm hover:shadow-md"
            }`}
          >
            {/* Most Popular Badge */}
            {pkg.highlight && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-block rounded-full bg-[#2563EB] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                  Most Popular
                </span>
              </div>
            )}

            <div className={pkg.highlight ? "mt-2" : ""}>
              <h3
                className={`text-base font-bold ${
                  pkg.highlight ? "text-[#2563EB]" : "text-[#111827]"
                }`}
              >
                {pkg.name}
              </h3>
              <p className="mt-0.5 text-[11px] text-[#6B7280]">{pkg.subtitle}</p>
            </div>

            <div className={`mt-4 text-base font-bold ${pkg.highlight ? "text-[#2563EB]" : "text-[#111827]"}`}>
              Contact for Pricing
            </div>

            <ul className="mt-4 space-y-2.5">
              {pkg.features.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-xs text-[#374151]">
                  <Check
                    className={`h-3.5 w-3.5 shrink-0 ${
                      pkg.highlight ? "text-[#2563EB]" : "text-[#6B7280]"
                    }`}
                    strokeWidth={2.5}
                  />
                  {feat}
                </li>
              ))}
            </ul>

            <a
              href="#enquiry-form"
              className={`mt-6 flex min-h-[40px] items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 ${
                pkg.highlight
                  ? "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-md"
                  : "border border-[#E5E7EB] bg-white text-[#111827] hover:border-[#2563EB] hover:text-[#2563EB]"
              }`}
            >
              Enquire Now
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
