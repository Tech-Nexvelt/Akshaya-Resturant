import React from "react";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { ADMIN_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server-gated. See app/admin/orders/page.tsx for why the client gate is not enough.
 *
 * ROLE SET — deliberately admin+, not staff+:
 * `leads` carries a single RLS policy, "admin read leads" USING
 * (is_admin_or_owner()) (0005), so a staff session reaching this page would be
 * allowed to render it and then read zero rows. A denied RLS read returns an
 * empty set, not an error — this codebase has already been bitten by exactly
 * that (staff-generated invoices silently carried no tax, see 0006). An empty
 * Leads table reads as "we have no leads", which is worse than a refusal.
 * The RBAC table in PROJECT_MEMORY.md agrees: staff have no access to Leads.
 * Widen this only in the same change that widens the RLS policy.
 */
export default async function AdminLeadsPage() {
  const session = await requireAdminSession(ADMIN_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={ADMIN_AND_ABOVE}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-[var(--color-ivory)] mb-1">
            Leads & Enquiry Capture Dashboard
          </h3>
          <p className="text-xs text-[var(--color-smoke)]">
            Captured intent from banquet forms, catering enquiries, restaurant orders, and contact clicks.
          </p>
        </div>
        <LeadsTable />
      </div>
    </RoleGate>
  );
}
