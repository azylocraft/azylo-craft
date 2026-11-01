"use client";

import clsx from "clsx";
import Link from "next/link";
import { ArrowUpRight, Heart, ShieldCheck, Truck } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { Price, T, useHydrated, useLocale, useText } from "@/components/shop/ShopContext";
import { Badge, Divider } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { useShop } from "@/lib/shop-store";
import type { ProductCardData } from "@/lib/types";

export function WishHeart({ productId, size = 36, className }: { productId: string; size?: number; className?: string }) {
  const t = useT();
  const hydrated = useHydrated();
  const saved = useShop((s) => s.wishlist.includes(productId)) && hydrated;
  const toggle = useShop((s) => s.toggleWishlist);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? t("card.unsave") : t("card.save")}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      style={{ width: size, height: size }}
      className={clsx(
        "z-10 flex items-center justify-center rounded-full bg-white/92 transition-transform hover:scale-105 active:scale-95",
        saved ? "text-red" : "text-ink",
        className,
      )}
    >
      <Heart size={Math.round(size * 0.47)} fill={saved ? "currentColor" : "none"} aria-hidden />
    </button>
  );
}

/** Carousel card (spec §4.1 / design PCard). */
export function PCard({ p, imgH = 300 }: { p: ProductCardData; imgH?: number }) {
  const t = useT();
  const text = useText();
  return (
    <Link
      href={`/products/${p.slug}`}
      className="az-card group flex h-full flex-col overflow-hidden rounded-card bg-bg2 p-2"
    >
      <Media src={p.image} alt={text(p.name, "product name")} tone={p.tone} label={p.image ? undefined : t("card.photoLabel")} className="flex-none rounded-[22px]" >
        <div style={{ height: imgH }} />
        {p.image2 && (
          <img
            src={p.image2}
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
        {p.imageCount > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold">1/{p.imageCount}</span>
        )}
        <WishHeart productId={p.id} className="absolute right-3 top-3" />
      </Media>
      <div className="flex flex-1 flex-col gap-2.5 p-[18px]">
        <span className="text-[10.5px] font-extrabold uppercase tracking-[.14em] text-gold">
          <T text={p.eyebrow} field="category tag" fallback />
        </span>
        <div className="line-clamp-2 min-h-[42px] text-[17px] font-bold lowercase leading-[1.25] tracking-[-0.03em]">
          <T text={p.name} field="product name" fallback />
        </div>
        <span className="flex flex-wrap gap-1.5">
          {p.chips.map((c) => (
            <Badge key={c} tone="grey" className="normal-case tracking-normal">
              {c}
            </Badge>
          ))}
        </span>
        <Divider />
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] font-bold tracking-[.1em] text-muted">{t("card.from")}</div>
            <div className="text-[19px] font-extrabold">
              <Price cad={p.fromPriceInr} withCode={false} />
              {p.compareAtInr && p.fromPriceInr != null && p.compareAtInr > p.fromPriceInr ? (
                <span className="ml-1.5 inline-flex items-center gap-1.5 align-middle">
                  <s className="text-[11px] font-semibold text-faint"><Price cad={p.compareAtInr} withCode={false} /></s>
                  <span className="rounded-full bg-red px-1.5 py-0.5 text-[10px] font-extrabold text-white">-{Math.round(((p.compareAtInr - p.fromPriceInr) / p.compareAtInr) * 100)}%</span>
                </span>
              ) : null}
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] text-muted">
            <span aria-hidden className="size-1.5 rounded-full bg-green" />
            {t("card.madeToOrder")}
          </span>
        </div>
        <span className="flex items-center gap-2 text-[11.5px] text-muted">
          <Truck size={15} className="text-gold" aria-hidden />
          {t("card.freeDelivery")}
        </span>
        <span className="flex items-start gap-2 text-[11.5px] leading-[1.4] text-muted">
          <ShieldCheck size={15} className="flex-none text-gold" aria-hidden />
          {t("card.dutiesNote")}
        </span>
        <span className="mt-auto flex items-center justify-between pt-1 text-[13px] font-semibold lowercase">
          {t("card.viewSofa")}
          <span className="az-card-go flex size-10 items-center justify-center rounded-full bg-ink text-white">
            <ArrowUpRight size={17} aria-hidden />
          </span>
        </span>
      </div>
    </Link>
  );
}

/** Grid card (spec §4.2 / design GCard). */
export function GCard({ p, imgH = 270 }: { p: ProductCardData; imgH?: number }) {
  const t = useT();
  const text = useText();
  const { lang } = useLocale();
  return (
    <Link
      href={`/products/${p.slug}`}
      className="az-card group flex h-full flex-col overflow-hidden rounded-card bg-bg2 p-2"
    >
      <Media src={p.image} alt={text(p.name, "product name")} tone={p.tone} label={p.image ? undefined : t("card.photoLabel")} className="rounded-[18px] sm:rounded-[22px]">
        <div className="h-[150px] sm:h-[210px] lg:h-[var(--img-h)]" style={{ ["--img-h" as string]: `${imgH}px` }} />
        {p.isNew && (
          <Badge tone="blue" className="absolute left-3 top-3 normal-case tracking-normal">
            {t("card.new")}
          </Badge>
        )}
        <WishHeart productId={p.id} className="absolute right-2 top-2 sm:right-3 sm:top-3" />
      </Media>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:px-[18px] sm:pb-[18px] sm:pt-4">
        <span className="text-[11px] font-black lowercase tracking-[-0.03em] text-ink">azylo<span className="text-gold">.</span></span>
        <div className="line-clamp-2 min-h-[32px] text-[12.5px] font-bold leading-[1.35] sm:min-h-[39px] sm:text-[14.5px]">
          <T text={p.name} field="product name" fallback />
        </div>
        {p.reviewCount > 0 && (
          <span className="inline-flex h-6 self-start items-center gap-1.5 rounded-full bg-gold-soft px-2.5 text-[11px] font-bold text-gold">
            ★ {t("card.experiences", { n: p.reviewCount })}
          </span>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1.5">
          <span className="text-[11px] font-extrabold tracking-[.04em] sm:text-xs">
            {lang === "fr" ? "À PARTIR DE " : "FROM "}
            <Price cad={p.fromPriceInr} />
            {p.compareAtInr && p.fromPriceInr != null && p.compareAtInr > p.fromPriceInr ? (
                <span className="ml-1.5 inline-flex items-center gap-1.5 align-middle">
                  <s className="text-[11px] font-semibold text-faint"><Price cad={p.compareAtInr} withCode={false} /></s>
                  <span className="rounded-full bg-red px-1.5 py-0.5 text-[10px] font-extrabold text-white">-{Math.round(((p.compareAtInr - p.fromPriceInr) / p.compareAtInr) * 100)}%</span>
                </span>
              ) : null}
          </span>
          <span className="az-card-go hidden size-[38px] flex-none items-center justify-center rounded-full bg-ink text-white sm:flex">
            <ArrowUpRight size={15} aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function GCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card bg-bg2 p-2">
      <div className="az-skeleton h-[150px] sm:h-[270px]" />
      <div className="flex flex-col gap-2.5 p-4">
        <div className="az-skeleton h-2.5 w-12 rounded" />
        <div className="az-skeleton h-3.5 w-full rounded" />
        <div className="az-skeleton h-3.5 w-2/3 rounded" />
        <div className="az-skeleton mt-3 h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
