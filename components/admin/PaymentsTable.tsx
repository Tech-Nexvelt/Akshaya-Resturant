"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { formatCurrency } from "@/lib/utils";
import { Search, CreditCard, ShieldCheck, Code, X } from "lucide-react";

export function PaymentsTable() {
  const { payments } = useAdminStore();
  const [search, setSearch] = useState("");
  const [selectedResponse, setSelectedResponse] = useState<Record<string, unknown> | null>(null);

  const filteredPayments = payments.filter((p) => {
    return (
      p.razorpay_order_id.toLowerCase().includes(search.toLowerCase()) ||
      (p.razorpay_payment_id && p.razorpay_payment_id.toLowerCase().includes(search.toLowerCase())) ||
      p.order_id.toLowerCase().includes(search.toLowerCase())
    );
  });

  const statusClasses = (status: string) => {
    if (status === "success") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (status === "pending") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-rose-50 text-rose-600 border border-rose-200";
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Payment Reconciliation</h2>
          <p className="text-xs text-[#6B7280]">Audit Razorpay gateway settlement statuses and payment logs</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6B7280]">
          <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
          <span>Razorpay UPI Reconciliation</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search Order ID or Payment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#6B7280]">Showing {filteredPayments.length} of {payments.length} transactions</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Razorpay Order ID</th>
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Gateway Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-[#2563EB]">
                      {pay.razorpay_order_id}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#6B7280]">
                      {pay.razorpay_payment_id || "Pending"}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#111827]">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusClasses(pay.status)}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-[#6B7280]">
                      {new Date(pay.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {pay.raw_response ? (
                        <button
                          onClick={() => setSelectedResponse(pay.raw_response)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          <Code className="h-3.5 w-3.5" />
                          <span>View JSON</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#6B7280] italic">None</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6B7280]">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gateway Response Inspector Modal */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">Gateway Webhook Response</h3>
              <button onClick={() => setSelectedResponse(null)} className="text-gray-400 hover:text-[#111827] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <pre className="rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              {JSON.stringify(selectedResponse, null, 2)}
            </pre>

            <div className="flex justify-end pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={() => setSelectedResponse(null)}
                className="h-9 rounded-xl bg-gray-100 px-4 text-xs font-bold text-gray-700 hover:bg-gray-200 cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
