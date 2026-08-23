"use client";

import { useState } from "react";
import { RefreshCw, AlertTriangle, CheckCircle2, Clock, ShieldAlert, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface WebhookEventRow {
  id: string;
  provider: string;
  event_type: string;
  external_event_id: string | null;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "success" | "failed" | "dead_letter";
  retry_count: number;
  max_retries: number;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

interface WebhooksTableProps {
  initialEvents: WebhookEventRow[];
}

export function WebhooksTable({ initialEvents }: WebhooksTableProps) {
  const [events, setEvents] = useState<WebhookEventRow[]>(initialEvents);
  const [filter, setFilter] = useState<"all" | "dead_letter">("dead_letter");
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [selectedPayload, setSelectedPayload] = useState<WebhookEventRow | null>(null);

  const filteredEvents = events.filter((evt) =>
    filter === "all" ? true : evt.status === "dead_letter"
  );

  async function handleReplay(eventId: string) {
    setReplayingId(eventId);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("replay_webhook_event", {
        p_event_id: eventId,
      });

      if (error) {
        alert(`Failed to replay webhook: ${error.message}`);
      } else {
        setEvents((prev) =>
          prev.map((evt) =>
            evt.id === eventId
              ? { ...evt, status: "pending", retry_count: 0, last_error: null }
              : evt
          )
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Error replaying webhook: ${msg}`);
    } finally {
      setReplayingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Webhook Observability & DLQ Control
          </h2>
          <p className="text-sm text-slate-400">
            Monitor real-time event delivery pipeline, inspect payload failures, and trigger manual replays.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setFilter("dead_letter")}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              filter === "dead_letter"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            DLQ ({events.filter((e) => e.status === "dead_letter").length})
          </button>
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              filter === "all"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Events ({events.length})
          </button>
        </div>
      </div>

      {/* Responsive Container: Cards on Mobile, Table on Desktop */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md overflow-hidden">
        
        {/* MOBILE CARD VIEW (< 768px) */}
        <div className="block md:hidden divide-y divide-slate-800/80">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-sans">
              No webhook events found for current filter.
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div key={evt.id} className="p-4 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-200 uppercase font-sans">
                    {evt.provider}
                  </span>
                  <div>
                    {evt.status === "success" && (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[10px] font-sans">
                        <CheckCircle2 className="w-3 h-3" /> Success
                      </span>
                    )}
                    {evt.status === "dead_letter" && (
                      <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[10px] font-sans">
                        <AlertTriangle className="w-3 h-3" /> Dead Letter
                      </span>
                    )}
                    {evt.status === "failed" && (
                      <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px] font-sans">
                        <Clock className="w-3 h-3" /> Retrying
                      </span>
                    )}
                    {evt.status === "pending" && (
                      <span className="inline-flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 text-[10px] font-sans">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Pending
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-white font-bold text-sm font-sans">{evt.event_type}</p>
                  <p className="text-[11px] text-slate-400 truncate">Ext ID: {evt.external_event_id || "N/A"}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{new Date(evt.created_at).toLocaleString("en-IN")}</p>
                </div>

                {evt.last_error && (
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-[11px] text-rose-300 font-sans">
                    <span className="font-bold block text-rose-400 text-[10px] uppercase">Last Error</span>
                    {evt.last_error}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400 text-[11px] font-sans">
                    Retries: {evt.retry_count}/{evt.max_retries}
                  </span>

                  <div className="flex items-center gap-2 font-sans">
                    <button
                      onClick={() => setSelectedPayload(evt)}
                      className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    >
                      Payload
                    </button>
                    {(evt.status === "dead_letter" || evt.status === "failed") && (
                      <button
                        onClick={() => handleReplay(evt.id)}
                        disabled={replayingId === evt.id}
                        className="px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <RotateCcw className={`w-3 h-3 ${replayingId === evt.id ? "animate-spin" : ""}`} />
                        Replay
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">External Event ID</th>
                <th className="px-4 py-3">Retries</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Error</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500 font-sans">
                    No webhook events found for current filter.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                      {new Date(evt.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-200 uppercase">
                        {evt.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">{evt.event_type}</td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[140px]" title={evt.external_event_id || ""}>
                      {evt.external_event_id || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {evt.retry_count} / {evt.max_retries}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      {evt.status === "success" && (
                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                          <CheckCircle2 className="w-3 h-3" /> Success
                        </span>
                      )}
                      {evt.status === "dead_letter" && (
                        <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> Dead Letter
                        </span>
                      )}
                      {evt.status === "failed" && (
                        <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                          <Clock className="w-3 h-3" /> Retrying
                        </span>
                      )}
                      {evt.status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 text-[11px]">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-rose-400/90 truncate max-w-[200px]" title={evt.last_error || ""}>
                      {evt.last_error || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-sans space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedPayload(evt)}
                        className="px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                      >
                        Payload
                      </button>
                      {(evt.status === "dead_letter" || evt.status === "failed") && (
                        <button
                          onClick={() => handleReplay(evt.id)}
                          disabled={replayingId === evt.id}
                          className="px-2.5 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          <RotateCcw className={`w-3 h-3 ${replayingId === evt.id ? "animate-spin" : ""}`} />
                          Replay
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                Webhook Event Payload ({selectedPayload.event_type})
              </h3>
              <button
                onClick={() => setSelectedPayload(null)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 bg-slate-800 rounded"
              >
                Close
              </button>
            </div>
            <div className="space-y-2 text-xs font-mono text-slate-300">
              <p><span className="text-slate-500">ID:</span> {selectedPayload.id}</p>
              <p><span className="text-slate-500">External Event ID:</span> {selectedPayload.external_event_id || "N/A"}</p>
              <p><span className="text-slate-500">Status:</span> {selectedPayload.status}</p>
              {selectedPayload.last_error && (
                <p className="text-rose-400"><span className="text-rose-500">Last Error:</span> {selectedPayload.last_error}</p>
              )}
              <div className="mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80 overflow-x-auto">
                <pre>{JSON.stringify(selectedPayload.payload, null, 2)}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
