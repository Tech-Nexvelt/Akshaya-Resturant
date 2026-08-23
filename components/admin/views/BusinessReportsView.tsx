"use client";

import React from "react";
import { BarChart3, Download, TrendingUp, DollarSign } from "lucide-react";
import { useBusinessAdminStore } from "@/store/useBusinessAdminStore";

export function BusinessReportsView() {
  const { payments, orders } = useBusinessAdminStore();

  const totalRevenue = payments
    .filter((p) => p.status === "Success")
    .reduce((sum, p) => sum + p.amount, 0) + 45320;

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto p-2 sm:p-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Sales Reports & Analytics</h2>
          <p className="text-xs text-[#6B7280]">Detailed breakdown of restaurant sales, payment methods, and dish popularity</p>
        </div>

        <button className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer">
          <Download className="h-4 w-4" /> Download PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales by Category */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#111827]">Sales by Category</h3>

          <div className="space-y-3 text-xs">
            {[
              { category: "Main Course", sales: 24500, pct: 45 },
              { category: "Starters", sales: 12800, pct: 24 },
              { category: "South Indian", sales: 8900, pct: 16 },
              { category: "Desserts & Drinks", sales: 8120, pct: 15 },
            ].map((c) => (
              <div key={c.category} className="space-y-1">
                <div className="flex justify-between font-bold text-[#111827]">
                  <span>{c.category}</span>
                  <span>₹ {c.sales.toLocaleString()} ({c.pct}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-[#2563EB]" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method Breakdown */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#111827]">Payment Method Breakdown</h3>

          <div className="space-y-3 text-xs">
            {[
              { method: "UPI / QR Code", count: 68, amount: 28400, pct: 55 },
              { method: "Credit / Debit Card", count: 32, amount: 14200, pct: 28 },
              { method: "Cash", count: 18, amount: 7500, pct: 14 },
              { method: "Digital Wallet", count: 5, amount: 1800, pct: 3 },
            ].map((pm) => (
              <div key={pm.method} className="space-y-1">
                <div className="flex justify-between font-bold text-[#111827]">
                  <span>{pm.method} ({pm.count} txns)</span>
                  <span>₹ {pm.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pm.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
