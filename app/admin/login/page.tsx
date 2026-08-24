"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { useAdminStore } from "@/lib/admin-store";
import { UserRole } from "@/types/platform";
import { Mail, Lock, Loader2 } from "lucide-react";
import { LoginLayout } from "@/components/auth/LoginLayout";
import { LoginCard } from "@/components/auth/LoginCard";
import { InputField } from "@/components/auth/InputField";
import { AuthButton } from "@/components/auth/AuthButton";

// Regular expression for client-side email format validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get("redirect");
  const urlError = searchParams?.get("error");

  const { setRole } = useAdminStore();

  // Refs for auto-focusing on fields with errors
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Flow State
  const [checkingSession, setCheckingSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(
    urlError === "auth-unavailable"
      ? "Authentication system is currently offline."
      : urlError === "account-inactive"
      ? "Your account has been deactivated or suspended."
      : urlError === "unauthorized"
      ? "You do not have permission to access that resource."
      : null
  );
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // 1. AUTO-CHECK ACTIVE SESSION ON PAGE LOAD
  useEffect(() => {
    let isMounted = true;

    async function checkExistingSession() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!url || !anonKey) {
          if (isMounted) setCheckingSession(false);
          return;
        }

        const supabase = createBrowserClient(url, anonKey);
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          // Fetch user profile role to determine redirect
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, status")
            .eq("id", session.user.id)
            .single();

          if (profile && profile.status === "active") {
            const role = profile.role as UserRole;
            setRole(role);

            // Instant redirect based on user role
            let targetRoute = "/admin/dashboard";
            if (redirectPath && redirectPath.startsWith("/")) {
              targetRoute = redirectPath;
            } else if (role === "super_admin") {
              targetRoute = "/super-admin";
            } else if (role === "owner") {
              targetRoute = "/owner";
            }

            router.replace(targetRoute);
            return;
          }
        }
      } catch (err) {
        console.error("Session verification check error:", err);
      } finally {
        if (isMounted) setCheckingSession(false);
      }
    }

    checkExistingSession();

    return () => {
      isMounted = false;
    };
  }, [redirectPath, router, setRole]);

  // Autofocus email input on initial mount after session check completes
  useEffect(() => {
    if (!checkingSession) {
      emailInputRef.current?.focus();
    }
  }, [checkingSession]);

  // 2. CLIENT-SIDE VALIDATION
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      errors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(cleanEmail)) {
      errors.email = "Please enter a valid email address (e.g. name@company.com).";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(errors);

    // UX: Shift focus to the first invalid field
    if (errors.email) {
      emailInputRef.current?.focus();
      return false;
    }
    if (errors.password) {
      passwordInputRef.current?.focus();
      return false;
    }

    return true;
  };

  // 3. SUBMIT LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent double submits

    setGlobalError(null);

    // Run client-side validation
    if (!validateForm()) return;

    setLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !anonKey) {
        throw new Error("Supabase credentials not configured.");
      }

      const supabase = createBrowserClient(url, anonKey);

      // Perform Supabase Authentication call
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let userFacingError = "Invalid email or password. Please verify your credentials.";
        if (error.message.includes("Invalid login credentials")) {
          userFacingError = "Invalid email address or password.";
        } else if (error.message.includes("Email not confirmed")) {
          userFacingError = "Your email address has not been verified yet.";
        } else if (error.message.includes("Failed to fetch") || error.status === 0) {
          userFacingError = "Network error. Please check your internet connection.";
        }
        throw new Error(userFacingError);
      }

      if (!data.user) {
        throw new Error("Authentication response contained no user session.");
      }

      // Fetch user profile & role for authorization
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, status")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        throw new Error("Unable to retrieve user profile credentials.");
      }

      if (profile.status !== "active") {
        await supabase.auth.signOut();
        throw new Error("Your account has been suspended or deactivated.");
      }

      const role = profile.role as UserRole;
      setRole(role);

      // Determine redirect target
      let targetRoute = "/admin/dashboard";
      if (redirectPath && redirectPath.startsWith("/")) {
        targetRoute = redirectPath;
      } else if (role === "super_admin") {
        targetRoute = "/super-admin";
      } else if (role === "owner") {
        targetRoute = "/owner";
      }

      // Fast perception transition to authorized dashboard
      router.push(targetRoute);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setGlobalError(message);
      setLoading(false);
    }
  };

  // If checking active session on initial page load, present sleek minimal loader shell
  if (checkingSession) {
    return (
      <LoginLayout>
        <div className="w-full max-w-[420px] bg-white border border-[#E5E7EB] rounded-[16px] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          <p className="text-xs font-medium text-slate-500">Verifying session...</p>
        </div>
      </LoginLayout>
    );
  }

  return (
    <LoginLayout>
      <LoginCard
        title="Welcome Back"
        subtitle="Sign in to access your admin console"
        error={globalError}
      >
        <form onSubmit={handleLogin} noValidate className="space-y-4">
          {/* Email Input */}
          <InputField
            id="admin-email"
            label="Email Address"
            type="email"
            placeholder="admin@akshaya.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            error={fieldErrors.email}
            leftIcon={<Mail className="w-4 h-4" />}
            inputRef={emailInputRef}
            autoComplete="email"
            disabled={loading}
          />

          {/* Password Input */}
          <InputField
            id="admin-password"
            label="Password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            error={fieldErrors.password}
            leftIcon={<Lock className="w-4 h-4" />}
            inputRef={passwordInputRef}
            autoComplete="current-password"
            disabled={loading}
          />

          {/* Micro UX Controls: Remember me + Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#E5E7EB] text-[#2563EB] focus:ring-[#2563EB]/20 accent-[#2563EB] cursor-pointer"
                disabled={loading}
              />
              <span className="text-xs text-slate-600 font-medium">
                Remember me
              </span>
            </label>

            <a
              href="/admin/forgot-password"
              className="text-xs font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors focus:outline-none focus:underline"
            >
              Forgot Password?
            </a>
          </div>

          {/* CTA Button */}
          <div className="pt-2">
            <AuthButton loading={loading} disabled={loading}>
              Sign In to Console
            </AuthButton>
          </div>
        </form>
      </LoginCard>
    </LoginLayout>
  );
}
