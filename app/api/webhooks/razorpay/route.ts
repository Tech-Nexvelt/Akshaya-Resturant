import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error(`[${requestId}] [CRITICAL] RAZORPAY_WEBHOOK_SECRET missing in environment`);
    return NextResponse.json({ error: "Webhook secret unconfigured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    console.warn(`[${requestId}] [WARNING] Webhook received without x-razorpay-signature header`);
    return NextResponse.json({ error: "Missing webhook signature" }, { status: 400 });
  }

  // HMAC SHA-256 Webhook Verification
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");

  // timingSafeEqual throws on unequal buffer lengths, so a malformed signature
  // would surface as an unhandled 500 instead of a 400. Compare lengths first —
  // length is not a secret, so this leaks nothing a timing attack could use.
  const expectedBuf = Buffer.from(expectedSignature, "utf-8");
  const receivedBuf = Buffer.from(signature, "utf-8");

  const isSignatureValid =
    expectedBuf.length === receivedBuf.length &&
    crypto.timingSafeEqual(expectedBuf, receivedBuf);

  if (!isSignatureValid) {
    console.error(`[${requestId}] [CRITICAL] Razorpay webhook HMAC signature mismatch`);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventType = (body.event as string) || "unknown";
  const payloadData = body.payload as Record<string, unknown> | undefined;
  const paymentEntity = (payloadData?.payment as Record<string, unknown> | undefined)?.entity as Record<string, unknown> | undefined;
  
  const razorpayOrderId = paymentEntity?.order_id as string | undefined;
  const razorpayPaymentId = paymentEntity?.id as string | undefined;
  const externalEventId = (body.account_id as string || "") + "_" + (body.created_at as number || "") + "_" + (razorpayPaymentId || "");

  // createAdminClient() THROWS when SUPABASE_SERVICE_ROLE_KEY is missing or is
  // the anon key (see lib/supabase/admin.ts). It used to downgrade to an anon
  // client silently, which cannot write webhook_events or payments at all —
  // migration 0015 REVOKEs both from anon — so the customer was charged and the
  // order stayed 'pending' forever. Now that it throws, the construction must be
  // guarded: an unhandled throw here would 500 with no log, which is the same
  // silence in a different costume. A 500 makes Razorpay retry the delivery,
  // which is the behaviour we want once the key is put back.
  let supabase: ReturnType<typeof createAdminClient>;
  try {
    supabase = createAdminClient();
  } catch (err: unknown) {
    console.error(
      `[${requestId}] [CRITICAL] Service-role client unavailable; payment cannot be recorded:`,
      err instanceof Error ? err.message : String(err)
    );
    // Deliberately generic — the thrown message names environment variables.
    return NextResponse.json({ error: "Webhook processing unavailable" }, { status: 500 });
  }

  // 1. Record Webhook Event with Deduplication Guard
  const { data: recordData, error: recordErr } = await supabase.rpc("record_webhook_event", {
    p_direction: "inbound",
    p_provider: "razorpay",
    p_event_type: eventType,
    p_external_event_id: externalEventId,
    p_payload: body,
  });

  if (recordErr) {
    console.error(`[${requestId}] [ERROR] Webhook audit recording failed:`, recordErr.message);
  }

  const webhookEventId = recordData?.[0]?.event_id;
  const isDuplicate = recordData?.[0]?.is_duplicate;

  if (isDuplicate) {
    console.log(`[${requestId}] [INFO] Duplicate webhook event ignored: ${externalEventId}`);
    return NextResponse.json({ status: "already_processed" }, { status: 200 });
  }

  // 2. Process Business Logic for Payment Success Events
  try {
    if (eventType === "payment.captured" || eventType === "order.paid") {
      if (!razorpayOrderId || !razorpayPaymentId) {
        throw new Error("Missing order_id or payment_id in Razorpay webhook payload");
      }

      // Idempotent database payment state update
      const { error: rpcErr } = await supabase.rpc("record_payment_success", {
        p_razorpay_order_id: razorpayOrderId,
        p_razorpay_payment_id: razorpayPaymentId,
        p_razorpay_signature: signature,
        p_gateway_response: body,
      });

      if (rpcErr) {
        throw new Error(`record_payment_success failed: ${rpcErr.message}`);
      }
    }

    // Mark Webhook Event as Successfully Processed
    if (webhookEventId) {
      await supabase.rpc("update_webhook_outcome", {
        p_event_id: webhookEventId,
        p_success: true,
      });
    }

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[${requestId}] [ERROR] Webhook processing exception:`, errorMsg);

    // Record Failure & Calculate Retry Schedule
    if (webhookEventId) {
      await supabase.rpc("update_webhook_outcome", {
        p_event_id: webhookEventId,
        p_success: false,
        p_error_msg: errorMsg,
      });
    }

    return NextResponse.json({ error: "Webhook handler failed", details: errorMsg }, { status: 500 });
  }
}
