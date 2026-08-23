"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-void px-6 text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-gold">
        Something went wrong
      </p>
      <h1 className="font-display text-3xl font-medium text-ivory sm:text-4xl">
        We hit a snag
      </h1>
      <p className="mt-4 max-w-md text-sm text-smoke">
        This page ran into an error. It&rsquo;s been logged — try again, or head back home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-full bg-gold px-8 py-3 text-xs font-bold uppercase tracking-[0.2em] text-void transition-transform hover:scale-[1.02]"
        >
          Try Again
        </button>
        <a
          href="/home"
          className="rounded-full border border-gold/40 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:border-gold hover:text-gold-bright"
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}
