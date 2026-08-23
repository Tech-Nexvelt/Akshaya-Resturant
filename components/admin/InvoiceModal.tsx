"use client";

import React from "react";
import { Invoice } from "@/types/platform";
import { formatCurrency } from "@/lib/utils";
import { brand } from "@/lib/data";
import { X, Printer, Download, CheckCircle2 } from "lucide-react";

interface InvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 md:p-8 text-gray-900 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
            <CheckCircle2 className="w-4 h-4" />
            <span>Official Invoice Document</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-blue-700 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Body (Printable Area) */}
        <div className="mt-6 space-y-6 text-left" id="invoice-print-area">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold text-gray-900">{brand.name}</h2>
              <p className="text-xs text-gray-500 mt-0.5">A Legacy of Flavor Since {brand.since}</p>
              <p className="text-xs text-gray-600 mt-2">
                Main Road, Siddipet, Telangana 502103
                <br />
                GSTIN: 36ABCDE1234F1Z5 &middot; FSSAI: 13621014000123
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded-md bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                {invoice.type === "tax" ? "Tax Invoice" : "Proforma Invoice"}
              </span>
              <p className="mt-2 font-mono text-sm font-bold text-gray-900">{invoice.invoice_number}</p>
              <p className="text-xs text-gray-500">Date: {new Date(invoice.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Details Table */}
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-[10px] font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                <tr>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">Restaurant Services / Order #{invoice.order_id || invoice.id}</p>
                    <p className="text-gray-500 text-[11px]">Food preparation, packaging & dining services</p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium">{formatCurrency(invoice.subtotal)}</td>
                </tr>
                {invoice.gst_amount > 0 && (
                  <tr>
                    <td className="px-4 py-2.5 text-gray-600">GST ({invoice.gst_rate}%)</td>
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-600">
                      +{formatCurrency(invoice.gst_amount)}
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                <tr>
                  <td className="px-4 py-3 text-gray-900">Total Payable Amount</td>
                  <td className="px-4 py-3 text-right font-mono text-base text-blue-700">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="border-t border-gray-200 pt-4 text-center text-[11px] text-gray-500">
            Thank you for dining with Akshaya Family Restaurant. Computer generated invoice.
          </div>
        </div>
      </div>
    </div>
  );
}
