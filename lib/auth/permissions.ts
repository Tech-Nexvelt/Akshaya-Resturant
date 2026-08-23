import { UserRole } from "@/types/platform";

export type Capability =
  | "can_manage_platform"
  | "can_manage_users"
  | "can_access_finance"
  | "can_manage_menu"
  | "can_view_leads"
  | "can_execute_orders"
  | "can_view_audit";

export const ROLE_CAPABILITIES: Record<UserRole, Capability[]> = {
  super_admin: [
    "can_manage_platform",
    "can_manage_users",
    "can_access_finance",
    "can_manage_menu",
    "can_view_leads",
    "can_execute_orders",
    "can_view_audit",
  ],
  owner: [
    "can_manage_users",
    "can_access_finance",
    "can_manage_menu",
    "can_view_leads",
    "can_execute_orders",
    "can_view_audit",
  ],
  admin: [
    "can_manage_menu",
    "can_view_leads",
    "can_execute_orders",
    "can_view_audit",
  ],
  staff: [
    "can_execute_orders",
  ],
};

export function hasCapability(role: UserRole | null, capability: Capability): boolean {
  if (!role) return false;
  const capabilities = ROLE_CAPABILITIES[role];
  return capabilities ? capabilities.includes(capability) : false;
}
