"use client";

import React, { useState } from "react";
import { Plus, Search, ChevronDown, X } from "lucide-react";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";

export function OrdersView() {
  const { orders, addOrder, updateOrderStatus, businesses } = useSuperAdminStore();

  const [filter, setFilter] = useState<"All" | "Pending" | "Completed" | "Cancelled">("All");
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Form states
  const [business, setBusiness] = useState(businesses[0]?.name || "The Grand Kitchen");
  const [amount, setAmount] = useState(2450);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === "All" ? true : o.status === filter;
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.business.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOrder({
      business,
      amount: Number(amount) || 1000,
      status: "Pending",
      time: "Just now",
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Orders</h2>
          <p className="text-xs text-[#6B7280]">Manage and monitor orders across all business locations</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Filters */}
          <div className="flex rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1 text-xs font-bold">
            {(["All", "Pending", "Completed", "Cancelled"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  filter === tab ? "bg-[#2563EB] text-white shadow-2xs" : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Order
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID..."
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#6B7280]">Showing {filteredOrders.length} of {orders.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#2563EB]">{o.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-[#111827]">{o.business}</td>
                  <td className="px-4 py-3.5 font-bold text-[#111827]">₹ {o.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 relative">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === o.id ? null : o.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer ${
                          o.status === "Completed"
                            ? "bg-emerald-50 text-[#10B981] border border-emerald-200"
                            : o.status === "Pending"
                            ? "bg-amber-50 text-[#F59E0B] border border-amber-200"
                            : "bg-red-50 text-[#EF4444] border border-red-200"
                        }`}
                      >
                        <span>{o.status}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      {activeDropdown === o.id && (
                        <div className="absolute left-0 top-full z-20 mt-1 w-28 rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-lg text-left">
                          {(["Pending", "Completed", "Cancelled"] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                updateOrderStatus(o.id, st);
                                setActiveDropdown(null);
                              }}
                              className="block w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-[#111827] hover:bg-blue-50 hover:text-[#2563EB] cursor-pointer"
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right text-[#6B7280]">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">Create New Order</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-[#111827] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#111827]">Select Business</label>
                <select
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111827]">Order Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 rounded-xl border border-[#E5E7EB] bg-white px-4 text-xs font-bold text-[#111827] hover:bg-[#F9FAFB]"
                >
                  Cancel
                </button>
                <button type="submit" className="h-9 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8]">
                  Submit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
