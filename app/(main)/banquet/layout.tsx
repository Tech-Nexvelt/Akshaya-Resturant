import type { ReactNode } from "react";
import { BanquetHeader } from "@/components/banquet/BanquetHeader";

export default function BanquetLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <BanquetHeader />
      {children}
    </>
  );
}
