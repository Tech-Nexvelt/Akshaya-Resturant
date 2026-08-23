import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: "bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:scale-[0.98] shadow-sm",
    secondary: "bg-[#DBEAFE] text-[#2563EB] hover:bg-[#BFDBFE] active:scale-[0.98]",
    ghost: "text-[#2563EB] hover:bg-[#DBEAFE] active:scale-[0.98]",
    outline: "border border-[#E5E7EB] bg-white text-[#111827] hover:bg-[#F9FAFB] hover:border-[#9CA3AF]",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-lg min-h-[36px]",
    md: "px-4 py-2 text-sm font-semibold rounded-xl min-h-[44px]",
    lg: "px-6 py-3 text-base font-bold rounded-xl min-h-[48px]",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
