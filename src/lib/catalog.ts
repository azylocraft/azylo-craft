import "server-only";
import { mediaUrl } from "@/lib/media";
import { supabasePublic } from "@/lib/supabase/server";
import {
  tx,
  type ArticleCard,
  type Collection,
  type ProductCardData,
  type ProductDetail,
  type Rates,
  type StoreSettings,
} from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any -- rows are mapped into typed shapes right here */

const CARD_SELECT = `
  id, slug, name_en, name_fr, eyebrow_en, eyebrow_fr, chips, functions, is_new, is_best_seller, is_featured,
  placeholder_tone, sort_order, created_at,
  product_variants ( price_inr, stock, material, color_en, is_active ),
  product_images ( storage_path, image_type, sort_order ),
  reviews ( count )
`;

type Row = any;

const studioImages = (row: Row) =>
  [...(row.product_images ?? [])]
    .filter((i: Row) => i.image_type === "studio" || i.image_type === "live" || i.image_type === "real_space")
    .sort((a: Row, b: Row) => (a.image_type === "studio" ? 0 : 1) - (b.image_type === "studio" ? 0 : 1) || a.sort_order - b.sort_order);

export function toCard(row: Row): ProductCardData {
  const prices = (row.product_variants ?? [])
    .filter((v: Row) => v.is_active !== false && v.price_inr != null)
    .map((v: Row) => Number(v.price_inr));
  const imgs = studioImages(row);
  return {
    id: row.id,
    slug: row.slug,
    name: tx(row.name_en, row.name_fr),
    eyebrow: tx(row.eyebrow_en, row.eyebrow_fr),
    fromPriceInr: prices.length ? Math.min(...prices) : null,
    isNew: !!row.is_new,
    isBestSeller: !!row.is_best_seller,
    reviewCount: row.reviews?.[0]?.count ?? 0,
    chips: row.chips ?? [],
    tone: row.placeholder_tone ?? null,
    image: mediaUrl(imgs[0]?.storage_path),
    image2: mediaUrl(imgs[1]?.storage_path),
    imageCount: imgs.length,
    createdAt: row.created_at,
  };
}

export type CardRowExtras = { functions: string[]; materials: string[]; colors: string[]; inStock: boolean; featuredOrder: number };

/** Products (with filter facets) for a collection slug, a flag, or everything. */
export async function listProducts(opts: { collection?: string; flag?: "is_best_seller" | "is_new" | "is_featured"; limit?: number } = {}) {
  const db = supabasePublic();
  let q;
  if (opts.collection && opts.collection !== "all") {
    q = db
      .from("products")
      .select(`${CARD_SELECT}, product_collections!inner ( sort_order, collections!inner ( slug ) )`)
      .eq("product_collections.collections.slug", opts.collection);
  } else {
    q = db.from("products").select(CARD_SELECT);
  }
  if (opts.flag) q = q.eq(opts.flag, true);
  q = q.order("sort_order", { ascending: true });
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: Row) => ({
    card: toCard(row),
    extras: {
      functions: row.functions ?? [],
      materials: [...new Set<string>((row.product_variants ?? []).map((v: Row) => v.material).filter(Boolean))],
      colors: [...new Set<string>((row.product_variants ?? []).map((v: Row) => v.color_en).filter(Boolean))],
      inStock: (row.product_variants ?? []).some((v: Row) => v.stock == null || v.stock > 0),
      featuredOrder: row.product_collections?.[0]?.sort_order ?? row.sort_order ?? 0,
    } satisfies CardRowExtras,
  }));
}

export async function listCards(opts: Parameters<typeof listProducts>[0]) {
  return (await listProducts(opts)).map((r) => r.card);
}

export async function searchProducts(term: string, limit = 60) {
  const db = supabasePublic();
  const like = `%${term.replace(/[%_,()]/g, " ").trim()}%`;
  const { data, error } = await db
    .from("products")
    .select(CARD_SELECT)
    .or(`name_en.ilike.${like},name_fr.ilike.${like},eyebrow_en.ilike.${like},short_description_en.ilike.${like}`)
    .order("sort_order")
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map(toCard);
}

