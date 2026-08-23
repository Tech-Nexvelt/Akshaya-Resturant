"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCart, cartCount } from "@/store/cart";
import { CartPanel } from "./CartPanel";

export function RestaurantCartDrawer() {
  const lines = useCart((s) => s.lines);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("open-cart", handler);
    return () => window.removeEventListener("open-cart", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const count = mounted ? cartCount(lines) : 0;

  return (
    <>
      {/* Mobile Floating Cart Button (visible on <lg screens when cart has items) */}
      {mounted && count > 0 && !open && (
        <div className="fixed bottom-5 right-5 z-40 lg:hidden">
          <button
            onClick={() => setOpen(true)}
            aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-white/60"
          >
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
            <span className="absolute -right-1 -top-1 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-[#111827] px-1.5 text-xs font-bold text-white shadow-md">
              {count}
            </span>
          </button>
        </div>
      )}

      {/* Drawer Overlay & Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 lg:bg-black/20 sm:items-stretch sm:justify-end"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Your cart drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90dvh] w-full max-w-sm sm:max-w-md flex-col rounded-t-2xl bg-white shadow-2xl sm:h-full sm:max-h-full sm:rounded-none border-l border-[#E5E7EB]"
            >
              <CartPanel onClose={() => setOpen(false)} isDrawer />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
