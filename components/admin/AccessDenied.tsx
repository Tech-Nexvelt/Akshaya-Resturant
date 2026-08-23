import Link from "next/link";
import { ShieldAlert } from "lucide-react";

/**
 * Server-rendered refusal for `/admin/*` pages.
 *
 * Deliberately NOT a client component: it is what a page renders INSTEAD OF
 * calling `requireAdminSession()`'s protected branch, so it has to be part of
 * the very first server response. <RoleGate> — the client gate — cannot do this
 * job, because by the time it runs the server has already rendered and shipped
 * whatever the page returned.
 *
 * It also says nothing about WHY. "No session" vs "wrong role" vs "account
 * suspended" vs "Supabase not configured" is useful to someone probing the
 * console and useless to staff, who will ask a person either way. The real
 * reason goes to the server log via `session.reason`.
 */
export function AccessDenied({
  message = "This console page needs a verified staff session on the server — not just a console role preview.",
}: {
  message?: string;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h2 className="mb-2 font-display text-2xl text-[var(--color-ivory)]">
        Sign-in Required
      </h2>
      <p className="mb-6 max-w-md text-[var(--color-smoke)]">{message}</p>
      <Link
        href="/admin/login"
        className="rounded-lg bg-gradient-to-r from-[var(--color-gold-dim)] to-[var(--color-gold)] px-6 py-2.5 font-semibold text-[var(--color-void)] transition-all hover:brightness-110"
      >
        Go to Staff Login
      </Link>
    </div>
  );
}
