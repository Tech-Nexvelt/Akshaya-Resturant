"use client";

import React, { useState } from "react";
import { Search, RefreshCcw, CheckCircle2, XCircle, Terminal, Code } from "lucide-react";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";

export function WebhooksView() {
  const { webhooks, replayWebhook } = useSuperAdminStore();
  const [search, setSearch] = useState("");
  const [selectedPayload, setSelectedPayload] = useState<string>(webhooks[0]?.payload || "{}");

  const filteredWebhooks = webhooks.filter((w) =>
    w.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
            <Terminal className="h-5 w-5 text-[#2563EB]" />
            <span>Webhooks Debug Console</span>
          </h2>
          <p className="text-xs text-[#6B7280]">Monitor external payment gateway webhooks and trigger manual replays</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Debug Console Table */}
        <div className="lg:col-span-2 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter event type..."
                className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none font-sans"
              />
            </div>
            <span className="text-xs text-[#6B7280]">Showing {filteredWebhooks.length} of {webhooks.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-[#111827]">
              <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold text-[#6B7280] border-b border-[#E5E7EB] font-sans">
                <tr>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Retry Count</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {filteredWebhooks.map((w) => (
                  <tr
                    key={w.id}
                    onClick={() => setSelectedPayload(w.payload)}
                    className="hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5 font-bold text-[#2563EB]">{w.type}</td>
                    <td className="px-4 py-3.5 font-sans">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          w.status === "DELIVERED"
                            ? "bg-emerald-50 text-[#10B981] border border-emerald-200"
                            : "bg-red-50 text-[#EF4444] border border-red-200"
                        }`}
                      >
                        {w.status === "DELIVERED" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {w.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#111827]">{w.retries} / 5</td>
                    <td className="px-4 py-3.5 text-[#6B7280]">{w.time}</td>
                    <td className="px-4 py-3.5 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          replayWebhook(w.id);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] bg-white px-2.5 py-1 text-[11px] font-bold text-[#2563EB] shadow-2xs hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                      >
                        <RefreshCcw className="h-3 w-3" /> Replay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payload Inspector Panel */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-white space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 font-sans">
            <span className="flex items-center gap-1.5 font-bold">
              <Code className="h-4 w-4 text-[#2563EB]" /> Payload Inspector
            </span>
            <span>JSON</span>
          </div>
          <pre className="text-emerald-400 overflow-x-auto p-3 bg-slate-950 rounded-xl border border-slate-800/80 leading-relaxed">
            {JSON.stringify(JSON.parse(selectedPayload || "{}"), null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
