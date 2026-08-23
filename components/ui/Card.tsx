import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export function Card({ children, hoverable = true, className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 text-[#111827] ${
        hoverable ? "transition-all duration-200 hover:shadow-md hover:border-[#DBEAFE]" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
