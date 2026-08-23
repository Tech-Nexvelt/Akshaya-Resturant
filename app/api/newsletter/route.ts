import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { Logger } from "@/lib/observability";

/**
 * Newsletter signup capture.
 *
 * The storefront's contact band used to show a "subscribed" confirmation and then
 * discard the address entirely. This persists it through `subscribe_newsletter`,
 * the only write path into `newsletter_subscribers` (see migration 0017).
 *
 * Deliberately does NOT reveal whether an address was already on the list —
 * "already subscribed" vs "newly subscribed" is an account-enumeration oracle.
 * The RPC is idempotent, so both cases look the same from here.
 */
export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();

  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email || email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { error } = await supabase.rpc("subscribe_newsletter", {
      p_email: email,
      p_source: typeof body?.source === "string" ? body.source : "restaurant_contact",
    });

    if (error) {
      Logger.critical(
        "newsletter.subscribe_failed",
        "newsletter_subscriber",
        { error: error.message, requestId },
        requestId
      );
      return NextResponse.json(
        { success: false, error: "We couldn't save your email. Please try again." },
        { status: 502 }
      );
    }

    Logger.info("newsletter.subscribed", "newsletter_subscriber", {}, requestId);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    Logger.critical(
      "newsletter.exception",
      "newsletter_subscriber",
      { error: err instanceof Error ? err.message : String(err), requestId },
      requestId
    );
    return NextResponse.json(
      { success: false, error: "We couldn't save your email. Please try again." },
      { status: 500 }
    );
  }
}
