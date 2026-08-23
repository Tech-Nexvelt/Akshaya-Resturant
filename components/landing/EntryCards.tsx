"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Utensils, Calendar, Users, ArrowRight } from "lucide-react";
import { setEntryChoice, type EntryChoice } from "@/lib/analytics";

const choices: {
  id: EntryChoice;
  title: string;
  subtitle: string;
  icon: typeof Utensils;
}[] = [
  {
    id: "restaurant",
    title: "Restaurant",
    subtitle: "Authentic Telangana dining & ordering",
    icon: Utensils,
  },
  {
    id: "banquet",
    title: "Banquet Hall",
    subtitle: "AC halls for celebrations",
    icon: Calendar,
  },
  {
    id: "catering",
    title: "Catering",
    subtitle: "Outdoor catering services",
    icon: Users,
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
    <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {choices.map((choice, i) => {
        const Icon = choice.icon;
        return (
          <motion.div
            key={choice.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              onClick={() => handleSelectService(choice.id)}
              onMouseEnter={() => router.prefetch(`/${choice.id}`)}
              aria-label={`Select ${choice.title}: ${choice.subtitle}`}
              className="group flex w-full h-full items-center gap-4 sm:flex-col sm:items-center rounded-xl border border-gray-200 bg-white/80 px-5 py-4 sm:p-6 text-left sm:text-center shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:bg-white hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 min-h-[72px] sm:min-h-[140px]"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base sm:text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 sm:mt-2">
                  {choice.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-600 line-clamp-2">{choice.subtitle}</p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700 sm:mt-3">
                Continue
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
