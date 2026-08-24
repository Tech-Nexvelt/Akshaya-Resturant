"use client";

import React from "react";
import { AlertCircle, Lock } from "lucide-react";

interface LoginCardProps {
  title?: string;
  subtitle?: string;
  error?: string | null;
  children: React.ReactNode;
}

export function LoginCard({
  title = "Welcome Back",
  subtitle = "Sign in to access your admin console",
  error,
  children,
}: LoginCardProps) {
  return (
    <div className="w-full max-w-[420px] bg-white border border-[#E5E7EB] rounded-lg md:rounded-[16px] p-5 sm:p-7 md:p-9 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
      {/* Header */}
      <div className="mb-5 md:mb-6 text-left">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-normal leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Global Error Banner (if any) */}
      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs flex items-start gap-2.5 shadow-2xs animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
          <div className="leading-normal font-medium">{error}</div>
        </div>
      )}

      {/* Main Form Content */}
      <div>{children}</div>

      {/* Subtle Security Badge Footer inside Card */}
      <div className="mt-7 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
        <Lock className="w-3 h-3 text-slate-400" />
        <span>Enterprise 256-bit SSL Encrypted</span>
      </div>
    </div>
  );
}
