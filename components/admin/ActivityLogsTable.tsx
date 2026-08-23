"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Search, Shield, Eye, X } from "lucide-react";

export function ActivityLogsTable() {
  const { activityLogs, staffProfiles } = useAdminStore();
  const [search, setSearch] = useState("");
  const [selectedMeta, setSelectedMeta] = useState<Record<string, unknown> | null>(null);

  const getActorName = (actorId: string | null) => {
    if (!actorId) return "System / Guest Action";
    const profile = staffProfiles.find((p) => p.id === actorId);
    return profile ? `${profile.full_name} (${profile.role})` : actorId;
  };

  const filteredLogs = activityLogs.filter((log) => {
    const actor = getActorName(log.actor_id);
    return (
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(search.toLowerCase()) ||
      actor.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Search Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Activity Audit Log</h2>
          <p className="text-xs text-[#6B7280]">Audit trail of system events, operator actions, and automated workflows</p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
          <Shield className="h-4 w-4 text-[#2563EB]" />
          <span>Immutable Audit Log</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search action, actor, or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#6B7280]">Showing {filteredLogs.length} of {activityLogs.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Tag</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3 text-right">Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-4 py-3.5 text-[#6B7280] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#2563EB] border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-[#111827]">
                      {getActorName(log.actor_id)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="capitalize text-[#6B7280] font-semibold">
                        {log.entity_type}
                      </span>
                      {log.entity_id && (
                        <span className="ml-1 text-[10px] text-[#9CA3AF] font-mono">
                          ({log.entity_id})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {log.metadata ? (
                        <button
                          onClick={() => setSelectedMeta(log.metadata)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>View Payload</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#6B7280] italic">None</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#6B7280]">
                    No activity records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Metadata Payload Modal */}
      {selectedMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">Audit Event Metadata</h3>
              <button onClick={() => setSelectedMeta(null)} className="text-gray-400 hover:text-[#111827] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <pre className="rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              {JSON.stringify(selectedMeta, null, 2)}
            </pre>

            <div className="flex justify-end pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={() => setSelectedMeta(null)}
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
