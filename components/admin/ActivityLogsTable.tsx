"use client";

import React, { useState } from "react";
import { useAdminStore } from "@/lib/admin-store";
import { Activity, Search, Shield, Eye, X } from "lucide-react";

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
    <div className="space-y-4">
      {/* ── Search Header ─────────────────────────────────────────── */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-smoke)]" />
          <input
            type="text"
            placeholder="Search action, actor, or entity..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-[var(--color-void-raised)] border border-[rgba(201,161,90,0.2)] text-sm text-[var(--color-ivory)] focus:outline-none focus:border-[var(--color-gold)] placeholder:text-[var(--color-smoke)]"
          />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-smoke)]">
          <Shield className="w-4 h-4 text-[var(--color-gold)]" />
          <span className="whitespace-nowrap">Immutable Audit Log</span>
        </div>
      </div>

      {/* ── Responsive Container ─────────────────────────────────── */}
      <div className="glass-panel rounded-xl overflow-hidden border-[rgba(201,161,90,0.15)]">

        {/* MOBILE CARD VIEW (<768px) */}
        <div className="block md:hidden divide-y divide-slate-800/80">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono px-2 py-0.5 rounded text-[11px] bg-white/5 text-[var(--color-gold-bright)] border border-white/10 break-all">
                    {log.action}
                  </span>
                  {log.metadata && (
                    <button
                      onClick={() => setSelectedMeta(log.metadata)}
                      className="flex items-center gap-1 text-xs text-[var(--color-gold-bright)] underline font-medium flex-shrink-0 min-h-[44px] px-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="text-xs">
                  <span className="text-[var(--color-smoke)] block text-[10px]">Actor</span>
                  <span className="text-[var(--color-ivory)] font-medium">{getActorName(log.actor_id)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[var(--color-smoke)] block text-[10px]">Target</span>
                    <span className="capitalize text-[var(--color-smoke)]">{log.entity_type}</span>
                    {log.entity_id && (
                      <span className="ml-1 text-[10px] text-[var(--color-smoke)]/60 font-mono">
                        ({log.entity_id.slice(0, 8)}…)
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[var(--color-smoke)] text-right">
                    {new Date(log.created_at).toLocaleString("en-IN", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[var(--color-smoke)]">
              No activity records found.
            </div>
          )}
        </div>

        {/* DESKTOP TABLE VIEW (≥768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--color-ivory)]">
            <thead className="bg-[var(--color-void-raised)] text-[var(--color-smoke)] uppercase tracking-wider text-[10px] font-bold border-b border-[rgba(201,161,90,0.15)]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action Tag</th>
                <th className="px-4 py-3">Actor</th>
                <th className="px-4 py-3">Target Entity</th>
                <th className="px-4 py-3 text-right">Audit Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-[var(--color-smoke)] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono px-2 py-0.5 rounded text-[11px] bg-white/5 text-[var(--color-gold-bright)] border border-white/10">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-ivory)]">
                        {getActorName(log.actor_id)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-[var(--color-smoke)] font-medium">
                        {log.entity_type}
                      </span>
                      {log.entity_id && (
                        <span className="ml-1 text-[10px] text-[var(--color-smoke)]/60 font-mono">
                          ({log.entity_id})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {log.metadata ? (
                        <button
                          onClick={() => setSelectedMeta(log.metadata)}
                          className="inline-flex items-center gap-1 text-[11px] text-[var(--color-gold-bright)] underline hover:text-white"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Payload</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[var(--color-smoke)] italic">None</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-smoke)]">
                    No activity records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Metadata Modal — bottom sheet on mobile ───────────────── */}
      {selectedMeta && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="glass-panel rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg border-[var(--color-gold)]/40 shadow-2xl flex flex-col max-h-[85dvh] sm:max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-white/10 p-4 flex-shrink-0">
              <h4 className="font-display font-semibold text-[var(--color-ivory)] text-base">
                Audit Event Metadata
              </h4>
              <button
                onClick={() => setSelectedMeta(null)}
                aria-label="Close"
                className="text-[var(--color-smoke)] hover:text-white p-1.5 rounded min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 flex-1">
              <pre className="bg-[var(--color-void)] p-4 rounded-lg font-mono text-xs text-emerald-400 overflow-x-auto border border-white/10">
                {JSON.stringify(selectedMeta, null, 2)}
              </pre>
            </div>
            <div className="p-4 border-t border-white/10 flex-shrink-0">
              <button
                onClick={() => setSelectedMeta(null)}
                className="w-full py-3 rounded-xl glass-panel text-[var(--color-ivory)] hover:border-[var(--color-gold)] text-xs font-semibold min-h-[48px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
