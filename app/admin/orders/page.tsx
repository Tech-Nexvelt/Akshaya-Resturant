import React from "react";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { OrdersTable } from "@/components/admin/OrdersTable";
import { RealtimeOrderFeed } from "@/components/admin/RealtimeOrderFeed";
import { STAFF_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server Component. `requireAdminSession()` runs before anything renders.
 *
 * This page used to be `"use client"` wrapped in <RoleGate> alone — a gate that
 * reads a Zustand field any visitor can set from devtools, and that runs only
 * after the server response has already been sent. The same shape once leaked
 * live Razorpay payloads out of `/admin/webhooks` (see lib/auth/require-admin.ts).
 *
 * <RoleGate> stays underneath so the dev role switcher still behaves, but it is
 * now decoration over a real gate, never the gate itself. Both are passed the
 * SAME role set from types/platform.ts so they cannot drift apart — this page
 * previously said ["owner","admin","staff"] on the client while the server
 * helper defaulted to ["owner","admin"].
 */
export default async function AdminOrdersPage() {
  const session = await requireAdminSession(STAFF_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={STAFF_AND_ABOVE}>
      <div className="space-y-6">
        <RealtimeOrderFeed />
        <div>
          <h3 className="text-base font-display font-semibold text-[var(--color-ivory)] mb-3">
            All Historical Orders & Kitchen Logs
          </h3>
          <OrdersTable />
        </div>
      </div>
    </RoleGate>
  );
}
