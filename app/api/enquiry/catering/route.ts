import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { Logger } from "@/lib/observability";

/**
 * Catering enquiry capture.
 *
 * Mirrors `/api/enquiry/banquet`. Before this route existed the catering form's
 * `handleSubmit` only flipped a `submitted` flag — it showed the visitor a
 * "we'll contact you shortly" confirmation and then dropped the lead on the floor.
 *
 * `create_catering_enquiry` is SECURITY DEFINER and is the ONLY write path into
 * `catering_enquiries`; it writes the enquiry row, the `leads` row, and the
 * activity log in one transaction.
 */
export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();

  try {
    const body = await req.json();
    const { name, phone, eventType, location, guestCount, eventDate, requirements } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ success: false, error: "Full Name is required." }, { status: 400 });
    }

    const cleanPhone = typeof phone === "string" ? phone.trim() : "";
    if (!/^[0-9]{10,13}$/.test(cleanPhone.replace(/\D/g, ""))) {
      return NextResponse.json(
        { success: false, error: "A valid mobile number is required." },
        { status: 400 }
      );
    }

    if (!eventType || typeof eventType !== "string" || !eventType.trim()) {
      return NextResponse.json({ success: false, error: "Event Type is required." }, { status: 400 });
    }

    if (!location || typeof location !== "string" || !location.trim()) {
      return NextResponse.json(
        { success: false, error: "Event location is required." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: enquiryId, error } = await supabase.rpc("create_catering_enquiry", {
      p_name: name.trim(),
      p_phone: cleanPhone,
      p_event_type: eventType.trim(),
      p_location: location.trim(),
      p_guest_count: guestCount ? parseInt(String(guestCount), 10) : null,
      p_event_date: eventDate ? eventDate : null,
      p_requirements: requirements ? String(requirements).trim() : null,
    });

    if (error) {
      // Raw Postgres text stays server-side; the client gets a generic message.
      Logger.critical(
        "enquiry.catering.rpc_failed",
        "catering_enquiry",
        { error: error.message, requestId },
        requestId
      );
      return NextResponse.json(
        { success: false, error: "We could not save your enquiry. Please try again." },
        { status: 502 }
      );
    }

    Logger.info("enquiry.catering.created", "catering_enquiry", { enquiryId }, requestId);
    return NextResponse.json({ success: true, enquiryId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    Logger.critical(
      "enquiry.catering.exception",
      "catering_enquiry",
      { error: message, requestId },
      requestId
    );
    return NextResponse.json(
      { success: false, error: "We could not save your enquiry. Please try again." },
      { status: 500 }
    );
  }
}
