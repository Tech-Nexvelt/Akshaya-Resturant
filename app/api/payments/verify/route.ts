import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();

  try {
    const body = await req.json();
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const keyId = process.env.RAZORPAY_KEY_ID;

    if (!keySecret || !keyId) {
      console.error(`[${requestId}] [CRITICAL] Razorpay secrets not configured in environment`);
      return NextResponse.json(
        { success: false, error: "Payment gateway configuration error" },
        { status: 500 }
      );
    }

    // Step 1: HMAC SHA-256 Signature Verification (Timing-safe comparison)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // timingSafeEqual throws on unequal buffer lengths, which would turn a
    // malformed signature into a 500 instead of a 400. Length is not secret.
    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const receivedBuf = Buffer.from(String(razorpay_signature), "utf-8");

    const isSignatureValid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isSignatureValid) {
      console.warn(`[${requestId}] [WARNING] Invalid payment signature attempt for order: ${order_id}`);
      return NextResponse.json(
        { success: false, error: "Invalid payment signature verification failed" },
        { status: 400 }
      );
    }

    // Step 2: Direct Gateway Verification Fallback via Razorpay REST API
    const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
    const gatewayRes = await fetch(
      `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
      {
        headers: { Authorization: authHeader },
        cache: "no-store",
      }
    );

    if (!gatewayRes.ok) {
      const errorPayload = await gatewayRes.text();
      console.error(`[${requestId}] [ERROR] Gateway API verification failed:`, errorPayload);
      return NextResponse.json(
        { success: false, error: "Could not verify payment status with gateway" },
        { status: 502 }
      );
    }

    const gatewayPayment = await gatewayRes.json();

    if (gatewayPayment.order_id !== razorpay_order_id) {
      console.error(`[${requestId}] [CRITICAL] Mismatch between Razorpay order ID and payment details`);
      return NextResponse.json(
        { success: false, error: "Payment verification order mismatch" },
        { status: 400 }
      );
    }

    if (gatewayPayment.status !== "captured" && gatewayPayment.status !== "authorized") {
      return NextResponse.json(
        { success: false, error: `Payment is in invalid state: ${gatewayPayment.status}` },
        { status: 400 }
      );
    }

    // Step 3: Idempotent Database State Reconciliation (FOR UPDATE lock inside RPC)
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("record_payment_success", {
      p_razorpay_order_id: razorpay_order_id,
      p_razorpay_payment_id: razorpay_payment_id,
      p_razorpay_signature: razorpay_signature,
      p_gateway_response: gatewayPayment,
    });

    if (error) {
      console.error(`[${requestId}] [ERROR] record_payment_success RPC failed:`, error.message);
      return NextResponse.json(
        { success: false, error: "Failed to update payment record in system" },
        { status: 500 }
      );
    }

    const record = data?.[0];
    return NextResponse.json({
      success: true,
      order_id: record?.order_id || order_id,
      payment_id: record?.payment_id,
      receipt_number: record?.receipt_number,
      message: "Payment successfully verified and confirmed",
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[${requestId}] [CRITICAL] Payment verification exception:`, errorMsg);
    return NextResponse.json(
      { success: false, error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
