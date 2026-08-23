import React from "react";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { InvoicesTable } from "@/components/admin/InvoicesTable";
import { STAFF_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/** Server-gated. See app/admin/orders/page.tsx for why the client gate is not enough. */
export default async function AdminInvoicesPage() {
  const session = await requireAdminSession(STAFF_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={STAFF_AND_ABOVE}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-[var(--color-ivory)] mb-1">
            Billing & Invoices Management
          </h3>
          <p className="text-xs text-[var(--color-smoke)]">
            GST-compliant invoices, FY-prefixed sequential billing numbers, and PDF exports.
          </p>
        </div>
        <InvoicesTable />
      </div>
    </RoleGate>
  );
}
