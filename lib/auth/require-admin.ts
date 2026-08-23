import { createClient } from "@/lib/supabase/server";
import { ADMIN_AND_ABOVE, type UserRole } from "@/types/platform";

export interface AdminSession {
  authorized: boolean;
  role: UserRole | null;
  /** Why access was refused, for logging — never render this to the client. */
  reason?: string;
}

/**
 * Server-side authorization for `/admin/*` Server Components.
 *
 * SERVER ONLY. It reads `next/headers` cookies, so importing it from a client
 * component is a build error anyway — but do not be tempted to "fix" that by
 * moving the check client-side, which is the exact bug this file exists to close.
 *
 * WHY THIS EXISTS: `<RoleGate>` is a CLIENT component reading a Zustand field that
 * anyone can set from the browser console. That is fine for hiding UI, but it runs
 * only after the server has already rendered. `/admin/webhooks` was a Server
 * Component that called `createAdminClient()` (service-role key, bypasses RLS) and
 * serialized live Razorpay webhook payloads into the RSC payload for EVERY
 * visitor, authenticated or not — a client-side gate cannot un-send that.
 *
 * So any Server Component holding privileged data must call this FIRST and only
 * query once `authorized` is true.
 *
 * Until real Supabase Auth is provisioned there is no session to read, so this
 * denies by default. That is deliberate: the failure mode of "staff cannot see the
 * webhook console yet" is strictly better than "anyone can".
 */
export async function requireAdminSession(
  allowed: readonly UserRole[] = ADMIN_AND_ABOVE
): Promise<AdminSession> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { authorized: false, role: null, reason: "supabase-not-configured" };
  }

  try {
    const supabase = await createClient();

    // getUser() revalidates the JWT against the auth server; getSession() would
    // trust a cookie the browser can forge.
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

    // `profiles.status` arrived in 0019 so an account can be switched off without
    // deleting the row. The DB helpers (is_staff/is_admin_or_owner/is_owner) all
    // require status='active'; this check keeps the page gate agreeing with them.
    // Without it a suspended account would still render admin pages and then hit
    // an empty result set from RLS, which reads as "the data is gone", not
    // "you are suspended".
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
