"use client";

import React, { useState } from "react";
import { Plus, Search, FileText, X } from "lucide-react";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";

export function EnquiriesView({ onNavigateToInvoice }: { onNavigateToInvoice?: () => void }) {
  const { enquiries, addEnquiry, generatePIFromEnquiry } = useSuperAdminStore();

  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventType, setEventType] = useState("Wedding");
  const [guests, setGuests] = useState(200);

  const filteredEnquiries = enquiries.filter(
    (e) =>
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.customer.toLowerCase().includes(search.toLowerCase()) ||
      e.eventType.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) return;

    addEnquiry({
      customer: customer.trim(),
      phone: phone || "+91 98765 43210",
      email: email || "customer@example.com",
      eventType,
      date: new Date(Date.now() + 86400000 * 14).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      guests: Number(guests) || 100,
      status: "New",
    });

    setCustomer("");
    setPhone("");
    setEmail("");
    setIsAddModalOpen(false);
  };

  const handleGeneratePI = (enquiryId: string) => {
    generatePIFromEnquiry(enquiryId);
    if (onNavigateToInvoice) onNavigateToInvoice();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Enquiries</h2>
          <p className="text-xs text-[#6B7280]">Manage all customer banquet & catering booking enquiries</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Enquiry
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
              placeholder="Search enquiry..."
              className="h-8 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] pl-8 pr-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
            />
          </div>
          <span className="text-xs text-[#6B7280]">Showing {filteredEnquiries.length} of {enquiries.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Enquiry ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Guests</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredEnquiries.map((e) => (
                <tr key={e.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#2563EB]">{e.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-[#111827]">{e.customer}</td>
                  <td className="px-4 py-3.5 text-[#6B7280]">{e.eventType}</td>
                  <td className="px-4 py-3.5 text-[#6B7280]">{e.date}</td>
                  <td className="px-4 py-3.5 font-bold text-[#111827]">{e.guests}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        e.status === "New"
                          ? "bg-blue-50 text-[#2563EB]"
                          : e.status === "Quoted"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-[#10B981]"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => handleGeneratePI(e.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5" /> Generate PI
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Enquiry Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-base font-bold text-[#111827]">New Booking Enquiry</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-[#111827] p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#111827]">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="e.g. Anish Malhotra"
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                >
                  <option value="Wedding">Wedding</option>
                  <option value="Engagement">Engagement</option>
                  <option value="Birthday Party">Birthday Party</option>
                  <option value="Corporate Event">Corporate Event</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#111827]">Expected Guests</label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
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
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
