"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useAdminStore } from "@/lib/admin-store";
import { Bell, PlusCircle, Radio, Database, X, Menu } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard Overview",
  "/admin/orders": "Live Orders",
  "/admin/invoices": "Invoices & GST",
  "/admin/leads": "Leads & Enquiries",
  "/admin/payments": "Payment Reconciliation",
  "/admin/menu": "Menu Editor",
  "/admin/activity": "Activity Audit Log",
  "/admin/settings": "Settings & RBAC",
  "/admin/login": "Admin Login",
};

interface AdminHeaderProps {
  /** Opens the mobile sidebar — wired to AdminLayout state */
  onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "Admin Console";
  const { addSimulatedOrder, lastOrderAlert, clearLastOrderAlert, currentRole } = useAdminStore();
  const [showNotification, setShowNotification] = useState(false);

  return (
    <header className="h-14 sm:h-16 border-b border-[rgba(201,161,90,0.15)] bg-[var(--color-void-soft)]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 flex-shrink-0">

      {/* ── Left: Hamburger (mobile) + Title ─────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger — hidden on desktop where sidebar is always visible */}
        <button
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="lg:hidden flex items-center justify-center h-10 w-10 rounded-lg text-[var(--color-smoke)] hover:text-[var(--color-ivory)] hover:bg-white/5 transition-colors flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-display font-semibold text-[var(--color-ivory)] tracking-wide truncate">
            {title}
          </h1>
          <div className="hidden sm:block text-[11px] text-[var(--color-smoke)] truncate">
            Akshaya Platform &bull; {pathname}
          </div>
        </div>
      </div>

      {/* ── Right: Action Tools ───────────────────────────────────── */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

        {/* Realtime Status — hidden on small mobile */}
        <div
          title="Supabase Realtime Live Order Feed Status"
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium glass-panel border-[var(--color-gold)]/20 text-[var(--color-ivory)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[var(--color-smoke)]">Realtime:</span>
          <span className="text-emerald-400 font-semibold">Active</span>
        </div>

        {/* DB Status Tag — only on large desktop */}
        <div
          title="Live Supabase project deferred by owner"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300"
        >
          <Database className="w-3 h-3 text-amber-400" />
          <span>Static Mode</span>
        </div>

        {/* Simulate Order — icon-only on mobile, icon+text on sm+ */}
        {currentRole && (
          <button
            onClick={() => addSimulatedOrder()}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-[var(--color-gold-dim)] to-[var(--color-gold)] text-[var(--color-void)] text-xs font-bold hover:brightness-110 transition-all shadow-md active:scale-95 min-h-[36px]"
            title="Trigger a new incoming order to test Realtime order feed"
          >
            <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Simulate Order</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotification(!showNotification)}
            aria-label="Notifications"
            aria-expanded={showNotification}
            className="relative p-2 rounded-lg glass-panel hover:border-[var(--color-gold)] text-[var(--color-smoke)] hover:text-[var(--color-ivory)] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <Bell className="w-4 h-4" />
            {lastOrderAlert && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--color-gold-bright)] animate-pulse" />
            )}
          </button>

          {/* Notification dropdown — constrained width on mobile */}
          {showNotification && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 glass-panel rounded-xl p-4 shadow-2xl z-50 border-[var(--color-gold)]/30 animate-fade-up">
              <div className="flex items-center justify-between border-b border-[rgba(201,161,90,0.15)] pb-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-gold-bright)]">
                  Live Notifications
                </span>
                <button
                  onClick={() => setShowNotification(false)}
                  aria-label="Close notifications"
                  className="text-[var(--color-smoke)] hover:text-[var(--color-ivory)] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {lastOrderAlert ? (
                <div className="bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 rounded-lg p-3 text-xs text-[var(--color-ivory)]">
                  <div className="font-semibold text-[var(--color-gold-bright)] mb-1 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Incoming Order Event
                  </div>
                  <p className="mb-2">{lastOrderAlert}</p>
                  <button
                    onClick={clearLastOrderAlert}
                    className="text-[10px] text-[var(--color-smoke)] underline hover:text-[var(--color-ivory)]"
                  >
                    Clear Alert
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[var(--color-smoke)] py-2 text-center">
                  No unread order notifications.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
