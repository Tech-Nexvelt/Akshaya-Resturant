"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminStore } from "@/lib/admin-store";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Users,
  CreditCard,
  UtensilsCrossed,
  Activity,
  Settings,
  ShieldCheck,
  X,
  Store,
} from "lucide-react";

interface AdminNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "orders" | "payments" | "leads";
}

const NAV_ITEMS: AdminNavItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag, badgeKey: "orders" },
  { name: "Invoices (PI / TI)", href: "/admin/invoices", icon: FileText },
  { name: "Leads & Enquiries", href: "/admin/leads", icon: Users, badgeKey: "leads" },
  { name: "Payments", href: "/admin/payments", icon: CreditCard, badgeKey: "payments" },
  { name: "Menu Management", href: "/admin/menu", icon: UtensilsCrossed },
  { name: "Activity Logs", href: "/admin/activity", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({
  open: propOpen,
  onClose: propOnClose,
}: {
  open?: boolean;
  onClose?: () => void;
} = {}) {
  const pathname = usePathname();
  const { currentRole, orders, banquetEnquiries, cateringEnquiries } = useAdminStore();
  const superStore = useSuperAdminStore();

  const isCollapsed = superStore.isSidebarCollapsed;

  // DERIVED DYNAMIC BADGE COUNTS
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "pending" || o.status === "preparing"
  ).length;

  const newLeadsCount =
    banquetEnquiries.filter((b) => b.status === "new").length +
    cateringEnquiries.filter((c) => c.status === "new").length;

  const failedPaymentsCount = superStore.payments.filter((p) => p.status === "Failed").length;

  const getDynamicBadge = (key?: string): string | number | undefined => {
    switch (key) {
      case "orders":
        return pendingOrdersCount > 0 ? pendingOrdersCount : undefined;
      case "leads":
        return newLeadsCount > 0 ? `${newLeadsCount} New` : undefined;
      case "payments":
        return failedPaymentsCount > 0 ? `${failedPaymentsCount} Failed` : undefined;
      default:
        return undefined;
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col select-none bg-white text-slate-700 border-r border-[#E5E7EB] transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[70px]" : "w-[240px]"
      } ${propOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      {/* Brand Header */}
      <div
        className={`flex h-16 items-center border-b border-[#E5E7EB] px-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] font-black text-white text-lg shadow-sm">
            A
          </div>
          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-300">
              <div className="font-extrabold text-[#111827] text-sm tracking-wider leading-tight truncate">
                AKSHAYA
              </div>
              <div className="text-[10px] text-[#2563EB] font-bold uppercase tracking-wider">
                ADMIN CONSOLE
              </div>
            </div>
          )}
        </div>

        {propOnClose && (
          <button
            onClick={propOnClose}
            className="lg:hidden text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Links Rail */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {!isCollapsed && (
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Platform Control
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const badge = getDynamicBadge(item.badgeKey);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={propOnClose}
              title={isCollapsed ? item.name : undefined}
              className={`flex w-full items-center rounded-xl text-xs transition-all duration-150 cursor-pointer ${
                isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3.5 py-2.5"
              } ${
                active
                  ? "bg-[#2563EB] text-white font-bold shadow-sm"
                  : "text-gray-600 hover:bg-blue-50 hover:text-[#2563EB] font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? "text-white" : "text-gray-500 group-hover:text-[#2563EB]"
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </div>

              {!isCollapsed && badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    active
                      ? "bg-white/20 text-white"
                      : item.badgeKey === "payments"
                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className={`p-3.5 border-t border-[#E5E7EB] bg-gray-50/50 ${isCollapsed ? "flex justify-center" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] font-bold text-xs text-white shadow-xs">
            AD
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#111827] truncate">Admin User</div>
              <div className="text-[10px] text-gray-500 truncate font-mono">admin@akshaya.com</div>
            </div>
          )}
          {!isCollapsed && <ShieldCheck className="h-4 w-4 text-[#2563EB] shrink-0" />}
        </div>
      </div>
    </aside>
  );
}
