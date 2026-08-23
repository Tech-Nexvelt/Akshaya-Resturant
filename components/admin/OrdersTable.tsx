"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { OrderStatus } from "@/types/platform";
import { formatCurrency } from "@/lib/utils";
import { Search, Phone } from "lucide-react";

const allStatuses: OrderStatus[] = ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"];

export function OrdersTable() {
  const { orders, orderItemsMap, updateOrderStatus, currentRole } = useAdminStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const canUpdateStatus = currentRole === "owner" || currentRole === "admin" || currentRole === "staff";

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      o.guest_phone.includes(search);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "preparing":
        return "bg-blue-50 text-[#2563EB] border border-blue-200";
      case "ready":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "completed":
        return "bg-gray-100 text-gray-700 border border-gray-200";
      case "cancelled":
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-blue-50 text-[#2563EB] border border-blue-200";
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Live Orders Queue</h2>
          <p className="text-xs text-[#6B7280]">Monitor and manage real-time dining, delivery, and online orders</p>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              statusFilter === "all" ? "bg-[#2563EB] text-white shadow-2xs" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({orders.length})
          </button>
          {allStatuses.map((st) => {
            const count = orders.filter((o) => o.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st ? "bg-[#2563EB] text-white shadow-2xs" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search order #, guest, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#6B7280]">Showing {filteredOrders.length} of {orders.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items Summary</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const items = orderItemsMap[order.id] || [];
                  return (
                    <tr key={order.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#2563EB]">
                        <div>{order.order_number}</div>
                        <div className="text-[10px] text-[#6B7280] font-normal">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-[#111827]">{order.guest_name}</div>
                        <div className="text-[10px] text-[#6B7280] flex items-center gap-1 font-mono">
                          <Phone className="h-3 w-3 text-[#9CA3AF]" />
                          <span>{order.guest_phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs truncate text-[#6B7280]">
                        {items.map((it) => `${it.quantity}x ${it.item_name}`).join(", ") || "Loading..."}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#111827]">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {canUpdateStatus ? (
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="h-8 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2 text-xs font-bold text-[#111827] focus:border-[#2563EB] focus:outline-none"
                          >
                            {allStatuses.map((st) => (
                              <option key={st} value={st}>
                                Set {st}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[10px] text-[#6B7280] italic">View Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">
                    No orders match criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
