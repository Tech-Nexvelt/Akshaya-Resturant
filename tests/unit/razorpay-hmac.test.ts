import { describe, it, expect } from "vitest";
import crypto from "crypto";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || typeof signature !== "string") return false;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const expectedBuf = Buffer.from(expectedSignature, "utf-8");
  const receivedBuf = Buffer.from(signature, "utf-8");

  // Length-guard precheck prevents timingSafeEqual crash
  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

describe("Razorpay HMAC Signature Verification", () => {
  const secret = "test_webhook_secret_123";
  const payload = JSON.stringify({ event: "payment.captured", id: "pay_123" });
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  it("should return true for valid HMAC signature", () => {
    expect(verifySignature(payload, validSignature, secret)).toBe(true);
  });

  it("should return false for invalid signature of correct length", () => {
    const invalidSignature = "a".repeat(64);
    expect(verifySignature(payload, invalidSignature, secret)).toBe(false);
  });

  it("should return false gracefully for malformed signature of wrong length", () => {
    const malformedShortSignature = "abc123short";
    expect(verifySignature(payload, malformedShortSignature, secret)).toBe(false);
  });

  it("should return false for empty or missing signature", () => {
    expect(verifySignature(payload, "", secret)).toBe(false);
  });
});
