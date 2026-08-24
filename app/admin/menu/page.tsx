import { requireAdminSession } from "@/lib/auth/require-admin";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { BusinessMenuView } from "@/components/admin/views/BusinessMenuView";
import { ADMIN_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/** Server-gated. See app/admin/invoices/page.tsx for why the client gate is not enough. */
export default async function AdminMenuPage() {
  const session = await requireAdminSession(ADMIN_AND_ABOVE);

  if (!session.authorized) {
    return <AccessDenied />;
  }

  return (
    <RoleGate allowedRoles={ADMIN_AND_ABOVE}>
      <BusinessMenuView />
    </RoleGate>
  );
}
