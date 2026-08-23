"use client";

export function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-void">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />
        <p className="font-display text-sm tracking-[0.3em] text-gold/70">AKSHAYA</p>
      </div>
    </div>
  );
}
