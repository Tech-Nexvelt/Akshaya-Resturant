import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { BusinessReportsView } from "@/components/admin/views/BusinessReportsView";
import { ADMIN_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server-gated. See app/admin/invoices/page.tsx for why the client gate is not enough.
 * admin+ — revenue/financial reporting, same tier as Payments per PROJECT_MEMORY.md's RBAC table.
 */
export default async function AdminReportsPage() {
  const session = await requireAdminSession(ADMIN_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={ADMIN_AND_ABOVE}>
      <BusinessReportsView />
    </RoleGate>
  );
}
