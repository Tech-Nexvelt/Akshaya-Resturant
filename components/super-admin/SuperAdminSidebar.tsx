"use client";

import React, { useState, useEffect, useCallback, memo } from "react";
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquare,
  FileText,
  ShoppingBag,
  CreditCard,
  Webhook,
  Activity,
  HeartPulse,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { useSuperAdminStore, SuperAdminTab, SystemUserRole } from "@/store/useSuperAdminStore";

interface NavItemConfig {
  id: SuperAdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: SystemUserRole[];
}

const NAV_CONFIG: NavItemConfig[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "businesses", label: "Businesses", icon: Building2 },
  { id: "users", label: "Users", icon: Users },
  { id: "enquiries", label: "Enquiries", icon: MessageSquare },
  { id: "invoices", label: "Invoices (PI / TI)", icon: FileText, roles: ["super_admin", "owner"] },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "webhooks", label: "Webhooks", icon: Webhook, roles: ["super_admin", "owner"] },
  { id: "activity", label: "Activity Logs", icon: Activity },
  { id: "health", label: "System Health", icon: HeartPulse, roles: ["super_admin", "owner"] },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SuperAdminSidebarProps {
  activeTab?: SuperAdminTab;
  onTabChange?: (tab: SuperAdminTab) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const SuperAdminSidebar = memo(function SuperAdminSidebar({
  activeTab: propActiveTab,
  onTabChange: propOnTabChange,
  mobileOpen: propMobileOpen,
  onMobileClose: propOnMobileClose,
}: SuperAdminSidebarProps = {}) {
  // ATOMIC SELECTORS TO ISOLATE RENDERING
  const storeActiveTab = useSuperAdminStore((s) => s.activeTab);
  const setActiveTab = useSuperAdminStore((s) => s.setActiveTab);
  const userRole = useSuperAdminStore((s) => s.userRole);
  const isCollapsed = useSuperAdminStore((s) => s.isSidebarCollapsed);
  const storeMobileOpen = useSuperAdminStore((s) => s.isMobileSidebarOpen);
  const setMobileSidebarOpen = useSuperAdminStore((s) => s.setMobileSidebarOpen);

  // DERIVED DYNAMIC BADGE COUNTS WITH ISOLATED SELECTORS
  const businessesCount = useSuperAdminStore((s) => s.businesses.length);
  const newEnquiriesCount = useSuperAdminStore((s) => s.enquiries.filter((e) => e.status === "New").length);
  const failedPaymentsCount = useSuperAdminStore((s) => s.payments.filter((p) => p.status === "Failed").length);
  const failedWebhooksCount = useSuperAdminStore((s) => s.webhooks.filter((w) => w.status === "FAILED").length);

  // Optimistic Tab State (0ms delay perception)
  const [optimisticTab, setOptimisticTab] = useState<SuperAdminTab>(propActiveTab ?? storeActiveTab);

  useEffect(() => {
    setOptimisticTab(propActiveTab ?? storeActiveTab);
  }, [propActiveTab, storeActiveTab]);

  const handleTabSelect = useCallback(
    (tab: SuperAdminTab) => {
      // 1. Instant local state update (0ms perception delay)
      setOptimisticTab(tab);
      setActiveTab(tab);
      if (propOnTabChange) propOnTabChange(tab);
      if (propOnMobileClose) propOnMobileClose();
      setMobileSidebarOpen(false);
    },
    [setActiveTab, propOnTabChange, propOnMobileClose, setMobileSidebarOpen]
  );

  const isMobileOpen = propMobileOpen ?? storeMobileOpen;

  const getDynamicBadge = useCallback(
    (tab: SuperAdminTab): string | number | undefined => {
      switch (tab) {
        case "businesses":
          return businessesCount > 0 ? businessesCount : undefined;
        case "enquiries":
          return newEnquiriesCount > 0 ? `${newEnquiriesCount} New` : undefined;
        case "payments":
          return failedPaymentsCount > 0 ? `${failedPaymentsCount} Failed` : undefined;
        case "webhooks":
          return failedWebhooksCount > 0 ? `${failedWebhooksCount} Failed` : undefined;
        default:
          return undefined;
      }
    },
    [businessesCount, newEnquiriesCount, failedPaymentsCount, failedWebhooksCount]
  );

  const handleCloseMobile = useCallback(() => {
    if (propOnMobileClose) propOnMobileClose();
    setMobileSidebarOpen(false);
  }, [propOnMobileClose, setMobileSidebarOpen]);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex flex-col select-none bg-white text-gray-700 border-r border-[#E5E7EB] transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[70px]" : "w-[240px]"
      } ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Brand Header */}
      <div className={`flex h-16 items-center border-b border-[#E5E7EB] px-4 ${isCollapsed ? "justify-center" : "justify-between"}`}>
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
                SUPER ADMIN
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleCloseMobile}
          className="lg:hidden text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links Rail */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
        {!isCollapsed && (
          <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Platform Control
          </div>
        )}

        {NAV_CONFIG.map((item) => {
          if (item.roles && !item.roles.includes(userRole)) {
            return null;
          }

          const active = optimisticTab === item.id;
          const Icon = item.icon;
          const badge = getDynamicBadge(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleTabSelect(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`flex w-full items-center rounded-lg text-xs transition-colors duration-150 ease-out cursor-pointer active:scale-[0.98] ${
                isCollapsed ? "justify-center px-0 py-2.5" : "justify-between px-3.5 py-2.5"
              } ${
                active
                  ? "bg-[#2563EB] text-white font-bold shadow-sm"
                  : "text-gray-600 hover:bg-blue-50 hover:text-[#2563EB] font-medium"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    active ? "text-white" : "text-gray-500 group-hover:text-[#2563EB]"
                  }`}
                />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </div>

              {!isCollapsed && badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile Section */}
      <div className={`p-3.5 border-t border-[#E5E7EB] bg-gray-50/50 ${isCollapsed ? "flex justify-center" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] font-bold text-xs text-white shadow-xs">
            SA
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#111827] truncate">Super Admin</div>
              <div className="text-[10px] text-gray-500 truncate">super@akshaya.com</div>
            </div>
          )}
          {!isCollapsed && <ShieldCheck className="h-4 w-4 text-[#2563EB] shrink-0" />}
        </div>
      </div>
    </aside>
  );
});
