"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Utensils, Calendar, Users, ArrowRight } from "lucide-react";
import { setEntryChoice, type EntryChoice } from "@/lib/analytics";

const choices = [
  {
    id: "restaurant" as EntryChoice,
    title: "Restaurant",
    subtitle: "Authentic Telangana dining & online ordering",
    tag: "Food & Dining",
    imageSrc: "/Images/service-card-restaurant.png",
    icon: Utensils,
    badgeStyle:
      "bg-amber-500/20 text-amber-300 border-amber-500/30 group-hover:bg-amber-500 group-hover:text-white",
  },
  {
    id: "banquet" as EntryChoice,
    title: "Banquet Hall",
    subtitle: "AC halls for grand celebrations & weddings",
    tag: "Events & Halls",
    imageSrc: "/Images/service-card-banquet.png",
    icon: Calendar,
    badgeStyle:
      "bg-blue-500/20 text-blue-300 border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white",
  },
  {
    id: "catering" as EntryChoice,
    title: "Catering",
    subtitle: "Outdoor catering services & live buffets",
    tag: "Outdoor Service",
    imageSrc: "/Images/service-card-catering.png",
    icon: Users,
    badgeStyle:
      "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 group-hover:bg-emerald-600 group-hover:text-white",
  },
];

export function EntryCards() {
  const router = useRouter();

  const handleSelectService = (serviceId: EntryChoice) => {
    setEntryChoice(serviceId);
    if (typeof window !== "undefined") {
      localStorage.setItem("akshaya_service", serviceId);
    }
    router.push(`/${serviceId}`);
  };

  return (
    <div className="grid w-full max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {choices.map((choice, i) => {
        const Icon = choice.icon;
        return (
          <motion.div
            key={choice.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => handleSelectService(choice.id)}
              onMouseEnter={() => router.prefetch(`/${choice.id}`)}
              aria-label={`Select ${choice.title}: ${choice.subtitle}`}
              className="group relative flex h-72 sm:h-80 w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/20 bg-slate-900 text-left shadow-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-white/40 hover:shadow-2xl hover:shadow-blue-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer"
            >
              {/* Contextual Service Background Image */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <Image
                  src={choice.imageSrc}
                  alt={choice.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-110 opacity-100"
                  priority={i === 0}
                />

                {/* Lightened Dark Overlay: subtle bottom gradient for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/5 transition-opacity duration-300 group-hover:from-black/70 group-hover:via-black/20" />
              </div>

              {/* Card Content Layer */}
              <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-7">
                {/* Header Badge & Service Tag */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border backdrop-blur-md transition-all duration-300 shadow-md ${choice.badgeStyle}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-black/50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white border border-white/30 backdrop-blur-md shadow-sm">
                    {choice.tag}
                  </span>
                </div>

                {/* Footer Copy & Call to Action */}
                <div className="space-y-2 pt-6">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-md transition-transform duration-300 group-hover:translate-x-0.5">
                    {choice.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-[#F3F4F6] drop-shadow-sm">
                    {choice.subtitle}
                  </p>

                  <div className="pt-3 flex items-center gap-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white drop-shadow-sm group-hover:text-blue-300 transition-colors">
                    <span>Continue</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
