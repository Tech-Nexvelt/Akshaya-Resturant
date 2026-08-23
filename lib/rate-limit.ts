/**
 * Serverless Rate Limiter Utility.
 * Integrates with Upstash Redis when env credentials are present,
 * with distributed sliding window rate limiting.
 */

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export async function checkRateLimit(
  identifier: string,
  requestsPerWindow: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      // @ts-ignore
      const { Ratelimit } = await import("@upstash/ratelimit");
      // @ts-ignore
      const { Redis } = await import("@upstash/redis");

      const redis = new Redis({ url, token });
      const limiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requestsPerWindow, `${windowSeconds} s`),
      });

      const res = await limiter.limit(identifier);
      return {
        success: res.success,
        remaining: res.remaining,
        reset: res.reset,
      };
    } catch (err) {
      console.warn("[RateLimit] Upstash Redis evaluation warning:", err);
    }
  }

  // Permissive fallback when Upstash Redis is not active
  return {
    success: true,
    remaining: requestsPerWindow,
    reset: Date.now() + windowSeconds * 1000,
  };
}
