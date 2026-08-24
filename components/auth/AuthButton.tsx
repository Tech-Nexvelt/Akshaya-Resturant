"use client";

import React from "react";
import { Loader2, ArrowRight } from "lucide-react";

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children?: React.ReactNode;
}

export function AuthButton({
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: AuthButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={`h-10 md:h-12 w-full rounded-lg md:rounded-[10px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm md:text-base transition-all duration-200 shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2.5 cursor-pointer select-none ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <span>{children || "Sign In to Console"}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}
