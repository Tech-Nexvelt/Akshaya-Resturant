import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { BusinessStaffView } from "@/components/admin/views/BusinessStaffView";
import { OWNER_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server-gated. See app/admin/invoices/page.tsx for why the client gate is not enough.
 * owner+ only — managing staff accounts and role assignment is the same trust tier as Settings
 * (`set_user_role()` is is_owner()-guarded), per PROJECT_MEMORY.md's RBAC table.
 */
export default async function AdminStaffPage() {
  const session = await requireAdminSession(OWNER_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={OWNER_AND_ABOVE}>
      <BusinessStaffView />
    </RoleGate>
  );
}
