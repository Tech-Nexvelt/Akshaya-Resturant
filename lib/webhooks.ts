/**
 * Outbound webhook dispatcher interface for POS, CRM, and WhatsApp notification integration.
 */

export interface WebhookPayload<T = Record<string, unknown>> {
  event: "order.created" | "banquet.enquiry" | "catering.enquiry" | "payment.success";
  timestamp: string;
  data: T;
}

export async function dispatchWebhook<T extends Record<string, unknown>>(
  event: WebhookPayload<T>["event"],
  data: T
): Promise<boolean> {
  const webhookUrl = process.env.DISPATCH_WEBHOOK_URL;
  if (!webhookUrl) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(`[Webhook Simulated] ${event}`, data);
    }
    return true;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Akshaya-Event": event,
      },
      body: JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data,
      }),
    });

    return response.ok;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`[Webhook Error] Failed to dispatch ${event}`, error);
    return false;
  }
}
