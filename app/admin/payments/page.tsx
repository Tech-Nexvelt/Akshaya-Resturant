import React from "react";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { ADMIN_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/** Server-gated. See app/admin/orders/page.tsx for why the client gate is not enough. */
export default async function AdminPaymentsPage() {
  const session = await requireAdminSession(ADMIN_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={ADMIN_AND_ABOVE}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-[var(--color-ivory)] mb-1">
            Payment Reconciliation Console
          </h3>
          <p className="text-xs text-[var(--color-smoke)]">
            Razorpay gateway transaction records, payment status, signatures, and webhook responses.
          </p>
        </div>
        <PaymentsTable />
      </div>
    </RoleGate>
  );
}
