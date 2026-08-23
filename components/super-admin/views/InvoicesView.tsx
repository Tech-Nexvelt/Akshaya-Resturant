"use client";

import React, { useState } from "react";
import {
  FileText,
  Send,
  Download,
  Plus,
  Trash2,
  Lock,
  Printer,
  Share2,
} from "lucide-react";
import { useSuperAdminStore, InvoiceItem, InvoiceLineItem } from "@/store/useSuperAdminStore";

export function InvoicesView() {
  const { invoices, saveInvoice, sendInvoice, convertPIToTI } = useSuperAdminStore();

  const [activeTab, setActiveTab] = useState<"PI" | "TI">("PI");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(invoices[0]?.id || "PI-2025-0045");

  // Editable Form State for selected PI
  const currentInvoice = invoices.find((i) => i.id === selectedInvoiceId) || invoices[0];
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    currentInvoice?.items || [
      { id: "i1", name: "Wedding Package - Premium", qty: 1, price: 150000, total: 150000 },
      { id: "i2", name: "Additional Food (Per Plate)", qty: 250, price: 550, total: 137500 },
    ]
  );

  const subtotal = lineItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const cgst = subtotal * 0.09;
  const sgst = subtotal * 0.09;
  const grandTotal = subtotal + cgst + sgst;

  const handleUpdateItem = (id: string, field: keyof InvoiceLineItem, val: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          if (field === "qty" || field === "price") {
            updated.total = Number(updated.qty) * Number(updated.price);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      { id: `item_${Date.now()}`, name: "New Line Item", qty: 1, price: 5000, total: 5000 },
    ]);
  };

  const handleSaveDraft = () => {
    if (!currentInvoice) return;
    const updated: InvoiceItem = {
      ...currentInvoice,
      items: lineItems,
      subtotal,
      cgst,
      sgst,
      amount: grandTotal,
    };
    saveInvoice(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Invoices (PI / TI)</h2>
          <p className="text-xs text-[#6B7280]">Generate and manage Proforma Invoices (PI) and Tax Invoices (TI)</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-1">
          <button
            onClick={() => setActiveTab("PI")}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "PI" ? "bg-[#2563EB] text-white shadow-2xs" : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            Proforma Invoice (PI)
          </button>
          <button
            onClick={() => setActiveTab("TI")}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "TI" ? "bg-[#2563EB] text-white shadow-2xs" : "text-[#6B7280] hover:text-[#111827]"
            }`}
          >
            Tax Invoice (TI)
          </button>
        </div>
      </div>

      {activeTab === "PI" ? (
        /* Proforma Invoice Layout */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Invoice List */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-[#111827]">Proforma Invoices</h3>
              <span className="text-xs font-bold text-[#2563EB]">{invoices.filter((i) => i.type === "PI").length} Active</span>
            </div>

            <div className="space-y-2">
              {invoices
                .filter((i) => i.type === "PI")
                .map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setSelectedInvoiceId(inv.id);
                      setLineItems(inv.items);
                    }}
                    className={`flex items-center justify-between rounded-xl border p-3 transition-all cursor-pointer ${
                      selectedInvoiceId === inv.id
                        ? "border-[#2563EB] bg-[#EFF6FF]"
                        : "border-[#E5E7EB] bg-[#F9FAFB] hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-[#2563EB]">{inv.id}</div>
                      <div className="text-xs font-semibold text-[#111827]">{inv.customer}</div>
                      <div className="text-[10px] text-[#6B7280]">{inv.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-xs text-[#111827]">₹ {inv.amount.toLocaleString()}</div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          inv.status === "Sent" ? "bg-blue-100 text-[#2563EB]" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right 2 Columns: Editable PI Form & Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
                <div>
                  <h3 className="font-bold text-base text-[#111827]">Create Proforma Invoice</h3>
                  <span className="text-xs text-[#2563EB] font-mono">{currentInvoice?.id}</span>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                  {currentInvoice?.status || "Draft"}
                </span>
              </div>

              {/* Customer Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Customer Details</h4>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#111827]">Full Name</label>
                    <input
                      type="text"
                      defaultValue={currentInvoice?.customer}
                      className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#111827]">Phone Number</label>
                    <input
                      type="text"
                      defaultValue={currentInvoice?.phone}
                      className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-[#111827]">Event Type</label>
                    <input
                      type="text"
                      defaultValue={currentInvoice?.eventType}
                      className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827]"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280]">Line Items Table</h4>
                  <button onClick={handleAddItem} className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3 w-3" /> Add Item
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#111827]">
                    <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5E7EB]">
                      <tr>
                        <th className="px-3 py-2">Item Name</th>
                        <th className="px-3 py-2 w-20">Qty</th>
                        <th className="px-3 py-2 w-28">Price (₹)</th>
                        <th className="px-3 py-2 text-right">Total (₹)</th>
                        <th className="px-3 py-2 text-right w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => handleUpdateItem(item.id, "name", e.target.value)}
                              className="w-full rounded-lg border border-[#E5E7EB] p-1.5 text-xs text-[#111827]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.qty}
                              onChange={(e) => handleUpdateItem(item.id, "qty", Number(e.target.value))}
                              className="w-full rounded-lg border border-[#E5E7EB] p-1.5 text-xs text-[#111827]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(item.id, "price", Number(e.target.value))}
                              className="w-full rounded-lg border border-[#E5E7EB] p-1.5 text-xs text-[#111827]"
                            />
                          </td>
                          <td className="p-2 text-right font-bold text-[#2563EB]">
                            ₹ {(item.qty * item.price).toLocaleString()}
                          </td>
                          <td className="p-2 text-right">
                            <button
                              onClick={() => setLineItems(lineItems.filter((i) => i.id !== item.id))}
                              className="text-gray-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-2 text-xs">
                <div className="flex justify-between font-medium text-[#6B7280]">
                  <span>Subtotal</span>
                  <span>₹ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-[#6B7280]">
                  <span>CGST (9%)</span>
                  <span>+ ₹ {cgst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium text-[#6B7280]">
                  <span>SGST (9%)</span>
                  <span>+ ₹ {sgst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#111827] pt-2 border-t border-[#E5E7EB]">
                  <span>Grand Total</span>
                  <span className="text-[#2563EB] font-extrabold text-base">₹ {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-[#E5E7EB]">
                <button
                  onClick={handleSaveDraft}
                  className="h-9 rounded-xl border border-[#E5E7EB] bg-white px-4 text-xs font-bold text-[#111827] shadow-2xs hover:bg-[#F9FAFB] cursor-pointer"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => sendInvoice(selectedInvoiceId, "whatsapp")}
                  className="h-9 rounded-xl bg-[#10B981] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#059669] cursor-pointer"
                >
                  Send via WhatsApp
                </button>
                <button
                  onClick={() => sendInvoice(selectedInvoiceId, "email")}
                  className="h-9 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8] cursor-pointer"
                >
                  Send via Email
                </button>
                <button
                  onClick={() => convertPIToTI(selectedInvoiceId)}
                  className="h-9 rounded-xl border border-[#2563EB] bg-blue-50 px-4 text-xs font-bold text-[#2563EB] hover:bg-blue-100 cursor-pointer"
                >
                  Convert to TI (Lock Tax Invoice)
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tax Invoice (TI) View with Document Preview */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Final Tax Invoice List */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <span className="text-xs font-bold text-[#2563EB]">Tax Invoices (Locked)</span>
                <h3 className="font-bold text-base text-[#111827]">GST Ledger Finalized</h3>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 flex items-center gap-1">
                <Lock className="h-3 w-3" /> Final Locked
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
              <table className="w-full text-left text-xs text-[#111827]">
                <thead className="bg-[#F9FAFB] text-[10px] font-bold text-[#6B7280]">
                  <tr>
                    <th className="px-3 py-2">TI Number</th>
                    <th className="px-3 py-2">Customer</th>
                    <th className="px-3 py-2">Total Amount</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {invoices
                    .filter((i) => i.type === "TI")
                    .map((ti) => (
                      <tr key={ti.id} className="hover:bg-[#F9FAFB]">
                        <td className="px-3 py-2.5 font-mono font-bold text-[#2563EB]">{ti.id}</td>
                        <td className="px-3 py-2.5 font-medium">{ti.customer}</td>
                        <td className="px-3 py-2.5 font-bold">₹ {ti.amount.toLocaleString()}</td>
                        <td className="px-3 py-2.5">
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-200">
                            {ti.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: PDF Document Preview Panel */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#6B7280]">Invoice Document Preview</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => window.print()} className="p-1.5 text-[#6B7280] hover:text-[#111827]" title="Print">
                  <Printer className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-[#6B7280] hover:text-[#111827]" title="Share">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-6 shadow-2xs text-xs space-y-6">
              <div className="flex justify-between items-start border-b border-[#E5E7EB] pb-4">
                <div>
                  <div className="font-extrabold text-base text-[#2563EB]">AKSHAYA PLATFORM</div>
                  <div className="text-[10px] text-[#6B7280]">Multi-Tenant SaaS Control System</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-[#111827]">TAX INVOICE</div>
                  <div className="text-[10px] text-[#2563EB] font-bold">TI-2025-00045</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <div className="text-[10px] font-bold uppercase text-[#9CA3AF]">Bill To:</div>
                  <div className="font-bold text-[#111827]">Ravi Kumar</div>
                  <div className="text-[#6B7280]">+91 98765 43210</div>
                </div>
                <div className="text-right">
                  <div className="text-[#6B7280]">Invoice Date: 24 May 2025</div>
                  <div className="text-[#6B7280]">Event Type: Wedding</div>
                </div>
              </div>

              <div className="flex flex-col items-end text-[11px] space-y-1 border-t border-[#E5E7EB] pt-3">
                <div className="flex justify-between w-48 font-bold text-xs text-[#111827]">
                  <span>Grand Total</span>
                  <span className="text-[#2563EB]">₹ 400,757.50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
