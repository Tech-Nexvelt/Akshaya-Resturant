"use client";

import React from "react";
import {
  DollarSign,
  ShoppingBag,
  Grid,
  Clock,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useBusinessAdminStore, OrderStatus } from "@/store/useBusinessAdminStore";

export function BusinessDashboardView() {
  const {
    orders,
    payments,
    tables,
    updateOrderStatus,
    setActiveTab,
  } = useBusinessAdminStore();

  // DERIVED METRICS FROM SINGLE SOURCE OF TRUTH STORE
  const todayRevenue = payments
    .filter((p) => p.status === "Success")
    .reduce((sum, p) => sum + p.amount, 0) + 45320; // Base + current payments

  const ordersToday = orders.length + 120;
  const activeTablesCount = tables.filter((t) => t.status === "Occupied" || t.status === "Billing").length;
  const pendingOrdersCount = orders.filter((o) => o.status === "Pending" || o.status === "Preparing").length;

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Preparing":
        return "bg-blue-50 text-[#2563EB] border-blue-200";
      case "Ready":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Completed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-200";
    }
  };

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto p-2 sm:p-4">
      {/* 4 METRIC CARDS GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Today Revenue */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:border-[#2563EB]/40">
          <div className="flex items-center justify-between text-xs font-bold text-[#6B7280]">
            <span>Today Revenue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#111827]">
            ₹ {todayRevenue.toLocaleString()}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#10B981]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>12.5%</span>
            <span className="text-[#6B7280]">vs yesterday</span>
          </div>
        </div>

        {/* Card 2: Orders Today */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:border-[#2563EB]/40">
          <div className="flex items-center justify-between text-xs font-bold text-[#6B7280]">
            <span>Orders Today</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#111827]">{ordersToday}</div>
          <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#10B981]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>8.2%</span>
            <span className="text-[#6B7280]">vs yesterday</span>
          </div>
        </div>

        {/* Card 3: Active Tables */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:border-[#2563EB]/40">
          <div className="flex items-center justify-between text-xs font-bold text-[#6B7280]">
            <span>Active Tables</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Grid className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#111827]">
            {activeTablesCount} <span className="text-xs font-normal text-[#6B7280]">of {tables.length} tables</span>
          </div>
          <div className="mt-1.5 text-xs font-semibold text-emerald-600">
            <span>POS Table Grid Live</span>
          </div>
        </div>

        {/* Card 4: Pending Orders */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:border-amber-200">
          <div className="flex items-center justify-between text-xs font-bold text-[#6B7280]">
            <span>Pending Orders</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#111827]">{pendingOrdersCount}</div>
          <div className="mt-1.5 text-xs font-semibold text-amber-600">
            <span>Requires kitchen attention</span>
          </div>
        </div>
      </div>

      {/* SVG CHARTS SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Trend Chart */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#111827]">Revenue Trend</h3>
              <p className="text-[11px] text-[#6B7280]">Weekly sales performance</p>
            </div>
            <span className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs font-bold text-[#6B7280]">
              This Week
            </span>
          </div>

          <div className="h-48 w-full flex items-end pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
              <path
                d="M 0 80 Q 40 40, 80 60 T 160 30 T 240 50 T 300 20"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
              />
              <path
                d="M 0 80 Q 40 40, 80 60 T 160 30 T 240 50 T 300 20 L 300 120 L 0 120 Z"
                fill="url(#blue-gradient)"
                opacity="0.15"
              />
              <defs>
                <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between border-t border-[#E5E7EB] pt-3 text-[11px] font-semibold text-[#9CA3AF]">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Orders Overview Bar Chart */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#111827]">Orders Overview</h3>
              <p className="text-[11px] text-[#6B7280]">Daily orders volume</p>
            </div>
            <span className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs font-bold text-[#6B7280]">
              This Week
            </span>
          </div>

          <div className="h-48 w-full flex items-end justify-between gap-3 pt-4 px-2">
            {[45, 65, 80, 55, 95, 110, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-[#2563EB] rounded-t-lg transition-all hover:bg-[#1D4ED8]" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between border-t border-[#E5E7EB] pt-3 text-[11px] font-semibold text-[#9CA3AF]">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: LIVE ORDERS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Live Orders Feed */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#2563EB]" /> Live Orders Feed
              </h3>
              <p className="text-[11px] text-[#6B7280]">Real-time kitchen order updates</p>
            </div>
            <button
              onClick={() => setActiveTab("orders")}
              className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1"
            >
              View All Orders <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3.5 hover:border-[#2563EB]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#2563EB]">{order.orderNumber}</span>
                    <span className="text-xs font-semibold text-[#111827]">{order.tableNo}</span>
                  </div>
                  <div className="text-[11px] text-[#6B7280] mt-0.5">
                    {order.customerName} • {order.itemsCount} Items • ₹ {order.amount.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getStatusBadge(order.status)}`}
                  >
                    {order.status}
                  </span>

                  {order.status === "Pending" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "Preparing")}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] cursor-pointer"
                    >
                      Prepare
                    </button>
                  )}
                  {order.status === "Preparing" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "Ready")}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                    >
                      Ready
                    </button>
                  )}
                  {order.status === "Ready" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "Completed")}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-gray-900 text-white hover:bg-black cursor-pointer"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
            <h3 className="font-bold text-sm text-[#111827]">Recent Restaurant Activity</h3>
            <span className="text-xs text-[#6B7280]">Live stream</span>
          </div>

          <div className="space-y-3">
            {[
              { title: "New order received", desc: "Order #ORD-1024 for Table 05", time: "2 min ago", icon: ShoppingBag, color: "text-[#2563EB] bg-blue-50" },
              { title: "Payment received", desc: "₹2,450 received for Order #ORD-1023", time: "15 min ago", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
              { title: "Order completed", desc: "Order #ORD-1019 completed", time: "25 min ago", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
              { title: "Payment failed", desc: "₹1,750 payment failed for Order #ORD-1021", time: "30 min ago", icon: Clock, color: "text-rose-600 bg-rose-50" },
            ].map((act, idx) => {
              const Icon = act.icon;
              return (
                <div key={idx} className="flex items-start gap-3 rounded-xl border border-[#E5E7EB] p-3 text-xs">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${act.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between font-bold text-[#111827]">
                      <span>{act.title}</span>
                      <span className="text-[10px] text-[#9CA3AF] font-normal">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-[#6B7280]">{act.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
