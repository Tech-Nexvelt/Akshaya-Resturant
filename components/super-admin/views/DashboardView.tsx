"use client";

import React from "react";
import {
  DollarSign,
  ShoppingBag,
  Building2,
  AlertOctagon,
  ArrowUpRight,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";

export function DashboardView() {
  const {
    businesses,
    orders,
    payments,
    webhooks,
    activityLogs,
    setActiveTab,
  } = useSuperAdminStore();

  // Dynamic Metrics Calculation
  const totalRevenue = payments
    .filter((p) => p.status === "Success")
    .reduce((acc, p) => acc + p.amount, 0) + 400757.5; // base + successful payments

  const totalOrders = orders.length;
  const activeBusinessesCount = businesses.filter((b) => b.status === "Active").length;
  const failedPaymentsCount = payments.filter((p) => p.status === "Failed").length;
  const failedWebhooksCount = webhooks.filter((w) => w.status === "FAILED").length;
  const inactiveBusinessesCount = businesses.filter((b) => b.status === "Inactive").length;

  return (
    <div className="space-y-6">
      {/* ROW 1 — METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:border-[#2563EB]/40">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280]">
            <span>Total Revenue</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#111827]">
            ₹ {totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#10B981]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>18.6%</span>
            <span className="text-[#6B7280]">vs last month</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:border-[#2563EB]/40">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280]">
            <span>Total Orders</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#111827]">{totalOrders.toLocaleString()}</div>
          <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#10B981]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>12.4%</span>
            <span className="text-[#6B7280]">vs last month</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:border-[#2563EB]/40">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280]">
            <span>Active Businesses</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#111827]">{activeBusinessesCount}</div>
          <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#10B981]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>6.3%</span>
            <span className="text-[#6B7280]">vs last month</span>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-all hover:border-red-200">
          <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280]">
            <span>Failed Payments</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-[#EF4444]">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-[#111827]">{failedPaymentsCount}</div>
          <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[#EF4444]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>23.5%</span>
            <span className="text-[#6B7280]">vs last month</span>
          </div>
        </div>
      </div>

      {/* CHARTS & ALERTS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend Chart */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-[#111827]">Revenue Trend</h3>
            <span className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
              This Month
            </span>
          </div>
          <div className="h-44 w-full flex items-end pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120">
              <path
                d="M 0 100 Q 40 80, 80 65 T 160 40 T 240 25 T 300 10"
                fill="none"
                stroke="#2563EB"
                strokeWidth="3"
              />
              <path
                d="M 0 100 Q 40 80, 80 65 T 160 40 T 240 25 T 300 10 L 300 120 L 0 120 Z"
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
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>

        {/* Orders Volume Chart */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-[#111827]">Orders Volume</h3>
            <span className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1 text-xs font-medium text-[#6B7280]">
              This Month
            </span>
          </div>
          <div className="h-44 w-full flex items-end justify-between gap-2 pt-4 px-2">
            {[45, 65, 80, 55, 95, 110, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-[#2563EB] rounded-t-md transition-all hover:bg-[#1D4ED8]" style={{ height: `${h}%` }} />
            ))}
          </div>
          <div className="flex justify-between border-t border-[#E5E7EB] pt-3 text-[11px] font-semibold text-[#9CA3AF]">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-[#111827]">Alerts</h3>
              <button onClick={() => setActiveTab("webhooks")} className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">
                View All
              </button>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setActiveTab("payments")}
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/50 p-3 cursor-pointer hover:bg-red-50 transition-colors"
              >
                <AlertOctagon className="h-4 w-4 text-[#EF4444] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#111827]">{failedPaymentsCount} Failed Payments</div>
                  <div className="text-[11px] text-[#6B7280]">Requires resolution in Payments Ledger</div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab("webhooks")}
                className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3 cursor-pointer hover:bg-amber-50 transition-colors"
              >
                <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#111827]">{failedWebhooksCount} Webhook Failures</div>
                  <div className="text-[11px] text-[#6B7280]">Manual replay available in Console</div>
                </div>
              </div>

              <div
                onClick={() => setActiveTab("businesses")}
                className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3 cursor-pointer hover:bg-amber-50 transition-colors"
              >
                <AlertOctagon className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#111827]">{inactiveBusinessesCount} Businesses Inactive</div>
                  <div className="text-[11px] text-[#6B7280]">Pending activation or verification</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY & TOP BUSINESSES */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Dynamic Activity Table */}
        <div className="lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-[#111827]">Recent Activity</h3>
            <button onClick={() => setActiveTab("activity")} className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1">
              <span>View All Activity</span> <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#111827]">
              <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
                <tr>
                  <th className="px-3 py-2.5">Action</th>
                  <th className="px-3 py-2.5">Entity</th>
                  <th className="px-3 py-2.5">Entity Name</th>
                  <th className="px-3 py-2.5">User</th>
                  <th className="px-3 py-2.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {activityLogs.slice(0, 5).map((row) => (
                  <tr key={row.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-3 py-3 font-semibold">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          row.severity === "Critical"
                            ? "bg-red-100 text-red-700"
                            : row.severity === "Warning"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {row.action}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[#6B7280]">{row.entity}</td>
                    <td className="px-3 py-3 font-medium text-[#111827]">{row.name}</td>
                    <td className="px-3 py-3 text-[#6B7280]">{row.user}</td>
                    <td className="px-3 py-3 text-[#9CA3AF]">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic Top Businesses by Revenue */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-[#111827]">Top Businesses by Revenue</h3>
            <span className="text-xs text-[#6B7280]">This Month</span>
          </div>

          <div className="space-y-4">
            {businesses.slice(0, 5).map((b) => (
              <div key={b.id} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[#111827]">
                  <span>{b.name}</span>
                  <span className="tabular-nums">₹ {b.revenue.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#F3F4F6]">
                  <div
                    className="h-2 rounded-full bg-[#2563EB]"
                    style={{ width: `${Math.min(100, Math.max(15, (b.revenue / 1500000) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-3 border-t border-[#E5E7EB] text-center">
            <button onClick={() => setActiveTab("businesses")} className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">
              View All Businesses →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
