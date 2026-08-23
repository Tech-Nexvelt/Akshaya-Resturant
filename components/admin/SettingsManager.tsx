"use client";

import React from "react";
import { useAdminStore } from "@/lib/admin-store";
import { UserRole } from "@/types/platform";
import { Settings, ShieldCheck, UserCog, ToggleLeft, ToggleRight, Key, CreditCard, Building } from "lucide-react";

export function SettingsManager() {
  const { staffProfiles, updateUserRole, gstEnabled, gstRate, toggleGst, currentRole } = useAdminStore();
  const isOwner = currentRole === "owner";

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="glass-panel p-5 rounded-xl border-[var(--color-gold)]/30 flex items-center justify-between">
        <div>
          <h3 className="text-base font-display font-semibold text-[var(--color-ivory)] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--color-gold)]" />
            System Administration & RBAC Controls
          </h3>
          <p className="text-xs text-[var(--color-smoke)] mt-0.5">
            Owner-level configuration for staff roles, billing rules, and platform credentials.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--color-gold)]/20 text-[var(--color-gold-bright)] border border-[var(--color-gold)]/40 uppercase tracking-wider">
          Owner Control Level
        </span>
      </div>

      {/* Staff Accounts & Role Management */}
      <div className="glass-panel p-5 rounded-xl border-[rgba(201,161,90,0.15)] space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-[var(--color-gold)]" />
            <h4 className="text-sm font-semibold text-[var(--color-ivory)]">
              Staff Accounts & Role Assignment
            </h4>
          </div>
          <span className="text-xs text-[var(--color-smoke)]">
            Total Accounts: {staffProfiles.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[var(--color-ivory)]">
            <thead className="bg-[var(--color-void-raised)] text-[var(--color-smoke)] uppercase tracking-wider text-[10px] font-bold border-b border-[rgba(201,161,90,0.15)]">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Email / Phone</th>
                <th className="px-4 py-2.5">Current Role</th>
                <th className="px-4 py-2.5 text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {staffProfiles.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-semibold text-[var(--color-ivory)]">
                    {user.full_name}
                  </td>
                  <td className="px-4 py-3 font-mono text-[var(--color-smoke)]">
                    {user.email} &bull; {user.phone}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        user.role === "owner"
                          ? "bg-[var(--color-gold)]/20 text-[var(--color-gold-bright)] border border-[var(--color-gold)]/40"
                          : user.role === "admin"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isOwner ? (
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                        className="bg-[var(--color-void-raised)] border border-[rgba(201,161,90,0.3)] text-xs text-[var(--color-ivory)] rounded px-2 py-1 font-medium focus:outline-none focus:border-[var(--color-gold)]"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    ) : (
                      <span className="text-[10px] text-[var(--color-smoke)] italic">Read Only</span>
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
        <div className="glass-panel p-5 rounded-xl border-[rgba(201,161,90,0.15)] space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <Building className="w-4 h-4 text-[var(--color-gold)]" />
            <h4 className="text-sm font-semibold text-[var(--color-ivory)]">
              GST Tax Settings
            </h4>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--color-smoke)]">Global GST Tax Engine:</span>
            <button
              onClick={() => toggleGst(!gstEnabled)}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 ${
                gstEnabled
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
              }`}
            >
              {gstEnabled ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
              <span>{gstEnabled ? "ENABLED (5%)" : "DISABLED"}</span>
            </button>
          </div>
          <p className="text-[11px] text-[var(--color-smoke)]">
            When enabled, tax amount (5%) is automatically appended to orders and rendered on tax invoices.
          </p>
        </div>

        {/* Razorpay Gateway Status */}
        <div className="glass-panel p-5 rounded-xl border-[rgba(201,161,90,0.15)] space-y-3">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <CreditCard className="w-4 h-4 text-[var(--color-gold)]" />
            <h4 className="text-sm font-semibold text-[var(--color-ivory)]">
              Razorpay Gateway Credentials
            </h4>
          </div>
          <div className="text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-[var(--color-smoke)] font-sans">Key ID Prefix:</span>
              <span className="text-amber-400">rzp_test_987654321</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-smoke)] font-sans">Webhook Secret:</span>
              <span className="text-emerald-400">Configured (.env.example)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-smoke)] font-sans">Environment:</span>
              <span className="text-[var(--color-gold-bright)] font-sans uppercase font-bold">
                Test Mode (Preview)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
