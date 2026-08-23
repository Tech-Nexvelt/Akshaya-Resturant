import { create } from "zustand";

export type SuperAdminTab =
  | "dashboard"
  | "businesses"
  | "users"
  | "enquiries"
  | "invoices"
  | "orders"
  | "payments"
  | "webhooks"
  | "activity"
  | "health"
  | "settings";

interface SuperAdminState {
  activeTab: SuperAdminTab;
  setActiveTab: (tab: SuperAdminTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  unreadNotifications: number;
  clearNotifications: () => void;
}

export const useSuperAdminStore = create<SuperAdminState>((set) => ({
  activeTab: "dashboard",
  setActiveTab: (tab) => set({ activeTab: tab }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  unreadNotifications: 3,
  clearNotifications: () => set({ unreadNotifications: 0 }),
}));
