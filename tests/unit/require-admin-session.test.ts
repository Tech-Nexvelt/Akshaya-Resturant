import { describe, it, expect } from "vitest";

describe("Require Admin Session Authorization Logic", () => {
  type UserRole = "super_admin" | "owner" | "admin" | "staff";

  function isRoleAllowed(role: UserRole, allowedRoles: UserRole[], status: string): boolean {
    if (status !== "active") return false;
    return allowedRoles.includes(role);
  }

  const ADMIN_AND_ABOVE: UserRole[] = ["super_admin", "owner", "admin"];
  const OWNER_AND_ABOVE: UserRole[] = ["super_admin", "owner"];

  it("should authorize active super_admin for all admin surfaces", () => {
    expect(isRoleAllowed("super_admin", ADMIN_AND_ABOVE, "active")).toBe(true);
    expect(isRoleAllowed("super_admin", OWNER_AND_ABOVE, "active")).toBe(true);
  });

  it("should authorize active owner for owner and admin surfaces", () => {
    expect(isRoleAllowed("owner", OWNER_AND_ABOVE, "active")).toBe(true);
    expect(isRoleAllowed("owner", ADMIN_AND_ABOVE, "active")).toBe(true);
  });

  it("should deny staff role from owner-only surfaces", () => {
    expect(isRoleAllowed("staff", OWNER_AND_ABOVE, "active")).toBe(false);
    expect(isRoleAllowed("staff", ADMIN_AND_ABOVE, "active")).toBe(false);
  });

  it("should deny access unconditionally if account status is suspended or inactive", () => {
    expect(isRoleAllowed("super_admin", ADMIN_AND_ABOVE, "suspended")).toBe(false);
    expect(isRoleAllowed("owner", OWNER_AND_ABOVE, "inactive")).toBe(false);
  });
});
