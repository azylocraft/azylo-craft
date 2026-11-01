// Checks a discount code: active, date window, minimum subtotal (INR) and usage limit.
import { admin, cors, json, rateLimit, str } from "../_shared/util.ts";

export type Discount = {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  min_subtotal_inr: number;
  starts_at: string | null;
  ends_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
};

/** Shared with checkout: returns the discount amount in INR or a reason it does not apply. */
export function evaluate(d: Discount | null, subtotalInr: number, now = new Date()) {
  if (!d || !d.is_active) return { valid: false, message: "This code isn't valid." };
  if (d.starts_at && new Date(d.starts_at) > now) return { valid: false, message: "This code isn't active yet." };
  if (d.ends_at && new Date(d.ends_at) < now) return { valid: false, message: "This code has expired." };
  if (d.usage_limit != null && d.used_count >= d.usage_limit) return { valid: false, message: "This code has reached its usage limit." };
  if (subtotalInr < Number(d.min_subtotal_inr))
    return { valid: false, message: `This code needs a subtotal of at least ₹${Number(d.min_subtotal_inr).toLocaleString("en-IN")}.` };
  const raw = d.kind === "percent" ? (subtotalInr * Number(d.value)) / 100 : Number(d.value);
  return { valid: true, code: d.code, amountInr: Math.round(Math.min(raw, subtotalInr) * 100) / 100 };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const code = str(body.code, 40);
  const subtotal = Number(body.subtotalInr);
  if (!code) return json({ valid: false, message: "Enter a code." });
  if (!(await rateLimit(req, "discount", 30))) return json({ valid: false, message: "Too many attempts. Try again later." }, 429);

  const { data } = await admin().from("discounts").select("*").ilike("code", code).maybeSingle();
  return json(evaluate(data as Discount | null, Number.isFinite(subtotal) ? subtotal : 0));
});
