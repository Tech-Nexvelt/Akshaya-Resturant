import React from "react";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { ActivityLogsTable } from "@/components/admin/ActivityLogsTable";
import { ADMIN_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server-gated. See app/admin/orders/page.tsx for why the client gate is not enough.
 *
 * ROLE SET — admin+, matching `activity_logs`' only policy, "admin read
 * activity" USING (is_admin_or_owner()) (0005). Same reasoning as
 * app/admin/leads/page.tsx: letting staff through the page gate would show them
 * an empty audit trail rather than a refusal, because RLS denies by returning
 * no rows. Widen the policy first, then this.
 */
export default async function AdminActivityPage() {
  const session = await requireAdminSession(ADMIN_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={ADMIN_AND_ABOVE}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-[var(--color-ivory)] mb-1">
            System Audit Log Trail
          </h3>
          <p className="text-xs text-[var(--color-smoke)]">
            Full audit log of order creation, payment events, menu edits, and staff actions.
          </p>
        </div>
        <ActivityLogsTable />
      </div>
    </RoleGate>
  );
}
