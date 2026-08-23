import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { menuItemUuid } from "@/lib/restaurant-data";
import { Logger } from "@/lib/observability";

/**
 * Creates an order and its Razorpay counterpart.
 *
 * SECURITY MODEL — the previous version of this route violated all three of these:
 *
 *  1. The client never supplies a price. It sends slug + quantity; `create_order`
 *     re-prices every line from `menu_items` and returns the authoritative total,
 *     and that returned total is the ONLY number sent to Razorpay.
 *  2. The client never supplies a menu_item UUID either. Slugs are translated
 *     through MENU_ITEM_IDS server-side, so an unknown slug is a 400 here rather
 *     than a mismatch inside the RPC.
 *  3. There is no partial success. If the order RPC, the Razorpay call, or the
 *     payments row fails, the response is non-2xx. Previously a failed RPC fell
 *     through to a path that computed the total from client-supplied `item.price`,
 *     invented an `orderId` that was never inserted, charged that amount through
 *     the real Razorpay API, and still answered `{success: true}`.
 */

/** Defence in depth against a cart crafted to be absurd. */
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
    const body = await req.json();
    const { customer_name, customer_phone, items, idempotency_key } = body;

    if (!customer_name || typeof customer_name !== "string" || !customer_name.trim()) {
      return NextResponse.json({ success: false, error: "Customer name is required" }, { status: 400 });
    }

    const phone = typeof customer_phone === "string" ? customer_phone.trim() : "";
    if (!/^[0-9]{10,13}$/.test(phone.replace(/\D/g, ""))) {
      return NextResponse.json(
        { success: false, error: "Valid customer phone number is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Cart cannot be empty" }, { status: 400 });
    }

    if (items.length > MAX_DISTINCT_ITEMS) {
      return NextResponse.json({ success: false, error: "Too many items in cart" }, { status: 400 });
    }

    // Translate slug -> menu_items UUID and validate quantity. Anything the
    // catalog does not know about is rejected here; price is ignored entirely.
    const rpcItems: { menu_item_id: string; quantity: number }[] = [];
    for (const raw of items as IncomingItem[]) {
      const slug = typeof raw?.id === "string" ? raw.id : "";
      const uuid = menuItemUuid(slug);
      if (!uuid) {
        Logger.warn(
          "order.create.unknown_item",
          "order",
          { slug, requestId },
          requestId
        );
        return NextResponse.json(
          { success: false, error: "One or more items are no longer on the menu" },
          { status: 400 }
        );
      }

      const quantity = Number(raw?.quantity ?? 1);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
        return NextResponse.json(
          { success: false, error: `Quantity must be between 1 and ${MAX_QUANTITY_PER_ITEM}` },
          { status: 400 }
        );
      }

      rpcItems.push({ menu_item_id: uuid, quantity });
    }

    const clientKey = idempotency_key || crypto.randomUUID();

    // ---- Step 1: the order row. Authoritative pricing happens here. ----
    const supabase = createAdminClient();

    const { data: orderData, error: orderErr } = await supabase.rpc("create_order", {
      p_customer_name: customer_name.trim(),
      p_customer_phone: phone,
      p_items: rpcItems,
      p_idempotency_key: clientKey,
    });

    if (orderErr || !orderData?.[0]) {
      Logger.critical(
        "order.create.rpc_failed",
        "order",
        { error: orderErr?.message ?? "create_order returned no row", requestId },
        requestId,
        Date.now() - startedAt
      );
      return NextResponse.json(
        { success: false, error: "We could not place your order. Please try again." },
        { status: 502 }
      );
    }

    const { order_id: orderId, order_number: orderNumber } = orderData[0];
    const totalAmount = Number(orderData[0].total);

    if (!Number.isFinite(totalAmount) || totalAmount <= 0 || totalAmount > MAX_ORDER_VALUE_INR) {
      Logger.critical(
        "order.create.implausible_total",
        "order",
        { orderId, totalAmount, requestId },
        requestId
      );
      return NextResponse.json(
        { success: false, error: "We could not place your order. Please try again." },
        { status: 502 }
      );
    }

    // ---- Step 2: the Razorpay order, for the server-derived total only. ----
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      // Deliberately a hard failure, not a mock id. Returning a fabricated
      // razorpay_order_id would let the client open a checkout that can never
      // settle, and the order row would sit unpaid forever.
      Logger.critical(
        "order.create.razorpay_unconfigured",
        "payment",
        { orderId, requestId },
        requestId
      );
      return NextResponse.json(
        { success: false, error: "Online payment is temporarily unavailable." },
        { status: 503 }
      );
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
        Logger.critical(
          "order.create.razorpay_rejected",
          "payment",
          { orderId, status: rzpRes.status, detail: detail.slice(0, 500), requestId },
          requestId
        );
        return NextResponse.json(
          { success: false, error: "We could not start your payment. Please try again." },
          { status: 502 }
        );
      }

      const rzpOrder = await rzpRes.json();
      if (!rzpOrder?.id) throw new Error("Razorpay response contained no order id");
      razorpayOrderId = rzpOrder.id;
    } catch (rzpErr) {
      Logger.critical(
        "order.create.razorpay_exception",
        "payment",
        { orderId, error: rzpErr instanceof Error ? rzpErr.message : String(rzpErr), requestId },
        requestId
      );
      return NextResponse.json(
        { success: false, error: "We could not start your payment. Please try again." },
        { status: 502 }
      );
    }

    // ---- Step 3: the payments row. Without it the webhook cannot reconcile. ----
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
      // A Razorpay order now exists that we cannot reconcile on webhook. That is
      // exactly the case an on-call human must see.
      Logger.critical(
        "order.create.payment_row_failed",
        "payment",
        { orderId, razorpayOrderId, error: payErr.message, requestId },
        requestId
      );
      return NextResponse.json(
        { success: false, error: "We could not start your payment. Please try again." },
        { status: 502 }
      );
    }

    Logger.info(
      "order.create.succeeded",
      "order",
      { orderId, orderNumber, totalAmount, razorpayOrderId },
      requestId,
      Date.now() - startedAt
    );

    return NextResponse.json({
      success: true,
      order_id: orderId,
      order_number: orderNumber,
      total: totalAmount,
      razorpay_order_id: razorpayOrderId,
      key_id: keyId,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    Logger.critical("order.create.exception", "order", { error: errorMsg, requestId }, requestId);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
