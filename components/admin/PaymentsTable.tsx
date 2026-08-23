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
    if (status === "success") return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
    if (status === "pending") return "bg-amber-500/20 text-amber-300 border border-amber-500/30";
    return "bg-red-500/20 text-red-300 border border-red-500/30";
  };

  return (
    <div className="space-y-4">
      {/* ── Controls ─────────────────────────────────────────────── */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-96">
          <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-smoke)]" />
          <input
            type="text"
            placeholder="Search Razorpay Order ID or Payment ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--color-void-raised)] border border-[rgba(201,161,90,0.2)] text-sm text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-smoke)]"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--color-smoke)]">
          <ShieldCheck className="w-4 h-4 text-[var(--color-gold)]" />
          <span>Razorpay UPI Reconciliation</span>
        </div>
      </div>

      {/* ── Responsive Container ─────────────────────────────────── */}
      <div className="glass-panel rounded-xl overflow-hidden border-[rgba(201,161,90,0.15)]">

        {/* MOBILE CARD VIEW (<768px) */}
        <div className="block md:hidden divide-y divide-slate-800/80">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((pay) => (
              <div key={pay.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusClasses(pay.status)}`}>
                    {pay.status}
                  </span>
                  <span className="font-bold text-[var(--color-ivory)] text-sm">
                    {formatCurrency(pay.amount)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--color-smoke)] block">Razorpay Order ID</span>
                    <span className="font-mono text-xs text-[var(--color-gold-bright)] break-all">{pay.razorpay_order_id}</span>
                  </div>
                  {pay.razorpay_payment_id && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[var(--color-smoke)] block">Payment ID</span>
                      <span className="font-mono text-xs text-[var(--color-smoke)] break-all">{pay.razorpay_payment_id}</span>
                    </div>
                  )}
                  <div className="text-[11px] text-[var(--color-smoke)]">
                    {new Date(pay.created_at).toLocaleString("en-IN")}
                  </div>
                </div>

                {pay.raw_response && (
                  <button
                    onClick={() => setSelectedResponse(pay.raw_response)}
                    className="flex items-center gap-1.5 text-xs text-[var(--color-gold-bright)] underline font-medium"
                  >
                    <Code className="w-3.5 h-3.5" />
                    View Gateway JSON
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[var(--color-smoke)]">
              No payment records found.
            </div>
          )}
        </div>

        {/* DESKTOP TABLE VIEW (≥768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--color-ivory)]">
            <thead className="bg-[var(--color-void-raised)] text-[var(--color-smoke)] uppercase tracking-wider text-[10px] font-bold border-b border-[rgba(201,161,90,0.15)]">
              <tr>
                <th className="px-4 py-3">Razorpay Order ID</th>
                <th className="px-4 py-3">Payment ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3 text-right">Gateway Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono text-[var(--color-gold-bright)] max-w-[160px] truncate" title={pay.razorpay_order_id}>
                      {pay.razorpay_order_id}
                    </td>
                    <td className="px-4 py-3 font-mono text-[var(--color-smoke)] max-w-[140px] truncate">
                      {pay.razorpay_payment_id || "Pending"}
                    </td>
                    <td className="px-4 py-3 font-bold text-[var(--color-ivory)]">
                      {formatCurrency(pay.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusClasses(pay.status)}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-smoke)] whitespace-nowrap">
                      {new Date(pay.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {pay.raw_response ? (
                        <button
                          onClick={() => setSelectedResponse(pay.raw_response)}
                          className="inline-flex items-center gap-1 text-[11px] text-[var(--color-gold-bright)] underline hover:text-white"
                        >
                          <Code className="w-3.5 h-3.5" />
                          <span>View JSON</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[var(--color-smoke)] italic">None</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-smoke)]">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Gateway Response Inspector Modal ─────────────────────── */}
      {selectedResponse && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="glass-panel rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg border-[var(--color-gold)]/40 shadow-2xl flex flex-col max-h-[85dvh] sm:max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-white/10 p-4 flex-shrink-0">
              <h4 className="font-display font-semibold text-[var(--color-ivory)] text-base">
                Gateway Webhook Response
              </h4>
              <button
                onClick={() => setSelectedResponse(null)}
                aria-label="Close"
                className="text-[var(--color-smoke)] hover:text-white p-1.5 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <pre className="bg-[var(--color-void)] p-4 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto border border-white/10">
                {JSON.stringify(selectedResponse, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-white/10 flex-shrink-0">
              <button
                onClick={() => setSelectedResponse(null)}
                className="w-full py-3 rounded-xl glass-panel text-[var(--color-ivory)] hover:border-[var(--color-gold)] text-xs font-semibold min-h-[48px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
