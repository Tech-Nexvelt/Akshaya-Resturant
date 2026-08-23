"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { formatCurrency } from "@/lib/utils";
import { FileText, Download, ToggleLeft, ToggleRight, ShieldAlert } from "lucide-react";
import { InvoiceModal } from "@/components/admin/InvoiceModal";
import { Invoice } from "@/types/platform";

export function InvoicesTable() {
  const { invoices, gstEnabled, gstRate, toggleGst, currentRole } = useAdminStore();
  const isOwner = currentRole === "owner";
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const typeClasses = (type: string) =>
    type === "tax"
      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
      : "bg-purple-500/20 text-purple-300 border border-purple-500/30";

  return (
    <div className="space-y-4">
      {/* ── GST Management Bar ───────────────────────────────────── */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-[var(--color-gold)]/20">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-ivory)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--color-gold)]" />
            GST Tax & Billing Configuration
          </h3>
          <p className="text-xs text-[var(--color-smoke)] mt-0.5">
            Sequential FY-prefixed billing system &bull; Current GST Rate: {gstRate}%
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[var(--color-void-raised)] p-2 rounded-lg border border-white/5 w-full sm:w-auto">
          <span className="text-xs font-semibold text-[var(--color-smoke)] whitespace-nowrap">
            GST Collection:
          </span>
          {isOwner ? (
            <button
              onClick={() => toggleGst(!gstEnabled)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all min-h-[36px] ${
                gstEnabled
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}
            >
              {gstEnabled ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-400" />
                  <span>GST ACTIVE ({gstRate}%)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-gray-400" />
                  <span>GST DISABLED</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1 text-xs text-[var(--color-smoke)] bg-white/5 px-2.5 py-1.5 rounded">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Owner Control Only</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Responsive Container ─────────────────────────────────── */}
      <div className="glass-panel rounded-xl overflow-hidden border-[rgba(201,161,90,0.15)]">

        {/* MOBILE CARD VIEW (<768px) */}
        <div className="block md:hidden divide-y divide-slate-800/80">
          {invoices.length > 0 ? (
            invoices.map((inv) => (
              <div key={inv.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono font-bold text-[var(--color-gold-bright)] text-sm block">
                      {inv.invoice_number}
                    </span>
                    <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeClasses(inv.type)}`}>
                      {inv.type === "tax" ? "Tax Invoice" : "Proforma Invoice"}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedInvoice(inv)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--color-gold)]/10 text-[var(--color-gold-bright)] hover:bg-[var(--color-gold)]/20 transition-colors text-xs font-medium min-h-[44px] flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>View PDF</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--color-smoke)] block">Subtotal</span>
                    <span className="text-[var(--color-smoke)] font-mono">{formatCurrency(inv.subtotal)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--color-smoke)] block">GST</span>
                    <span className="text-emerald-400 font-mono">+{formatCurrency(inv.gst_amount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--color-smoke)] block">Total</span>
                    <span className="text-[var(--color-ivory)] font-bold font-mono">{formatCurrency(inv.total_amount)}</span>
                  </div>
                </div>

                <div className="text-[11px] text-[var(--color-smoke)]">
                  {new Date(inv.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[var(--color-smoke)]">
              No invoices generated yet.
            </div>
          )}
        </div>

        {/* DESKTOP TABLE VIEW (≥768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--color-ivory)]">
            <thead className="bg-[var(--color-void-raised)] text-[var(--color-smoke)] uppercase tracking-wider text-[10px] font-bold border-b border-[rgba(201,161,90,0.15)]">
              <tr>
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Subtotal</th>
                <th className="px-4 py-3">GST Amount</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">PDF Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-[var(--color-gold-bright)]">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${typeClasses(inv.type)}`}>
                        {inv.type === "tax" ? "Tax Invoice" : "Proforma Invoice"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-smoke)]">
                      {formatCurrency(inv.subtotal)}
                    </td>
                    <td className="px-4 py-3 font-mono text-emerald-400">
                      +{formatCurrency(inv.gst_amount)} ({inv.gst_rate}%)
                    </td>
                    <td className="px-4 py-3 font-bold text-[var(--color-ivory)]">
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-smoke)]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--color-gold)]/10 text-[var(--color-gold-bright)] hover:bg-[var(--color-gold)]/20 transition-colors text-[11px] font-medium"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View / Print PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[var(--color-smoke)]">
                    No invoices generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Invoice Printable Modal ───────────────────────────────── */}
      <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </div>
  );
}
