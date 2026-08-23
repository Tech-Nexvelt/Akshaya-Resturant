import type { ReactNode } from "react";

/**
 * Banquet-specific layout — returns children directly so parent (main)/layout.tsx
 * handles shared Navbar and PageTransition without duplicate wrapping.
 */
export default function BanquetLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

