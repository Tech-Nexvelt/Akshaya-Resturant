"use client";

import React, { useState } from "react";
import { Plus, Search, CheckCircle2, XCircle, Clock, ChevronDown, Trash2, X } from "lucide-react";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";

export function PaymentsView() {
  const { payments, updatePaymentStatus, addPayment, deletePayment, orders } = useSuperAdminStore();
  const [search, setSearch] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [orderId, setOrderId] = useState(orders[0]?.id || "ORD-78910");
  const [amount, setAmount] = useState(2450);
  const [method, setMethod] = useState<"Card" | "UPI" | "Wallet" | "Net Banking">("UPI");
  const [status, setStatus] = useState<"Success" | "Pending" | "Failed">("Success");

  const filteredPayments = payments.filter(
    (p) =>
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.orderId.toLowerCase().includes(search.toLowerCase()) ||
      p.method.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPayment({
      orderId,
      amount: Number(amount) || 1000,
      method,
      status,
      time: "Just now",
    });
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Payments Ledger</h2>
          <p className="text-xs text-[#6B7280]">Audit transactions and payment gateway settlement statuses</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Record Payment
        </button>
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
              placeholder="Search payment ID or method..."
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#6B7280]">Showing {filteredPayments.length} of {payments.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-[#2563EB]">{p.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-[#111827]">{p.orderId}</td>
                  <td className="px-4 py-3.5 font-bold text-[#111827]">₹ {p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-[#6B7280]">{p.method}</td>
                  <td className="px-4 py-3.5 relative">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === p.id ? null : p.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer ${
                          p.status === "Success"
                            ? "bg-emerald-50 text-[#10B981] border border-emerald-200"
                            : p.status === "Pending"
                            ? "bg-amber-50 text-[#F59E0B] border border-amber-200"
                            : "bg-red-50 text-[#EF4444] border border-red-200"
                        }`}
                      >
                        {p.status === "Success" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : p.status === "Pending" ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>{p.status}</span>
                        <ChevronDown className="h-3 w-3 ml-0.5" />
                      </button>

                      {activeDropdown === p.id && (
                        <div className="absolute left-0 top-full z-20 mt-1 w-28 rounded-xl border border-[#E5E7EB] bg-white p-1 shadow-lg text-left">
                          {(["Success", "Pending", "Failed"] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => {
                                updatePaymentStatus(p.id, st);
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
                  <td className="px-4 py-3.5 text-[#6B7280]">{p.time}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => deletePayment(p.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">Record Transaction</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-[#111827] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddPaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#111827]">Order Reference ID</label>
                <input
                  type="text"
                  required
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Payment Method</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Wallet">Wallet</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111827]">Initial Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="Success">Success</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
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
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
