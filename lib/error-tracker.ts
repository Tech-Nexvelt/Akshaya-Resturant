import { Logger } from "@/lib/observability";

export interface ErrorTrackerOptions {
  action: string;
  entityType: string;
  entityId?: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
}

export function captureSystemError(error: unknown, options: ErrorTrackerOptions) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  const requestId = options.requestId || "req_untraced";

  Logger.critical(
    options.action,
    options.entityType,
    {
      error: errorMessage,
      stack: errorStack,
      entityId: options.entityId,
      ...options.metadata,
    },
    requestId
  );

  // Wire Sentry tag if Sentry SDK is present
  if (typeof window !== "undefined" && (window as unknown as { Sentry?: { setTag: (k: string, v: string) => void; captureException: (e: unknown) => void } }).Sentry) {
    const Sentry = (window as unknown as { Sentry: { setTag: (k: string, v: string) => void; captureException: (e: unknown) => void } }).Sentry;
    Sentry.setTag("request_id", requestId);
    Sentry.captureException(error);
  }
}
