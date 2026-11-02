"use client";

import clsx from "clsx";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { Price, T, useHydrated, useText } from "@/components/shop/ShopContext";
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


function OffPrice({ p, size = "text-[16px]" }: { p: ProductCardData; size?: string }) {
  const off = p.compareAtInr && p.fromPriceInr != null && p.compareAtInr > p.fromPriceInr ? Math.round(((p.compareAtInr - p.fromPriceInr) / p.compareAtInr) * 100) : 0;
  return (
    <span className={clsx("inline-flex flex-wrap items-baseline gap-x-1.5 font-semibold tracking-[-0.02em]", size)}>
      {off > 0 && (
        <>
          <span className="text-[12px] font-bold text-green">↓{off}%</span>
          <s className="text-[12px] font-normal text-faint">
            <Price cad={p.compareAtInr} withCode={false} />
          </s>
        </>
      )}
      <Price cad={p.fromPriceInr} withCode={false} />
    </span>
  );
}

/** Card title: the product name up to its first " — " / " – " / " - " (e.g. "Modern Convertible Lounge Sofa"). */
const shortName = (name: string) => name.split(/\s+[—–-]\s+/)[0].trim();

/** Colour dot + name, shown on per-colour cards. */
function ColourTag({ p }: { p: ProductCardData }) {
  return (
    <span className="flex flex-none items-center gap-1.5 text-[10.5px] text-muted sm:text-[11px]">
      <span aria-hidden className="size-2.5 rounded-full ring-1 ring-black/10" style={{ background: p.colorHex ?? "#ccc" }} />
      {p.color}
    </span>
  );
}

/** Round black arrow that sits over the tile's bottom edge (Bau tile). */
function TileArrow({ size = 36 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, marginLeft: -size / 2, bottom: -size / 2 }}
      className="absolute left-1/2 flex items-center justify-center rounded-full bg-ink text-white ring-4 ring-bg"
    >
      <span className="az-card-go flex">
        <ArrowUpRight size={Math.round(size * 0.44)} />
      </span>
    </span>
  );
}

/** Carousel tile: name + note on top, photo, price, round arrow on the bottom edge. */
export function PCard({ p }: { p: ProductCardData; /** @deprecated cards use a 4:5 photo area */ imgH?: number }) {
  const t = useT();
  const text = useText();
  return (
    <div className="h-full pb-5">
      <Link href={p.href ?? `/products/${p.slug}`} className="az-card group relative flex h-full flex-col rounded-card bg-cream p-2 pb-8">
        <div className="flex items-start justify-between gap-4 px-3 pb-3 pt-2.5">
          <div className="line-clamp-1 text-[16px] font-semibold leading-[1.2] tracking-[-0.03em]">
            {shortName(text(p.name, "product name"))}
          </div>
          {p.color ? (
            <ColourTag p={p} />
          ) : (
            <span className="max-w-[42%] flex-none text-right text-[10.5px] leading-[1.35] text-muted">
              <T text={p.eyebrow} field="category tag" fallback />
            </span>
          )}
        </div>
        {/* Listing photos are cropped to the lower 6:5 area, hiding the logo band at the top of product shots. */}
        <Media src={p.image} alt={text(p.name, "product name")} tone={p.tone} label={p.image ? undefined : t("card.photoLabel")} align="bottom" className="flex-none rounded-[22px] bg-white">
          <div className="aspect-[6/5] w-full" />
          {p.image2 && (
            <img src={p.image2} alt="" loading="lazy" className="absolute inset-0 size-full bg-white object-cover object-bottom opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          )}
          <WishHeart productId={p.id} className="absolute right-3 top-3" />
        </Media>
        <div className="flex items-baseline justify-between gap-3 px-3 pt-3.5">
          <OffPrice p={p} />
          <span className="flex-none text-[11px] text-muted">{t("card.madeToOrder")}</span>
        </div>
        <TileArrow />
      </Link>
    </div>
  );
}

/** Grid tile (collections, search, related). */
export function GCard({ p }: { p: ProductCardData; /** @deprecated cards use a 4:5 photo area */ imgH?: number }) {
  const t = useT();
  const text = useText();
  return (
    <div className="h-full pb-4">
      <Link href={p.href ?? `/products/${p.slug}`} className="az-card group relative flex h-full flex-col rounded-[22px] bg-cream p-1.5 pb-7 sm:rounded-card sm:p-2 sm:pb-8">
        <div className="flex flex-col gap-1 px-2 pb-2 pt-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-3 sm:pb-3 sm:pt-2.5">
          <div className="line-clamp-2 text-[12.5px] sm:line-clamp-1 font-semibold leading-[1.25] tracking-[-0.02em] sm:text-[15px]">
            {shortName(text(p.name, "product name"))}
          </div>
          {p.color ? <ColourTag p={p} /> : p.isNew && <span className="flex-none text-[10px] text-gold sm:text-[11px]">{t("card.new")}</span>}
        </div>
        <Media src={p.image} alt={text(p.name, "product name")} tone={p.tone} label={p.image ? undefined : t("card.photoLabel")} align="bottom" className="rounded-[16px] bg-white sm:rounded-[22px]">
          <div className="aspect-[6/5] w-full" />
          {p.image2 && (
            <img src={p.image2} alt="" loading="lazy" className="absolute inset-0 size-full bg-white object-cover object-bottom opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          )}
          <WishHeart productId={p.id} size={32} className="absolute right-2 top-2 sm:right-3 sm:top-3" />
        </Media>
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 px-2 pt-2.5 sm:px-3 sm:pt-3.5">
          <OffPrice p={p} size="text-[13px] sm:text-[15px]" />
          {p.reviewCount > 0 && <span className="text-[10.5px] text-muted">★ {p.reviewCount}</span>}
        </div>
        <TileArrow size={32} />
      </Link>
    </div>
  );
}

export function GCardSkeleton() {
  return (
    <div className="rounded-card bg-cream p-2">
      <div className="flex flex-col gap-2 p-3">
        <div className="az-skeleton h-3.5 w-2/3 rounded" />
      </div>
      <div className="az-skeleton h-[150px] rounded-[22px] sm:h-[270px]" />
      <div className="p-3">
        <div className="az-skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
