"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem } from "@/lib/data";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export type CartLine = CartItem;

interface CartState {
  lines: CartItem[];
  items: CartItem[];
  addItem: (item: { id: string; name: string; price: number; image_url?: string } | MenuItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clear: () => void;
  total: () => number;
}

/**
 * Sample basket for local UI work ONLY — never the store's default.
 *
 * This used to be the initial `lines` value, which meant every first-time visitor
 * landed on /restaurant with three dishes they never chose already in the cart and
 * a "3" on the badge. Beyond being wrong, those lines flowed straight into
 * checkout and would have been charged.
 *
 * Call it explicitly from a dev tool or story if you want a populated cart:
 *   useCart.setState({ lines: DEV_SAMPLE_CART })
 */
export const DEV_SAMPLE_CART: CartItem[] = [
  { id: "chicken-biryani", name: "Hyderabadi Chicken Biryani", price: 349, quantity: 1, image_url: "/Images/chicken-biryani.jpg" },
  { id: "paneer-butter-masala", name: "Paneer Butter Masala", price: 269, quantity: 1, image_url: "/Images/paneer-butter-masala.jpg" },
  { id: "butter-naan", name: "Butter Naan", price: 49, quantity: 2, image_url: "/Images/butter-naan.jpg" },
];

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      get items() {
        return get().lines;
      },
      addItem: (item) =>
        set((state) => {
          const existing = state.lines.find((l) => l.id === item.id);
          const updatedLines = existing
            ? state.lines.map((l) =>
                l.id === item.id ? { ...l, quantity: l.quantity + 1 } : l
              )
            : [
                ...state.lines,
                {
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  quantity: 1,
                  image_url: "image_url" in item ? item.image_url : undefined,
                },
              ];
          return { lines: updatedLines };
        }),
      removeItem: (id) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.id !== id),
        })),
      updateQty: (id, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.id !== id)
              : state.lines.map((l) => (l.id === id ? { ...l, quantity } : l)),
        })),
      setQuantity: (id, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.id !== id)
              : state.lines.map((l) => (l.id === id ? { ...l, quantity } : l)),
        })),
      clearCart: () => set({ lines: [] }),
      clear: () => set({ lines: [] }),
      total: () => get().lines.reduce((sum, l) => sum + l.quantity * l.price, 0),
    }),
    {
      name: "akshaya-cart",
      /**
       * v0 carts were created while the store seeded three dishes by default, so
       * anyone who loaded the site during that window has phantom items sitting in
       * localStorage. Clearing v0 once is the only way to get those users to the
       * empty cart the fix intends; without it the bug persists per-browser.
       */
      version: 1,
      migrate: () => ({ lines: [] }),
    }
  )
);

export function cartCount(lines: CartItem[]) {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function cartTotal(lines: CartItem[]) {
  return lines.reduce((sum, l) => sum + l.quantity * l.price, 0);
}
