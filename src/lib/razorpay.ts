"use client";

/* Razorpay Standard Checkout (checkout.js) loader and typed wrapper. */

type Success = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type Failure = { error: { description?: string; reason?: string } };
type RazorpayInstance = { open: () => void; on: (ev: "payment.failed", cb: (r: Failure) => void) => void };
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

let loading: Promise<void> | null = null;
export function loadRazorpay() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.Razorpay) return Promise.resolve();
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error("Couldn't load the payment window. Check your connection and try again."));
    };
    document.body.appendChild(s);
  });
  return loading;
}

/** Opens the Razorpay modal; resolves with the signed payment, or rejects with the shopper-facing reason. */
export async function payWithRazorpay(opts: {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderNumber: number;
  prefill: { name?: string; email?: string; contact?: string };
}): Promise<Success> {
  await loadRazorpay();
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay!({
      key: opts.keyId,
      order_id: opts.razorpayOrderId,
      amount: opts.amount,
      currency: opts.currency,
      name: "AZYLO",
      description: `Order #${opts.orderNumber}`,
      prefill: opts.prefill,
      theme: { color: "#151412" },
      // Show UPI, then credit and debit cards as separate options, then the rest.
      config: {
        display: {
          blocks: {
            upi: { name: "Pay using UPI", instruments: [{ method: "upi" }] },
            credit: { name: "Credit card", instruments: [{ method: "card", types: ["credit"] }] },
            debit: { name: "Debit card", instruments: [{ method: "card", types: ["debit"] }] },
          },
          sequence: ["block.upi", "block.credit", "block.debit"],
          hide: [{ method: "card" }],
          preferences: { show_default_blocks: true },
        },
      },
      handler: (r: Success) => resolve(r),
      modal: { ondismiss: () => reject(new Error("dismissed")) },
    });
    rzp.on("payment.failed", (r) => reject(new Error(r.error?.description || "The payment was declined.")));
    rzp.open();
  });
}
