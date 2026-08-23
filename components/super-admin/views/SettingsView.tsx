"use client";

import React, { useState } from "react";
import { CreditCard, Save, ShieldCheck } from "lucide-react";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";

export function SettingsView() {
  const { platformSettings, updateSettings } = useSuperAdminStore();

  const [platformName, setPlatformName] = useState(platformSettings.platformName);
  const [supportEmail, setSupportEmail] = useState(platformSettings.supportEmail);
  const [contactNumber, setContactNumber] = useState(platformSettings.contactNumber);
  const [dateFormat, setDateFormat] = useState(platformSettings.dateFormat);
  const [razorpayKey, setRazorpayKey] = useState(platformSettings.razorpayKey);
  const [webhookSecret, setWebhookSecret] = useState(platformSettings.webhookSecret);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      platformName,
      supportEmail,
      contactNumber,
      dateFormat,
      razorpayKey,
      webhookSecret,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Settings</h2>
          <p className="text-xs text-[#6B7280]">Configure platform-wide parameters, payment integration, and RBAC permissions</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: General & Payment Settings */}
        <div className="space-y-6 lg:col-span-2">
          {/* General Settings */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#111827]">General Settings</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="font-semibold text-[#111827]">Platform Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-[#111827]">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-[#111827]">Contact Number</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-[#111827]">Date Format</label>
                <input
                  type="text"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Save Platform Settings</span>
              </button>
            </div>
          </div>

          {/* Payment & Webhook Configuration */}
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#2563EB]" />
              <span>Payment Gateway Integration (Razorpay)</span>
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="font-semibold text-[#111827]">Razorpay Key ID</label>
                <input
                  type="text"
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-semibold text-[#111827]">Webhook Signing Secret</label>
                <input
                  type="password"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Role Permissions Card */}
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#2563EB]" />
            <span>Role Permissions Overview</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
              <span className="font-bold text-[#111827]">Super Admin</span>
              <span className="rounded bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">Full Access</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
              <span className="font-bold text-[#111827]">Owner</span>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">Limited Access</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
              <span className="font-bold text-[#111827]">Admin</span>
              <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Operational Access</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
              <span className="font-bold text-[#111827]">Staff</span>
              <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-700">Basic Access</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
