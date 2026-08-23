"use client";

import React from "react";
import { BusinessAdminSidebar } from "@/components/admin/BusinessAdminSidebar";
import { BusinessAdminHeader } from "@/components/admin/BusinessAdminHeader";
import { BusinessAdminToast } from "@/components/admin/BusinessAdminToast";
import { useBusinessAdminStore } from "@/store/useBusinessAdminStore";

import { BusinessDashboardView } from "@/components/admin/views/BusinessDashboardView";
import { BusinessOrdersView } from "@/components/admin/views/BusinessOrdersView";
import { BusinessTablesView } from "@/components/admin/views/BusinessTablesView";
import { BusinessMenuView } from "@/components/admin/views/BusinessMenuView";
import { BusinessCustomersView } from "@/components/admin/views/BusinessCustomersView";
import { BusinessPaymentsView } from "@/components/admin/views/BusinessPaymentsView";
import { BusinessReportsView } from "@/components/admin/views/BusinessReportsView";
import { BusinessStaffView } from "@/components/admin/views/BusinessStaffView";
import { BusinessSettingsView } from "@/components/admin/views/BusinessSettingsView";

export default function OwnerDashboardPage() {
  const { activeTab, isSidebarCollapsed, isMobileSidebarOpen, setMobileSidebarOpen } = useBusinessAdminStore();

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <BusinessDashboardView key="dashboard" />;
      case "orders":
        return <BusinessOrdersView key="orders" />;
      case "tables":
        return <BusinessTablesView key="tables" />;
      case "menu":
        return <BusinessMenuView key="menu" />;
      case "customers":
        return <BusinessCustomersView key="customers" />;
      case "payments":
        return <BusinessPaymentsView key="payments" />;
      case "reports":
        return <BusinessReportsView key="reports" />;
      case "staff":
        return <BusinessStaffView key="staff" />;
      case "settings":
        return <BusinessSettingsView key="settings" />;
      default:
        return <BusinessDashboardView key="dashboard" />;
    }
  };

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
          {renderActiveView()}
        </main>
      </div>

      {/* Reactive System Toast Feedback */}
      <BusinessAdminToast />
    </div>
  );
}
