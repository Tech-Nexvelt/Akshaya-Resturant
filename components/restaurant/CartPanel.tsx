"use client";

import { memo, useState } from "react";
import { ShoppingBag, X, ArrowRight, Sparkles } from "lucide-react";
import { useCart, cartCount } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { calculateFees, calculateSavings } from "@/lib/restaurant-data";
import { CartItem } from "./CartItem";
import { CheckoutForm } from "@/components/order/CheckoutForm";

interface CartPanelProps {
  onClose?: () => void;
  isDrawer?: boolean;
}

export const CartPanel = memo(function CartPanel({ onClose, isDrawer = false }: CartPanelProps) {
  const lines = useCart((s) => s.lines);
  const total = useCart((s) => s.total);
  const [checkingOut, setCheckingOut] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");

  const count = cartCount(lines);
  const subtotal = total();
  const { deliveryFee, total: grandTotal } = calculateFees(subtotal);
  const savings = calculateSavings(lines);

  if (checkingOut) {
    return (
      <div className="p-4 sm:p-5">
        <CheckoutForm
          onBack={() => setCheckingOut(false)}
          onDone={() => {
            setCheckingOut(false);
            if (onClose) onClose();
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-white ${
        isDrawer
          ? "h-full"
          : "sticky top-20 rounded-xl border border-[#E5E7EB] shadow-sm p-4 max-h-[calc(100vh-6rem)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3.5 px-4 pt-4 sm:pt-5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
          <h2 className="text-base font-bold text-[#111827]">
            Your Cart ({count})
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Lines / Content */}
      {lines.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 px-4 text-center">
          <ShoppingBag className="h-10 w-10 text-[#D1D5DB]" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-[#111827]">Your cart is empty</p>
          <p className="mt-1 text-xs text-[#6B7280]">
            Browse the menu and add your favorite dishes.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-3">
          {/* Scrollable list */}
          <ul className="divide-y divide-[#F3F4F6] overflow-y-auto max-h-[320px]">
            {lines.map((line) => (
              <CartItem key={line.id} line={line} />
            ))}
          </ul>

          {/* Expandable Add a note */}
          <div className="mt-3 border-t border-[#E5E7EB] pt-3">
            {!showNote ? (
              <button
                onClick={() => setShowNote(true)}
                className="text-xs font-semibold text-[#2563EB] hover:underline cursor-pointer"
              >
                + Add a note (optional)
              </button>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                  <span>Order Note</span>
                  <button
                    onClick={() => setShowNote(false)}
                    className="text-[#9CA3AF] hover:text-[#111827]"
                  >
                    Cancel
                  </button>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Less spicy, extra cutlery..."
                  className="w-full rounded-lg border border-[#E5E7EB] p-2 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Savings pill if applicable */}
          {savings > 0 && (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
              <span>You saved {formatCurrency(savings)} on this order</span>
            </div>
          )}

          {/* Bill summary */}
          <div className="mt-3 border-t border-[#E5E7EB] pt-3 space-y-2">
            <div className="flex justify-between text-xs text-[#6B7280]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#111827] tabular-nums">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#6B7280]">
              <span>Delivery Fee</span>
              <span className="font-semibold text-[#111827] tabular-nums">
                {deliveryFee === 0 ? "Free" : formatCurrency(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-[#6B7280]">
              <span>Packaging Fee</span>
              <span className="font-semibold text-emerald-600 tabular-nums">
                Free
              </span>
            </div>
            <div className="flex justify-between border-t border-[#F3F4F6] pt-2 text-sm font-bold text-[#111827]">
              <span>Total</span>
              <span className="text-[#2563EB] tabular-nums">
                {formatCurrency(grandTotal)}
              </span>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setCheckingOut(true)}
                className="flex-1 min-h-[46px] items-center justify-center rounded-xl bg-[#2563EB] px-4 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-[#1D4ED8] active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                Checkout
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-xs sm:text-sm font-bold text-[#111827] hover:bg-[#F9FAFB] cursor-pointer"
                >
                  View Cart
                </button>
              )}
            </div>

            {/* Trust Row */}
            <div className="mt-3 pt-2 text-center text-[11px] font-medium text-[#6B7280] border-t border-[#F3F4F6]">
              Safe Packaging &middot; On-time Delivery
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
