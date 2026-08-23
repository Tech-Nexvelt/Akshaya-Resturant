"use client";

import { memo, useCallback } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { DishImage } from "./DishImage";
import { useCart, type CartItem as CartItemType } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { dishes } from "@/lib/restaurant-data";

interface CartItemProps {
  line: CartItemType;
}

export const CartItem = memo(function CartItem({ line }: CartItemProps) {
  const updateQty = useCart((s) => s.updateQty);
  const removeItem = useCart((s) => s.removeItem);

  const dish = dishes.find((d) => d.id === line.id);

  const handleDecrement = useCallback(() => {
    updateQty(line.id, line.quantity - 1);
  }, [updateQty, line.id, line.quantity]);

  const handleIncrement = useCallback(() => {
    updateQty(line.id, line.quantity + 1);
  }, [updateQty, line.id, line.quantity]);

  const handleRemove = useCallback(() => {
    removeItem(line.id);
  }, [removeItem, line.id]);

  return (
    <li className="flex items-center gap-3.5 py-4 border-b border-[#F3F4F6] last:border-b-0">
      <DishImage
        src={line.image_url ?? dish?.image ?? "/Images/paneer-butter-masala.jpg"}
        tint={dish?.tint ?? "from-stone-100 to-stone-200"}
        alt={line.name}
        rounded="rounded-xl"
        className="h-16 w-16 shrink-0 shadow-xs"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs sm:text-sm font-bold text-[#111827]">
          {line.name}
        </p>
        <p className="mt-0.5 text-xs text-[#6B7280] font-medium tabular-nums">
          {formatCurrency(line.price)}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
            <button
              onClick={handleDecrement}
              aria-label={`Reduce quantity of ${line.name}`}
              className="flex h-7 w-7 items-center justify-center rounded-l-lg text-[#111827] hover:bg-[#E5E7EB] active:scale-95 transition-all cursor-pointer"
            >
              <Minus className="h-3 w-3" aria-hidden="true" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-[#111827] tabular-nums">
              {line.quantity}
            </span>
            <button
              onClick={handleIncrement}
              aria-label={`Increase quantity of ${line.name}`}
              className="flex h-7 w-7 items-center justify-center rounded-r-lg text-[#111827] hover:bg-[#E5E7EB] active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            aria-label={`Remove ${line.name} from cart`}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-600 active:scale-95 cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
});
