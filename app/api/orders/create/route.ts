import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { menuItemUuid } from "@/lib/restaurant-data";
import { Logger } from "@/lib/observability";
import { checkRateLimit } from "@/lib/rate-limit";
import { apiSuccess, apiError } from "@/lib/api-response";

const MAX_QUANTITY_PER_ITEM = 20;
const MAX_DISTINCT_ITEMS = 50;
const MAX_ORDER_VALUE_INR = 100000;

interface IncomingItem {
  id?: string;
  menu_item_id?: string;
  quantity?: number;
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
  const startedAt = Date.now();

  try {
    // 1. Rate Limiting Guard (10 requests/minute per IP)
    const clientIp = req.headers.get("x-forwarded-for") || "ip_untraced";
    const rateLimit = await checkRateLimit(`order_create:${clientIp}`, 10, 60);

    if (!rateLimit.success) {
      Logger.warn("order.create.rate_limited", "order", { clientIp }, requestId);
      return apiError("Too many order requests. Please wait a minute.", "RATE_LIMITED", 429, undefined, requestId);
    }

    const body = await req.json();
    const { customer_name, customer_phone, items, idempotency_key } = body;

    if (!customer_name || typeof customer_name !== "string" || !customer_name.trim()) {
      return apiError("Customer name is required", "INVALID_INPUT", 400, undefined, requestId);
    }

    const phone = typeof customer_phone === "string" ? customer_phone.trim() : "";
    if (!/^[0-9]{10,13}$/.test(phone.replace(/\D/g, ""))) {
      return apiError("Valid customer phone number is required", "INVALID_INPUT", 400, undefined, requestId);
    }

    if (!Array.isArray(items) || items.length === 0) {
      return apiError("Cart cannot be empty", "EMPTY_CART", 400, undefined, requestId);
    }

    if (items.length > MAX_DISTINCT_ITEMS) {
      return apiError("Too many items in cart", "EXCEEDED_ITEM_LIMIT", 400, undefined, requestId);
    }

    const rpcItems: { menu_item_id: string; quantity: number }[] = [];
    for (const raw of items as IncomingItem[]) {
      const slug = typeof raw?.id === "string" ? raw.id : "";
      const uuid = menuItemUuid(slug);
      if (!uuid) {
        Logger.warn("order.create.unknown_item", "order", { slug }, requestId);
        return apiError("One or more items are no longer on the menu", "ITEM_NOT_FOUND", 400, undefined, requestId);
      }

      const quantity = Number(raw?.quantity ?? 1);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
        return apiError(`Quantity must be between 1 and ${MAX_QUANTITY_PER_ITEM}`, "INVALID_QUANTITY", 400, undefined, requestId);
      }

      rpcItems.push({ menu_item_id: uuid, quantity });
    }

    const clientKey = idempotency_key || crypto.randomUUID();
    const supabase = createAdminClient();

    const { data: orderData, error: orderErr } = await supabase.rpc("create_order", {
      p_customer_name: customer_name.trim(),
      p_customer_phone: phone,
      p_items: rpcItems,
      p_idempotency_key: clientKey,
    });

    if (orderErr || !orderData?.[0]) {
      Logger.critical("order.create.rpc_failed", "order", { error: orderErr?.message }, requestId);
      return apiError("We could not place your order. Please try again.", "RPC_FAILED", 502, undefined, requestId);
    }

    const { order_id: orderId, order_number: orderNumber } = orderData[0];
    const totalAmount = Number(orderData[0].total);

    if (!Number.isFinite(totalAmount) || totalAmount <= 0 || totalAmount > MAX_ORDER_VALUE_INR) {
      Logger.critical("order.create.implausible_total", "order", { orderId, totalAmount }, requestId);
      return apiError("We could not place your order. Please try again.", "IMPLAUSIBLE_TOTAL", 502, undefined, requestId);
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      Logger.critical("order.create.razorpay_unconfigured", "payment", { orderId }, requestId);
      return apiError("Online payment is temporarily unavailable.", "GATEWAY_UNCONFIGURED", 503, undefined, requestId);
    }

    let razorpayOrderId: string;
    try {
      const authHeader = `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(totalAmount * 100),
          currency: "INR",
          receipt: orderNumber,
          notes: { order_id: orderId, customer_name: customer_name.trim() },
        }),
      });

      if (!rzpRes.ok) {
        const detail = await rzpRes.text().catch(() => "<unreadable>");
        Logger.critical("order.create.razorpay_rejected", "payment", { orderId, status: rzpRes.status, detail: detail.slice(0, 500) }, requestId);
        return apiError("We could not start your payment. Please try again.", "GATEWAY_REJECTED", 502, undefined, requestId);
      }

      const rzpOrder = await rzpRes.json();
      if (!rzpOrder?.id) throw new Error("Razorpay response contained no order id");
      razorpayOrderId = rzpOrder.id;
    } catch (rzpErr) {
      Logger.critical("order.create.razorpay_exception", "payment", { orderId, error: String(rzpErr) }, requestId);
      return apiError("We could not start your payment. Please try again.", "GATEWAY_EXCEPTION", 502, undefined, requestId);
    }

    const { error: payErr } = await supabase.from("payments").upsert(
      {
        order_id: orderId,
        razorpay_order_id: razorpayOrderId,
        amount: totalAmount,
        currency: "INR",
        status: "pending",
      },
      { onConflict: "razorpay_order_id" }
    );

    if (payErr) {
      Logger.critical("order.create.payment_row_failed", "payment", { orderId, razorpayOrderId, error: payErr.message }, requestId);
      return apiError("We could not start your payment. Please try again.", "PAYMENT_RECORD_FAILED", 502, undefined, requestId);
    }

    const durationMs = Date.now() - startedAt;
    if (durationMs > 500) {
      Logger.warn("api.slow_request", "order", { route: "/api/orders/create", durationMs }, requestId);
    }

    Logger.info("order.create.succeeded", "order", { orderId, orderNumber, totalAmount, razorpayOrderId }, requestId, durationMs);

    return apiSuccess(
      {
        order_id: orderId,
        order_number: orderNumber,
        total: totalAmount,
        razorpay_order_id: razorpayOrderId,
        key_id: keyId,
      },
      200,
      { request_id: requestId, duration_ms: durationMs }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    Logger.critical("order.create.exception", "order", { error: errorMsg }, requestId);
    return apiError("Internal server error", "INTERNAL_ERROR", 500, undefined, requestId);
  }
}