export async function getCollection(slug: string): Promise<Collection | null> {
  const { data, error } = await supabasePublic().from("collections").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    title: tx(data.title_en, data.title_fr),
    description: tx(data.description_en, data.description_fr),
    heroImage: mediaUrl(data.hero_image_path),
  };
}

export async function collectionCounts(): Promise<Record<string, number>> {
  const db = supabasePublic();
  const [{ data }, { count: total }] = await Promise.all([
    db.from("collections").select("slug, product_collections ( count )"),
    db.from("products").select("id", { count: "exact", head: true }),
  ]);
  const out: Record<string, number> = { all: total ?? 0 };
  for (const c of (data ?? []) as Row[]) if (c.slug !== "all") out[c.slug] = c.product_collections?.[0]?.count ?? 0;
  return out;
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  const db = supabasePublic();
  const { data: row, error } = await db
    .from("products")
    .select(
      `*, product_variants ( * ), product_images ( * ), product_videos ( * ), reviews ( count ),
       product_collections ( collection_id, collections ( slug ) )`,
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) return null;
  const variants = [...(row.product_variants ?? [])]
    .filter((v: Row) => v.is_active)
    .sort((a: Row, b: Row) => a.sort_order - b.sort_order)
    .map((v: Row) => ({
      id: v.id,
      model: tx(v.model_en, v.model_fr),
      color: tx(v.color_en, v.color_fr),
      colorHex: v.color_hex,
      material: v.material,
      priceInr: v.price_inr == null ? null : Number(v.price_inr),
      stock: v.stock,
    }));
  const images = [...(row.product_images ?? [])]
    .sort((a: Row, b: Row) => a.sort_order - b.sort_order)
    .map((i: Row) => ({ id: i.id, url: mediaUrl(i.storage_path)!, type: i.image_type, alt: tx(i.alt_en, i.alt_fr) }));
  const videos = [...(row.product_videos ?? [])]
    .sort((a: Row, b: Row) => a.sort_order - b.sort_order)
    .map((v: Row) => ({ id: v.id, url: mediaUrl(v.storage_path)!, poster: mediaUrl(v.poster_path), title: tx(v.title_en, v.title_fr) }));
  return {
    ...toCard(row),
    shortDescription: tx(row.short_description_en, row.short_description_fr),
    overview: tx(row.overview_en, row.overview_fr),
    deliveryAccess: tx(row.delivery_access_en, row.delivery_access_fr),
    specs: row.specs ?? [],
    functions: row.functions ?? [],
    leadMin: row.lead_time_min_days,
    leadMax: row.lead_time_max_days,
    variants,
    images,
    videos,
    collectionIds: (row.product_collections ?? []).map((c: Row) => c.collection_id),
    collectionSlugs: (row.product_collections ?? []).map((c: Row) => c.collections?.slug).filter(Boolean),
  };
}

export async function relatedProducts(product: ProductDetail, limit = 8) {
  const slug = product.collectionSlugs.find((s) => !["new-arrivals", "best-selling-sofas", "all"].includes(s)) ?? product.collectionSlugs[0];
  const cards = slug ? await listCards({ collection: slug }) : await listCards({ limit: limit + 1 });
  return cards.filter((c) => c.id !== product.id).slice(0, limit);
}

const articleCard = (a: Row): ArticleCard => ({
  id: a.id,
  slug: a.slug,
  template: a.template,
  category: a.category,
  title: tx(a.title_en, a.title_fr),
  excerpt: tx(a.excerpt_en, a.excerpt_fr),
  cover: mediaUrl(a.cover_image_path),
  readMinutes: a.read_minutes,
  publishedAt: a.published_at,
});

