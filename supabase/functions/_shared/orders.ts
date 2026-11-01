// Marks an order paid exactly once (called by verify-payment and the webhook).
import { admin, escapeHtml, sendEmail } from "./util.ts";

const enc = new TextEncoder();
export async function hmacHex(secret: string, message: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function finalizeOrder(razorpayOrderId: string, razorpayPaymentId: string) {
  const db = admin();
  // Atomic pending → paid transition makes this idempotent across verify + webhook.
  const { data: order } = await db
    .from("orders")
    .update({ status: "paid", razorpay_payment_id: razorpayPaymentId, paid_at: new Date().toISOString() })
    .eq("razorpay_order_id", razorpayOrderId)
    .eq("status", "pending")
    .select("*, order_items (*)")
    .maybeSingle();
  if (!order) return { already: true };

  for (const it of order.order_items) {
    if (!it.variant_id) continue;
    const { data: v } = await db.from("product_variants").select("stock").eq("id", it.variant_id).maybeSingle();
    if (v && v.stock != null) await db.from("product_variants").update({ stock: Math.max(0, v.stock - it.quantity) }).eq("id", it.variant_id);
  }
  if (order.discount_code) {
    const { data: d } = await db.from("discounts").select("id, used_count").ilike("code", order.discount_code).maybeSingle();
    if (d) await db.from("discounts").update({ used_count: d.used_count + 1 }).eq("id", d.id);
  }
  if (order.user_id) {
    const { data: cart } = await db.from("carts").select("id").eq("user_id", order.user_id).maybeSingle();
    if (cart) await db.from("cart_items").delete().eq("cart_id", cart.id);
  }
  if (order.marketing_opt_in) await db.from("newsletter_subscribers").upsert({ email: order.email, subscribed: true, source: "checkout" }, { onConflict: "email" });

  const rows = order.order_items
    .map((i: { product_name: string; variant_label: string; quantity: number; unit_price_cad: number }) =>
      `<tr><td>${escapeHtml(i.product_name)}<br><small>${escapeHtml(i.variant_label ?? "")}</small></td><td>×${i.quantity}</td><td align="right">$${(Number(i.unit_price_cad) * i.quantity).toFixed(2)}</td></tr>`)
    .join("");
  await sendEmail(
    order.email,
    `Your AZYLO order #${order.order_number} is confirmed`,
    `<h2>Thank you for your order.</h2><p>Order <b>#${order.order_number}</b> is confirmed. We'll email you when it ships.</p>
     <table width="100%" cellpadding="6">${rows}</table>
     <p><b>Total: $${Number(order.total_cad).toFixed(2)} CAD</b></p>`,
  );
  return { already: false, orderNumber: order.order_number };
}
