"use client";

import React from "react";
import Link from "next/link";
import { STAFF_AND_ABOVE } from "@/types/platform";
import { RoleGate } from "@/components/admin/RoleGate";
import { RealtimeOrderFeed } from "@/components/admin/RealtimeOrderFeed";
import { useAdminStore } from "@/lib/admin-store";
import { formatCurrency } from "@/lib/utils";
import {
  ShoppingBag,
  TrendingUp,
  Users,
  UtensilsCrossed,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Sparkles,
} from "lucide-react";
/**
 * The dashboard body, extracted verbatim from app/admin/dashboard/page.tsx when
 * that page became a Server Component. The markup is unchanged — it is split out
 * only so the page above it can run `requireAdminSession()` on the server before
 * any of this is rendered. It still reads the mock Zustand store, so <RoleGate>
 * remains here to keep the dev role switcher consistent with the rest.
 */

export function DashboardOverview() {
  const { orders, leads, banquetEnquiries, cateringEnquiries, menuItemsList, currentRole } =
    useAdminStore();

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "pending" || o.status === "preparing"
  ).length;
  const pendingEnquiriesCount =
    banquetEnquiries.filter((b) => b.status === "new").length +
    cateringEnquiries.filter((c) => c.status === "new").length;

  return (
    <RoleGate allowedRoles={STAFF_AND_ABOVE}>
      <div className="space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="glass-panel p-4 rounded-xl border-[rgba(201,161,90,0.15)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--color-smoke)] text-xs mb-2">
              <span>Today&apos;s Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-display text-[var(--color-gold-bright)]">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <span>+14.2% from yesterday</span>
            </div>
          </div>

          {/* Orders */}
          <div className="glass-panel p-4 rounded-xl border-[rgba(201,161,90,0.15)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--color-smoke)] text-xs mb-2">
              <span>Total Orders</span>
              <ShoppingBag className="w-4 h-4 text-[var(--color-gold)]" />
            </div>
            <div className="text-2xl font-bold font-display text-[var(--color-ivory)]">
              {orders.length}
            </div>
            <div className="text-[10px] text-amber-400 mt-1 font-medium">
              {pendingOrdersCount} active in kitchen
            </div>
          </div>

          {/* Pending Enquiries */}
          <div className="glass-panel p-4 rounded-xl border-[rgba(201,161,90,0.15)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--color-smoke)] text-xs mb-2">
              <span>Banquet & Catering</span>
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-display text-[var(--color-ivory)]">
              {banquetEnquiries.length + cateringEnquiries.length}
            </div>
            <div className="text-[10px] text-purple-300 mt-1 font-medium">
              {pendingEnquiriesCount} new unread leads
            </div>
          </div>

          {/* Menu Catalog */}
          <div className="glass-panel p-4 rounded-xl border-[rgba(201,161,90,0.15)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[var(--color-smoke)] text-xs mb-2">
              <span>Menu Items</span>
              <UtensilsCrossed className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold font-display text-[var(--color-ivory)]">
              {menuItemsList.length}
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-medium">
              {menuItemsList.filter((m) => m.available).length} items available today
            </div>
          </div>
        </div>

        {/* Live Order Feed Section */}
        <RealtimeOrderFeed />

        {/* Recent Enquiries & Quick Shortcuts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Banquet & Catering Enquiries */}
          <div className="glass-panel p-5 rounded-xl border-[rgba(201,161,90,0.15)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-[var(--color-ivory)] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--color-gold)]" />
                Recent Event Enquiries
              </h3>
              {currentRole !== "staff" && (
                <Link
                  href="/admin/leads"
                  className="text-xs text-[var(--color-gold-bright)] hover:underline flex items-center gap-1"
                >
                  <span>View All Leads</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="space-y-2.5">
              {banquetEnquiries.map((bq) => (
                <div
                  key={bq.id}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-[var(--color-ivory)]">
                      {bq.guest_name} &bull; <span className="text-[var(--color-gold)]">{bq.event_type}</span>
                    </div>
                    <div className="text-[11px] text-[var(--color-smoke)]">
                      Phone: {bq.guest_phone} | Guests: {bq.guest_count} | Date: {bq.event_date}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Banquet
                  </span>
                </div>
              ))}

              {cateringEnquiries.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-[var(--color-ivory)]">
                      {cat.guest_name} &bull; <span className="text-emerald-400">Catering ({cat.location})</span>
                    </div>
                    <div className="text-[11px] text-[var(--color-smoke)]">
                      Phone: {cat.guest_phone} | Guests: {cat.guest_count} | Date: {cat.event_date}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Catering
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick RBAC Permissions Summary */}
          <div className="glass-panel p-5 rounded-xl border-[rgba(201,161,90,0.15)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-semibold text-[var(--color-ivory)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--color-gold)]" />
                RBAC Access Matrix Quick-Reference
              </h3>
              <span className="text-[11px] text-[var(--color-smoke)] capitalize">
                Current: {currentRole}
              </span>
            </div>

            <div className="text-xs space-y-2 text-[var(--color-smoke)]">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span>Dashboard & Live Orders</span>
                <span className="text-emerald-400 font-bold">Owner, Admin, Staff</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span>Leads, Payments, Activity & Menu CRUD</span>
                <span className="text-purple-300 font-bold">Owner, Admin Only</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex justify-between items-center">
                <span>Settings & Role Allocation</span>
                <span className="text-[var(--color-gold-bright)] font-bold">Owner Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
