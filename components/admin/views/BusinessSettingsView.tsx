"use client";

import React, { useState } from "react";
import { Save, Store, CreditCard, Printer, ShieldCheck } from "lucide-react";
import { useBusinessAdminStore } from "@/store/useBusinessAdminStore";

export function BusinessSettingsView() {
  const { businessInfo, updateBusinessInfo } = useBusinessAdminStore();

  const [name, setName] = useState(businessInfo.name);
  const [phone, setPhone] = useState(businessInfo.phone);
  const [email, setEmail] = useState(businessInfo.email);
  const [address, setAddress] = useState(businessInfo.address);
  const [gstin, setGstin] = useState(businessInfo.gstin);
  const [serviceTaxPct, setServiceTaxPct] = useState(businessInfo.serviceTaxPct);
  const [printerIp, setPrinterIp] = useState(businessInfo.printerIp);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessInfo({
      name,
      phone,
      email,
      address,
      gstin,
      serviceTaxPct,
      printerIp,
    });
  };

  return (
    <div className="space-y-6 max-w-[1280px] mx-auto p-2 sm:p-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-[#111827]">Restaurant POS Settings</h2>
          <p className="text-xs text-[#6B7280]">Manage store profile, GST & tax settings, payment gateways, and KOT thermal printer IP</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Settings Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Store Info */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
              <Store className="h-4 w-4 text-[#2563EB]" /> Store Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="font-bold text-[#111827]">Restaurant Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Store Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tax & Hardware Config */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-[#111827] flex items-center gap-2">
              <Printer className="h-4 w-4 text-[#2563EB]" /> Tax & Thermal Printer Hardware Config
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
              <div>
                <label className="font-bold text-[#111827]">GSTIN Registration</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Service Tax / GST (%)</label>
                <input
                  type="number"
                  value={serviceTaxPct}
                  onChange={(e) => setServiceTaxPct(Number(e.target.value))}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#111827]">Thermal KOT Printer IP</label>
                <input
                  type="text"
                  value={printerIp}
                  onChange={(e) => setPrinterIp(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 text-xs text-[#111827] focus:border-[#2563EB] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#2563EB] px-4 text-xs font-bold text-white shadow-2xs hover:bg-[#1D4ED8] transition-colors cursor-pointer"
              >
                <Save className="h-4 w-4" /> Save Settings
              </button>
            </div>
          </div>
        </div>

        {/* Right Info Card */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-xs space-y-4">
          <div className="text-center p-4 border border-[#E5E7EB] bg-[#F9FAFB] rounded-xl space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2563EB] text-white font-extrabold text-xl shadow-xs">
              A
            </div>
            <h4 className="font-extrabold text-sm text-[#111827]">{name}</h4>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
              Active POS Branch
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
