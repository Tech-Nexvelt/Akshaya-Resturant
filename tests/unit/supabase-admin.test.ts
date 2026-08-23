import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createAdminClient, serviceRoleConfigStatus } from "@/lib/supabase/admin";

describe("Supabase Admin Client & Health Probe Guard", () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const originalAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-secret-key";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-public-key";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalAnonKey;
  });

  it("should create client when correctly configured", () => {
    expect(() => createAdminClient()).not.toThrow();
    const probe = serviceRoleConfigStatus();
    expect(probe.ok).toBe(true);
    expect(probe.missing).toHaveLength(0);
  });

  it("should throw when SUPABASE_SERVICE_ROLE_KEY is missing", () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(() => createAdminClient()).toThrow("SUPABASE_SERVICE_ROLE_KEY is not set");
    const probe = serviceRoleConfigStatus();
    expect(probe.ok).toBe(false);
    expect(probe.missing).toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("should throw when service role key equals anon key", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "same-key";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "same-key";
    expect(() => createAdminClient()).toThrow("identical to the anon key");
    const probe = serviceRoleConfigStatus();
    expect(probe.ok).toBe(false);
  });
});
