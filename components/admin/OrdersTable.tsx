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

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, guest, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === "all"
                ? "bg-amber-500 text-slate-950 font-bold"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? "bg-amber-500 text-slate-950 font-bold"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive View: Desktop Table + Mobile Cards */}
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80">
        
        {/* MOBILE CARD VIEW (< 768px) */}
        <div className="block md:hidden divide-y divide-slate-800/80">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const items = orderItemsMap[order.id] || [];
              return (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        {order.order_number}
                      </span>
                      <div className="text-[11px] text-slate-400">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        order.status === "pending"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : order.status === "preparing"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : order.status === "ready"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : order.status === "completed"
                          ? "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                          : order.status === "cancelled"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">{order.guest_name}</p>
                      <p className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3 text-amber-400" />
                        <span>{order.guest_phone}</span>
                      </p>
                    </div>
                    <div className="font-mono font-bold text-amber-400 text-base">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider mb-0.5">Items Summary</span>
                    {items.map((it) => `${it.quantity}x ${it.item_name}`).join(", ") || "Loading..."}
                  </p>

                  {canUpdateStatus && (
                    <div className="pt-1">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="w-full bg-slate-900 border border-amber-500/30 text-xs text-white rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-amber-500"
                      >
                        {allStatuses.map((st) => (
                          <option key={st} value={st} className="bg-slate-900 text-white">
                            Status: {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No orders match your filter criteria.
            </div>
          )}
        </div>

        {/* DESKTOP TABLE VIEW (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items Summary</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const items = orderItemsMap[order.id] || [];
                  return (
                    <tr key={order.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-amber-400">
                          {order.order_number}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{order.guest_name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-amber-400" />
                          <span>{order.guest_phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-xs truncate text-slate-300">
                        {items.map((it) => `${it.quantity}x ${it.item_name}`).join(", ") || "Loading..."}
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-400 font-mono">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            order.status === "pending"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : order.status === "preparing"
                              ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                              : order.status === "ready"
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : order.status === "completed"
                              ? "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                              : order.status === "cancelled"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canUpdateStatus ? (
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-slate-900 border border-amber-500/30 text-xs text-white rounded px-2.5 py-1 font-medium focus:outline-none focus:border-amber-500"
                          >
                            {allStatuses.map((st) => (
                              <option key={st} value={st} className="bg-slate-900 text-white">
                                Set {st}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">View Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No orders match your filter criteria.
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
