import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, serviceRoleConfigStatus } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const secretKey = req.headers.get("x-health-key");
  const isDetailedAuthorized =
    !!process.env.HEALTH_CHECK_SECRET && secretKey === process.env.HEALTH_CHECK_SECRET;

  const serviceRoleStatus = serviceRoleConfigStatus();
  const razorpayConfigured =
    !!(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID) &&
    !!process.env.RAZORPAY_KEY_SECRET;

  let supabaseOk = false;
  let deadLetterCount = 0;
  let stalePendingCount = 0;

  try {
    const supabase = createAdminClient();
    const { count: deadLetters, error: dlErr } = await supabase
      .from("webhook_events")
      .select("*", { count: "exact", head: true })
      .eq("state", "dead_letter");

    if (!dlErr) deadLetterCount = deadLetters ?? 0;

    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { count: staleOrders, error: stErr } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .lt("created_at", thirtyMinsAgo);

    if (!stErr) stalePendingCount = staleOrders ?? 0;

    supabaseOk = true;
  } catch {
    supabaseOk = false;
  }

  const isDegraded =
    !supabaseOk ||
    !serviceRoleStatus.ok ||
    !razorpayConfigured ||
    deadLetterCount > 5 ||
    stalePendingCount > 10;

  // Unauthenticated / Public Response: Zero system leakage
  if (!isDetailedAuthorized) {
    return NextResponse.json(
      { status: isDegraded ? "degraded" : "ok" },
      { status: isDegraded ? 503 : 200 }
    );
  }

  // Detailed Authenticated Response
  return NextResponse.json(
    {
      status: isDegraded ? "degraded" : "ok",
      timestamp: new Date().toISOString(),
      checks: {
        supabase_connected: supabaseOk,
        service_role_config: serviceRoleStatus,
        razorpay_configured: razorpayConfigured,
        dead_letter_webhooks: deadLetterCount,
        stale_pending_orders_gt_30m: stalePendingCount,
      },
    },
    { status: isDegraded ? 503 : 200 }
  );
}
