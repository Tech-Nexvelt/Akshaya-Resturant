"use client";

import React, { useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  type?: string;
  error?: string | null;
  leftIcon?: React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function InputField({
  id,
  label,
  type = "text",
  error,
  leftIcon,
  inputRef,
  className = "",
  ...props
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="space-y-1.5 w-full">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-slate-700 tracking-wide"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <input
          id={id}
          ref={inputRef}
          type={actualType}
          className={`w-full h-10 md:h-12 bg-white text-slate-900 text-sm md:text-base rounded-lg md:rounded-xl transition-all duration-200 ease-in-out placeholder:text-slate-400 outline-none ${
            leftIcon ? "pl-9 md:pl-10" : "pl-3 md:pl-4"
          } ${isPassword ? "pr-10 md:pr-11" : "pr-3 md:pr-4"} ${
            error
              ? "border border-[#EF4444] focus:border-[#EF4444] focus:ring-4 focus:ring-[#EF4444]/15 text-[#EF4444]"
              : "border border-[#E5E7EB] hover:border-slate-300 focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 text-slate-900"
          } ${className}`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            tabIndex={-1}
            className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md cursor-pointer focus:outline-none"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-[#EF4444] font-medium pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
