"use client";

import { Check, ExternalLink, Minus, Sparkles, TrendingDown } from "lucide-react";
import { Price, useLocale } from "@/components/shop/ShopContext";
import { Eyebrow, H, P, Serif } from "@/components/ui/primitives";
import type { Comparison } from "@/lib/types";

/** Compact line under the product price: savings vs the cheapest seller + link to the full table. */
export function PriceCompareHint({ price, comparisons }: { price: number | null; comparisons: Comparison[] }) {
  if (price == null || comparisons.length === 0) return null;
  const cheapest = comparisons.reduce((a, c) => (c.priceInr < a.priceInr ? c : a), comparisons[0]);
  const diff = cheapest.priceInr - price;

  if (diff <= 0)
    return (
      <a href="#compare" className="-mt-2 flex items-center gap-2 self-start text-[13px] text-muted underline hover:text-ink">
        Compared with {comparisons.length} other seller{comparisons.length > 1 ? "s" : ""} · See comparison ↓
      </a>
    );

  const pct = Math.round((diff / cheapest.priceInr) * 100);
  return (
    <a
      href="#compare"
      className="az-deal group relative -mt-1 flex w-full items-center gap-4 overflow-hidden rounded-tile border border-green/40 bg-[linear-gradient(120deg,var(--az-green-soft),#F3FAF5_55%,var(--az-gold-soft))] p-4 text-ink shadow-soft transition-transform hover:-translate-y-0.5 md:p-5"
    >
      <span className="flex size-12 flex-none items-center justify-center rounded-full bg-green text-white shadow-soft md:size-14">
        <Sparkles size={24} aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[11px] font-extrabold uppercase tracking-[.16em] text-green">Surprise · you save</span>
        <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="text-[26px] font-extrabold leading-none tracking-[-0.02em] text-green md:text-[30px]">
            <Price cad={diff} />
          </span>
          <span className="rounded-full bg-green px-2.5 py-1 text-xs font-extrabold text-white">{pct}% less</span>
        </span>
        <span className="text-[13px] text-muted">
          than {cheapest.seller} at <s className="decoration-red/70">{<Price cad={cheapest.priceInr} />}</s>
          <span className="ml-2 font-bold text-ink underline underline-offset-2 group-hover:text-green">See comparison ↓</span>
        </span>
      </span>
    </a>
  );
}

function Yes({ on }: { on: boolean }) {
  return on ? <Check size={16} className="text-green" aria-label="Included" /> : <Minus size={16} className="text-faint" aria-label="Not included" />;
}

/**
 * "Compare before you buy": AZYLO's live price against prices the store owner
 * checked on other sellers (entered and dated in Admin — never scraped or invented).
 */
export function PriceComparison({
  azyloPrice,
  comparisons,
  points,
}: {
  azyloPrice: number | null;
  comparisons: Comparison[];
  points: string[];
}) {
  const { lang } = useLocale();
  if (comparisons.length === 0) return null;

  const prices = comparisons.map((c) => c.priceInr);
  const lowest = Math.min(...prices);
  const average = prices.reduce((s, p) => s + p, 0) / prices.length;
  const saveVsLowest = azyloPrice != null ? lowest - azyloPrice : null;
  const saveVsAverage = azyloPrice != null ? average - azyloPrice : null;
  const latest = comparisons.reduce((d, c) => (c.checkedOn > d ? c.checkedOn : d), comparisons[0].checkedOn);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <section id="compare" className="scroll-mt-40 px-4 pt-16 md:px-12 md:pt-24">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="flex flex-col gap-3">
          <Eyebrow>Price check</Eyebrow>
          <H className="text-[30px] md:text-[44px]">
            Compare <Serif gold>before you buy.</Serif>
          </H>
          <P>The same type of piece from other sellers, checked by our team. Prices can change — follow the links to see their current offer.</P>
        </div>
        {saveVsLowest != null && saveVsLowest > 0 && (
          <div className="flex flex-none items-center gap-3 rounded-tile border border-green/30 bg-green-soft px-5 py-4">
            <TrendingDown size={22} className="text-green" aria-hidden />
            <div>
              <div className="text-xs font-bold uppercase tracking-[.12em] text-green">You save</div>
              <div className="text-xl font-extrabold text-ink">
                <Price cad={saveVsLowest} /> <span className="text-sm font-semibold text-muted">vs the lowest price found</span>
              </div>
              {saveVsAverage != null && saveVsAverage > saveVsLowest && (
                <div className="text-xs text-muted">
                  <Price cad={saveVsAverage} /> vs the average of {comparisons.length} sellers
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 overflow-x-auto rounded-block border border-line2 bg-white shadow-card">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-line text-left text-[11px] uppercase tracking-[.1em] text-muted">
            <tr>
              <th className="p-4">Seller</th>
              <th className="p-4">Price</th>
              <th className="p-4 text-center">Free delivery</th>
              <th className="p-4 text-center">Taxes in price</th>
              <th className="p-4">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-line2 bg-gold-soft">
              <td className="p-4 font-extrabold">
                AZYLO <span className="ml-1 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">This piece</span>
              </td>
              <td className="p-4 text-base font-extrabold">{azyloPrice != null ? <Price cad={azyloPrice} /> : "—"}</td>
              <td className="p-4 text-center"><Yes on /></td>
              <td className="p-4 text-center"><Yes on /></td>
              <td className="p-4 text-muted">Made to order in your chosen model and colour</td>
            </tr>
            {comparisons.map((c) => (
              <tr key={c.id} className="border-b border-line2 last:border-0">
                <td className="p-4 font-bold">
                  {c.url ? (
                    <a href={c.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 hover:text-gold">
                      {c.seller}
                      <ExternalLink size={13} aria-hidden />
                    </a>
                  ) : (
                    c.seller
                  )}
                </td>
                <td className="p-4">
                  <Price cad={c.priceInr} />
                  {azyloPrice != null && c.priceInr > azyloPrice && (
                    <span className="ml-2 text-xs font-semibold text-green">
                      +<Price cad={c.priceInr - azyloPrice} />
                    </span>
                  )}
                </td>
                <td className="p-4 text-center"><Yes on={c.includesDelivery} /></td>
                <td className="p-4 text-center"><Yes on={c.includesGst} /></td>
                <td className="p-4 text-muted">{c.notes ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-faint">
        Prices last checked on {fmtDate(latest)}. Other sellers&apos; prices, specifications and offers may have changed since. AZYLO isn&apos;t affiliated with
        the sellers listed.
      </p>

      {points.length > 0 && (
        <div className="mt-8 rounded-block bg-dark p-6 text-white md:p-8">
          <div className="text-lg font-extrabold">Why AZYLO is the better buy</div>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {points.map((pt) => (
              <li key={pt} className="flex items-start gap-3 text-sm text-on-dark">
                <span className="mt-0.5 flex size-5 flex-none items-center justify-center rounded-full bg-gold text-white">
                  <Check size={12} aria-hidden />
                </span>
                {pt}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
