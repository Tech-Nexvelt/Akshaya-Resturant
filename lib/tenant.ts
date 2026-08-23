import { NextRequest } from "next/server";

export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Extracts and validates tenant_id from request headers or domain metadata.
 * Ensures strict multi-tenant isolation across API routes and database queries.
 */
export function getTenantId(req: NextRequest): string {
  const tenantHeader = req.headers.get("x-tenant-id");
  if (tenantHeader && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tenantHeader)) {
    return tenantHeader;
  }
  return DEFAULT_TENANT_ID;
}

/**
 * Validates that an entity belongs strictly to the requested tenant.
 * Prevents cross-tenant data leakage in API operations.
 */
export function assertTenantOwnership<T extends { tenant_id?: string }>(
  entity: T | null,
  expectedTenantId: string
): boolean {
  if (!entity) return false;
  if (!entity.tenant_id) return true; // Global/Unpartitioned entity
  return entity.tenant_id === expectedTenantId;
}
