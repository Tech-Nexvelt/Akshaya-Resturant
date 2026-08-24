import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import BanquetPage from "../page";

export const metadata: Metadata = generatePageMetadata({
  title: "Banquet Hall Packages & Catering Pricing",
  description: "View affordable banquet hall packages, buffet menus, and pricing options at Akshaya Siddipet.",
  path: "/banquet/packages",
});

export default function BanquetPackagesPage() {
  return <BanquetPage />;
}
