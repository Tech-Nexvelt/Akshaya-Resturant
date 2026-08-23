"use client";

/**
 * Provider-agnostic analytics engine & service choice persistence.
 */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type EntryChoice = "restaurant" | "banquet" | "catering";

export interface AnalyticsEventMap {
  entry_selected: { akshaya_entry: EntryChoice };
  view_menu: { category?: string };
  add_to_cart: { itemId: string; itemName: string; price: number; quantity: number };
  remove_from_cart: { itemId: string };
  begin_checkout: { itemCount: number; totalAmount: number };
  purchase_completed: { orderId: string; totalAmount: number; paymentMethod: string };
  banquet_enquiry_submitted: { eventType: string; guestCount: number };
  catering_enquiry_submitted: { guestCount: number; location: string };
}

export function trackEvent<K extends keyof AnalyticsEventMap>(
  eventName: K,
  params: AnalyticsEventMap[K]
): void;
export function trackEvent(eventName: string, params?: Record<string, unknown>): void;
export function trackEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    timestamp: new Date().toISOString(),
    ...params,
  });

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log(`[Analytics Event] ${eventName}`, params);
  }
}

const ENTRY_COOKIE = "akshaya_entry";
const LOCAL_STORAGE_KEY = "akshaya_service";

export function setEntryChoice(choice: EntryChoice) {
  if (typeof document !== "undefined") {
    document.cookie = `${ENTRY_COOKIE}=${choice}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, choice);
    } catch {
      // Storage access blocked or unavailable
    }
  }
  trackEvent("entry_selected", { akshaya_entry: choice });
}

export function getEntryChoice(): EntryChoice | null {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY) as EntryChoice | null;
      if (stored && ["restaurant", "banquet", "catering"].includes(stored)) {
        return stored;
      }
    } catch {
      // Storage fallback
    }
  }
  if (typeof document !== "undefined") {
    const match = document.cookie.match(new RegExp(`${ENTRY_COOKIE}=(restaurant|banquet|catering)`));
    return (match?.[1] as EntryChoice) ?? null;
  }
  return null;
}

export function clearEntryChoice() {
  if (typeof document !== "undefined") {
    document.cookie = `${ENTRY_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Storage cleanup
    }
  }
}
