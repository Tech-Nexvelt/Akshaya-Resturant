"use client";

import React, { useState } from "react";
import { Plus, Search, Eye, Trash2, Building2, CheckCircle2, XCircle, X } from "lucide-react";
import { useSuperAdminStore, BusinessItem } from "@/store/useSuperAdminStore";

export function BusinessesView() {
  const { businesses, addBusiness, deleteBusiness, updateBusiness } = useSuperAdminStore();

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessItem | null>(null);

  // Form states
  const [newName, setNewName] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [newEmail, setNewEmail] = useState("");

  const filteredBusinesses = businesses.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.owner.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newOwner.trim()) return;

    addBusiness({
      name: newName.trim(),
      owner: newOwner.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, "")}@akshaya.com`,
      status: "Active",
      revenue: 0,
      createdDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    });

    setNewName("");
    setNewOwner("");
    setNewEmail("");
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Businesses</h2>
          <p className="text-xs text-[#6B7280]">Manage all registered businesses and branch configurations</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Business
        </button>
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
              placeholder="Search business..."
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#6B7280]">Showing {filteredBusinesses.length} of {businesses.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Business Name</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Revenue (This Month)</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredBusinesses.map((b) => (
                <tr key={b.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#2563EB] flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#6B7280]" />
                    <span>{b.name}</span>
                  </td>
                  <td className="px-4 py-3.5 text-[#111827] font-medium">{b.owner}</td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => updateBusiness(b.id, { status: b.status === "Active" ? "Inactive" : "Active" })}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold cursor-pointer ${
                        b.status === "Active"
                          ? "bg-emerald-50 text-[#10B981] border border-emerald-200"
                          : "bg-red-50 text-[#EF4444] border border-red-200"
                      }`}
                    >
                      {b.status === "Active" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {b.status}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-[#111827]">₹ {b.revenue.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-[#6B7280]">{b.createdDate}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2 text-[#6B7280]">
                      <button
                        onClick={() => setSelectedBusiness(b)}
                        className="p-1 hover:text-[#2563EB] transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteBusiness(b.id)}
                        className="p-1 hover:text-[#EF4444] transition-colors cursor-pointer"
                        title="Delete Business"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Business Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">Add New Business Tenant</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-[#111827] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#111827]">Business Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Imperial Hospitality"
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Owner Name</label>
                <input
                  type="text"
                  required
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Contact Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. owner@imperial.com"
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 rounded-xl border border-[#E5E7EB] bg-white px-4 text-xs font-bold text-[#111827] hover:bg-[#F9FAFB]"
                >
                  Cancel
                </button>
                <button type="submit" className="h-9 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8]">
                  Create Business
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Business Details Drawer */}
      {selectedBusiness && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 shadow-2xl space-y-6 overflow-y-auto h-full border-l border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-4">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">{selectedBusiness.name}</h3>
                <span className="text-xs text-[#2563EB] font-bold">ID: {selectedBusiness.id}</span>
              </div>
              <button onClick={() => setSelectedBusiness(null)} className="text-gray-400 hover:text-black p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 space-y-2">
                <div className="flex justify-between text-[#6B7280]">
                  <span>Owner:</span> <strong className="text-[#111827]">{selectedBusiness.owner}</strong>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Email:</span> <strong className="text-[#111827]">{selectedBusiness.email}</strong>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-600">{selectedBusiness.status}</span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Monthly Revenue:</span>
                  <span className="font-bold text-[#2563EB]">₹ {selectedBusiness.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#6B7280]">
                  <span>Created:</span> <span>{selectedBusiness.createdDate}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E5E7EB]">
              <button
                onClick={() => {
                  deleteBusiness(selectedBusiness.id);
                  setSelectedBusiness(null);
                }}
                className="w-full h-9 rounded-xl bg-red-50 border border-red-200 text-red-600 font-bold text-xs hover:bg-red-100"
              >
                Delete Business Tenant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