export async function listArticles(opts: { category?: string; limit?: number; offset?: number } = {}) {
  let q = supabasePublic()
    .from("articles")
    .select("id, slug, template, category, title_en, title_fr, excerpt_en, excerpt_fr, cover_image_path, read_minutes, published_at", {
      count: "exact",
    })
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  if (opts.category) q = q.eq("category", opts.category);
  if (opts.limit) q = q.range(opts.offset ?? 0, (opts.offset ?? 0) + opts.limit - 1);
  const { data, error, count } = await q;
  if (error) throw new Error(error.message);
  return { articles: (data ?? []).map(articleCard), total: count ?? 0 };
}

export async function getArticle(slug: string) {
  const db = supabasePublic();
  const { data, error } = await db.from("articles").select("*").eq("slug", slug).eq("is_published", true).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const { data: all } = await db
    .from("articles")
    .select("id, slug, template, category, title_en, title_fr, excerpt_en, excerpt_fr, cover_image_path, read_minutes, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });
  const list = (all ?? []).map(articleCard);
  const idx = list.findIndex((a) => a.id === data.id);
  let linked: ProductDetail | null = null;
  if (data.linked_product_id) {
    const { data: p } = await db.from("products").select("slug").eq("id", data.linked_product_id).maybeSingle();
    if (p) linked = await getProduct(p.slug);
  }
  return {
    ...articleCard(data),
    body: tx(data.body_en, data.body_fr),
    authorName: data.author_name as string | null,
    authorBio: tx(data.author_bio_en, data.author_bio_fr),
    authorAvatar: mediaUrl(data.author_avatar_path),
    prev: idx > 0 ? list[idx - 1] : null,
    next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
    related: list.filter((a) => a.id !== data.id && a.category === data.category).slice(0, 6),
    linkedProduct: linked,
  };
}

export async function getPage(slug: string) {
  const { data, error } = await supabasePublic().from("pages").select("*").eq("slug", slug).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    slug: data.slug as string,
    title: tx(data.title_en, data.title_fr),
    body: tx(data.body_en, data.body_fr),
    blocks: (data.blocks ?? {}) as Record<string, { en?: string; fr?: string }>,
    lastUpdated: data.last_updated as string,
  };
}

export async function listFaqs() {
  const { data, error } = await supabasePublic().from("faqs").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((f: Row) => ({
    id: f.id as string,
    slug: f.slug as string,
    group: f.faq_group as "shipping" | "orders" | "returns" | "products",
    question: tx(f.question_en, f.question_fr),
    answer: tx(f.answer_en, f.answer_fr),
    showOnProduct: !!f.show_on_product,
  }));
}

export async function listMaterials() {
  const { data, error } = await supabasePublic().from("materials").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((m: Row) => ({
    id: m.id as string,
    slug: m.slug as string,
    category: m.category as string,
    name: tx(m.name_en, m.name_fr),
    description: tx(m.description_en, m.description_fr),
    specs: (m.specs ?? {}) as Record<string, { en?: string; fr?: string }>,
    verifyNote: tx(m.verify_note_en, m.verify_note_fr),
    sofaImage: mediaUrl(m.sofa_image_path),
    swatchImage: mediaUrl(m.swatch_image_path),
  }));
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const { data } = await supabasePublic().from("store_settings").select("*").eq("id", 1).maybeSingle();
  return {
    email: data?.store_email ?? null,
    phone: data?.phone ?? null,
    address: data?.address ?? null,
    mapUrl: data?.map_url ?? null,
    openingHours: tx(data?.opening_hours_en, data?.opening_hours_fr),
    playStoreUrl: data?.play_store_url ?? null,
    shippingMethods: data?.shipping_methods ?? [],
  };
}

export async function getRates(): Promise<Rates> {
  const { data } = await supabasePublic().from("exchange_rates").select("currency, rate_from_cad");
  const out: Rates = { CAD: 1 };
  for (const r of data ?? []) out[r.currency] = r.rate_from_cad == null ? null : Number(r.rate_from_cad);
  return out;
}
