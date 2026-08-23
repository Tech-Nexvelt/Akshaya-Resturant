import React from "react";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { STAFF_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server-gated. See app/admin/orders/page.tsx for why the client gate is not enough.
 *
 * The page body moved verbatim to <DashboardOverview> — it is a client component
 * (Zustand, hooks) and had to stop being the page itself so the page could become
 * a Server Component and await `requireAdminSession()` first. No markup changed.
 */
export default async function AdminDashboardPage() {
  const session = await requireAdminSession(STAFF_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return <DashboardOverview />;
}
