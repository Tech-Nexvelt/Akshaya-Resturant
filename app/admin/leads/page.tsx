import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { BusinessCustomersView } from "@/components/admin/views/BusinessCustomersView";
import { ADMIN_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server-gated. See app/admin/invoices/page.tsx for why the client gate is not enough.
 * admin+, not staff+ — matches `leads`' only RLS policy, is_admin_or_owner(). Letting staff
 * through would show them an empty table (RLS-denied read returns zero rows, not an error)
 * instead of a clear refusal. See PROJECT_MEMORY.md's RBAC section.
 */
export default async function AdminLeadsPage() {
  const session = await requireAdminSession(ADMIN_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={ADMIN_AND_ABOVE}>
      <BusinessCustomersView />
    </RoleGate>
  );
}
