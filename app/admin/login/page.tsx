"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useAdminStore } from "@/lib/admin-store";
import { ALL_ROLES, UserRole } from "@/types/platform";
import { ShieldCheck, ArrowRight, Store, Lock, AlertCircle, Loader2 } from "lucide-react";

const ROLE_PREVIEW_ENABLED = process.env.NODE_ENV !== "production";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect");
  const authError = searchParams?.get("error");

  const { setRole } = useAdminStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>("owner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    authError === "auth-unavailable"
      ? "Authentication system is currently offline."
      : authError === "account-inactive"
      ? "Your account has been deactivated or suspended."
      : null
  );

  // Real Supabase Auth login
  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !anonKey) {
        throw new Error("Supabase credentials not configured.");
      }

      const supabase = createBrowserClient(url, anonKey);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message || "Invalid credentials.");
      }

      if (data.user) {
        // Query profile for role routing
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, status")
          .eq("id", data.user.id)
          .single();

        if (profile?.role) {
          setRole(profile.role as UserRole);

          if (redirectPath) {
            router.push(redirectPath);
          } else if (profile.role === "super_admin") {
            router.push("/super-admin");
          } else if (profile.role === "owner") {
            router.push("/owner");
          } else {
            router.push("/admin/dashboard");
          }
          return;
        }
      }

      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  // Preview login for dev mode
  const handlePreviewLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ROLE_PREVIEW_ENABLED) return;
    setRole(selectedRole);
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full border-[var(--color-gold)]/30 shadow-2xl animate-fade-up">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-gold-dim)] to-[var(--color-gold)] flex items-center justify-center font-display font-bold text-[var(--color-void)] text-2xl mx-auto mb-3 shadow-lg">
            A
          </div>
          <h2 className="text-2xl font-display font-bold text-[var(--color-ivory)]">
            Akshaya Staff Portal
          </h2>
          <p className="text-xs text-[var(--color-smoke)] mt-1">
            Sign in with your staff credentials to access the console
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Real Sign In Form */}
        <form onSubmit={handleRealLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-ivory)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@akshaya.com"
              className="w-full h-10 rounded-xl border border-white/10 bg-[var(--color-void-raised)] px-3 text-xs text-[var(--color-ivory)] placeholder:text-gray-500 focus:border-[var(--color-gold)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-ivory)] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-10 rounded-xl border border-white/10 bg-[var(--color-void-raised)] px-3 text-xs text-[var(--color-ivory)] placeholder:text-gray-500 focus:border-[var(--color-gold)] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-gold-dim)] to-[var(--color-gold)] text-[var(--color-void)] font-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Dev Mode Role Preview Switcher */}
        {ROLE_PREVIEW_ENABLED && (
          <form onSubmit={handlePreviewLogin} className="mt-6 pt-6 border-t border-white/10 space-y-3">
            <div className="bg-[var(--color-void-raised)] p-3 rounded-xl border border-white/5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)] mb-2 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dev Preview Switcher:</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {ALL_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold capitalize transition-all ${
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
              className="w-full py-2 rounded-lg border border-white/10 text-xs font-semibold text-[var(--color-smoke)] hover:text-white hover:bg-white/5 transition-all"
            >
              Preview as {selectedRole.toUpperCase()}
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <a
            href="/restaurant"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--color-smoke)] hover:text-[var(--color-gold)] transition-colors"
          >
            <Store className="w-3.5 h-3.5" /> Return to Customer Restaurant Website
          </a>
        </div>
      </div>
    </div>
  );
}
