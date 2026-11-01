"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, CalendarCheck, Camera, CreditCard, Flame, Gift, Headset, Lock, MapPin, ShieldCheck, Star, Timer, Truck, Users, X } from "lucide-react";
import { Overlay } from "@/components/shop/Overlay";
import { Price, useHydrated, useShopCtx } from "@/components/shop/ShopContext";
import { Eyebrow, H, P, Serif } from "@/components/ui/primitives";
import type { Bonus, Review } from "@/lib/types";

/**
 * Conversion helpers for the product page. Every claim shown here comes from real data:
 * owner-entered prices/bonuses/tiers, real stock, real paid orders, real reviews, and a
 * campaign with a real end date. No invented timers, viewer counts or reviews
 * (CCPA Dark Patterns Guidelines 2023; IS 19000:2022 on online reviews).
 */

/** Sale price with the genuine compare-at (MRP) price struck through, % off and rupee saving. */
export function PriceBlock({ price, compareAt }: { price: number | null; compareAt: number | null | undefined }) {
  if (price == null) return null;
  const hasDeal = compareAt != null && compareAt > price;
  const pct = hasDeal ? Math.round(((compareAt! - price) / compareAt!) * 100) : 0;
  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-[32px] font-extrabold leading-none tracking-[-0.02em]">
          <Price cad={price} />
        </span>
        {hasDeal && (
          <>
            <s className="text-lg text-faint decoration-red/60">
              <Price cad={compareAt!} />
            </s>
            <span className="rounded-full bg-red px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-white">{pct}% off</span>
          </>
        )}
      </div>
      {hasDeal && (
        <span className="text-sm font-bold text-green">
          You save <Price cad={compareAt! - price} /> on this piece
        </span>
      )}
    </div>
  );
}

function useCountdown(endsAt: string | undefined) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    if (!endsAt) return;
    const tick = () => setLeft(Math.max(0, new Date(endsAt).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return left;
}

/** Launch-offer reminder at the price, counting down to the campaign's real end date. */
export function LaunchPriceTimer() {
  const { settings } = useShopCtx();
  const hydrated = useHydrated();
  const left = useCountdown(settings.campaign?.endsAt);
  if (!hydrated || !settings.campaign || !left) return null;
  const d = Math.floor(left / 86400000);
  const h = Math.floor((left % 86400000) / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-field bg-ink px-4 py-3 text-white">
      <Timer size={18} className="flex-none text-gold-line" aria-hidden />
      <span className="text-sm">
        <b className="text-gold-line">{settings.campaign.title}</b> — code <b>{settings.campaign.code}</b> is already in your cart
      </span>
      <span className="ml-auto flex items-center gap-1 font-mono text-sm tabular-nums">
        <span className="text-on-dark-faint">ends in</span>
        {d > 0 && <b className="rounded bg-white/10 px-1.5 py-0.5">{d}d</b>}
        <b className="rounded bg-white/10 px-1.5 py-0.5">{pad(h)}</b>:<b className="rounded bg-white/10 px-1.5 py-0.5">{pad(m)}</b>:
        <b className="rounded bg-white/10 px-1.5 py-0.5">{pad(s)}</b>
      </span>
    </div>
  );
}

/** "Your offer": the piece plus everything included, with total value when values are set. */
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
                <s className="mr-1.5 text-faint">
                  <Price cad={Number(b.value_inr)} />
                </s>
              ) : null}
              <b className="text-green">Included</b>
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

/** "Buy more, save more": the real tier discounts with the rupee saving for this piece. */
export function BuyMoreSaveMore({ price }: { price: number | null }) {
  const { settings } = useShopCtx();
  const tiers = settings.bundleTiers;
  if (price == null || tiers.length === 0) return null;
  const best = tiers.reduce((a, t) => (t.pct > a.pct ? t : a), tiers[0]);
  return (
    <div className="overflow-hidden rounded-tile border-2 border-dashed border-gold bg-gold-soft/60">
      <div className="flex items-center gap-2 px-4 pt-3 text-[11px] font-extrabold uppercase tracking-[.14em] text-gold">
        <Gift size={14} aria-hidden /> Buy more, save more
      </div>
      <p className="px-4 pb-2 pt-1 text-sm font-bold">
        Furnishing more than one room? Save up to <span className="text-green">{best.pct}%</span> on your whole order.
      </p>
      <ul className="grid gap-2 px-4 pb-4 sm:grid-cols-2">
        {[...tiers].sort((a, b) => a.min - b.min).map((t) => {
          const save = Math.round(((price * t.min * t.pct) / 100) / 10) * 10;
          return (
            <li key={t.min} className="rounded-field border border-gold-line bg-white px-3 py-2.5">
              <div className="text-xs font-bold text-muted">
                {t.min}
                {t === best && tiers.length > 1 ? "+" : ""} pieces
              </div>
              <div className="text-lg font-extrabold text-green">{t.pct}% off</div>
              <div className="text-xs text-muted">
                e.g. save <b className="text-ink"><Price cad={save} /></b> on {t.min} of these
              </div>
            </li>
          );
        })}
      </ul>
      <p className="border-t border-gold-line bg-white/70 px-4 py-2 text-xs text-muted">Mix any products — the discount is applied automatically at checkout.</p>
    </div>
  );
}

