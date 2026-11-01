"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { Missing } from "@/components/ui/primitives";
import { usePrefs, type Currency, type Lang } from "@/lib/prefs";
import type { I18nText, Rates, StoreSettings } from "@/lib/types";

type ShopCtx = { rates: Rates; settings: StoreSettings };
const Ctx = createContext<ShopCtx | null>(null);

export function ShopProvider({ rates, settings, children }: ShopCtx & { children: ReactNode }) {
  return <Ctx.Provider value={{ rates, settings }}>{children}</Ctx.Provider>;
}

export function useShopCtx() {
  const v = useContext(Ctx);
  if (!v) throw new Error("ShopProvider missing");
  return v;
}

/** True only after hydration, so device-saved prefs never cause a hydration mismatch. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Language/currency after hydration (server render uses EN / CAD). */
export function useLocale(): { lang: Lang; currency: Currency } {
  const hydrated = useHydrated();
  const { lang, currency } = usePrefs();
  return hydrated ? { lang, currency } : { lang: "en", currency: "CAD" };
}

const SYMBOL: Record<string, string> = { CAD: "$", USD: "$", AUD: "$", EUR: "€", GBP: "£" };

export function formatMoney(amountCad: number, currency: Currency, rate: number, lang: Lang, withCode = true) {
  const value = amountCad * rate;
  const locale = lang === "fr" ? "fr-CA" : "en-CA";
  const num = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  const sym = SYMBOL[currency] ?? "";
  const body = currency === "EUR" || lang === "fr" ? `${num} ${sym}` : `${sym}${num}`;
  return withCode && currency !== "EUR" ? `${body} ${currency}` : body;
}

/** Hook returning a formatter for CAD amounts in the selected currency (null if rate missing). */
export function useMoney() {
  const { rates } = useShopCtx();
  const { lang, currency } = useLocale();
  const rate = rates[currency];
  return {
    currency,
    rateMissing: rate == null,
    format: (cad: number, withCode = true) => (rate == null ? null : formatMoney(cad, currency, rate, lang, withCode)),
  };
}

/** Price in the shopper's currency; shows MISSING when the price or the exchange rate is absent. */
export function Price({ cad, withCode = true, className }: { cad: number | null | undefined; withCode?: boolean; className?: string }) {
  const { format, currency } = useMoney();
  if (cad == null) return <Missing field="price" className={className} />;
  const s = format(cad, withCode);
  if (s == null) return <Missing field={`${currency} exchange rate`} className={className} />;
  return <span className={className}>{s}</span>;
}

/** Picks the current-language text; shows MISSING when that translation is absent. */
export function T({ text, field, fallback }: { text: I18nText; field: string; fallback?: boolean }) {
  const { lang } = useLocale();
  // English content is shown when a translation has not been written.
  const v = text[lang] ?? text.en ?? (fallback ? text.fr : null);
  if (v) return <>{v}</>;
  return <Missing field={field} />;
}

/** Plain-string variant for attributes (alt, aria-label, meta). */
export function useText() {
  const { lang } = useLocale();
  return (text: I18nText, field: string) => text[lang] ?? text.en ?? `MISSING: ${field}`;
}
