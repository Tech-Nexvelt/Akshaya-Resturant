"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-2xl border-red-500/20 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
          <AlertTriangle className="h-7 w-7" />
        </div>

        <h2 className="font-display text-2xl font-bold text-[var(--color-ivory)]">
          Something went wrong
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-[var(--color-smoke)]">
          We encountered an unexpected error. Don&rsquo;t worry, your cart and session data are safe.
        </p>

        {error.digest && (
          <p className="mt-2 font-mono text-[10px] text-gray-500">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            onClick={() => reset()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--color-gold)] px-5 text-xs font-bold text-[var(--color-void)] hover:brightness-110 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try Again
          </button>
          <a
            href="/restaurant"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 glass-panel px-5 text-xs font-semibold text-[var(--color-smoke)] hover:text-white transition-all"
          >
            <Home className="h-3.5 w-3.5" /> Return Home
          </a>
        </div>
      </div>
    </div>
  );
}
