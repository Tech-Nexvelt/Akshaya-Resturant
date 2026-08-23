"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Menu,
  ChevronDown,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  AlertOctagon,
  CheckCheck,
  Store,
} from "lucide-react";
import { useBusinessAdminStore } from "@/store/useBusinessAdminStore";

export function BusinessAdminHeader() {
  const store = useBusinessAdminStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isCollapsed = store.isSidebarCollapsed;
  const unreadCount = store.notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md px-4 sm:px-6 shadow-2xs">
      {/* Sidebar Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => store.toggleSidebarCollapse()}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Toggle Sidebar Collapse"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <button
          onClick={() => store.setMobileSidebarOpen(true)}
          className="lg:hidden text-[#6B7280] hover:text-[#111827] p-1.5 rounded-lg hover:bg-gray-100"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="font-extrabold text-lg sm:text-xl text-[#111827] tracking-tight">
            {store.activeTabTitle}
          </h1>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={store.searchQuery}
            onChange={(e) => store.setSearchQuery(e.target.value)}
            placeholder="Search orders, dishes, customers..."
            className="h-9 w-full rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] pl-9 pr-3 text-xs text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 transition-all"
          />
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]" />
              </span>
            )}
          </button>

          {/* Interactive Notifications Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#E5E7EB] bg-white p-0 shadow-lg ring-1 ring-slate-900/5 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#111827]">Live POS Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => store.markAllNotificationsAsRead()}
                  className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" /> Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {store.notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 font-medium">
                    No new notifications
                  </div>
                ) : (
                  store.notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        store.markNotificationAsRead(n.id);
                        store.setActiveTab(n.targetTab);
                        setNotifOpen(false);
                      }}
                      className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-gray-50 ${
                        !n.read ? "bg-blue-50/60 border-l-4 border-[#2563EB]" : "bg-white"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                          n.type === "payment_failed"
                            ? "bg-rose-50 border-rose-200 text-rose-600"
                            : "bg-blue-50 border-blue-200 text-[#2563EB]"
                        }`}
                      >
                        {n.type === "payment_failed" ? (
                          <AlertOctagon className="h-4 w-4" />
                        ) : (
                          <ShoppingBag className="h-4 w-4" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#111827] truncate">{n.title}</p>
                          <span className="text-[10px] text-gray-400 font-medium shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium line-clamp-2 mt-0.5">
                          {n.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Store Open Status Badge */}
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/60">
          <Store className="h-3.5 w-3.5 text-emerald-600" /> Akshaya Store Open
        </span>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] font-bold text-xs text-white shadow-xs">
              RK
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-[#111827]">
              Ravi Kumar
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-xl ring-1 ring-slate-900/5 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Ravi Kumar</p>
                <p className="text-[11px] text-slate-500">Store Owner / Manager</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    store.setActiveTab("settings");
                    setProfileOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" /> Store Settings
                </button>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    store.showToast("Logging out...", "info");
                    const { performLogout } = await import("@/lib/auth/logout");
                    setTimeout(() => {
                      performLogout("/admin/login");
                    }, 350);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer active:scale-98 transition-all"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
