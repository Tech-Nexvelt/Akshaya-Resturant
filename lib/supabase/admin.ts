import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS by design.
 *
 * SERVER ONLY. Never import this from a client component, and never from a
 * Server Component that has not already authorized the caller — see
 * `lib/auth/require-admin.ts` for why (`/admin/webhooks` once serialized live
 * Razorpay payloads into the RSC payload for every visitor).
 *
 * WHY THIS THROWS INSTEAD OF FALLING BACK:
 * The previous implementation was
 *
 *   const serviceRoleKey =
 *     process.env.SUPABASE_SERVICE_ROLE_KEY ||
 *     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||   // <- silent downgrade
 *     "placeholder-key";
 *
 * which meant that when SUPABASE_SERVICE_ROLE_KEY was absent, every caller got
 * an ANON client while believing it held service-role privileges. Nothing threw.
 * The consequences were invisible and expensive:
 *
 *   - `webhook_events` and `idempotency_keys` have RLS enabled with zero policies
 *     and `REVOKE ALL ... FROM anon, authenticated` (migration 0015). An anon
 *     client cannot write them at all.
 *   - So the Razorpay webhook handler could not record a payment: the customer is
 *     charged, the webhook fires, the write is rejected, and the order stays
 *     `pending` forever. Money in, no order.
 *   - The idempotency cache silently stopped deduplicating, so retries could
 *     create duplicate orders.
 *
 * A payments path must never degrade quietly. If the key is missing, that is a
 * deployment fault and the process should say so at the first call rather than
 * mis-recording money. Fail loud, fail early.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "[supabase/admin] NEXT_PUBLIC_SUPABASE_URL is not set. " +
        "The service-role client cannot be created."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "[supabase/admin] SUPABASE_SERVICE_ROLE_KEY is not set. " +
        "Refusing to fall back to the anon key: webhook_events and " +
        "idempotency_keys are REVOKEd from anon (migration 0015), so payment " +
        "recording and idempotency would fail silently and orders would be " +
        "left unpaid-but-charged. Set SUPABASE_SERVICE_ROLE_KEY in the server " +
        "environment (never in a NEXT_PUBLIC_ variable)."
    );
  }

  // Guard against the key being pasted into a public variable by mistake.
  if (serviceRoleKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      "[supabase/admin] SUPABASE_SERVICE_ROLE_KEY is identical to the anon key. " +
        "This client would have no elevated privileges. Check the environment."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Non-throwing probe for health checks and startup diagnostics.
 * Returns what is missing without constructing a client.
 *
 * It reports `ok: false` for EVERY condition under which `createAdminClient()`
 * throws, including the key-equals-anon-key case. A health check that went green
 * while the payments path was dead would be worse than having no health check —
 * it would be the same silent-downgrade failure this file exists to prevent,
 * relocated into the monitoring.
 */
export function serviceRoleConfigStatus(): {
  ok: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  } else if (serviceRoleKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Present but useless. Named distinctly so the operator does not spend the
    // outage hunting for an unset variable that is, in fact, set.
    missing.push("SUPABASE_SERVICE_ROLE_KEY (set, but identical to the anon key)");
  }

  return { ok: missing.length === 0, missing };
}
