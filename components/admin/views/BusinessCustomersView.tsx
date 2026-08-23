"use client";

import React, { useState } from "react";
import { Search, Download, UserCheck } from "lucide-react";
import { useBusinessAdminStore } from "@/store/useBusinessAdminStore";

export function BusinessCustomersView() {
  const { customers } = useBusinessAdminStore();
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto p-2 sm:p-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Customer Directory</h2>
          <p className="text-xs text-[#6B7280]">Customer order frequency and total lifetime spend CRM</p>
        </div>

        <button className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 text-xs font-bold text-[#111827] shadow-2xs hover:bg-[#F9FAFB] transition-colors cursor-pointer">
          <Download className="h-4 w-4 text-[#6B7280]" /> Export CRM CSV
        </button>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer name or phone..."
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#6B7280]">Showing {filteredCustomers.length} of {customers.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">Total Orders</th>
                <th className="px-4 py-3">Total Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#111827] flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-[#2563EB]" />
                    <span>{c.name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[#6B7280]">{c.phone}</td>
                  <td className="px-4 py-3.5 font-bold text-[#111827]">{c.ordersCount} Orders</td>
                  <td className="px-4 py-3.5 font-bold text-[#2563EB]">₹ {c.totalSpend.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