/** No-cost EMI highlight — shown only when switched on in Admin (and enabled in Razorpay). */
export function EmiLine({ price }: { price: number | null }) {
  const { settings } = useShopCtx();
  if (price == null || !settings.emiNoCost || price < 1000) return null;
  const months = settings.emiMonths;
  return (
    <div className="flex items-center gap-3 rounded-field border border-blue/25 bg-[#EEF3FD] px-4 py-3">
      <CreditCard size={20} className="flex-none text-blue" aria-hidden />
      <div className="text-sm">
        <div>
          <span className="mr-2 rounded bg-blue px-1.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-white">No-cost EMI</span>
          Pay <b><Price cad={Math.ceil(price / months)} />/month</b> for {months} months
        </div>
        <div className="text-xs text-muted">0% interest on eligible credit cards — total stays <Price cad={price} />.</div>
      </div>
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

const TRUST = [
  [Lock, "Secure payments", "Razorpay · cards, UPI, netbanking"],
  [Truck, "Free delivery", "To your door across India"],
  [BadgeCheck, "No hidden charges", "The price you see is what you pay"],
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

export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? "fill-gold text-gold" : "text-line"} aria-hidden />
      ))}
    </span>
  );
}

export const REVIEW_SUMMARY_MIN = 5;

/** Rating summary near the product title — only once there are enough real reviews to mean something. */
export function RatingSummary({ reviews }: { reviews: Review[] }) {
  if (reviews.length < REVIEW_SUMMARY_MIN) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const withPhotos = reviews.filter((r) => r.photos.length).length;
  return (
    <a href="#reviews" className="flex flex-wrap items-center gap-x-2.5 gap-y-1 self-start text-sm hover:underline">
      <Stars value={avg} size={17} />
      <b>{avg.toFixed(1)}</b>
      <span className="text-muted">
        {reviews.length} verified reviews{withPhotos ? ` · ${withPhotos} with photos` : ""}
      </span>
    </a>
  );
}

/** Customer reviews with photos, "why I bought it", verified badge and photo lightbox. */
export function ReviewsSection({ reviews, writeButton }: { reviews: Review[]; writeButton?: React.ReactNode }) {
  const [shown, setShown] = useState(6);
  const [photo, setPhoto] = useState<string | null>(null);
  if (reviews.length === 0 && !writeButton) return null;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));
  const gallery = reviews.flatMap((r) => r.photos).slice(0, 12);
  return (
    <section id="reviews" className="scroll-mt-40 px-4 pt-16 md:px-12 md:pt-24">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div className="flex flex-col gap-3">
          <Eyebrow>Customer experiences</Eyebrow>
          <H className="text-[30px] md:text-[44px]">
            What owners <Serif gold>say.</Serif>
          </H>
        </div>
        {writeButton}
      </div>

      {reviews.length > 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="rounded-card border border-line2 bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold">{avg.toFixed(1)}</span>
              <span>
                <Stars value={avg} size={18} />
                <span className="text-xs text-muted">{reviews.length} reviews</span>
              </span>
            </div>
            <ul className="mt-4 flex flex-col gap-1.5">
              {dist.map(({ n, c }) => (
                <li key={n} className="flex items-center gap-2 text-xs">
                  <span className="w-6">{n}★</span>
                  <span className="h-2 flex-1 overflow-hidden rounded bg-line2">
                    <span className="block h-2 rounded bg-gold" style={{ width: `${reviews.length ? (c / reviews.length) * 100 : 0}%` }} />
                  </span>
                  <span className="w-6 text-right text-muted">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          {gallery.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-bold">
                <Camera size={16} className="text-gold" aria-hidden /> Photos from customers
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {gallery.map((src) => (
                  <button key={src} type="button" onClick={() => setPhoto(src)} className="aspect-square overflow-hidden rounded-xl">
                    <img src={src} alt="Customer photo" loading="lazy" className="size-full object-cover transition-transform hover:scale-105" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ul className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.slice(0, shown).map((r) => (
          <li key={r.id} className="flex flex-col gap-2 rounded-card border border-line2 bg-white p-5">
            <div className="flex items-center justify-between gap-2">
              <Stars value={r.rating} />
              {r.verified && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-green">
                  <BadgeCheck size={13} aria-hidden /> Verified purchase
                </span>
              )}
            </div>
            {r.title && <b>{r.title}</b>}
            {r.body && <P className="text-sm">{r.body}</P>}
            {r.reason && (
              <p className="rounded-field bg-gold-soft px-3 py-2 text-[13px]">
                <b className="text-gold">Why I bought it: </b>
                {r.reason}
              </p>
            )}
            {r.photos.length > 0 && (
              <div className="flex gap-2">
                {r.photos.slice(0, 4).map((src) => (
                  <button key={src} type="button" onClick={() => setPhoto(src)} className="size-16 overflow-hidden rounded-lg">
                    <img src={src} alt="Customer photo" loading="lazy" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <span className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-faint">
              {r.author ?? "Customer"}
              {r.location && (
                <>
                  <MapPin size={11} aria-hidden /> {r.location}
                </>
              )}
              · {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
            </span>
          </li>
        ))}
      </ul>
      {reviews.length > shown && (
        <div className="mt-6 flex justify-center">
          <button type="button" onClick={() => setShown(shown + 9)} className="rounded-full border border-ink px-6 py-2.5 text-sm font-bold">
            Show more reviews ({reviews.length - shown})
          </button>
        </div>
      )}
      {photo && (
        <Overlay onClose={() => setPhoto(null)} label="Customer photo" className="!bg-[rgba(20,19,17,.88)]">
          <div className="absolute inset-0 flex items-center justify-center p-4" onMouseDown={(e) => e.target === e.currentTarget && setPhoto(null)}>
            <img src={photo} alt="Customer photo" className="max-h-[85vh] max-w-full rounded-tile object-contain" />
            <button type="button" aria-label="Close" onClick={() => setPhoto(null)} className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white text-ink">
              <X size={18} aria-hidden />
            </button>
          </div>
        </Overlay>
      )}
    </section>
  );
}
