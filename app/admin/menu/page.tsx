import React from "react";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { MenuManager } from "@/components/admin/MenuManager";
import { ADMIN_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server-gated. See app/admin/orders/page.tsx for why the client gate is not enough.
 *
 * ROLE SET — admin+, matching "admin manage categories" / "admin manage items"
 * USING (is_admin_or_owner()) (0005). This page is a CRUD surface, so a staff
 * session would not merely see stale data: every save would be rejected by RLS.
 * The RBAC table in PROJECT_MEMORY.md excludes staff from Menu CRUD. Widen the
 * policy first, then this.
 */
export default async function AdminMenuPage() {
  const session = await requireAdminSession(ADMIN_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={ADMIN_AND_ABOVE}>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-display font-semibold text-[var(--color-ivory)] mb-1">
            Menu Catalog & Price Management
          </h3>
          <p className="text-xs text-[var(--color-smoke)]">
            Manage restaurant menu categories, dish pricing, availability toggles, and new items.
          </p>
        </div>
        <MenuManager />
      </div>
    </RoleGate>
  );
}
