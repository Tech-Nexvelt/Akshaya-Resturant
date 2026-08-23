"use client";

import { useState } from "react";
import { Clock, CheckCircle2, ChevronRight, Utensils, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface OrderItem {
  name: string;
  quantity: number;
}

interface StaffOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered";
  created_at: string;
}

const MOCK_STAFF_ORDERS: StaffOrder[] = [
  {
    id: "ord-101",
    order_number: "AK-20260823-8969",
    customer_name: "Ravi Kumar",
    customer_phone: "+91 9876543210",
    items: [
      { name: "Hyderabadi Chicken Biryani", quantity: 2 },
      { name: "Butter Naan", quantity: 3 },
    ],
    total: 747,
    status: "confirmed",
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-102",
    order_number: "AK-20260823-8970",
    customer_name: "Priya Sharma",
    customer_phone: "+91 9876543211",
    items: [
      { name: "Paneer Butter Masala", quantity: 1 },
      { name: "Garlic Naan", quantity: 2 },
      { name: "Gulab Jamun", quantity: 1 },
    ],
    total: 447,
    status: "preparing",
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-103",
    order_number: "AK-20260823-8971",
    customer_name: "Arjun Mehta",
    customer_phone: "+91 9876543212",
    items: [{ name: "Chicken 65", quantity: 2 }],
    total: 480,
    status: "ready",
    created_at: new Date(Date.now() - 22 * 60 * 1000).toISOString(),
  },
];

export function StaffOrderQueue() {
  const [orders, setOrders] = useState<StaffOrder[]>(MOCK_STAFF_ORDERS);

  const handleAdvanceStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const nextStatus: StaffOrder["status"] =
          o.status === "confirmed"
            ? "preparing"
            : o.status === "preparing"
            ? "ready"
            : o.status === "ready"
            ? "delivered"
            : o.status;
        return { ...o, status: nextStatus };
      })
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#2563EB]">
            <Utensils className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#111827]">Kitchen Order Queue</h2>
            <p className="text-xs text-[#6B7280]">Staff execution interface for active orders</p>
          </div>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
          {orders.filter((o) => o.status !== "delivered").length} Active Orders
        </span>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex flex-col justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
          >
            <div>
              {/* Order Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                <div>
                  <span className="text-xs font-bold text-[#2563EB]">{order.order_number}</span>
                  <h3 className="text-sm font-bold text-[#111827]">{order.customer_name}</h3>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    order.status === "confirmed"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "preparing"
                      ? "bg-amber-100 text-amber-800"
                      : order.status === "ready"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items List */}
              <div className="py-4 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Dishes to Prepare:
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold text-[#111827]">
                    <span>{item.name}</span>
                    <span className="rounded bg-[#F3F4F6] px-2 py-0.5 font-bold text-[#2563EB]">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Stepper Button */}
            <div className="pt-3 border-t border-[#E5E7EB]">
              {order.status === "delivered" ? (
                <div className="flex min-h-[48px] items-center justify-center gap-1.5 rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Order Complete & Delivered
                </div>
              ) : (
                <button
                  onClick={() => handleAdvanceStatus(order.id)}
                  className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] text-xs font-bold text-white shadow-md hover:bg-[#1D4ED8] active:scale-98 transition-all cursor-pointer"
                >
                  <span>
                    Advance to:{" "}
                    {order.status === "confirmed"
                      ? "PREPARING"
                      : order.status === "preparing"
                      ? "READY"
                      : "DELIVERED"}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
