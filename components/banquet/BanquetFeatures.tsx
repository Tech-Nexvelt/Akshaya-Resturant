import { Users, Snowflake, Car, UtensilsCrossed } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Seating Capacity",
    highlight: "300 – 800 Guests",
    desc: "Spacious halls for small and large gatherings",
  },
  {
    icon: Snowflake,
    title: "Ac / Non-Ac Halls",
    highlight: "Comfortable Ambience",
    desc: "Well-ventilated, air-conditioned halls for your comfort.",
  },
  {
    icon: Car,
    title: "Ample Parking",
    highlight: "Hassle-free Parking",
    desc: "Large parking space for you and your guests.",
  },
  {
    icon: UtensilsCrossed,
    title: "Catering Options",
    highlight: "Veg & Non-Veg",
    desc: "Delicious multi-cuisine catering (customizable).",
  },
];

export function BanquetFeatures() {
  return (
    <section className="relative z-20 mx-auto -mt-10 sm:-mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 rounded-2xl border border-[#E5E7EB] bg-white shadow-lg overflow-hidden">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className={`flex items-start gap-4 p-5 sm:p-6 transition-colors hover:bg-slate-50/80 ${
                idx < features.length - 1
                  ? "border-b sm:border-b-0 lg:border-r border-[#E5E7EB]"
                  : ""
              } ${idx % 2 === 0 && idx < features.length - 1 ? "sm:border-r lg:border-r" : ""}`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB] mt-0.5">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#6B7280]">{feat.title}</p>
                <p className="text-sm font-bold text-[#111827] mt-0.5">{feat.highlight}</p>
                <p className="text-xs text-[#6B7280] mt-1 leading-snug">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

