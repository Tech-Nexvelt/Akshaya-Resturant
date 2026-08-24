import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { BusinessCustomersView } from "@/components/admin/views/BusinessCustomersView";
import { ADMIN_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Server-gated. See app/admin/invoices/page.tsx for why the client gate is not enough.
 * Same data and role set as app/admin/leads/page.tsx — this route renders the same
 * BusinessCustomersView, so it carries the same admin+ restriction.
 */
export default async function AdminCustomersPage() {
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
