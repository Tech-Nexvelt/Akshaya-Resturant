"use client";

import React from "react";
import { SuperAdminSidebar } from "@/components/super-admin/SuperAdminSidebar";
import { SuperAdminHeader } from "@/components/super-admin/SuperAdminHeader";
import { ToastBanner } from "@/components/super-admin/ToastBanner";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isMobileSidebarOpen, setMobileSidebarOpen, activeTabTitle, isSidebarCollapsed, userRole } = useSuperAdminStore();

  React.useEffect(() => {
    // Client-side Session & Role Protection Guard
    if (typeof window !== "undefined") {
      const isSuperAdminAllowed = userRole === "super_admin";
      if (!isSuperAdminAllowed) {
        window.location.replace("/admin/login");
      }
    }
  }, [userRole]);

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
      <SuperAdminSidebar />

      {/* Main Viewport Shell with Dynamic Padding Shift */}
      <div
        className={`flex flex-col flex-1 min-h-screen transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "lg:pl-[70px]" : "lg:pl-[240px]"
        }`}
      >
        {/* Sticky Header */}
        <SuperAdminHeader title={activeTabTitle} />

        {/* Scrollable Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Reactive System Toast Feedback */}
      <ToastBanner />
    </div>
  );
}
