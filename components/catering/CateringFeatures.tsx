import { memo } from "react";
import { UtensilsCrossed, ShieldCheck, Truck, Sliders } from "lucide-react";
import { cateringFeatures } from "@/lib/catering-data";

const iconMap = {
  UtensilsCrossed,
  ShieldCheck,
  Truck,
  Sliders,
};

export const CateringFeatures = memo(function CateringFeatures() {
  return (
    <section className="bg-[#F9FAFB] pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cateringFeatures.map((feat) => {
            const Icon = iconMap[feat.icon as keyof typeof iconMap] || UtensilsCrossed;
            return (
              <div
                key={feat.id}
                className="flex items-start gap-3.5 rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-xs transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#111827]">{feat.title}</h3>
                  <p className="mt-0.5 text-[11px] sm:text-xs text-[#6B7280] leading-snug">
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});
