"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { useAdminStore } from "@/lib/admin-store";
import { UserRole } from "@/types/platform";
import { ShieldAlert, Lock, ArrowLeft } from "lucide-react";

interface RoleGateProps {
  allowedRoles: readonly UserRole[];
  children: ReactNode;
}

export function RoleGate({ allowedRoles, children }: RoleGateProps) {
  const { currentRole } = useAdminStore();

  if (!currentRole) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center mb-4 text-[var(--color-gold)]">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-display text-[var(--color-ivory)] mb-2">
          Authentication Required
        </h2>
        <p className="text-[var(--color-smoke)] max-w-md mb-6">
          You must be logged in as staff, admin, or owner to access the Akshaya Admin Console.
        </p>
        <Link
          href="/admin/login"
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-gold-dim)] to-[var(--color-gold)] text-[var(--color-void)] font-semibold hover:brightness-110 transition-all"
        >
          Go to Staff Login
        </Link>
      </div>
    );
  }

  if (!allowedRoles.includes(currentRole)) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 mb-3 uppercase tracking-wider">
          RBAC Access Denied
        </div>
        <h2 className="text-2xl font-display text-[var(--color-ivory)] mb-2">
          Restricted Access Route
        </h2>
        <p className="text-[var(--color-smoke)] max-w-lg mb-6 leading-relaxed">
          Your current role (<span className="text-[var(--color-gold-bright)] font-semibold capitalize">{currentRole}</span>) does not have permission to view this console page.
          Required role(s): <span className="text-[var(--color-ivory)] font-medium capitalize">{allowedRoles.join(", ")}</span>.
        </p>

        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg glass-panel text-[var(--color-ivory)] hover:border-[var(--color-gold)] transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Admin Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
