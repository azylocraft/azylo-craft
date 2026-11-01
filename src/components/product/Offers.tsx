"use client";

import clsx from "clsx";
import { BadgeCheck, CalendarCheck, CreditCard, Flame, Gift, Headset, Lock, ShieldCheck, Star, Truck, Users } from "lucide-react";
import { Price, useShopCtx } from "@/components/shop/ShopContext";
import { Eyebrow, H, P, Serif } from "@/components/ui/primitives";
import type { Bonus, Review } from "@/lib/types";

/**
 * Conversion helpers for the product page. Every claim shown here comes from real data:
 * bonuses/guarantee entered by the owner, real stock, real paid orders, real reviews.
 * No invented timers, viewer counts or stock numbers (CCPA Dark Patterns Guidelines, 2023).
 */

/** "Your offer": the price plus everything included, with the total value when values are set. */
export function OfferStack({ price, bonuses, guaranteeDays, guaranteeText }: { price: number | null; bonuses: Bonus[]; guaranteeDays: number | null; guaranteeText: string | null }) {
  if (price == null || (bonuses.length === 0 && !guaranteeDays)) return null;
  const extras = bonuses.reduce((s, b) => s + (Number(b.value_inr) || 0), 0);
  return (
    <div className="overflow-hidden rounded-tile border border-gold-line bg-white">
      <div className="flex items-center gap-2 border-b border-gold-line bg-gold-soft px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[.14em] text-gold">
        <Gift size={14} aria-hidden /> Your offer
      </div>
      <ul className="divide-y divide-line2 text-sm">
        <li className="flex items-center justify-between gap-3 px-4 py-2.5">
          <span className="font-bold">The piece, made to order for you</span>
          <Price cad={price} />
        </li>
        {bonuses.map((b) => (
          <li key={b.title} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="flex items-center gap-2">
              <BadgeCheck size={16} className="flex-none text-green" aria-hidden />
              {b.title}
            </span>
            <span className="flex-none text-right">
              {b.value_inr ? (
                <>
                  <s className="mr-1.5 text-faint">
                    <Price cad={Number(b.value_inr)} />
                  </s>
                  <b className="text-green">Included</b>
                </>
              ) : (
                <b className="text-green">Included</b>
              )}
            </span>
          </li>
        ))}
        {guaranteeDays ? (
          <li className="flex items-start gap-2 bg-green-soft px-4 py-3">
            <ShieldCheck size={18} className="mt-0.5 flex-none text-green" aria-hidden />
            <span>
              <b>{guaranteeDays}-day guarantee.</b> {guaranteeText ?? ""}
            </span>
          </li>
        ) : null}
      </ul>
      {extras > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-gold-line bg-gold-soft px-4 py-3 text-sm">
          <span>
            Total value <s className="text-faint"><Price cad={price + extras} /></s>
          </span>
          <span className="font-extrabold">
            You pay <Price cad={price} />
          </span>
        </div>
      )}
    </div>
  );
}

/** Real scarcity: shown only when the selected variant's tracked stock is low. */
export function LowStock({ stock }: { stock: number | null }) {
  const { settings } = useShopCtx();
  if (stock == null || stock <= 0 || stock > settings.lowStockThreshold) return null;
  return (
    <p className="flex items-center gap-2 text-sm font-bold text-red">
      <Flame size={16} aria-hidden /> Only {stock} left in this option
    </p>
  );
}

/** Real social proof from paid orders in the last 30 days (hidden below 3). */
export function RecentBuyers({ count }: { count: number }) {
  if (count < 3) return null;
  return (
    <p className="flex items-center gap-2 text-[13px] text-muted">
      <Users size={15} className="text-gold" aria-hidden /> <b className="text-ink">{count} people</b> ordered this in the last 30 days
    </p>
  );
}

/** Indicative monthly EMI (price ÷ months). Interest and eligibility depend on the customer's bank. */
export function EmiLine({ price }: { price: number | null }) {
  const { settings } = useShopCtx();
  if (price == null || price < 3000) return null;
  return (
    <p className="flex items-center gap-2 text-[13px] text-muted">
      <CreditCard size={15} className="text-gold" aria-hidden />
      EMI from <b className="text-ink"><Price cad={Math.ceil(price / settings.emiMonths)} />/month</b> for {settings.emiMonths} months
      <span className="text-faint">· before bank interest</span>
    </p>
  );
}

const TRUST = [
  [Lock, "Secure payments", "Razorpay · cards, UPI, netbanking, EMI"],
  [Truck, "Free delivery", "To your door across India"],
  [BadgeCheck, "GST invoice", "Prices include GST"],
  [CalendarCheck, "Made to order", "Built in your model and colour"],
  [Headset, "Real support", "Replies within 24–36 hours"],
] as const;

export function TrustBadges() {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {TRUST.map(([Icon, title, sub]) => (
        <li key={title} className="flex items-start gap-2.5 rounded-field border border-line2 bg-white p-3">
          <Icon size={18} className="mt-0.5 flex-none text-gold" aria-hidden />
          <span>
            <b className="block text-[13px]">{title}</b>
            <span className="text-[11.5px] leading-snug text-muted">{sub}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? "fill-gold text-gold" : "text-line"} aria-hidden />
      ))}
    </span>
  );
}

/** Customer reviews (published reviews only). */
export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <section id="reviews" className="scroll-mt-40 px-4 pt-16 md:px-12 md:pt-24">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-3">
          <Eyebrow>Customer experiences</Eyebrow>
          <H className="text-[30px] md:text-[44px]">
            What owners <Serif gold>say.</Serif>
          </H>
        </div>
        <div className="flex items-center gap-3 rounded-tile border border-line2 bg-white px-5 py-3">
          <span className="text-3xl font-extrabold">{avg.toFixed(1)}</span>
          <span>
            <Stars value={avg} />
            <span className="text-xs text-muted">
              {reviews.length} review{reviews.length > 1 ? "s" : ""}
            </span>
          </span>
        </div>
      </div>
      <ul className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 rounded-card border border-line2 bg-white p-5">
            <Stars value={r.rating} />
            {r.title && <b>{r.title}</b>}
            {r.body && <P className="text-sm">{r.body}</P>}
            <span className="mt-auto text-xs text-faint">
              {r.author ?? "Verified customer"} · {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function BundleHint() {
  const { settings } = useShopCtx();
  if (!settings.bundlePercent) return null;
  return (
    <p className={clsx("flex items-center gap-2 rounded-field border border-dashed border-gold-line bg-gold-soft/60 px-3 py-2 text-[13px]")}>
      <Gift size={15} className="text-gold" aria-hidden />
      Buy {settings.bundleMinItems} or more pieces and get <b>{settings.bundlePercent}% off</b> your order — applied automatically at checkout.
    </p>
  );
}
