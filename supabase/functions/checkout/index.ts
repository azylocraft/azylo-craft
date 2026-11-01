// Checkout API. Actions:
//   quote  — recompute totals for the summary panel (no side effects)
//   create — create the pending order + a Razorpay order (amount computed here, in INR)
//   verify — check Razorpay's payment signature and mark the order paid
//   status — confirmation page polling (needs order id + razorpay order id)
import { admin, cors, isEmail, json, rateLimit, str, userId } from "../_shared/util.ts";
import { finalizeOrder, hmacHex, safeEqual } from "../_shared/orders.ts";
import { priceCart, validateAddress, type Address, type LineInput } from "../_shared/pricing.ts";

const KEY_ID = () => Deno.env.get("RAZORPAY_KEY_ID") ?? "";
const KEY_SECRET = () => Deno.env.get("RAZORPAY_KEY_SECRET") ?? "";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const db = admin();
  const action = String(body.action ?? "");

  if (action === "quote") {
    const a = (body.address ?? {}) as Partial<Address>;
    const q = await priceCart(db, (body.items ?? []) as LineInput[], { country: a.country, province: a.province, discountCode: str(body.discountCode, 40) || null, shippingCode: str(body.shippingCode, 40) });
    return json(q);
  }

  if (action === "create") {
    if (!(await rateLimit(req, "checkout", 20))) return json({ error: "Too many attempts. Please wait a moment." }, 429);
    const email = str(body.email, 254);
    const address = body.address as Address;
    const errors: Record<string, string> = { ...validateAddress(address) };
    if (!isEmail(email)) errors.email = "invalid";
    if (body.billingAddress) Object.assign(errors, Object.fromEntries(Object.entries(validateAddress(body.billingAddress)).map(([k, v]) => [`billing_${k}`, v])));
    if (Object.keys(errors).length) return json({ error: "validation", fields: errors }, 422);
    if (!KEY_ID() || !KEY_SECRET()) return json({ error: "Payments aren't configured yet (Razorpay keys missing)." }, 503);

    const q = await priceCart(db, body.items ?? [], { country: address.country, province: address.province, discountCode: str(body.discountCode, 40) || null, shippingCode: str(body.shippingCode, 40) });
    if ("error" in q) return json({ error: q.error }, 409);

    const { data: order, error } = await db
      .from("orders")
      .insert({
        user_id: await userId(req), email, status: "pending", currency: "INR",
        subtotal_inr: q.subtotal, discount_inr: q.discount, shipping_inr: q.shipping, tax_inr: q.tax, total_inr: q.total,
        tax_breakdown: q.taxBreakdown, discount_code: q.discountCode, shipping_method: q.shippingMethod.code,
        shipping_address: address, billing_address: body.billingAddress ?? null, note: str(body.note, 500) || null,
        marketing_opt_in: body.marketingOptIn === true,
      })
      .select("id, order_number")
      .single();
    if (error) return json({ error: "Couldn't create the order." }, 500);
    await db.from("order_items").insert(q.items.map((i) => ({ ...i, order_id: order.id })));

    const rp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { Authorization: `Basic ${btoa(`${KEY_ID()}:${KEY_SECRET()}`)}`, "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(q.total * 100), currency: "INR", receipt: `azylo-${order.order_number}`, notes: { order_id: order.id } }),
    });
    const rj = await rp.json();
    if (!rp.ok) {
      await db.from("orders").update({ status: "cancelled" }).eq("id", order.id);
      console.error("razorpay order failed", rj?.error);
      return json({ error: rj?.error?.description ? `Payment provider: ${rj.error.description}` : "Payment provider unavailable." }, 502);
    }
    await db.from("orders").update({ razorpay_order_id: rj.id }).eq("id", order.id);
    return json({ orderId: order.id, orderNumber: order.order_number, razorpayOrderId: rj.id, amount: rj.amount, currency: rj.currency, keyId: KEY_ID(), total: q.total });
  }

  if (action === "verify") {
    const oid = str(body.razorpay_order_id, 64);
    const pid = str(body.razorpay_payment_id, 64);
    const sig = str(body.razorpay_signature, 128);
    if (!oid || !pid || !sig) return json({ error: "Missing payment details." }, 400);
    const expected = await hmacHex(KEY_SECRET(), `${oid}|${pid}`);
    if (!safeEqual(expected, sig)) return json({ error: "Payment signature didn't match." }, 400);
    await finalizeOrder(oid, pid);
    const { data } = await db.from("orders").select("id, order_number, status").eq("razorpay_order_id", oid).maybeSingle();
    return json({ ok: true, ...data });
  }

  if (action === "status") {
    const { data } = await db
      .from("orders")
      .select("id, order_number, status, email, total_inr, subtotal_inr, discount_inr, shipping_inr, tax_inr, shipping_address, order_items ( product_name, variant_label, quantity, unit_price_inr, image_path )")
      .eq("id", str(body.orderId, 64))
      .eq("razorpay_order_id", str(body.razorpayOrderId, 64))
      .maybeSingle();
    return data ? json(data) : json({ error: "not_found" }, 404);
  }

  return json({ error: "Unknown action" }, 400);
});
