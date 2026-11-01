// Server-side order pricing. Every amount is recomputed from the database in INR;
// nothing the browser sends about prices is trusted.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export type LineInput = { variantId: string; quantity: number; customColor?: boolean; gift?: string };
export type Address = {
  first_name: string; last_name: string; line1: string; line2?: string | null; city: string;
  province?: string | null; postal_code: string; country: string; phone?: string | null;
};

const round = (n: number) => Math.round(n * 100) / 100;
export const IN_PIN = /^[1-9]\d{5}$/;

export function validateAddress(a: Partial<Address> | undefined): Record<string, string> {
  const e: Record<string, string> = {};
  if (!a) return { address: "required" };
  for (const k of ["first_name", "last_name", "line1", "city", "postal_code", "country"] as const)
    if (!String(a[k] ?? "").trim()) e[k] = "required";
  if (a.postal_code && !IN_PIN.test(String(a.postal_code).trim())) e.postal_code = "format";
  if (!a.province) e.province = "required";
  return e;
}

export async function priceCart(db: SupabaseClient, lines: LineInput[], opts: { country?: string; province?: string | null; discountCode?: string | null; shippingCode?: string }) {
  const clean = lines
    .filter((l) => typeof l.variantId === "string" && /^[0-9a-f-]{36}$/i.test(l.variantId))
    .map((l) => ({ ...l, quantity: Math.max(1, Math.min(10, Math.floor(Number(l.quantity) || 1))) }));
  if (!clean.length) return { error: "Your cart is empty." } as const;

  const { data: variants, error } = await db
    .from("product_variants")
    .select("id, model_en, color_en, price_inr, stock, is_active, products ( id, name_en, slug, is_published, free_gift_enabled, product_images ( storage_path, sort_order ) )")
    .in("id", clean.map((l) => l.variantId));
  if (error) return { error: error.message } as const;

  const items = [];
  for (const l of clean) {
    // deno-lint-ignore no-explicit-any
    const v: any = variants?.find((x) => x.id === l.variantId);
    if (!v || !v.is_active || !v.products?.is_published) return { error: "An item in your cart is no longer available." } as const;
    if (v.price_inr == null) return { error: `${v.products.name_en}: this option can't be ordered yet.` } as const;
    if (v.stock != null && v.stock < l.quantity) return { error: `${v.products.name_en}: only ${v.stock} left in this option.` } as const;
    const img = [...(v.products.product_images ?? [])].sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)[0];
    items.push({
      product_id: v.products.id, variant_id: v.id, product_name: v.products.name_en ?? v.products.slug,
      variant_label: [v.color_en, v.model_en].filter(Boolean).join(" / ") + (l.customColor ? " · Custom color" : ""),
      image_path: img?.storage_path ?? null, unit_price_inr: Number(v.price_inr), quantity: l.quantity, custom_color: !!l.customColor, is_gift: false,
    });
  }
  const subtotal = round(items.reduce((s, i) => s + i.unit_price_inr * i.quantity, 0));

  // Discount
  let discount = 0;
  let discountCode: string | null = null;
  let discountMessage: string | null = null;
  if (opts.discountCode) {
    const { data: d } = await db.from("discounts").select("*").ilike("code", opts.discountCode.trim()).maybeSingle();
    const now = new Date();
    if (!d || !d.is_active) discountMessage = "This code isn't valid.";
    else if (d.starts_at && new Date(d.starts_at) > now) discountMessage = "This code isn't active yet.";
    else if (d.ends_at && new Date(d.ends_at) < now) discountMessage = "This code has expired.";
    else if (d.usage_limit != null && d.used_count >= d.usage_limit) discountMessage = "This code has reached its usage limit.";
    else if (subtotal < Number(d.min_subtotal_inr)) discountMessage = `This code needs a subtotal of at least ₹${Number(d.min_subtotal_inr).toLocaleString("en-IN")}.`;
    else {
      discount = round(Math.min(d.kind === "percent" ? (subtotal * Number(d.value)) / 100 : Number(d.value), subtotal));
      discountCode = d.code;
    }
  }

  // Shipping (methods from store_settings; free standard delivery by default)
  const { data: settings } = await db.from("store_settings").select("shipping_methods, bundle_min_items, bundle_percent, bundle_tiers, free_gifts").eq("id", 1).maybeSingle();
  const methods: { code: string; label_en?: string; price_inr: number; days_min?: number; days_max?: number }[] =
    settings?.shipping_methods?.length ? settings.shipping_methods : [{ code: "standard", label_en: "Free standard delivery", price_inr: 0 }];
  // Free gift with purchase: one chosen gift per piece on eligible products, added as a ₹0 line.
  const gifts: { key: string; title: string; image_path?: string | null }[] = Array.isArray(settings?.free_gifts) ? settings.free_gifts : [];
  for (const l of clean) {
    if (!l.gift) continue;
    const gift = gifts.find((g) => g.key === l.gift);
    // deno-lint-ignore no-explicit-any
    const v: any = variants?.find((x) => x.id === l.variantId);
    if (!gift || !v || v.products?.free_gift_enabled === false) continue;
    items.push({
      product_id: v.products.id, variant_id: null as unknown as string, product_name: `Free gift: ${gift.title}`,
      variant_label: `With ${v.products.name_en ?? v.products.slug}`, image_path: gift.image_path ?? null,
      unit_price_inr: 0, quantity: l.quantity, custom_color: false, is_gift: true,
    } as (typeof items)[number]);
  }

  const method = methods.find((m) => m.code === opts.shippingCode) ?? methods[0];
  const shipping = round(Number(method.price_inr) || 0);

  // Prices are inclusive of GST, so no tax is added on top.
  const taxBreakdown: { label: string; rate: number; amount: number }[] = [];
  const tax = 0;
  // Bundle offer: buy N or more pieces, get X% off the subtotal (on top of a discount code, capped at the subtotal).
  const pieces = items.filter((i) => !i.is_gift).reduce((n, i) => n + i.quantity, 0);
  // Tiered quantity discount ("buy more, save more"): the highest tier whose minimum is met.
  const tiers: { min: number; pct: number }[] = Array.isArray(settings?.bundle_tiers) && settings.bundle_tiers.length
    ? settings.bundle_tiers
    : [{ min: Number(settings?.bundle_min_items ?? 2), pct: Number(settings?.bundle_percent ?? 0) }];
  const tier = tiers.filter((t) => pieces >= Number(t.min) && Number(t.pct) > 0).sort((a, b) => Number(b.pct) - Number(a.pct))[0];
  const bundlePct = tier ? Number(tier.pct) : 0;
  const bundleDiscount = bundlePct > 0 ? round(Math.min((subtotal * bundlePct) / 100, subtotal - discount)) : 0;
  discount = round(discount + bundleDiscount);
  const total = round(subtotal - discount + shipping + tax);

  return {
    items, subtotal, discount, bundleDiscount, bundlePercent: bundleDiscount > 0 ? bundlePct : 0, discountCode, discountMessage, shipping, shippingMethod: method, methods,
    tax, taxBreakdown, taxesIncluded: true, total, currency: "INR" as const,
  };
}
