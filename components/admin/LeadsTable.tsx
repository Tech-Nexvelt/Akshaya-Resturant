"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Download, Search, Phone, Eye, X } from "lucide-react";

export function LeadsTable() {
  const { leads, exportLeadsToCsv } = useAdminStore();
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedDetails, setSelectedDetails] = useState<Record<string, unknown> | null>(null);

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.guest_name.toLowerCase().includes(search.toLowerCase()) || l.guest_phone.includes(search);
    const matchesSource = sourceFilter === "all" || l.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const handleExport = () => {
    const csvContent = exportLeadsToCsv();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Akshaya_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case "banquet_enquiry":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      case "catering_enquiry":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case "restaurant_order":
        return "bg-blue-50 text-[#2563EB] border border-blue-200";
      default:
        return "bg-amber-50 text-amber-700 border border-amber-200";
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Leads & Enquiry Capture Dashboard</h2>
          <p className="text-xs text-[#6B7280]">Captured intent from banquet forms, catering enquiries, restaurant orders, and contact clicks</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Source Select */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-9 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs font-bold text-[#111827] focus:border-[#2563EB] focus:outline-none"
          >
            <option value="all">All Sources ({leads.length})</option>
            <option value="restaurant_order">Restaurant Order</option>
            <option value="banquet_enquiry">Banquet Enquiry</option>
            <option value="catering_enquiry">Catering Enquiry</option>
            <option value="contact_form">Contact Form</option>
            <option value="button_click">Button Click Intent</option>
          </select>

          <button
            onClick={handleExport}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search lead name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#6B7280]">Showing {filteredLeads.length} of {leads.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Guest Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Captured Date</th>
                <th className="px-4 py-3 text-right">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getSourceBadge(
                          lead.source
                        )}`}
                      >
                        {lead.source.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#111827]">
                      {lead.guest_name}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[#6B7280]">
                      {lead.guest_phone}
                    </td>
                    <td className="px-4 py-3.5 text-[#6B7280]">
                      {new Date(lead.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => setSelectedDetails(lead.details)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect Payload</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#6B7280]">
                    No leads found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata Payload Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">Lead Metadata Payload</h3>
              <button onClick={() => setSelectedDetails(null)} className="text-gray-400 hover:text-[#111827] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <pre className="rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              {JSON.stringify(selectedDetails, null, 2)}
            </pre>

            <div className="flex justify-end pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={() => setSelectedDetails(null)}
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
