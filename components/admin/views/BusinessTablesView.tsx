"use client";

import React, { useState } from "react";
import { Grid, Users, ChevronDown, CheckCircle2, AlertTriangle, CreditCard, X } from "lucide-react";
import { useBusinessAdminStore, TableStatus, BusinessTable } from "@/store/useBusinessAdminStore";

export function BusinessTablesView() {
  const { tables, updateTableStatus, orders } = useBusinessAdminStore();
  const [filter, setFilter] = useState<TableStatus | "All">("All");
  const [selectedTable, setSelectedTable] = useState<BusinessTable | null>(null);

  const filteredTables = tables.filter((t) => (filter === "All" ? true : t.status === filter));

  const availableCount = tables.filter((t) => t.status === "Available").length;
  const occupiedCount = tables.filter((t) => t.status === "Occupied").length;
  const billingCount = tables.filter((t) => t.status === "Billing").length;

  const getStatusBadge = (st: TableStatus) => {
    switch (st) {
      case "Available":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Occupied":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Billing":
        return "bg-purple-50 text-purple-700 border-purple-200";
    }
  };

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto p-2 sm:p-4">
      {/* Header Bar & Summary Stats */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">POS Floor Plan Tables Grid</h2>
          <p className="text-xs text-[#6B7280]">Live table occupancy, active orders, and billing status</p>
        </div>

        {/* Status Pill Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter("All")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filter === "All" ? "bg-[#2563EB] text-white shadow-2xs" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({tables.length})
          </button>
          <button
            onClick={() => setFilter("Available")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filter === "Available" ? "bg-emerald-600 text-white shadow-2xs" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Available ({availableCount})
          </button>
          <button
            onClick={() => setFilter("Occupied")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filter === "Occupied" ? "bg-amber-600 text-white shadow-2xs" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
            }`}
          >
            Occupied ({occupiedCount})
          </button>
          <button
            onClick={() => setFilter("Billing")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              filter === "Billing" ? "bg-purple-600 text-white shadow-2xs" : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            Billing ({billingCount})
          </button>
        </div>
      </div>

      {/* Tables Grid (24 Tables) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {filteredTables.map((t) => (
          <div
            key={t.id}
            onClick={() => setSelectedTable(t)}
            className={`flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all cursor-pointer hover:shadow-md hover:scale-[1.02] ${
              t.status === "Occupied"
                ? "border-amber-200 bg-amber-50/40"
                : t.status === "Billing"
                ? "border-purple-200 bg-purple-50/40"
                : "border-[#E5E7EB] bg-white"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-[#111827]">{t.number}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold border uppercase tracking-wider ${getStatusBadge(
                    t.status
                  )}`}
                >
                  {t.status}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1 text-[11px] text-[#6B7280]">
                <Users className="h-3 w-3 text-gray-400" />
                <span>{t.capacity} Guests</span>
              </div>
            </div>

            {t.status !== "Available" && t.currentOrderId ? (
              <div className="mt-4 border-t border-gray-200/60 pt-2 text-[11px]">
                <div className="font-bold text-[#2563EB]">{t.currentOrderId}</div>
                <div className="font-bold text-[#111827]">₹ {t.currentAmount?.toLocaleString()}</div>
              </div>
            ) : (
              <div className="mt-4 border-t border-gray-100 pt-2 text-[10px] text-emerald-600 font-semibold">
                Ready for guests
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Table Details Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#111827]">{selectedTable.number}</h3>
                <span className="text-xs text-gray-500">{selectedTable.capacity} Guests Capacity</span>
              </div>
              <button onClick={() => setSelectedTable(null)} className="text-gray-400 hover:text-[#111827] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#111827]">Change Table Status</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["Available", "Occupied", "Billing"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        updateTableStatus(selectedTable.id, st);
                        setSelectedTable(null);
                      }}
                      className={`rounded-xl py-2 font-bold text-xs border transition-all cursor-pointer ${
                        selectedTable.status === st
                          ? "bg-[#2563EB] text-white border-[#2563EB]"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {selectedTable.currentOrderId && (
                <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3 space-y-1">
                  <div className="font-bold text-[#2563EB]">{selectedTable.currentOrderId}</div>
                  <div className="text-[#6B7280]">Running Total: <strong className="text-[#111827]">₹ {selectedTable.currentAmount?.toLocaleString()}</strong></div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E5E7EB]">
              <button
                onClick={() => setSelectedTable(null)}
                className="h-9 rounded-xl bg-gray-100 px-4 text-xs font-bold text-gray-700 hover:bg-gray-200"
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
