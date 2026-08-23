"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/lib/admin-store";
import { ALL_ROLES, UserRole } from "@/types/platform";
import { ShieldCheck, ArrowRight, Store, Lock } from "lucide-react";

/**
 * The console's front door, and one of the few `/admin` paths `middleware.ts`
 * deliberately leaves open — gating it would be a redirect loop.
 *
 * The role picker below is a preview aid that writes straight into the
 * client-side Zustand role, so anyone reaching it in production could
 * self-promote to Owner in one click. `AdminSidebar`'s equivalent switcher is
 * gated on NODE_ENV; this one was not, which made that gate pointless.
 *
 * Evaluated at build time, so the picker is not merely hidden — it is not in the
 * production bundle at all. Note it now only moves the CLIENT role: every admin
 * page runs `requireAdminSession()` on the server first, so picking "Owner" here
 * no longer opens anything on a deployment with real Supabase Auth.
 */
const ROLE_PREVIEW_ENABLED = process.env.NODE_ENV !== "production";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setRole } = useAdminStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>("owner");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ROLE_PREVIEW_ENABLED) return;
    setRole(selectedRole);
    router.push("/admin/dashboard");
  };

  if (!ROLE_PREVIEW_ENABLED) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md rounded-2xl border-[var(--color-gold)]/30 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[var(--color-void-raised)] text-[var(--color-gold)]">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold text-[var(--color-ivory)]">
            Staff Sign-In Unavailable
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-[var(--color-smoke)]">
            Authenticated staff sign-in is not enabled on this deployment yet. Please
            contact the owner for access to the Akshaya admin console.
          </p>
          <a
            href="/restaurant"
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-[var(--color-smoke)] transition-colors hover:text-[var(--color-gold)]"
          >
            <Store className="h-3.5 w-3.5" /> Return to Customer Restaurant Website
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full border-[var(--color-gold)]/30 shadow-2xl animate-fade-up">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-gold-dim)] to-[var(--color-gold)] flex items-center justify-center font-display font-bold text-[var(--color-void)] text-2xl mx-auto mb-3 shadow-lg">
            A
          </div>
          <h2 className="text-2xl font-display font-bold text-[var(--color-ivory)]">
            Akshaya Admin Portal
          </h2>
          <p className="text-xs text-[var(--color-smoke)] mt-1">
            Real staff sign-in isn&rsquo;t live yet — pick a role to preview the console
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="bg-[var(--color-void-raised)] p-3 rounded-xl border border-white/5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)] mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Preview Console As:</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                    selectedRole === role
                      ? "bg-[var(--color-gold)] text-[var(--color-void)] font-bold shadow-sm"
                      : "glass-panel text-[var(--color-smoke)] hover:text-white"
                  }`}
                >
                  {role.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-[var(--color-gold-dim)] to-[var(--color-gold)] text-[var(--color-void)] font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-98"
          >
            <span>Preview as {selectedRole.toUpperCase()}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <a
            href="/home"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-smoke)] hover:text-[var(--color-gold)] transition-colors"
          >
            <Store className="w-3.5 h-3.5" /> Return to Customer Restaurant Website
          </a>
        </div>
      </div>
    </div>
  );
}
