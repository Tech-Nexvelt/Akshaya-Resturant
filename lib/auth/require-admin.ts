import { createClient } from "@/lib/supabase/server";
import { ADMIN_AND_ABOVE, type UserRole } from "@/types/platform";
import { hasCapability, type Capability } from "./permissions";

export interface AdminSession {
  authorized: boolean;
  role: UserRole | null;
  reason?: string;
}

export async function requireAdminSession(
  allowed: readonly UserRole[] = ADMIN_AND_ABOVE
): Promise<AdminSession> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { authorized: false, role: null, reason: "supabase-not-configured" };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return { authorized: false, role: null, reason: "no-session" };
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile?.role) {
      return { authorized: false, role: null, reason: "no-profile" };
    }

    const role = profile.role as UserRole;

    if (profile.status && profile.status !== "active") {
      return { authorized: false, role, reason: `account-${profile.status}` };
    }

    return allowed.includes(role)
      ? { authorized: true, role }
      : { authorized: false, role, reason: "role-not-permitted" };
  } catch (err) {
    return {
      authorized: false,
      role: null,
      reason: err instanceof Error ? err.message : "auth-check-threw",
    };
  }
}

export async function requireCapability(
  capability: Capability
): Promise<AdminSession> {
  const session = await requireAdminSession(ADMIN_AND_ABOVE);
  if (!session.authorized || !session.role) return session;

  const permitted = hasCapability(session.role, capability);
  return permitted
    ? session
    : { authorized: false, role: session.role, reason: `missing-capability-${capability}` };
}
