import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { Logger } from "@/lib/observability";

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();

  try {
    const body = await req.json();
    const { name, phone, eventType, eventDate, guestCount, budgetRange, notes } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: "Full Name is required." }, { status: 400 });
    }

    if (!phone || typeof phone !== "string" || !phone.trim()) {
      return NextResponse.json({ success: false, error: "A valid mobile number is required." }, { status: 400 });
    }

    if (!eventType || typeof eventType !== "string" || !eventType.trim()) {
      return NextResponse.json({ success: false, error: "Event Type is required." }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: enquiryId, error } = await supabase.rpc("create_banquet_enquiry", {
      p_name: name.trim(),
      p_phone: phone.trim(),
      p_event_type: eventType.trim(),
      p_event_date: eventDate ? eventDate : null,
      p_guest_count: guestCount ? parseInt(String(guestCount), 10) : null,
      p_budget_range: budgetRange ? budgetRange : null,
      p_notes: notes ? notes.trim() : null,
    });

    if (error) {
      Logger.critical(
        "enquiry.banquet.rpc_failed",
        "banquet_enquiry",
        { error: error.message, requestId },
        requestId
      );
      return NextResponse.json(
        { success: false, error: "We could not save your enquiry. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, enquiryId });
  } catch (err: unknown) {
    // The message is logged, never returned. `createAdminClient()` throws from
    // inside this try block and its message names environment variables; the
    // Postgres errors from the RPC can carry column and constraint names. Both
    // belong in the server log and nowhere near the response body.
    const message = err instanceof Error ? err.message : "Internal Server Error";
    Logger.critical(
      "enquiry.banquet.exception",
      "banquet_enquiry",
      { error: message, requestId },
      requestId
    );
    return NextResponse.json(
      { success: false, error: "We could not save your enquiry. Please try again." },
      { status: 500 }
    );
  }
}
