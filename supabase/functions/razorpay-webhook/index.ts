// Razorpay webhook (source of truth): order.paid / payment.captured → mark the order paid.
// Configure in Razorpay Dashboard → Webhooks with the RAZORPAY_WEBHOOK_SECRET value.
import { json } from "../_shared/util.ts";
import { finalizeOrder, hmacHex, safeEqual } from "../_shared/orders.ts";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const raw = await req.text();
  const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") ?? "";
  const sig = req.headers.get("x-razorpay-signature") ?? "";
  if (!secret || !safeEqual(await hmacHex(secret, raw), sig)) return json({ error: "bad signature" }, 400);

  const event = JSON.parse(raw);
  const payment = event?.payload?.payment?.entity;
  const orderId = event?.payload?.order?.entity?.id ?? payment?.order_id;
  if ((event.event === "order.paid" || event.event === "payment.captured") && orderId && payment?.id) {
    const r = await finalizeOrder(orderId, payment.id);
    return json({ ok: true, already: r.already });
  }
  return json({ ok: true, ignored: event.event });
});
