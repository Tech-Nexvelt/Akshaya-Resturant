import { memo } from "react";
import { Heart, Building2, PartyPopper, Sun } from "lucide-react";
import { DishImage } from "@/components/restaurant/DishImage";
import { cateringEventTypes } from "@/lib/catering-data";

const iconMap = {
  Heart,
  Building2,
  PartyPopper,
  Sun,
};

export const CateringEventTypes = memo(function CateringEventTypes() {
  return (
    <section id="event-types" className="scroll-mt-20 bg-[#F9FAFB] py-14 border-t border-[#E5E7EB]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">We Cater For</p>
        <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
          Perfect for Every Event
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cateringEventTypes.map((evt) => {
            const Icon = iconMap[evt.icon as keyof typeof iconMap] || Heart;
            return (
              <div
                key={evt.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:scale-[1.01]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <DishImage
                    src={evt.image}
                    tint="from-slate-100 to-slate-200"
                    alt={evt.title}
                    rounded="rounded-none"
                    className="h-full w-full"
                  />
                  <div className="absolute left-3 bottom-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-md">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-bold text-[#111827]">{evt.title}</h3>
                  <p className="mt-1 text-xs text-[#6B7280] leading-relaxed">
                    {evt.description}
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
