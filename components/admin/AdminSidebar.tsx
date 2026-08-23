"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminStore } from "@/lib/admin-store";
import {
  UserRole,
  ADMIN_AND_ABOVE,
  ALL_ROLES,
  OWNER_AND_ABOVE,
  STAFF_AND_ABOVE,
} from "@/types/platform";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  CreditCard,
  FileText,
  Activity,
  UtensilsCrossed,
  Settings,
  Lock,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Store,
  X,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: readonly UserRole[];
}

const navItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    allowedRoles: STAFF_AND_ABOVE,
  },
  {
    name: "Live Orders",
    href: "/admin/orders",
    icon: ShoppingBag,
    allowedRoles: STAFF_AND_ABOVE,
  },
  {
    name: "Invoices",
    href: "/admin/invoices",
    icon: FileText,
    allowedRoles: STAFF_AND_ABOVE,
  },
  {
    name: "Leads & Enquiries",
    href: "/admin/leads",
    icon: Users,
    allowedRoles: ADMIN_AND_ABOVE,
  },
  {
    name: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    allowedRoles: ADMIN_AND_ABOVE,
  },
  {
    name: "Menu Management",
    href: "/admin/menu",
    icon: UtensilsCrossed,
    allowedRoles: ADMIN_AND_ABOVE,
  },
  {
    name: "Activity Audit Log",
    href: "/admin/activity",
    icon: Activity,
    allowedRoles: ADMIN_AND_ABOVE,
  },
  {
    name: "Settings & RBAC",
    href: "/admin/settings",
    icon: Settings,
    allowedRoles: OWNER_AND_ABOVE,
  },
];

interface AdminSidebarProps {
  /** Whether the sidebar is open (mobile overlay mode) */
  open: boolean;
  /** Close handler — called when X button or backdrop is clicked */
  onClose: () => void;
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { currentRole, currentUser, setRole } = useAdminStore();

  const isRoleAllowed = (allowedRoles: readonly UserRole[]) => {
    return currentRole ? allowedRoles.includes(currentRole) : false;
  };

  return (
    /*
     * Layout strategy:
     *  - Mobile (<lg): fixed, z-50, full height, slides in/out via transform.
     *    The backdrop is rendered in AdminLayout (so it's outside this element).
     *  - Desktop (lg+): static inside the flex row, always visible, w-64.
     *
     * Using CSS translate instead of conditional rendering so the sidebar DOM
     * is always mounted → no layout shift on first open.
     */
    <aside
      className={[
        /* --- Shared --- */
        "flex flex-col bg-[var(--color-void-soft)] border-r border-[rgba(201,161,90,0.15)] select-none",
        /* --- Mobile: fixed overlay, slides in from left --- */
        "fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full",
        /* --- Desktop: static in flex row, always visible --- */
        "lg:relative lg:translate-x-0 lg:w-64 lg:z-auto lg:flex-shrink-0",
      ].join(" ")}
      aria-label="Admin Navigation"
    >
      {/* ── Brand Header ──────────────────────────────────────────────── */}
      <div className="p-5 border-b border-[rgba(201,161,90,0.15)] flex items-center justify-between flex-shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-gold-dim)] to-[var(--color-gold)] flex items-center justify-center font-display font-bold text-[var(--color-void)] text-lg shadow-md group-hover:scale-105 transition-transform">
            A
          </div>
          <div>
            <div className="font-display font-bold text-[var(--color-ivory)] text-sm tracking-wide leading-tight">
              AKSHAYA
            </div>
            <div className="text-[10px] text-[var(--color-gold)] uppercase tracking-widest font-semibold">
              Admin Console
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/home"
            title="Back to Public Site"
            className="text-[var(--color-smoke)] hover:text-[var(--color-gold)] transition-colors p-1.5 rounded-md hover:bg-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={onClose}
          >
            <Store className="w-4 h-4" />
          </Link>
          {/* Mobile close button — hidden on desktop */}
          <button
            onClick={onClose}
            aria-label="Close navigation menu"
            className="lg:hidden text-[var(--color-smoke)] hover:text-[var(--color-ivory)] p-1.5 rounded-md hover:bg-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Role Badge ───────────────────────────────────────────────── */}
      <div className="px-4 py-3 bg-[var(--color-void-raised)]/60 border-b border-[rgba(201,161,90,0.1)] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--color-gold)]" />
          <span className="text-xs text-[var(--color-smoke)]">Active Role:</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--color-gold)]/15 text-[var(--color-gold-bright)] border border-[var(--color-gold)]/30">
          {currentRole || "Logged Out"}
        </span>
      </div>

      {/* ── Navigation Links ─────────────────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="Admin sections">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-smoke)]/60 px-3 py-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const active = pathname === item.href;
          const allowed = isRoleAllowed(item.allowedRoles);
          const Icon = item.icon;

          if (!allowed) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-[var(--color-smoke)]/40 bg-white/[0.01] cursor-not-allowed group relative min-h-[44px]"
                title={`Requires ${item.allowedRoles.join(" or ")} role`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-[var(--color-smoke)]/40" />
                  <span>{item.name}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-[var(--color-smoke)]/40" />
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                active
                  ? "bg-gradient-to-r from-[var(--color-gold)]/20 to-transparent text-[var(--color-gold-bright)] border-l-2 border-[var(--color-gold)]"
                  : "text-[var(--color-smoke)] hover:text-[var(--color-ivory)] hover:bg-white/[0.04]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-[var(--color-gold-bright)]" : "text-[var(--color-smoke)]"
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 text-[var(--color-gold)]" />}
            </Link>
          );
        })}
      </nav>

      {/* ── User Profile & Role Switcher ──────────────────────────────── */}
      <div className="p-4 border-t border-[rgba(201,161,90,0.15)] bg-[var(--color-void-raised)]/40 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="truncate min-w-0">
            <div className="text-xs font-semibold text-[var(--color-ivory)] truncate">
              {currentUser?.full_name || "Admin Staff"}
            </div>
            <div className="text-[10px] text-[var(--color-smoke)] truncate">
              {currentUser?.email || "staff@akshaya.in"}
            </div>
          </div>
          <button
            onClick={() => setRole(null)}
            title="Sign out"
            aria-label="Sign out"
            className="text-[var(--color-smoke)] hover:text-red-400 p-1.5 rounded hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Role Tester — dev-only. This is a UI-building aid, not access control:
            it must never ship where a real visitor could self-promote to Owner. Remove
            entirely once Supabase Auth replaces the mock role store (see PROJECT_MEMORY.md). */}
        {process.env.NODE_ENV !== "production" && (
          <div className="pt-2 border-t border-[rgba(201,161,90,0.1)]">
            <div className="text-[9px] uppercase tracking-wider text-[var(--color-gold-dim)] font-semibold mb-1.5">
              Dev Only — Role Preview Switcher
            </div>
            <div className="grid grid-cols-2 gap-1">
              {ALL_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setRole(role)}
                  className={`py-1.5 rounded text-[10px] font-semibold capitalize transition-colors min-h-[36px] ${
                    currentRole === role
                      ? "bg-[var(--color-gold)] text-[var(--color-void)]"
                      : "bg-white/5 text-[var(--color-smoke)] hover:bg-white/10 hover:text-[var(--color-ivory)]"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
