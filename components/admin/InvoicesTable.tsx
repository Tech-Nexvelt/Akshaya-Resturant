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
      ? "bg-blue-50 text-[#2563EB] border border-blue-200"
      : "bg-purple-50 text-purple-700 border border-purple-200";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* GST Management Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#111827] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#2563EB]" />
            <span>GST Tax & Billing Configuration</span>
          </h3>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Sequential FY-prefixed billing system • Current GST Rate: {gstRate}%
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#F9FAFB] p-2 rounded-xl border border-[#E5E7EB] w-full sm:w-auto">
          <span className="text-xs font-bold text-[#6B7280] whitespace-nowrap">
            GST Collection:
          </span>
          {isOwner ? (
            <button
              onClick={() => toggleGst(!gstEnabled)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                gstEnabled
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
            >
              {gstEnabled ? (
                <>
                  <ToggleRight className="h-4 w-4 text-emerald-600" />
                  <span>GST ACTIVE ({gstRate}%)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4 text-gray-400" />
                  <span>GST DISABLED</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-1 text-xs text-[#6B7280] bg-white px-2.5 py-1.5 rounded-lg border border-[#E5E7EB]">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              <span>Owner Control Only</span>
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#111827]">Financial Invoices Ledger</h3>
          <span className="text-xs text-[#6B7280]">Showing {invoices.length} invoices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
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
            <tbody className="divide-y divide-[#E5E7EB]">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-[#2563EB]">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeClasses(inv.type)}`}>
                        {inv.type === "tax" ? "Tax Invoice" : "Proforma Invoice"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-[#6B7280]">
                      {formatCurrency(inv.subtotal)}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-emerald-600 font-bold">
                      +{formatCurrency(inv.gst_amount)} ({inv.gst_rate}%)
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#111827]">
                      {formatCurrency(inv.total_amount)}
                    </td>
                    <td className="px-4 py-3.5 text-[#6B7280]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB] hover:bg-blue-100 transition-colors text-xs font-bold cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>View PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-[#6B7280]">
                    No invoices generated yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Printable Modal */}
      <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
    </div>
  );
}
