"use client";

import React, { useState, useCallback } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-[var(--color-void)] text-[var(--color-ivory)] flex overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      {/*
        Desktop (lg+): sticky sidebar, always visible in the flex row.
        Mobile/Tablet (<lg): fixed overlay that slides in from the left.
        The sidebar itself handles both layouts via responsive classes.
      */}
      <AdminSidebar open={sidebarOpen} onClose={closeSidebar} />

      {/* ── Mobile Backdrop ──────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Main Content Area ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AdminHeader onMenuClick={openSidebar} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
