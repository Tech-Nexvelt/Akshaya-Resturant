"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Global App Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#0B0F17] text-white flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-[#121824] p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            ⚠️
          </div>
          <h2 className="text-2xl font-bold text-white">System Error</h2>
          <p className="mt-2 text-xs text-gray-400">
            A critical rendering error occurred. Please refresh or try again later.
          </p>
          <button
            onClick={() => reset()}
            className="mt-6 w-full rounded-xl bg-amber-500 py-3 text-xs font-bold text-black hover:bg-amber-400 transition-all"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
