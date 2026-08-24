import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { BusinessDashboardView } from "@/components/admin/views/BusinessDashboardView";
import { STAFF_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/** Server-gated. See app/admin/invoices/page.tsx for why the client gate is not enough. */
export default async function AdminDashboardPage() {
  const session = await requireAdminSession(STAFF_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={STAFF_AND_ABOVE}>
      <BusinessDashboardView />
    </RoleGate>
  );
}
