"use client";

import React from "react";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";
import { DashboardView } from "@/components/super-admin/views/DashboardView";
import { BusinessesView } from "@/components/super-admin/views/BusinessesView";
import { UsersView } from "@/components/super-admin/views/UsersView";
import { EnquiriesView } from "@/components/super-admin/views/EnquiriesView";
import { InvoicesView } from "@/components/super-admin/views/InvoicesView";
import { OrdersView } from "@/components/super-admin/views/OrdersView";
import { PaymentsView } from "@/components/super-admin/views/PaymentsView";
import { WebhooksView } from "@/components/super-admin/views/WebhooksView";
import { ActivityLogsView } from "@/components/super-admin/views/ActivityLogsView";
import { SystemHealthView } from "@/components/super-admin/views/SystemHealthView";
import { SettingsView } from "@/components/super-admin/views/SettingsView";

export default function SuperAdminPage() {
  const { activeTab, setActiveTab } = useSuperAdminStore();

  const renderView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView key="dashboard" />;
      case "businesses":
        return <BusinessesView key="businesses" />;
      case "users":
        return <UsersView key="users" />;
      case "enquiries":
        return <EnquiriesView key="enquiries" onNavigateToInvoice={() => setActiveTab("invoices")} />;
      case "invoices":
        return <InvoicesView key="invoices" />;
      case "orders":
        return <OrdersView key="orders" />;
      case "payments":
        return <PaymentsView key="payments" />;
      case "webhooks":
        return <WebhooksView key="webhooks" />;
      case "activity":
        return <ActivityLogsView key="activity" />;
      case "health":
        return <SystemHealthView key="health" />;
      case "settings":
        return <SettingsView key="settings" />;
      default:
        return <DashboardView key="dashboard" />;
    }
  };

  return <div className="w-full">{renderView()}</div>;
}
