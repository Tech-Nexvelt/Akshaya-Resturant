/**
 * Utility function to execute fetch calls or async promises with exponential backoff retries.
 * Used for network resilience across ordering, banquet booking, and payment processing.
 */

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 500,
    backoffFactor = 2,
    onRetry,
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error instanceof Error ? error : new Error(String(error));
      }

      if (onRetry) {
        onRetry(attempt, error instanceof Error ? error : new Error(String(error)));
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }

  throw new Error("Execution failed after maximum retries");
}
