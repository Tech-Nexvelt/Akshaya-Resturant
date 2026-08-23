"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { BusinessAdminSidebar } from "@/components/admin/BusinessAdminSidebar";
import { BusinessAdminHeader } from "@/components/admin/BusinessAdminHeader";
import { BusinessAdminToast } from "@/components/admin/BusinessAdminToast";
import { useBusinessAdminStore } from "@/store/useBusinessAdminStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isSidebarCollapsed, isMobileSidebarOpen, setMobileSidebarOpen, setActiveTab } =
    useBusinessAdminStore();

  useEffect(() => {
    if (pathname.includes("/orders")) setActiveTab("orders");
    else if (pathname.includes("/tables")) setActiveTab("tables");
    else if (pathname.includes("/menu")) setActiveTab("menu");
    else if (pathname.includes("/customers") || pathname.includes("/leads")) setActiveTab("customers");
    else if (pathname.includes("/payments")) setActiveTab("payments");
    else if (pathname.includes("/reports")) setActiveTab("reports");
    else if (pathname.includes("/staff")) setActiveTab("staff");
    else if (pathname.includes("/settings")) setActiveTab("settings");
    else setActiveTab("dashboard");
  }, [pathname, setActiveTab]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased font-sans flex flex-col relative">
      {/* Mobile Drawer Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Fixed Sidebar */}
      <BusinessAdminSidebar />

      {/* Main Viewport Shell with Dynamic Padding Shift */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-[70px]" : "lg:pl-[240px]"
        }`}
      >
        {/* Sticky Header */}
        <BusinessAdminHeader />

        {/* Scrollable Canvas Container: max-width 1280px, padding 24px */}
        <main className="flex-1 p-4 sm:p-6 max-w-[1280px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Reactive System Toast Feedback */}
      <BusinessAdminToast />
    </div>
  );
}
