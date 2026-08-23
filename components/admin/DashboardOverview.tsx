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
} from "lucide-react";

export function DashboardOverview() {
  const { orders, banquetEnquiries, cateringEnquiries, menuItemsList, currentRole } =
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
      <div className="space-y-6 max-w-[1600px] mx-auto">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-[#6B7280] text-xs">
              <span className="font-bold">Today&apos;s Revenue</span>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-[#111827]">
              {formatCurrency(totalRevenue)}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <span>+14.2% from yesterday</span>
            </div>
          </div>

          {/* Orders */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-[#6B7280] text-xs">
              <span className="font-bold">Total Orders</span>
              <ShoppingBag className="h-4 w-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl font-bold text-[#111827]">
              {orders.length}
            </div>
            <div className="text-[10px] text-amber-600 font-bold">
              {pendingOrdersCount} active in kitchen
            </div>
          </div>

          {/* Pending Enquiries */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-[#6B7280] text-xs">
              <span className="font-bold">Banquet & Catering</span>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-[#111827]">
              {banquetEnquiries.length + cateringEnquiries.length}
            </div>
            <div className="text-[10px] text-purple-700 font-bold">
              {pendingEnquiriesCount} new unread leads
            </div>
          </div>

          {/* Menu Catalog */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between text-[#6B7280] text-xs">
              <span className="font-bold">Menu Items</span>
              <UtensilsCrossed className="h-4 w-4 text-[#2563EB]" />
            </div>
            <div className="text-2xl font-bold text-[#111827]">
              {menuItemsList.length}
            </div>
            <div className="text-[10px] text-emerald-600 font-bold">
              {menuItemsList.filter((m) => m.available).length} items available today
            </div>
          </div>
        </div>

        {/* Live Order Feed Section */}
        <RealtimeOrderFeed />

        {/* Recent Enquiries & Quick Shortcuts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Banquet & Catering Enquiries */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#2563EB]" />
                Recent Event Enquiries
              </h3>
              {currentRole !== "staff" && (
                <Link
                  href="/admin/leads"
                  className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  <span>View All Leads</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            <div className="space-y-2.5">
              {banquetEnquiries.map((bq) => (
                <div
                  key={bq.id}
                  className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#111827]">
                      {bq.guest_name} • <span className="text-[#2563EB]">{bq.event_type}</span>
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      Phone: {bq.guest_phone} | Guests: {bq.guest_count} | Date: {bq.event_date}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Banquet
                  </span>
                </div>
              ))}

              {cateringEnquiries.map((cat) => (
                <div
                  key={cat.id}
                  className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#111827]">
                      {cat.guest_name} • <span className="text-emerald-600">Catering ({cat.location})</span>
                    </div>
                    <div className="text-[11px] text-[#6B7280]">
                      Phone: {cat.guest_phone} | Guests: {cat.guest_count} | Date: {cat.event_date}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Catering
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick RBAC Permissions Summary */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
                RBAC Access Matrix Quick-Reference
              </h3>
              <span className="text-xs text-[#6B7280] font-bold capitalize">
                Current: {currentRole}
              </span>
            </div>

            <div className="text-xs space-y-2 text-[#6B7280]">
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex justify-between items-center">
                <span>Dashboard & Live Orders</span>
                <span className="text-emerald-600 font-bold">Owner, Admin, Staff</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex justify-between items-center">
                <span>Leads, Payments, Activity & Menu CRUD</span>
                <span className="text-purple-700 font-bold">Owner, Admin Only</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex justify-between items-center">
                <span>Settings & Role Allocation</span>
                <span className="text-[#2563EB] font-bold">Owner Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGate>
  );
}
