import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { BusinessSettingsView } from "@/components/admin/views/BusinessSettingsView";
import { OWNER_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server-gated. See app/admin/invoices/page.tsx for why the client gate is not enough.
 * owner+ only — settings/GST/staff-role-assignment is the one page Admin does not get,
 * per PROJECT_MEMORY.md's RBAC table and the DB's is_owner() guard on `settings` writes.
 */
export default async function AdminSettingsPage() {
  const session = await requireAdminSession(OWNER_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={OWNER_AND_ABOVE}>
      <BusinessSettingsView />
    </RoleGate>
  );
}
