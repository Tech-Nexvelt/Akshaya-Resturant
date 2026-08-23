"use client";

import React, { useState } from "react";
import { Plus, Search, Eye, ChevronDown, X, ShoppingBag } from "lucide-react";
import { useBusinessAdminStore, OrderStatus, BusinessOrder } from "@/store/useBusinessAdminStore";

export function BusinessOrdersView() {
  const { orders, addOrder, updateOrderStatus } = useBusinessAdminStore();

  const [filter, setFilter] = useState<OrderStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<BusinessOrder | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for new order
  const [customerName, setCustomerName] = useState("");
  const [tableNo, setTableNo] = useState("Table 01");
  const [amount, setAmount] = useState(1250);

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === "All" ? true : o.status === filter;
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.tableNo.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    addOrder({
      customerName: customerName.trim(),
      tableNo,
      itemsCount: 3,
      items: [
        { id: "i1", name: "Special Combo", qty: 1, price: amount },
      ],
      amount: Number(amount) || 1000,
      status: "Pending",
      time: "Just now",
    });

    setCustomerName("");
    setIsAddModalOpen(false);
  };

  const getStatusStyle = (st: OrderStatus) => {
    switch (st) {
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
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Orders Management</h2>
          <p className="text-xs text-[#6B7280]">Live POS dining, takeaway, and delivery orders</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tab Filters */}
          <div className="flex rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1 text-xs font-bold">
            {(["All", "Pending", "Preparing", "Ready", "Completed", "Cancelled"] as const).map((tab) => (
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
            <Plus className="h-4 w-4" /> Create Order
          </button>
        </div>
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
              placeholder="Search order ID or customer..."
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
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#2563EB]">{o.orderNumber}</td>
                  <td className="px-4 py-3.5 font-semibold text-[#111827]">{o.customerName}</td>
                  <td className="px-4 py-3.5 text-[#6B7280]">{o.tableNo}</td>
                  <td className="px-4 py-3.5 font-bold text-[#111827]">{o.itemsCount} Items</td>
                  <td className="px-4 py-3.5 font-bold text-[#111827]">₹ {o.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 relative">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === o.id ? null : o.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border cursor-pointer ${getStatusStyle(o.status)}`}
                      >
                        <span>{o.status}</span>
                        <ChevronDown className="h-3 w-3" />
                      </button>

                      {activeDropdown === o.id && (
                        <div className="absolute left-0 top-full z-20 mt-1 w-32 rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-lg text-left">
                          {(["Pending", "Preparing", "Ready", "Completed", "Cancelled"] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                updateOrderStatus(o.id, st);
                                setActiveDropdown(null);
                              }}
                              className="block w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-[#111827] hover:bg-[#EFF6FF] hover:text-[#2563EB] cursor-pointer"
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-[#6B7280]">{o.time}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="p-1 text-[#6B7280] hover:text-[#2563EB] transition-colors cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
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
              <h3 className="text-base font-bold text-[#111827]">Create New POS Order</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-[#111827] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#111827]">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Select Table</label>
                <select
                  value={tableNo}
                  onChange={(e) => setTableNo(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                >
                  {Array.from({ length: 15 }, (_, i) => `Table ${String(i + 1).padStart(2, "0")}`).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111827]">Total Amount (₹)</label>
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

      {/* Order Details Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl space-y-6 overflow-y-auto h-full border-l border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">{selectedOrder.orderNumber}</h3>
                <span className="text-xs text-[#2563EB] font-bold">{selectedOrder.tableNo}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-black p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-2">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Customer:</span> <strong className="text-[#111827]">{selectedOrder.customerName}</strong>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Order Time:</span> <strong className="text-[#111827]">{selectedOrder.time}</strong>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Current Status:</span>
                  <span className={`font-bold rounded-full px-2 py-0.5 ${getStatusStyle(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#111827] uppercase tracking-wider text-[10px] mb-2">Order Line Items</h4>
                <div className="divide-y divide-[#E5E7EB] border border-[#E5E7EB] rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between p-3 bg-white">
                      <div>
                        <div className="font-bold text-[#111827]">{item.name}</div>
                        <div className="text-[10px] text-[#6B7280]">{item.qty} x ₹{item.price}</div>
                      </div>
                      <div className="font-bold text-[#2563EB]">₹ {item.qty * item.price}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 flex justify-between font-bold text-sm text-[#111827]">
                <span>Grand Total</span>
                <span className="text-[#2563EB] text-base font-extrabold">₹ {selectedOrder.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
