"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Order, OrderStatus } from "@/types/platform";
import { formatCurrency } from "@/lib/utils";
import { Plus, Ban, Eye, Phone, ChevronRight, X } from "lucide-react";

const statusBadges: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
  pending: { label: "Pending", bg: "bg-amber-100", text: "text-amber-900 font-extrabold", border: "border-amber-300" },
  confirmed: { label: "Confirmed", bg: "bg-blue-50", text: "text-blue-700 font-bold", border: "border-blue-200" },
  preparing: { label: "Preparing", bg: "bg-purple-50", text: "text-purple-700 font-bold", border: "border-purple-200" },
  ready: { label: "Ready for Pickup", bg: "bg-emerald-50", text: "text-emerald-700 font-bold", border: "border-emerald-200" },
  completed: { label: "Completed", bg: "bg-gray-100", text: "text-gray-700 font-bold", border: "border-gray-200" },
  cancelled: { label: "Cancelled", bg: "bg-rose-50", text: "text-rose-700 font-bold", border: "border-rose-200" },
};

const nextStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "completed",
};

export function RealtimeOrderFeed() {
  const { orders, orderItemsMap, updateOrderStatus, addSimulatedOrder, currentRole } = useAdminStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const canUpdateStatus = currentRole === "owner" || currentRole === "admin" || currentRole === "staff";
  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111827] flex items-center gap-2">
              Supabase Realtime Order Feed
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                {activeOrders.length} Active
              </span>
            </h3>
            <p className="text-xs text-[#6B7280]">
              Kitchen Operations Feed • Auto-updates in real time
            </p>
          </div>
        </div>

        <button
          onClick={() => addSimulatedOrder()}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Simulate Incoming Order</span>
        </button>
      </div>

      {/* Active Orders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.slice(0, 6).map((order) => {
          const badge = statusBadges[order.status];
          const nextStatus = nextStatusMap[order.status];
          const items = orderItemsMap[order.id] || [];

          return (
            <div
              key={order.id}
              className={`rounded-2xl border p-5 shadow-xs transition-all bg-white ${
                order.status === "pending" ? "border-amber-300 bg-amber-50/20" : "border-[#E5E7EB]"
              }`}
            >
              {/* Card Top */}
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-2.5 mb-2.5">
                <div>
                  <span className="font-mono text-xs font-bold text-[#2563EB]">
                    {order.order_number}
                  </span>
                  <div className="text-[10px] text-[#6B7280]">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Guest Info */}
              <div className="mb-3">
                <div className="text-sm font-extrabold text-[#111827]">{order.guest_name}</div>
                <div className="text-xs text-slate-700 flex items-center gap-1.5 mt-0.5 font-mono font-bold">
                  <Phone className="h-3.5 w-3.5 text-slate-700" />
                  <span>{order.guest_phone}</span>
                </div>
                {order.notes && (
                  <div className="mt-2 text-xs font-bold text-amber-950 bg-amber-100/90 p-2.5 rounded-xl border border-amber-300 shadow-2xs leading-relaxed">
                    &quot;{order.notes}&quot;
                  </div>
                )}
              </div>

              {/* Item Summary */}
              <div className="text-xs text-[#6B7280] space-y-1 mb-3 bg-[#F9FAFB] p-2.5 rounded-xl border border-[#E5E7EB]">
                {items.length > 0 ? (
                  items.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span className="text-[#111827] font-semibold">
                        {it.quantity}x {it.item_name}
                      </span>
                      <span className="font-mono">{formatCurrency(it.subtotal)}</span>
                    </div>
                  ))
                ) : (
                  <div className="italic text-[10px]">Order items loading...</div>
                )}
                <div className="border-t border-[#E5E7EB] pt-1.5 flex justify-between font-bold text-[#2563EB]">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>

              {/* Status Update Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {canUpdateStatus && nextStatus && (
                  <button
                    onClick={() => updateOrderStatus(order.id, nextStatus)}
                    className="flex-1 h-8 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Advance to {nextStatusMap[order.status]}</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}

                {canUpdateStatus && order.status !== "cancelled" && order.status !== "completed" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                    title="Cancel Order"
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-gray-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                  >
                    <Ban className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(order)}
                  title="View Full Details"
                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-gray-500 hover:bg-gray-100 hover:text-[#111827] cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#111827]">Order #{selectedOrder.order_number}</h3>
                <div className="text-xs text-[#6B7280]">
                  Created: {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-[#111827] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#6B7280]">Customer Name:</span>
                <div className="font-bold text-[#111827]">{selectedOrder.guest_name}</div>
              </div>
              <div>
                <span className="text-[#6B7280]">Phone Number:</span>
                <div className="font-mono text-[#6B7280]">{selectedOrder.guest_phone}</div>
              </div>
              <div>
                <span className="text-[#6B7280]">Status:</span>
                <div className="capitalize text-[#2563EB] font-bold">{selectedOrder.status}</div>
              </div>
              <div>
                <span className="text-[#6B7280]">Items Breakdown:</span>
                <div className="space-y-1.5 mt-1 bg-[#F9FAFB] p-3 rounded-xl border border-[#E5E7EB]">
                  {(orderItemsMap[selectedOrder.id] || []).map((it) => (
                    <div key={it.id} className="flex justify-between text-xs">
                      <span className="text-[#111827] font-semibold">{it.quantity}x {it.item_name}</span>
                      <span className="font-mono text-[#6B7280]">{formatCurrency(it.subtotal)}</span>
                    </div>
                  ))}
                  <div className="border-t border-[#E5E7EB] pt-2 flex justify-between font-bold text-sm text-[#2563EB]">
                    <span>Total Amount</span>
                    <span>{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={() => setSelectedOrder(null)}
                className="h-9 rounded-xl bg-gray-100 px-4 text-xs font-bold text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
