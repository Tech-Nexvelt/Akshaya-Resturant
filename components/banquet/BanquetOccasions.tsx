import Image from "next/image";
import { Users, Heart, Gift, Briefcase } from "lucide-react";

const occasions = [
  {
    id: "weddings",
    title: "Weddings",
    desc: "Make your dream wedding truly magical.",
    src: "/banquet/occasion-wedding.png",
    alt: "Ornate floral wedding mandap inside Akshaya Banquet Hall",
    icon: Heart,
  },
  {
    id: "receptions",
    title: "Receptions",
    desc: "Celebrate love with elegance and grandeur.",
    src: "/banquet/occasion-reception.png",
    alt: "Grand wedding reception dinner arrangement",
    icon: Users,
  },
  {
    id: "birthdays",
    title: "Birthday Parties",
    desc: "Host memorable birthdays with style.",
    src: "/banquet/occasion-birthday.png",
    alt: "Upscale birthday celebration setup with balloon arch",
    icon: Gift,
  },
  {
    id: "corporate",
    title: "Corporate Events",
    desc: "Perfect venues for meetings, seminars & gatherings.",
    src: "/banquet/occasion-corporate.png",
    alt: "Corporate conference setup in Akshaya Banquet Hall",
    icon: Briefcase,
  },
];

export function BanquetOccasions() {
  return (
    <section
      id="facilities"
      className="mt-14 md:mt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20"
    >
      <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-[#111827] mb-6">
        Perfect For Every Occasion
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {occasions.map((occ) => {
          const Icon = occ.icon;
          return (
            <div
              key={occ.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image with overlapping blue badge */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <Image
                  src={occ.src}
                  alt={occ.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Small circular blue icon badge overlapping bottom-left corner */}
                <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-lg border-2 border-white">
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors">
                    {occ.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#6B7280] leading-relaxed">
                    {occ.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

