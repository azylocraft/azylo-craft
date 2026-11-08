"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, SearchX, X } from "lucide-react";
import { Carousel } from "@/components/shop/Carousel";
import { GCard } from "@/components/shop/ProductCards";
import { T, useHydrated } from "@/components/shop/ShopContext";
import { Btn, Eyebrow, H, P } from "@/components/ui/primitives";
import { useProductCards } from "@/lib/cart-details";
import { useT } from "@/lib/i18n";
import type { ListingParams } from "@/lib/listing";
import { useShop } from "@/lib/shop-store";
import type { I18nText, ProductCardData } from "@/lib/types";

export function Crumb({ items }: { items: { label: React.ReactNode; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <ChevronRight size={12} className="text-faint" aria-hidden />}
          {it.href && i < items.length - 1 ? (
            <Link href={it.href} className="font-medium hover:text-ink">
              {it.label}
            </Link>
          ) : (
            <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? "font-semibold text-gold" : "font-medium"}>
              {it.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function TitleText({ text, field }: { text: I18nText; field: string }) {
  return <T text={text} field={field} fallback />;
}

/** Writes listing state into the URL so reload/share restores the view. */
function useListingNav() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  return (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in patch)) next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
}

type Facets = { materials: string[]; colors: string[]; functions: string[] };

/** Product count + any active filter chips (sort menu and filter drawer were removed). */
export function Toolbar({ total, params }: { total: number; params: ListingParams; facets?: Facets }) {
  const t = useT();
  const nav = useListingNav();

  const chips: { label: string; patch: Record<string, string | null> }[] = [];
  if (params.min) chips.push({ label: `≥ $${params.min}`, patch: { min: null } });
  if (params.max) chips.push({ label: `≤ $${params.max}`, patch: { max: null } });
  for (const m of params.material) chips.push({ label: m, patch: { material: params.material.filter((x) => x !== m).join(",") } });
  for (const c of params.color) chips.push({ label: c, patch: { color: params.color.filter((x) => x !== c).join(",") } });
  for (const f of params.fn) chips.push({ label: t(`filters.fn.${f}`), patch: { fn: params.fn.filter((x) => x !== f).join(",") } });
  if (params.inStock) chips.push({ label: t("filters.inStock"), patch: { stock: null } });

  return (
    <>
      <div className="flex items-center justify-between gap-3 rounded-tile border border-line2 bg-white px-4 py-3 md:px-5 md:py-3.5">
        <span className="text-[13.5px] text-muted">
          <b className="text-ink">{t("listing.products", { n: total })}</b>
        </span>
      </div>
      {chips.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button key={c.label} type="button" onClick={() => nav(c.patch)} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-ink bg-gold-soft px-3 text-xs font-semibold">
              {c.label}
              <X size={12} aria-label={t("filters.remove")} />
            </button>
          ))}
          <button type="button" onClick={() => nav({ min: null, max: null, material: null, color: null, fn: null, stock: null })} className="text-xs font-bold underline">
            {t("filters.clearAll")}
          </button>
        </div>
      )}
    </>
  );
}

export function ProductGrid({ items }: { items: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
      {items.map((p) => (
        <GCard key={p.id + (p.color ?? "")} p={p} />
      ))}
    </div>
  );
}

export function NoMatches() {
  const t = useT();
  const nav = useListingNav();
  return (
    <div className="flex flex-col items-center gap-4 rounded-block border border-line2 bg-white px-6 py-16 text-center">
      <span className="flex size-[68px] items-center justify-center rounded-full bg-gold-soft text-gold">
        <SearchX size={26} aria-hidden />
      </span>
      <H className="text-[28px]">{t("listing.noMatchTitle")}</H>
      <P>{t("listing.noMatchSub")}</P>
      <Btn onClick={() => nav({ min: null, max: null, material: null, color: null, fn: null, stock: null })}>{t("filters.clearAll")}</Btn>
    </div>
  );
}

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const t = useT();
  const sp = useSearchParams();
  const pathname = usePathname();
  if (pages <= 1) return null;
  const href = (n: number) => {
    const next = new URLSearchParams(sp.toString());
    if (n === 1) next.delete("page");
    else next.set("page", String(n));
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };
  return (
    <nav aria-label={t("listing.pagination")} className="mt-10 flex items-center justify-center gap-2">
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <Link
          key={n}
          href={href(n)}
          aria-current={n === page ? "page" : undefined}
          className={clsx("flex size-11 items-center justify-center rounded-full border text-sm font-bold", n === page ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink")}
        >
          {n}
        </Link>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} aria-label={t("listing.next")} className="flex size-11 items-center justify-center rounded-full border border-line bg-white hover:border-ink">
          <ChevronRight size={16} aria-hidden />
        </Link>
      )}
    </nav>
  );
}

/** Last 12 viewed products, saved on this device only. */
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const t = useT();
  const hydrated = useHydrated();
  const ids = useShop((s) => s.recentlyViewed).filter((id) => id !== excludeId);
  const { cards } = useProductCards(hydrated ? ids : []);
  if (!hydrated || cards.length === 0) return null;
  return (
    <section className="px-4 pt-16 md:px-12 md:pt-24">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-3">
          <Eyebrow>{t("recent.eyebrow")}</Eyebrow>
          <H className="text-[30px] md:text-[40px]">{t("recent.title")}</H>
        </div>
        <span className="self-start rounded-full border border-line bg-white px-4 py-2 text-xs text-muted">{t("recent.device")}</span>
      </div>
      <Carousel label={t("recent.title")}>
        {cards.map((p) => (
          <GCard key={p.id + (p.color ?? "")} p={p} imgH={220} />
        ))}
      </Carousel>
    </section>
  );
}

export function SectionError() {
  const t = useT();
  return (
    <div className="flex flex-col items-start gap-3 rounded-card border border-line2 bg-white p-6">
      <P>{t("common.loadError")}</P>
      <Btn kind="outline" size="sm" onClick={() => location.reload()}>
        {t("common.retry")}
      </Btn>
    </div>
  );
}
