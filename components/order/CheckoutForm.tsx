"use client";

import { useState, useRef } from "react";
import { useCart, cartTotal } from "@/store/cart";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

interface CheckoutFormProps {
  onBack: () => void;
  onDone: () => void;
}

type CheckoutStep = "details" | "processing" | "success" | "failure";

export function CheckoutForm({ onBack, onDone }: CheckoutFormProps) {
  const { lines, clearCart, total } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<CheckoutStep>("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receiptDetails, setReceiptDetails] = useState<{
    orderNumber?: string;
    receiptNumber?: string;
    orderId?: string;
  }>({});

  // Client Idempotency Key (Guarantees single-submission protection)
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());
  const cartAmount = total();

  // Helper to load Razorpay script on demand
  function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Post to /api/orders/create (Backend recalculates prices & total)
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: phone,
          // The route reads `item.id` as the catalog SLUG (e.g. "chicken-biryani")
          // and translates it to a menu_items UUID itself via menuItemUuid() — see
          // app/api/orders/create/route.ts. Sending it under `menu_item_id` instead
          // left `raw.id` undefined server-side, so every real cart failed 400
          // "One or more items are no longer on the menu" (2026-08-23, live report).
          items: lines.map((l) => ({ id: l.id, quantity: l.quantity })),
          idempotency_key: idempotencyKeyRef.current,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Order creation failed");
      }

      setReceiptDetails((prev) => ({ ...prev, orderId: data.order_id, orderNumber: data.order_number }));

      // 2. Load Razorpay Checkout Script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        // Fallback for offline or blocked script
        throw new Error("Could not load payment gateway checkout SDK.");
      }

      // 3. Configure & Open Razorpay Modal
      const options = {
        key: data.key_id,
        amount: Math.round(data.total * 100),
        currency: "INR",
        name: "Akshaya Restaurant",
        description: `Order #${data.order_number}`,
        order_id: data.razorpay_order_id,
        prefill: {
          name,
          contact: phone,
        },
        theme: {
          color: "#f59e0b",
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setStep("processing");

          // 4. Verify Payment Fallback with Server
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                order_id: data.order_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              setReceiptDetails({
                orderId: data.order_id,
                orderNumber: data.order_number,
                receiptNumber: verifyData.receipt_number,
              });
              setStep("success");
              clearCart();
            } else {
              throw new Error(verifyData.error || "Payment verification failed");
            }
          } catch (vErr: unknown) {
            const msg = vErr instanceof Error ? vErr.message : String(vErr);
            setErrorMsg(msg);
            setStep("failure");
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response: { error: { description: string } }) {
        setErrorMsg(response.error.description || "Payment was declined by payment gateway.");
        setStep("failure");
        setIsSubmitting(false);
      });

      paymentObject.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setStep("failure");
      setIsSubmitting(false);
    }
  }

  function handleRetry() {
    // Generate new idempotency key for retry attempt
    idempotencyKeyRef.current = crypto.randomUUID();
    setErrorMsg(null);
    setStep("details");
    setIsSubmitting(false);
  }

  // --- STEP RENDERERS ---

  if (step === "processing") {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
        <RefreshCw className="w-12 h-12 text-[#2563EB] animate-spin" />
        <h3 className="font-display text-2xl text-[#111827]">Verifying Payment...</h3>
        <p className="max-w-xs text-xs text-[#6B7280]">
          Reconciling payment with bank. Please do not close or refresh this drawer.
        </p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h3 className="font-display text-2xl text-[#111827]">Order Confirmed!</h3>
        <div className="space-y-1 text-xs text-[#6B7280]">
          <p>Order Number: <span className="font-mono text-[#111827] font-bold">{receiptDetails.orderNumber}</span></p>
          {receiptDetails.receiptNumber && (
            <p>Receipt Number: <span className="font-mono text-[#1D4ED8] font-bold">{receiptDetails.receiptNumber}</span></p>
          )}
        </div>
        <p className="max-w-xs text-xs text-[#6B7280] pt-2">
          Your payment was successfully processed. Kitchen is preparing your order.
        </p>
        <button
          onClick={onDone}
          className="mt-4 rounded-full bg-[#2563EB] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition-transform hover:scale-105"
        >
          Done & Close
        </button>
      </div>
    );
  }

  if (step === "failure") {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h3 className="font-display text-2xl text-[#111827]">Payment Failed</h3>
        <p className="max-w-xs text-xs text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
          {errorMsg || "Transaction could not be completed. Please try again."}
        </p>
        <div className="flex flex-col xs:flex-row gap-3 pt-2">
          <button
            onClick={onBack}
            className="rounded-full border border-[#E5E7EB] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-[#111827]"
          >
            Cancel
          </button>
          <button
            onClick={handleRetry}
            className="rounded-full bg-[#2563EB] px-6 py-3 text-xs font-bold uppercase tracking-[0.15em] text-white transition-transform hover:scale-105"
          >
            Retry Payment
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="text-xs uppercase tracking-[0.2em] text-[#6B7280] hover:text-[#1D4ED8]"
        >
          &larr; Back to cart
        </button>

        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3 h-3" /> Idempotent Checkout
        </span>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#6B7280]">Full Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-base text-[#111827] placeholder:text-[#6B7280] focus:border-[#2563EB] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#6B7280]">Mobile Number (10 digits)</label>
          <input
            required
            type="tel"
            pattern="[0-9]{10,13}"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 9876543210"
            className="w-full rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-4 py-3 text-base text-[#111827] placeholder:text-[#6B7280] focus:border-[#2563EB] focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-4 text-sm">
        <span className="text-[#6B7280]">Order Total</span>
        <span className="font-display text-xl text-[#1D4ED8] tabular-nums">
          {formatCurrency(cartAmount)}
        </span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`rounded-full px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-all ${
          isSubmitting
            ? "bg-[#2563EB]/50 cursor-not-allowed"
            : "bg-[#2563EB] hover:scale-[1.02] shadow-md"
        }`}
      >
        {isSubmitting ? "Initiating Gateway..." : "Pay via UPI / Razorpay"}
      </button>
    </form>
  );
}
