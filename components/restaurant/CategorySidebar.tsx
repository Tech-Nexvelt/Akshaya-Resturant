"use client";

import { memo } from "react";
import {
  LayoutGrid,
  CookingPot,
  Flame,
  UtensilsCrossed,
  Sparkles,
  Soup,
  Sandwich,
  IceCream2,
  CupSoda,
  FileText,
} from "lucide-react";
import { categoryFilters, type CategoryFilter } from "@/lib/restaurant-data";

const categoryIcons: Record<CategoryFilter, typeof LayoutGrid> = {
  "All Categories": LayoutGrid,
  Bestsellers: Sparkles,
  Biryani: CookingPot,
  Starters: Flame,
  "Main Course": UtensilsCrossed,
  Breads: Sandwich,
  Desserts: IceCream2,
  Beverages: CupSoda,
};

interface CategorySidebarProps {
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  onAddNoteClick?: () => void;
}

export const CategorySidebar = memo(function CategorySidebar({
  selectedCategory,
  onSelectCategory,
  onAddNoteClick,
}: CategorySidebarProps) {
  return (
    <aside className="sticky top-20 z-20 flex flex-col gap-4">
      {/* Category Rail */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
        <nav aria-label="Menu Categories">
          <ul className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0 scrollbar-none">
            {categoryFilters.map((cat) => {
              const Icon = categoryIcons[cat] || LayoutGrid;
              const isActive = cat === selectedCategory;
              return (
                <li key={cat} className="shrink-0">
                  <button
                    onClick={() => onSelectCategory(cat)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[#2563EB] text-white shadow-xs font-bold"
                        : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{cat}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Special Request Box (Desktop) */}
      <div className="hidden lg:block rounded-xl border border-[#DBEAFE] bg-[#F5F9FF] p-4 shadow-xs">
        <div className="flex items-start gap-2.5">
          <FileText className="h-4 w-4 text-[#2563EB] mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#111827]">Have a special request?</h4>
            <p className="mt-0.5 text-[11px] text-[#6B7280] leading-relaxed">
              Add instructions for your order
            </p>
            <button
              onClick={onAddNoteClick}
              className="mt-2.5 inline-flex min-h-[32px] items-center rounded-lg border border-[#2563EB] bg-white px-3 py-1 text-xs font-bold text-[#2563EB] shadow-2xs hover:bg-[#EFF6FF] transition-all cursor-pointer active:scale-95"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
});
