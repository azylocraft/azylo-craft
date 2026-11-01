"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronDown, ChevronRight, SearchX, SlidersHorizontal, X } from "lucide-react";
import { Carousel } from "@/components/shop/Carousel";
import { DrawerPanel, Overlay } from "@/components/shop/Overlay";
import { GCard } from "@/components/shop/ProductCards";
import { T, useHydrated } from "@/components/shop/ShopContext";
import { Btn, Eyebrow, H, P } from "@/components/ui/primitives";
import { useProductCards } from "@/lib/cart-details";
import { useT } from "@/lib/i18n";
import { FUNCTIONS, SORTS, type ListingParams, type Sort } from "@/lib/listing";
import { useShop } from "@/lib/shop-store";
import type { I18nText, ProductCardData } from "@/lib/types";
import { useDismiss } from "@/lib/use-dismiss";

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

export function Toolbar({ total, params, facets }: { total: number; params: ListingParams; facets: Facets }) {
  const t = useT();
  const nav = useListingNav();
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  useDismiss(sortOpen, [sortRef], () => setSortOpen(false));

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
        <div className="flex gap-2">
          <div ref={sortRef} className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={sortOpen}
              onClick={() => setSortOpen((v) => !v)}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-semibold hover:border-ink"
            >
              {t(`sort.${params.sort}`)}
              <ChevronDown size={13} aria-hidden className={clsx("transition-transform", sortOpen && "rotate-180")} />
            </button>
            {sortOpen && (
              <ul role="listbox" aria-label={t("sort.label")} className="absolute right-0 top-[calc(100%+8px)] z-30 w-[220px] rounded-tile border border-line2 bg-white p-2 shadow-float">
                {SORTS.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={params.sort === s}
                      onClick={() => {
                        setSortOpen(false);
                        nav({ sort: s === "featured" ? null : s });
                      }}
                      className={clsx("flex h-10 w-full items-center rounded-xl px-3 text-left text-sm hover:bg-gold-soft", params.sort === s && "bg-gold-soft font-bold")}
                    >
                      {t(`sort.${s as Sort}`)}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button type="button" onClick={() => setFilterOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-semibold text-white">
            <SlidersHorizontal size={14} aria-hidden />
            {t("filters.filter")}
            {chips.length > 0 && <span className="rounded-full bg-gold px-1.5 text-[11px]">{chips.length}</span>}
          </button>
        </div>
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
      {filterOpen && <FilterDrawer params={params} facets={facets} onClose={() => setFilterOpen(false)} onApply={nav} />}
    </>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
  <fieldset className="flex flex-col gap-3 border-t border-line2 py-5">
    <legend className="sr-only">{title}</legend>
    <Eyebrow line={false}>{title}</Eyebrow>
    {children}
  </fieldset>
  );
}
function Pill({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
  <button
    type="button"
    aria-pressed={on}
    onClick={onClick}
    className={clsx("inline-flex h-9 items-center rounded-full border px-4 text-[13px] font-semibold capitalize", on ? "border-ink bg-ink text-white" : "border-line bg-white text-ink2")}
  >
    {label}
  </button>
  );
}


function FilterDrawer({
  params,
  facets,
  onClose,
  onApply,
}: {
  params: ListingParams;
  facets: Facets;
  onClose: () => void;
  onApply: (patch: Record<string, string | null>) => void;
}) {
  const t = useT();
  const [min, setMin] = useState(params.min?.toString() ?? "");
  const [max, setMax] = useState(params.max?.toString() ?? "");
  const [material, setMaterial] = useState(params.material);
  const [color, setColor] = useState(params.color);
  const [fn, setFn] = useState(params.fn);
  const [inStock, setInStock] = useState(params.inStock);
  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <Overlay onClose={onClose} label={t("filters.title")}>
      <DrawerPanel>
        <div className="flex items-center justify-between px-6 pb-2 pt-6">
          <H className="text-[26px]">{t("filters.title")}</H>
          <button type="button" aria-label={t("common.close")} onClick={onClose} className="flex size-10 items-center justify-center rounded-full border border-line bg-white">
            <X size={16} aria-hidden />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6">
          <Group title={t("filters.price")}>
            <div className="flex items-center gap-2">
              <input inputMode="numeric" aria-label={t("filters.min")} placeholder={t("filters.min")} value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} className="h-11 w-full rounded-field border border-line bg-white px-3 text-sm" />
              <span className="text-muted">–</span>
              <input inputMode="numeric" aria-label={t("filters.max")} placeholder={t("filters.max")} value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} className="h-11 w-full rounded-field border border-line bg-white px-3 text-sm" />
            </div>
            <span className="text-[11.5px] text-faint">{t("filters.cadNote")}</span>
          </Group>
          {facets.materials.length > 0 && (
            <Group title={t("filters.material")}>
              <div className="flex flex-wrap gap-2">
                {facets.materials.map((m) => (
                  <Pill key={m} on={material.includes(m)} label={m} onClick={() => toggle(material, setMaterial, m)} />
                ))}
              </div>
            </Group>
          )}
          {facets.colors.length > 0 && (
            <Group title={t("filters.colour")}>
              <div className="flex flex-wrap gap-2">
                {facets.colors.map((c) => (
                  <Pill key={c} on={color.includes(c)} label={c} onClick={() => toggle(color, setColor, c)} />
                ))}
              </div>
            </Group>
          )}
          <Group title={t("filters.function")}>
            <div className="flex flex-wrap gap-2">
              {FUNCTIONS.map((f) => (
                <Pill key={f} on={fn.includes(f)} label={t(`filters.fn.${f}`)} onClick={() => toggle(fn, setFn, f)} />
              ))}
            </div>
          </Group>
          <Group title={t("filters.availability")}>
            <Pill on={inStock} label={t("filters.inStock")} onClick={() => setInStock(!inStock)} />
          </Group>
        </div>
        <div className="flex gap-2.5 border-t border-line bg-white px-6 pb-7 pt-4">
          <Btn
            kind="light"
            full
            onClick={() => {
              setMin("");
              setMax("");
              setMaterial([]);
              setColor([]);
              setFn([]);
              setInStock(false);
            }}
          >
            {t("filters.clearAll")}
          </Btn>
          <Btn
            full
            onClick={() => {
              onApply({ min: min || null, max: max || null, material: material.join(","), color: color.join(","), fn: fn.join(","), stock: inStock ? "1" : null });
              onClose();
            }}
          >
            {t("filters.apply")}
          </Btn>
        </div>
      </DrawerPanel>
    </Overlay>
  );
}

export function ProductGrid({ items }: { items: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-5 lg:grid-cols-4">
      {items.map((p) => (
        <GCard key={p.id} p={p} />
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
          <GCard key={p.id} p={p} imgH={220} />
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
