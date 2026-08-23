import React from "react";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { SettingsManager } from "@/components/admin/SettingsManager";
import { OWNER_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server-gated, owner tier only. This is the narrowest page in the console:
 * it assigns roles and toggles GST, so `admin` is deliberately excluded — the
 * RBAC table and `is_owner()` in the database agree on that, and this is the
 * third place that has to.
 *
 * OWNER_AND_ABOVE is ['owner', 'super_admin']: super_admin is accepted
 * everywhere owner is, matching `is_owner()` in 0019_rbac_hardening.sql.
 */
export default async function AdminSettingsPage() {
  const session = await requireAdminSession(OWNER_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={OWNER_AND_ABOVE}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-[var(--color-ivory)] mb-1">
            Owner Platform Settings & RBAC Accounts
          </h3>
          <p className="text-xs text-[var(--color-smoke)]">
            Role allocations, staff accounts management, GST configuration, and gateway keys.
          </p>
        </div>
        <SettingsManager />
      </div>
    </RoleGate>
  );
}
