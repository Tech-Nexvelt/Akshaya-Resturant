import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminSession } from "@/lib/auth/require-admin";
import { WebhooksTable, WebhookEventRow } from "@/components/admin/WebhooksTable";
import { AccessDenied } from "@/components/admin/AccessDenied";
import { RoleGate } from "@/components/admin/RoleGate";
import { ADMIN_AND_ABOVE } from "@/types/platform";

export const revalidate = 0;

/**
 * Webhook / dead-letter console.
 *
 * This page is the one `/admin` route that reads privileged data on the SERVER
 * with the service-role key, so it cannot rely on <RoleGate> alone the way the
 * other admin pages do — a client gate runs after the payload has already been
 * sent. `requireAdminSession()` therefore runs BEFORE any query, and the
 * service-role client is only constructed once it passes. <RoleGate> is still
 * applied underneath so the in-app role switcher behaves consistently with the
 * rest of the console.
 */
export default async function AdminWebhooksPage() {
  const session = await requireAdminSession(ADMIN_AND_ABOVE);

  if (!session.authorized) {
    return (
      <AccessDenied message="The webhook console reads live payment payloads, so it needs a verified staff session on the server — not just a console role preview." />
    );
  }

  // createAdminClient() throws when SUPABASE_SERVICE_ROLE_KEY is absent. Catch it
  // here so a deployment misconfiguration renders an empty console for an already
  // authorized member of staff rather than throwing them into app/error.tsx —
  // which, being a client boundary, would also print the thrown message (and the
  // env var names in it) into the browser in a dev build.
  let events: WebhookEventRow[] = [];
  let loadFailed = false;

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("webhook_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      loadFailed = true;
      console.error("[CRITICAL] Failed to fetch webhook events:", error.message);
    }

    events = (data || []).map((row) => ({
      id: row.id,
      provider: row.provider,
      event_type: row.event_type,
      external_event_id: row.external_event_id,
      payload: row.payload as Record<string, unknown>,
      status: row.status as WebhookEventRow["status"],
      retry_count: row.retry_count,
      max_retries: row.max_retries,
      last_error: row.last_error,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (err) {
    loadFailed = true;
    console.error(
      "[CRITICAL] Webhook console could not create a service-role client:",
      err instanceof Error ? err.message : String(err)
    );
  }

  return (
    <RoleGate allowedRoles={ADMIN_AND_ABOVE}>
      <div className="space-y-6">
        {loadFailed && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Webhook events could not be loaded. This is a server configuration
            problem, not a permissions one — check the server log.
          </div>
        )}
        <WebhooksTable initialEvents={events} />
      </div>
    </RoleGate>
  );
}
