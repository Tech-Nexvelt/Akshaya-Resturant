"use client";

import { memo, useState, useCallback } from "react";
import { Check, Plus, Minus } from "lucide-react";
import { DishImage, VegBadge } from "./DishImage";
import { useCart } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import type { Dish } from "@/lib/restaurant-data";

interface MenuCardProps {
  dish: Dish;
}

export const MenuCard = memo(function MenuCard({ dish }: MenuCardProps) {
  const line = useCart(useCallback((s) => s.lines.find((l) => l.id === dish.id), [dish.id]));
  const addItem = useCart((s) => s.addItem);
  const updateQty = useCart((s) => s.updateQty);

  const [justAdded, setJustAdded] = useState(false);
  const qty = line?.quantity ?? 0;

  const handleAdd = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      addItem({ id: dish.id, name: dish.name, price: dish.price, image_url: dish.image });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    },
    [addItem, dish]
  );

  const handleIncrement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      updateQty(dish.id, qty + 1);
    },
    [updateQty, dish.id, qty]
  );

  const handleDecrement = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      updateQty(dish.id, qty - 1);
    },
    [updateQty, dish.id, qty]
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.01] sm:hover:scale-[1.02]">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <DishImage
          src={dish.image}
          tint={dish.tint}
          alt={dish.name}
          rounded="rounded-none"
          className="h-full w-full"
        />

        <div className="absolute left-2.5 top-2.5 z-10">
          <VegBadge isVeg={dish.isVeg} />
        </div>

        {dish.isBestseller && (
          <span className="absolute right-2.5 top-2.5 z-10 rounded-md bg-[#2563EB] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-xs">
            Bestseller
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm sm:text-base font-bold leading-snug text-[#111827] line-clamp-1">
          {dish.name}
        </h3>

        {dish.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#6B7280]">
            {dish.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm sm:text-base font-bold text-[#111827] tabular-nums">
            {formatCurrency(dish.price)}
          </span>

          {qty === 0 ? (
            <button
              onClick={handleAdd}
              aria-label={`Add ${dish.name} to cart`}
              className={`min-h-[36px] h-9 rounded-lg border px-4 py-1 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                justAdded
                  ? "border-[#16A34A] bg-[#16A34A] text-white shadow-xs"
                  : "border-[#2563EB] text-[#2563EB] bg-white hover:bg-[#EFF6FF]"
              }`}
            >
              {justAdded ? (
                <span className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" /> Added
                </span>
              ) : (
                "Add"
              )}
            </button>
          ) : (
            <div className="flex items-center rounded-lg border border-[#2563EB] bg-[#EFF6FF]">
              <button
                onClick={handleDecrement}
                aria-label={`Reduce ${dish.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-l-lg text-[#2563EB] hover:bg-[#DBEAFE] active:scale-95 transition-all cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <span className="w-6 text-center text-xs font-bold text-[#2563EB] tabular-nums">
                {qty}
              </span>
              <button
                onClick={handleIncrement}
                aria-label={`Add another ${dish.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-r-lg text-[#2563EB] hover:bg-[#DBEAFE] active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
});

export const DishCard = MenuCard;
