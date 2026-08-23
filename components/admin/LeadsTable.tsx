"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Download, Search, Phone, Eye } from "lucide-react";

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

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="glass-panel p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search lead name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Source Filters & Export */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="flex-1 md:flex-none bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-500 min-h-[42px]"
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
            className="flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all whitespace-nowrap shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Responsive Container: Cards on Mobile, Table on Desktop */}
      <div className="glass-panel rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80">
        
        {/* MOBILE CARD VIEW (< 768px) */}
        <div className="block md:hidden divide-y divide-slate-800/80">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <div key={lead.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      lead.source === "banquet_enquiry"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : lead.source === "catering_enquiry"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : lead.source === "restaurant_order"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {lead.source.replace("_", " ")}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="font-bold text-white text-sm">{lead.guest_name}</p>
                    <p className="text-slate-400 font-mono text-xs flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-400" />
                      <span>{lead.guest_phone}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedDetails(lead.details)}
                    className="flex items-center gap-1 text-xs text-amber-400 underline font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Payload</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No leads found.
            </div>
          )}
        </div>

        {/* DESKTOP TABLE VIEW (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Guest Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Captured Date</th>
                <th className="px-4 py-3">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          lead.source === "banquet_enquiry"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : lead.source === "catering_enquiry"
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : lead.source === "restaurant_order"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {lead.source.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {lead.guest_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">
                      {lead.guest_phone}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(lead.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedDetails(lead.details)}
                        className="flex items-center gap-1 text-[11px] text-amber-400 underline hover:text-white"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Payload</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No leads found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl max-w-md w-full border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h4 className="font-display font-semibold text-white text-base">
                Lead Metadata Payload
              </h4>
              <button
                onClick={() => setSelectedDetails(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto mb-4 border border-slate-800">
              {JSON.stringify(selectedDetails, null, 2)}
            </pre>
            <button
              onClick={() => setSelectedDetails(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
