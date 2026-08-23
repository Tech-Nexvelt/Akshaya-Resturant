"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Order, OrderStatus } from "@/types/platform";
import { formatCurrency } from "@/lib/utils";
import { Radio, Clock, CheckCircle2, Flame, PackageCheck, Ban, Plus, Eye, Phone, ChevronRight } from "lucide-react";

const statusBadges: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
  pending: { label: "Pending", bg: "bg-amber-500/10", text: "text-amber-300", border: "border-amber-500/30" },
  confirmed: { label: "Confirmed", bg: "bg-blue-500/10", text: "text-blue-300", border: "border-blue-500/30" },
  preparing: { label: "Preparing", bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/30" },
  ready: { label: "Ready for Pickup", bg: "bg-emerald-500/10", text: "text-emerald-300", border: "border-emerald-500/30" },
  completed: { label: "Completed", bg: "bg-gray-500/10", text: "text-gray-400", border: "border-gray-500/30" },
  cancelled: { label: "Cancelled", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/30" },
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

  // Staff can view and update order status per RBAC
  const canUpdateStatus = currentRole === "owner" || currentRole === "admin" || currentRole === "staff";

  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ivory)] flex items-center gap-2">
              Supabase Realtime Order Feed
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {activeOrders.length} Active
              </span>
            </h3>
            <p className="text-xs text-[var(--color-smoke)]">
              Kitchen Operations Feed &bull; Auto-updates in real time
            </p>
          </div>
        </div>

        <button
          onClick={() => addSimulatedOrder()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold-bright)] border border-[var(--color-gold)]/30 text-xs font-semibold hover:bg-[var(--color-gold)]/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
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
              className={`glass-panel p-4 rounded-xl border transition-all hover:border-[var(--color-gold)]/40 ${
                order.status === "pending" ? "border-amber-500/40 bg-amber-500/[0.02]" : "border-[rgba(201,161,90,0.15)]"
              }`}
            >
              {/* Card Top */}
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-2.5">
                <div>
                  <span className="font-mono text-xs font-bold text-[var(--color-gold-bright)]">
                    {order.order_number}
                  </span>
                  <div className="text-[10px] text-[var(--color-smoke)]">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Guest Info */}
              <div className="mb-3">
                <div className="text-sm font-semibold text-[var(--color-ivory)]">{order.guest_name}</div>
                <div className="text-xs text-[var(--color-smoke)] flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3 text-[var(--color-gold)]" />
                  <span>{order.guest_phone}</span>
                </div>
                {order.notes && (
                  <div className="mt-1.5 text-[11px] text-amber-200/90 italic bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                    &quot;{order.notes}&quot;
                  </div>
                )}
              </div>

              {/* Item Summary */}
              <div className="text-xs text-[var(--color-smoke)] space-y-1 mb-3 bg-white/[0.02] p-2 rounded border border-white/5">
                {items.length > 0 ? (
                  items.map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span className="text-[var(--color-ivory)] font-medium">
                        {it.quantity}x {it.item_name}
                      </span>
                      <span>{formatCurrency(it.subtotal)}</span>
                    </div>
                  ))
                ) : (
                  <div className="italic text-[10px]">Order items loading...</div>
                )}
                <div className="border-t border-white/10 pt-1 flex justify-between font-bold text-[var(--color-gold-bright)]">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>

              {/* Status Update Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {canUpdateStatus && nextStatus && (
                  <button
                    onClick={() => updateOrderStatus(order.id, nextStatus)}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-gradient-to-r from-[var(--color-gold-dim)] to-[var(--color-gold)] text-[var(--color-void)] text-xs font-bold hover:brightness-110 transition-all flex items-center justify-center gap-1"
                  >
                    <span>Advance to {nextStatusMap[order.status]}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {canUpdateStatus && order.status !== "cancelled" && order.status !== "completed" && (
                  <button
                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                    title="Cancel Order"
                    className="p-1.5 rounded-lg glass-panel hover:bg-red-500/20 hover:text-red-300 text-[var(--color-smoke)] transition-colors"
                  >
                    <Ban className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setSelectedOrder(order)}
                  title="View Full Details"
                  className="p-1.5 rounded-lg glass-panel hover:border-[var(--color-gold)] text-[var(--color-smoke)] hover:text-[var(--color-ivory)] transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border-[var(--color-gold)]/40 shadow-2xl animate-fade-up">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <h4 className="font-display font-semibold text-[var(--color-ivory)] text-lg">
                  Order #{selectedOrder.order_number}
                </h4>
                <div className="text-xs text-[var(--color-smoke)]">
                  Created: {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[var(--color-smoke)] hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-5 text-sm">
              <div>
                <span className="text-[var(--color-smoke)] text-xs">Customer Name:</span>
                <div className="text-[var(--color-ivory)] font-medium">{selectedOrder.guest_name}</div>
              </div>
              <div>
                <span className="text-[var(--color-smoke)] text-xs">Phone Number:</span>
                <div className="text-[var(--color-ivory)] font-mono">{selectedOrder.guest_phone}</div>
              </div>
              <div>
                <span className="text-[var(--color-smoke)] text-xs">Status:</span>
                <div className="capitalize text-[var(--color-gold-bright)] font-bold">{selectedOrder.status}</div>
              </div>
              <div>
                <span className="text-[var(--color-smoke)] text-xs">Items:</span>
                <div className="space-y-1 mt-1 bg-white/5 p-3 rounded-lg">
                  {(orderItemsMap[selectedOrder.id] || []).map((it) => (
                    <div key={it.id} className="flex justify-between text-xs">
                      <span>{it.quantity}x {it.item_name}</span>
                      <span className="font-mono">{formatCurrency(it.subtotal)}</span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm text-[var(--color-gold)]">
                    <span>Total Amount</span>
                    <span>{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2 rounded-lg glass-panel text-[var(--color-ivory)] hover:border-[var(--color-gold)] text-sm font-semibold"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
