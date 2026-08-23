"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Menu,
  ShieldCheck,
  ChevronDown,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
  MessageSquare,
  AlertTriangle,
  UserPlus,
  CheckCheck,
} from "lucide-react";
import { useSuperAdminStore, NotificationType } from "@/store/useSuperAdminStore";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard Overview",
  "/admin/orders": "Live Orders Queue",
  "/admin/invoices": "Invoices & Billing (PI / TI)",
  "/admin/leads": "Leads & Enquiries",
  "/admin/payments": "Payments Reconciliation",
  "/admin/menu": "Menu Management",
  "/admin/activity": "Activity Audit Logs",
  "/admin/settings": "Settings & Staff RBAC",
};

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps = {}) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Admin Console";
  const superStore = useSuperAdminStore();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isCollapsed = superStore.isSidebarCollapsed;
  const unreadCount = superStore.notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
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

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case "payment_failed":
        return <AlertOctagon className="h-4 w-4 text-[#EF4444]" />;
      case "new_enquiry":
        return <MessageSquare className="h-4 w-4 text-[#2563EB]" />;
      case "webhook_failure":
        return <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />;
      case "new_user":
        return <UserPlus className="h-4 w-4 text-[#10B981]" />;
    }
  };

  const getNotifIconBg = (type: NotificationType) => {
    switch (type) {
      case "payment_failed":
        return "bg-rose-50 border-rose-200";
      case "new_enquiry":
        return "bg-blue-50 border-blue-200";
      case "webhook_failure":
        return "bg-amber-50 border-amber-200";
      case "new_user":
        return "bg-emerald-50 border-emerald-200";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md px-4 sm:px-6 shadow-2xs">
      {/* Sidebar Toggle & Title */}
      <div className="flex items-center gap-3">
        {/* Desktop Sidebar Collapse Toggle Button */}
        <button
          onClick={() => superStore.toggleSidebarCollapse()}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
          aria-label="Toggle Sidebar Collapse"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Mobile Hamburger Toggle */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden text-[#6B7280] hover:text-[#111827] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Open mobile navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <h1 className="font-extrabold text-lg sm:text-xl text-[#111827] tracking-tight">{title}</h1>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={superStore.searchQuery}
            onChange={(e) => superStore.setSearchQuery(e.target.value)}
            placeholder="Search anything..."
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]"></span>
              </span>
            )}
          </button>

          {/* Interactive Notifications Panel */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[#E5E7EB] bg-white p-0 shadow-lg ring-1 ring-slate-900/5 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-[#111827]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#2563EB]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => superStore.markAllNotificationsAsRead()}
                  className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" /> Mark all as read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {superStore.notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 font-medium">
                    No new notifications
                  </div>
                ) : (
                  superStore.notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        superStore.markNotificationAsRead(item.id);
                        setNotifOpen(false);
                      }}
                      className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-gray-50 ${
                        !item.read ? "bg-blue-50/60 border-l-4 border-[#2563EB]" : "bg-white"
                      }`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${getNotifIconBg(item.type)}`}>
                        {getNotifIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-[#111827] truncate">{item.title}</p>
                          <span className="text-[10px] text-gray-400 font-medium shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-gray-600 font-medium line-clamp-2 mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin Privilege Badge */}
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-bold text-[#2563EB] border border-blue-200/50">
          <ShieldCheck className="h-3.5 w-3.5" /> Admin Console
        </span>

        {/* Profile Avatar Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-xl p-1 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB] font-bold text-xs text-white shadow-xs">
              AD
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-[#111827]">
              Admin User
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-[#6B7280] hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[#E5E7EB] bg-white p-2 shadow-xl ring-1 ring-slate-900/5 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Admin Account</p>
                <p className="text-[11px] text-slate-500 font-mono">admin@akshaya.com</p>
              </div>
              <div className="py-1">
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium cursor-pointer">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Account Profile
                </button>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={async () => {
                    setProfileOpen(false);
                    const { performLogout } = await import("@/lib/auth/logout");
                    performLogout("/admin/login");
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
