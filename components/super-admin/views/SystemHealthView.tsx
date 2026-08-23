"use client";

import React from "react";
import { Server, Database, CreditCard, CheckCircle2, Clock, Activity, AlertTriangle } from "lucide-react";

export function SystemHealthView() {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">System Health</h2>
          <p className="text-xs text-[#6B7280]">Monitor infrastructure status, database connectivity, and uptime metrics</p>
        </div>
      </div>

      {/* Top 3 Component Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#10B981]">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-[#6B7280]">API Status</div>
              <div className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981]" /> Operational
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#10B981]">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-[#6B7280]">Database</div>
              <div className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981]" /> Operational
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#10B981]">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-[#6B7280]">Payment Gateway</div>
              <div className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#10B981]" /> Operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-[#6B7280]">Uptime (Last 30 Days)</div>
          <div className="mt-2 text-2xl font-bold text-[#10B981]">99.98%</div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-[#6B7280]">Average Response Time</div>
          <div className="mt-2 text-2xl font-bold text-[#2563EB]">120 ms</div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
          <div className="text-xs text-[#6B7280]">Error Rate</div>
          <div className="mt-2 text-2xl font-bold text-[#111827]">0.02%</div>
        </div>
      </div>

      {/* Recent Incidents Panel */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-[#111827]">Recent Incidents</h3>
          <button className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer">
            View All Incidents →
          </button>
        </div>

        <div className="space-y-3">
          {[
            { title: "Payment gateway timeout", date: "24 May 2025 18:10", status: "Resolved" },
            { title: "Webhook delivery delay", date: "22 May 2025 14:30", status: "Resolved" },
            { title: "Database slow query", date: "20 May 2025 11:15", status: "Resolved" },
          ].map((inc, i) => (
            <div key={i} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                <span className="font-semibold text-[#111827]">{inc.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[#6B7280]">{inc.date}</span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#10B981]">
                  {inc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
