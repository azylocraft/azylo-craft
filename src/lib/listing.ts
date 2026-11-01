import type { CardRowExtras } from "@/lib/catalog";
import type { ProductCardData } from "@/lib/types";

export const PAGE_SIZE = 24;
export const SORTS = ["featured", "best", "price-asc", "price-desc", "newest", "az"] as const;
export type Sort = (typeof SORTS)[number];
export const FUNCTIONS = ["electric", "massage", "storage", "convertible", "modular"] as const;

export type ListingParams = {
  sort: Sort;
  page: number;
  min?: number;
  max?: number;
  material: string[];
  color: string[];
  fn: string[];
  inStock: boolean;
};

type SP = Record<string, string | string[] | undefined>;
const list = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? v.split(",") : []).filter(Boolean);
const num = (v: string | string[] | undefined) => {
  const n = Number(Array.isArray(v) ? v[0] : v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function parseListing(sp: SP): ListingParams {
  const sort = (Array.isArray(sp.sort) ? sp.sort[0] : sp.sort) as Sort;
  return {
    sort: SORTS.includes(sort) ? sort : "featured",
    page: Math.max(1, Math.floor(num(sp.page) ?? 1)),
    min: num(sp.min),
    max: num(sp.max),
    material: list(sp.material),
    color: list(sp.color),
    fn: list(sp.fn),
    inStock: sp.stock === "1",
  };
}

export function applyListing(rows: { card: ProductCardData; extras: CardRowExtras }[], p: ListingParams) {
  const filtered = rows.filter(({ card, extras }) => {
    const price = card.fromPriceInr;
    if (p.min != null && (price == null || price < p.min)) return false;
    if (p.max != null && (price == null || price > p.max)) return false;
    if (p.material.length && !p.material.some((m) => extras.materials.includes(m))) return false;
    if (p.color.length && !p.color.some((c) => extras.colors.includes(c))) return false;
    if (p.fn.length && !p.fn.every((f) => extras.functions.includes(f))) return false;
    if (p.inStock && !extras.inStock) return false;
    return true;
  });
  const by = (f: (r: (typeof rows)[number]) => number | string) => (a: (typeof rows)[number], b: (typeof rows)[number]) => {
    const x = f(a), y = f(b);
    return x < y ? -1 : x > y ? 1 : 0;
  };
  const priceOr = (r: (typeof rows)[number], dflt: number) => r.card.fromPriceInr ?? dflt;
  const sorted = [...filtered].sort(
    {
      featured: by((r) => r.extras.featuredOrder),
      best: (a: (typeof rows)[number], b: (typeof rows)[number]) => Number(b.card.isBestSeller) - Number(a.card.isBestSeller) || b.card.reviewCount - a.card.reviewCount,
      "price-asc": by((r) => priceOr(r, Infinity)),
      "price-desc": (a: (typeof rows)[number], b: (typeof rows)[number]) => priceOr(b, -1) - priceOr(a, -1),
      newest: (a: (typeof rows)[number], b: (typeof rows)[number]) => Number(b.card.isNew) - Number(a.card.isNew) || b.card.createdAt.localeCompare(a.card.createdAt),
      az: by((r) => (r.card.name.en ?? r.card.slug).toLowerCase()),
    }[p.sort],
  );
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const page = Math.min(p.page, pages);
  const facets = {
    materials: [...new Set(rows.flatMap((r) => r.extras.materials))].sort(),
    colors: [...new Set(rows.flatMap((r) => r.extras.colors))].sort(),
    functions: FUNCTIONS.filter((f) => rows.some((r) => r.extras.functions.includes(f))),
  };
  return { total: sorted.length, page, pages, items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((r) => r.card), facets };
}
