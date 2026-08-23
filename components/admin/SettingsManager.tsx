"use client";

import React from "react";
import { useAdminStore } from "@/lib/admin-store";
import { UserRole } from "@/types/platform";
import { ShieldCheck, UserCog, ToggleLeft, ToggleRight, CreditCard, Building } from "lucide-react";

export function SettingsManager() {
  const { staffProfiles, updateUserRole, gstEnabled, gstRate, toggleGst, currentRole } = useAdminStore();
  const isOwner = currentRole === "owner";

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#2563EB]" />
            <span>System Administration & RBAC Controls</span>
          </h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Owner-level configuration for staff roles, billing rules, and platform credentials
          </p>
        </div>
        <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-[#2563EB] uppercase tracking-wider">
          Owner Control Level
        </span>
      </div>

      {/* Staff Accounts & Role Management */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
          <div className="flex items-center gap-2">
            <UserCog className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#111827]">Staff Accounts & Role Assignment</h3>
          </div>
          <span className="text-xs text-[#6B7280]">Total Accounts: {staffProfiles.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#111827]">
            <thead className="bg-[#F9FAFB] text-[10px] uppercase font-bold tracking-wider text-[#6B7280] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email / Phone</th>
                <th className="px-4 py-3">Current Role</th>
                <th className="px-4 py-3 text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {staffProfiles.map((user) => (
                <tr key={user.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-4 py-3.5 font-bold text-[#111827]">
                    {user.full_name}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[#6B7280]">
                    {user.email} • {user.phone}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        user.role === "owner"
                          ? "bg-blue-50 text-[#2563EB] border border-blue-200"
                          : user.role === "admin"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {isOwner ? (
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                        className="h-8 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-2 text-xs font-bold text-[#111827] focus:border-[#2563EB] focus:outline-none"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    ) : (
                      <span className="text-[10px] text-[#6B7280] italic">Read Only</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Config Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GST Billing Settings */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
            <Building className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#111827]">GST Tax Settings</h3>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#6B7280]">Global GST Engine:</span>
            <button
              onClick={() => toggleGst(!gstEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                gstEnabled
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-gray-100 text-gray-500 border border-gray-200"
              }`}
            >
              {gstEnabled ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4" />}
              <span>{gstEnabled ? `ENABLED (${gstRate}%)` : "DISABLED"}</span>
            </button>
          </div>
          <p className="text-xs text-[#6B7280]">
            When enabled, tax amount (5%) is automatically appended to orders and rendered on tax invoices.
          </p>
        </div>

        {/* Razorpay Gateway Status */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#E5E7EB] pb-2">
            <CreditCard className="h-4 w-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#111827]">Razorpay Gateway Credentials</h3>
          </div>
          <div className="text-xs space-y-2 font-mono text-[#6B7280]">
            <div className="flex justify-between">
              <span className="font-sans">Key ID Prefix:</span>
              <span className="text-[#2563EB] font-bold">rzp_test_987654321</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans">Webhook Secret:</span>
              <span className="text-emerald-600 font-bold">Configured</span>
            </div>
            <div className="flex justify-between">
              <span className="font-sans">Environment:</span>
              <span className="text-[#2563EB] font-sans uppercase font-bold">
                Test Mode (Preview)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
