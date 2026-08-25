"use client";

import React, { useState, useEffect, useCallback, useTransition, memo } from "react";
import NextImage from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Grid,
  UtensilsCrossed,
  Users,
  CreditCard,
  BarChart3,
  UserCheck,
  Settings,
  Store,
  X,
} from "lucide-react";
import { useBusinessAdminStore, BusinessAdminTab } from "@/store/useBusinessAdminStore";

interface NavItemConfig {
  id: BusinessAdminTab;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { id: "tables", label: "Tables", href: "/admin/tables", icon: Grid },
  { id: "menu", label: "Menu Management", href: "/admin/menu", icon: UtensilsCrossed },
  { id: "customers", label: "Customers", href: "/admin/customers", icon: Users },
  { id: "payments", label: "Payments", href: "/admin/payments", icon: CreditCard },
  { id: "reports", label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { id: "staff", label: "Staff", href: "/admin/staff", icon: UserCheck },
  { id: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
];

export const BusinessAdminSidebar = memo(function BusinessAdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  // ATOMIC SELECTORS TO PREVENT UNNECESSARY RE-RENDERS
  const activeTab = useBusinessAdminStore((s) => s.activeTab);
  const setActiveTab = useBusinessAdminStore((s) => s.setActiveTab);
  const isCollapsed = useBusinessAdminStore((s) => s.isSidebarCollapsed);
  const isMobileOpen = useBusinessAdminStore((s) => s.isMobileSidebarOpen);
  const setMobileSidebarOpen = useBusinessAdminStore((s) => s.setMobileSidebarOpen);

  // OPTIMISTIC UI LOCAL STATE (0ms latency perception)
  const [optimisticTab, setOptimisticTab] = useState<BusinessAdminTab>(activeTab);

  // Sync state when route actually changes in background
  useEffect(() => {
    const matched = NAV_ITEMS.find((it) => pathname?.includes(it.id));
    if (matched && matched.id !== optimisticTab) {
      setOptimisticTab(matched.id);
    }
  }, [pathname, optimisticTab]);

  // Prefetch all admin routes on mount for instant page loads
  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      router.prefetch(item.href);
    });
  }, [router]);

  const handleNavClick = useCallback(
    (item: NavItemConfig) => {
      // 1. Instant synchronous UI highlight (0ms lag)
      setOptimisticTab(item.id);
      setActiveTab(item.id);
      setMobileSidebarOpen(false);

      // 2. React Non-Blocking Transition for Next.js Router Push
      startTransition(() => {
        router.push(item.href);
      });
    },
    [router, setActiveTab, setMobileSidebarOpen]
  );

  // DERIVED DYNAMIC BADGE COUNTS WITH ISOLATED SELECTORS
  const pendingOrdersCount = useBusinessAdminStore((s) =>
    s.orders.filter((o) => o.status === "Pending" || o.status === "Preparing").length
  );

  const activeTablesCount = useBusinessAdminStore((s) =>
    s.tables.filter((t) => t.status === "Occupied" || t.status === "Billing").length
  );

  const failedPaymentsCount = useBusinessAdminStore((s) =>
    s.payments.filter((p) => p.status === "Failed").length
  );

  const getDynamicBadge = useCallback(
    (tab: BusinessAdminTab): string | number | undefined => {
      switch (tab) {
        case "orders":
          return pendingOrdersCount > 0 ? pendingOrdersCount : undefined;
        case "tables":
          return activeTablesCount > 0 ? activeTablesCount : undefined;
        case "payments":
          return failedPaymentsCount > 0 ? `${failedPaymentsCount} failed` : undefined;
        default:
          return undefined;
      }
    },
    [pendingOrdersCount, activeTablesCount, failedPaymentsCount]
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col select-none bg-white text-gray-700 border-r border-[#E5E7EB] transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[70px]" : "w-[240px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
    >
      {/* Brand Header */}
      <div
        className={`flex h-16 items-center border-b border-[#E5E7EB] px-4 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        <div className="flex items-center gap-3">
          <NextImage
            src="/akshaya-logo.png"
            alt="Akshaya Logo"
            width={110}
            height={32}
            className="h-8 w-auto object-contain"
          />
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Restaurant POS
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Rail */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
        {!isCollapsed && (
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            POS Operations
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const active = optimisticTab === item.id;
          const Icon = item.icon;
          const badge = getDynamicBadge(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              onMouseEnter={() => router.prefetch(item.href)}
              title={isCollapsed ? item.label : undefined}
              className={`flex w-full items-center rounded-xl text-xs transition-colors duration-150 ease-out cursor-pointer active:scale-[0.98] ${
                isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3.5 py-2.5"
              } ${
                active
                  ? "bg-[#2563EB] text-white font-bold shadow-sm"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-semibold"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? "text-white" : "text-gray-500"
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    active
                      ? "bg-white/20 text-white"
                      : item.id === "payments"
                      ? "bg-rose-50 text-rose-600 border border-rose-200"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile Footer */}
      <div className={`p-3.5 border-t border-[#E5E7EB] bg-gray-50/50 ${isCollapsed ? "flex justify-center" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] font-bold text-xs text-white shadow-xs">
            RK
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#111827] truncate">Ravi Kumar</div>
              <div className="text-[10px] text-gray-500 truncate">Owner / Manager</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
});
