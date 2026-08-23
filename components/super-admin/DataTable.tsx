"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  onSearchChange?: (term: string) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  searchPlaceholder = "Search...",
  pageSize = 5,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <span className="text-xs text-[#6B7280]">
          Showing {filteredData.length > 0 ? startIndex + 1 : 0} to{" "}
          {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} entries
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#111827]">
          <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`px-4 py-3 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center text-[#6B7280]">
                  No matching records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => (
                <tr key={row.id} className="hover:bg-[#F9FAFB] transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className={`px-4 py-3.5 ${col.className || ""}`}>
                      {typeof col.accessorKey === "function"
                        ? col.accessorKey(row)
                        : (row[col.accessorKey] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4 mt-4 text-xs">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] disabled:opacity-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Previous
          </button>

          <span className="text-[#6B7280]">
            Page <strong className="text-[#111827]">{currentPage}</strong> of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-[#E5E7EB] px-2.5 py-1 text-xs font-semibold text-[#111827] hover:bg-[#F9FAFB] disabled:opacity-50"
          >
            Next <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
