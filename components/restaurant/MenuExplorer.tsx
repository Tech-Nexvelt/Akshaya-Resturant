"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { MenuCard } from "./MenuCard";
import { CategorySidebar } from "./CategorySidebar";
import { CartPanel } from "./CartPanel";
import { dishes, type CategoryFilter } from "@/lib/restaurant-data";

type DietFilter = "all" | "veg" | "nonveg";

export function MenuExplorer() {
  const [category, setCategory] = useState<CategoryFilter>("All Categories");
  const [query, setQuery] = useState("");
  const [diet, setDiet] = useState<DietFilter>("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dishes.filter((d) => {
      let matchesCategory = true;
      if (category === "All Categories") {
        matchesCategory = true;
      } else if (category === "Bestsellers") {
        matchesCategory = !!d.isBestseller;
      } else {
        matchesCategory = d.category === category;
      }

      const matchesQuery =
        q === "" ||
        d.name.toLowerCase().includes(q) ||
        (d.description?.toLowerCase().includes(q) ?? false);
      const matchesDiet =
        diet === "all" || (diet === "veg" ? d.isVeg : !d.isVeg);
      return matchesCategory && matchesQuery && matchesDiet;
    });
  }, [category, query, diet]);

  const isTrimmed = !showAll && filtered.length > 6;
  const visible = isTrimmed ? filtered.slice(0, 6) : filtered;
  const dietActive = diet !== "all";

  const handleCategorySelect = useCallback((cat: CategoryFilter) => {
    setCategory(cat);
    setShowAll(false);
  }, []);

  return (
    <section id="menu" className="scroll-mt-20 bg-[#F9FAFB] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              OUR MENU
            </p>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#111827]">
              Delicious Dishes for You
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B7280]">
              Select your favorites and enjoy a delightful meal.
            </p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <label htmlFor="search-dishes-input" className="sr-only">
                Search dishes
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]"
                aria-hidden="true"
              />
              <input
                id="search-dishes-input"
                name="search"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowAll(false);
                }}
                placeholder="Search dishes..."
                aria-label="Search dishes"
                className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white pl-9 pr-3 text-xs sm:text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>

            {/* Diet Filter toggle */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                aria-expanded={filterOpen}
                aria-haspopup="true"
                className={`flex h-10 items-center gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-colors cursor-pointer ${
                  dietActive
                    ? "border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]"
                    : "border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F3F4F6]"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                <span>Filter</span>
                {dietActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" aria-hidden="true" />
                )}
              </button>

              {filterOpen && (
                <div className="absolute right-0 z-30 mt-2 w-52 rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-lg">
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-xs font-bold uppercase tracking-wide text-[#6B7280]">
                      Dietary Filter
                    </span>
                    <button
                      onClick={() => setFilterOpen(false)}
                      aria-label="Close filters"
                      className="text-[#9CA3AF] hover:text-[#111827]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {(
                    [
                      ["all", "All dishes"],
                      ["veg", "Vegetarian only"],
                      ["nonveg", "Non-vegetarian only"],
                    ] as const
                  ).map(([value, label]) => (
                    <label
                      key={value}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-xs font-semibold text-[#111827] hover:bg-[#F3F4F6]"
                    >
                      <input
                        type="radio"
                        name="diet"
                        checked={diet === value}
                        onChange={() => {
                          setDiet(value);
                          setShowAll(false);
                        }}
                        className="h-4 w-4 accent-[#2563EB]"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layout: Left Sidebar Category Filter | Right 3-Col Dish Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
          {/* Left Category Sidebar */}
          <div>
            <CategorySidebar
              selectedCategory={category}
              onSelectCategory={handleCategorySelect}
            />
          </div>

          {/* Right Menu Grid Area */}
          <div className="min-w-0">
            {visible.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E5E7EB] bg-white py-16 text-center">
                <p className="text-sm font-semibold text-[#111827]">No dishes found</p>
                <p className="mt-1 text-xs text-[#6B7280]">
                  Try adjusting your search query or selected category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {visible.map((dish) => (
                  <MenuCard key={dish.id} dish={dish} />
                ))}
              </div>
            )}

            {/* View Full Menu button */}
            {isTrimmed && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-6 py-2.5 text-xs sm:text-sm font-bold text-[#111827] shadow-2xs hover:bg-[#F9FAFB] hover:border-[#2563EB] hover:text-[#2563EB] transition-all cursor-pointer active:scale-95"
                >
                  <span>View Full Menu &rarr;</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
