import { describe, it, expect } from "vitest";
import { cartTotal, cartCount, type CartItem } from "@/store/cart";

describe("Cart & Money Calculations", () => {
  it("should return 0 total and count for an empty cart", () => {
    const empty: CartItem[] = [];
    expect(cartTotal(empty)).toBe(0);
    expect(cartCount(empty)).toBe(0);
  });

  it("should calculate exact total for single line item", () => {
    const items: CartItem[] = [{ id: "dish-1", name: "Biryani", price: 250, quantity: 2 }];
    expect(cartTotal(items)).toBe(500);
    expect(cartCount(items)).toBe(2);
  });

  it("should calculate exact sum across multiple items and quantities", () => {
    const items: CartItem[] = [
      { id: "dish-1", name: "Biryani", price: 250, quantity: 2 },
      { id: "dish-2", name: "Paneer", price: 180, quantity: 1 },
      { id: "dish-3", name: "Naan", price: 40, quantity: 4 },
    ];
    // 250*2 + 180*1 + 40*4 = 500 + 180 + 160 = 840
    expect(cartTotal(items)).toBe(840);
    expect(cartCount(items)).toBe(7);
  });

  it("should handle floating point prices accurately without rounding errors", () => {
    const items: CartItem[] = [
      { id: "item-1", name: "Item 1", price: 19.99, quantity: 3 },
      { id: "item-2", name: "Item 2", price: 5.01, quantity: 1 },
    ];
    // 19.99 * 3 + 5.01 = 59.97 + 5.01 = 64.98
    expect(Number(cartTotal(items).toFixed(2))).toBe(64.98);
  });
});
