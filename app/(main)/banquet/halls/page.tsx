import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import BanquetPage from "../page";

export const metadata: Metadata = generatePageMetadata({
  title: "AC Banquet Halls — Hall Capacities & Layouts",
  description: "Explore AC and Non-AC banquet hall options at Akshaya. Seating capacity for 50 to 500+ guests.",
  path: "/banquet/halls",
});

export default function BanquetHallsPage() {
  return <BanquetPage />;
}
