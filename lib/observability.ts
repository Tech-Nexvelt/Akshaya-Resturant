/**
 * Unified Enterprise Fintech-Grade Observability & Monitoring Infrastructure.
 * Provides end-to-end trace-id propagation, alert rate-limiting/fatigue prevention,
 * and structured JSON logging.
 */

export type LogSeverity = "info" | "warning" | "critical";

export interface LogContext {
  action: string;
  entityType: string;
  entityId?: string;
  severity?: LogSeverity;
  metadata?: Record<string, unknown>;
  requestId?: string;
  actorId?: string;
  durationMs?: number;
}

interface AlertThrottleRecord {
  count: number;
  firstSeenAt: number;
  lastAlertedAt: number;
}

export class Logger {
  private static alertThrottleMap = new Map<string, AlertThrottleRecord>();
  private static readonly MAX_ALERTS_PER_WINDOW = 5;
  private static readonly THROTTLE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Emits a standardized JSON log entry to stdout/stderr and dispatches alert hooks with fatigue protection.
   */
  static log(context: LogContext) {
    const timestamp = new Date().toISOString();
    const severity = context.severity || "info";
    const requestId = context.requestId || "req_untraced";

    const logEntry = {
      timestamp,
      trace_id: requestId,
      severity,
      action: context.action,
      entity_type: context.entityType,
      entity_id: context.entityId,
      actor_id: context.actorId,
      duration_ms: context.durationMs,
      metadata: context.metadata || {},
    };

    const formattedLog = JSON.stringify(logEntry);

    switch (severity) {
      case "critical":
        console.error(`[CRITICAL] ${formattedLog}`);
        this.notifyAlertChannelWithThrottling(logEntry);
        break;
      case "warning":
        console.warn(`[WARNING] ${formattedLog}`);
        break;
      default:
        console.log(`[INFO] ${formattedLog}`);
        break;
    }
  }

  static info(action: string, entityType: string, metadata?: Record<string, unknown>, requestId?: string, durationMs?: number) {
    this.log({ action, entityType, severity: "info", metadata, requestId, durationMs });
  }

  static warn(action: string, entityType: string, metadata?: Record<string, unknown>, requestId?: string, durationMs?: number) {
    this.log({ action, entityType, severity: "warning", metadata, requestId, durationMs });
  }

  static critical(action: string, entityType: string, metadata?: Record<string, unknown>, requestId?: string, durationMs?: number) {
    this.log({ action, entityType, severity: "critical", metadata, requestId, durationMs });
  }

  /**
   * Alert Fatigue Protection: Throttles identical critical alerts to prevent on-call alert storms.
   * Allows max 5 alerts per 5-minute sliding window per alert fingerprint key.
   */
  private static notifyAlertChannelWithThrottling(logEntry: Record<string, unknown>) {
    const alertKey = `${logEntry.action}:${logEntry.entity_type}:${logEntry.entity_id || "none"}`;
    const now = Date.now();

    let record = this.alertThrottleMap.get(alertKey);

    if (!record || now - record.firstSeenAt > this.THROTTLE_WINDOW_MS) {
      record = { count: 1, firstSeenAt: now, lastAlertedAt: now };
      this.alertThrottleMap.set(alertKey, record);
    } else {
      record.count += 1;
    }

    // Suppress dispatch if threshold is exceeded in current window
    if (record.count > this.MAX_ALERTS_PER_WINDOW) {
      console.warn(
        `[ALERT_SUPPRESSED] Alert key '${alertKey}' exceeded threshold (${record.count}/${this.MAX_ALERTS_PER_WINDOW} in 5m). Suppressing notification.`
      );
      return;
    }

    if (process.env.NODE_ENV === "production" && process.env.ALERT_WEBHOOK_URL) {
      const isThrottlingWarning = record.count === this.MAX_ALERTS_PER_WINDOW;
      const countNote = isThrottlingWarning ? "\n⚠️ *Note: Rate limit reached. Further identical alerts in 5m will be grouped.*" : "";

      fetch(process.env.ALERT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `🚨 *CRITICAL SYSTEM ALERT* 🚨\n*Action:* ${logEntry.action}\n*Trace ID:* \`${logEntry.trace_id}\`\n*Entity:* ${logEntry.entity_type} (${logEntry.entity_id || "N/A"})\n*Count (5m window):* ${record.count}/${this.MAX_ALERTS_PER_WINDOW}${countNote}\n\`\`\`${JSON.stringify(logEntry.metadata, null, 2)}\`\`\``,
        }),
      }).catch((err) => {
        console.error("Failed to send critical alert notification:", err);
      });
    }
  }
}
