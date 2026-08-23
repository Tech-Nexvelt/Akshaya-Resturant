"use client";

import React, { useState } from "react";
import { Search, ShieldAlert, AlertTriangle, Info } from "lucide-react";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";

export function ActivityLogsView() {
  const { activityLogs } = useSuperAdminStore();
  const [search, setSearch] = useState("");

  const filteredLogs = activityLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.entity.toLowerCase().includes(search.toLowerCase()) ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Activity Logs</h2>
          <p className="text-xs text-[#6B7280]">Audit log of system events, security alerts, and operator actions</p>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activity..."
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#6B7280]">Showing {filteredLogs.length} of {activityLogs.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">Target Name</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#111827]">{l.action}</td>
                  <td className="px-4 py-3.5 text-[#6B7280]">{l.entity}</td>
                  <td className="px-4 py-3.5 font-medium text-[#2563EB]">{l.name}</td>
                  <td className="px-4 py-3.5 text-[#6B7280]">{l.user}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        l.severity === "Critical"
                          ? "bg-red-50 text-[#EF4444] border border-red-200"
                          : l.severity === "Warning"
                          ? "bg-amber-50 text-[#F59E0B] border border-amber-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {l.severity === "Critical" ? (
                        <ShieldAlert className="h-3 w-3" />
                      ) : l.severity === "Warning" ? (
                        <AlertTriangle className="h-3 w-3" />
                      ) : (
                        <Info className="h-3 w-3" />
                      )}
                      {l.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-[#6B7280]">{l.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
