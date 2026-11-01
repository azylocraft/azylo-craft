"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";
import { Missing } from "@/components/ui/primitives";
import { usePrefs, type Lang } from "@/lib/prefs";
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

/** Language after hydration (server render uses EN). The store sells in INR only. */
export function useLocale(): { lang: Lang; currency: "INR" } {
  const hydrated = useHydrated();
  const lang = usePrefs((s) => s.lang);
  return { lang: hydrated ? lang : "en", currency: "INR" };
}

const INR = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 0 });

/** ₹ with Indian digit grouping, e.g. ₹1,69,200. */
export function formatMoney(amountInr: number) {
  return `₹${INR.format(Math.round(amountInr * 100) / 100)}`;
}

export function useMoney() {
  return { currency: "INR" as const, rateMissing: false, format: (inr: number) => formatMoney(inr) };
}

/** Price in INR; shows MISSING when the price is absent. */
export function Price({ cad, className }: { cad: number | null | undefined; withCode?: boolean; className?: string }) {
  if (cad == null) return <Missing field="price" className={className} />;
  return <span className={className}>{formatMoney(cad)}</span>;
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
