import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { BusinessTablesView } from "@/components/admin/views/BusinessTablesView";
import { STAFF_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server-gated. See app/admin/invoices/page.tsx for why the client gate is not enough.
 * staff+ — floor/table status is operational, same tier as Orders.
 */
export default async function AdminTablesPage() {
  const session = await requireAdminSession(STAFF_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={STAFF_AND_ABOVE}>
      <BusinessTablesView />
    </RoleGate>
  );
}
