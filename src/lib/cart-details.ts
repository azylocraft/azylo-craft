"use client";

import { useEffect, useState } from "react";
import { mediaUrl } from "@/lib/media";
import { useShop } from "@/lib/shop-store";
import { supabaseBrowser } from "@/lib/supabase/client";
import { tx, type I18nText, type ProductCardData } from "@/lib/types";

export type CartDetail = {
  variantId: string;
  productSlug: string;
  name: I18nText;
  model: I18nText;
  color: I18nText;
  priceCad: number | null;
  stock: number | null;
  image: string | null;
  tone: string | null;
};

type Status = "idle" | "loading" | "ready" | "error";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Live product data for the cart lines (prices are always re-read from the database). */
export function useCartDetails() {
  const cart = useShop((s) => s.cart);
  const ids = cart.map((l) => l.variantId).sort().join(",");
  const [details, setDetails] = useState<Record<string, CartDetail>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!ids) return;
    let cancelled = false;
    queueMicrotask(() => !cancelled && setStatus("loading"));
    supabaseBrowser()
      .from("product_variants")
      .select(
        "id, model_en, model_fr, color_en, color_fr, price_cad, stock, products ( slug, name_en, name_fr, placeholder_tone, product_images ( storage_path, image_type, sort_order ) )",
      )
      .in("id", ids.split(","))
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) return setStatus("error");
        const map: Record<string, CartDetail> = {};
        for (const v of (data ?? []) as any[]) {
          const imgs = [...(v.products?.product_images ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
          map[v.id] = {
            variantId: v.id,
            productSlug: v.products?.slug,
            name: tx(v.products?.name_en, v.products?.name_fr),
            model: tx(v.model_en, v.model_fr),
            color: tx(v.color_en, v.color_fr),
            priceCad: v.price_cad == null ? null : Number(v.price_cad),
            stock: v.stock,
            image: mediaUrl(imgs[0]?.storage_path),
            tone: v.products?.placeholder_tone ?? null,
          };
        }
        setDetails(map);
        setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [ids, attempt]);

  const lines = cart.map((l) => ({ ...l, detail: details[l.variantId] as CartDetail | undefined }));
  const subtotal = lines.reduce((s, l) => s + (l.detail?.priceCad ?? 0) * l.quantity, 0);
  const missingPrice = lines.some((l) => l.detail && l.detail.priceCad == null);
  return { lines, subtotal, missingPrice, status: ids ? status : "ready", retry: () => setAttempt((n) => n + 1) };
}

/** Product cards for the wishlist drawer. */
export function useWishlistCards() {
  return useProductCards(useShop((s) => s.wishlist));
}

/** Product cards for a list of ids, in the given order (wishlist, recently viewed). */
export function useProductCards(idList: string[]) {
  const ids = idList.join(",");
  const [cards, setCards] = useState<ProductCardData[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  useEffect(() => {
    if (!ids) return;
    let cancelled = false;
    queueMicrotask(() => !cancelled && setStatus("loading"));
    supabaseBrowser()
      .from("products")
      .select("id, slug, name_en, name_fr, placeholder_tone, created_at, is_new, is_best_seller, chips, eyebrow_en, eyebrow_fr, product_variants ( price_cad, is_active ), product_images ( storage_path, image_type, sort_order )")
      .in("id", ids.split(","))
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) return setStatus("error");
        setCards(
          ((data ?? []) as any[]).map((r) => {
            const prices = (r.product_variants ?? []).filter((v: any) => v.price_cad != null).map((v: any) => Number(v.price_cad));
            const imgs = [...(r.product_images ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order);
            return {
              id: r.id,
              slug: r.slug,
              name: tx(r.name_en, r.name_fr),
              eyebrow: tx(r.eyebrow_en, r.eyebrow_fr),
              fromPriceCad: prices.length ? Math.min(...prices) : null,
              isNew: r.is_new,
              isBestSeller: r.is_best_seller,
              reviewCount: 0,
              chips: r.chips ?? [],
              tone: r.placeholder_tone,
              image: mediaUrl(imgs[0]?.storage_path),
              image2: null,
              imageCount: imgs.length,
              createdAt: r.created_at,
            } satisfies ProductCardData;
          }),
        );
        setStatus("ready");
      });
    return () => {
      cancelled = true;
    };
  }, [ids]);
  const order = ids ? ids.split(",") : [];
  const byId = new Map(cards.map((c) => [c.id, c]));
  return { cards: ids ? order.map((id) => byId.get(id)).filter((c): c is ProductCardData => !!c) : [], status: ids ? status : "ready" };
}
