"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useSuperAdminStore } from "@/store/useSuperAdminStore";

export function ToastBanner() {
  const { toast, hideToast } = useSuperAdminStore();

  if (!toast.visible) return null;

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-rose-600" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (toast.type) {
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-900";
      case "error":
        return "bg-rose-50 border-rose-200 text-rose-900";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900";
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border p-3.5 shadow-lg transition-all duration-300 animate-slide-up max-w-md">
      <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 ${getColors()}`}>
        {getIcon()}
        <span className="text-xs font-bold">{toast.message}</span>
        <button onClick={hideToast} className="ml-2 text-gray-400 hover:text-gray-700">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
