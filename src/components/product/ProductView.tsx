"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Images,
  Link2,
  Mail,
  Play,
  Search,
  Share2,
  ShieldCheck,
  Sofa,
  Sparkles,
  Truck,
} from "lucide-react";
import { Gallery, Lightbox } from "@/components/product/Gallery";
import { MaterialPicker } from "@/components/product/MaterialPicker";
import { MATERIAL_INFO } from "@/lib/material-info";
import { VideoModal } from "@/components/product/VideoModal";
import { PriceCompareHint, PriceComparison } from "@/components/product/PriceComparison";
import { BuyMoreSaveMore, EmiLine, LaunchPriceTimer, LowStock, OfferStack, PriceBlock, RatingSummary, RecentBuyers, ReviewsSection, TrustBadges } from "@/components/product/Offers";
import { WriteReview } from "@/components/product/WriteReview";
import { FreeGiftPicker } from "@/components/product/Gifts";
import { RelatedCarousel } from "@/components/product/Related";
import { Stepper } from "@/components/shop/CartParts";
import { Crumb, RecentlyViewed } from "@/components/shop/Listing";
import { Media } from "@/components/shop/Media";
import { WishHeart } from "@/components/shop/ProductCards";
import { Price, T, useLocale, useShopCtx, useText } from "@/components/shop/ShopContext";
import { AccordionRow } from "@/components/ui/Accordion";
import { Markdown } from "@/components/ui/Markdown";
import { Badge, Btn, Eyebrow, H, Missing, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { useShop } from "@/lib/shop-store";
import type { I18nText, ProductCardData, ProductDetail, Variant } from "@/lib/types";
import { useUi } from "@/lib/ui-store";

type Faq = { id: string; slug: string; group: string; question: I18nText; answer: I18nText; showOnProduct: boolean };

const CUSTOM = "__custom__";
const keyOf = (t: I18nText) => t.en ?? t.fr ?? "";
const slugOf = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function ProductView({ product, related, faqs }: { product: ProductDetail; related: ProductCardData[]; faqs: Faq[] }) {
  const t = useT();
  const text = useText();
  const { lang } = useLocale();
  const { settings } = useShopCtx();
  const addRecentlyViewed = useShop((s) => s.addRecentlyViewed);
  const addToCart = useShop((s) => s.addToCart);
  const openDrawer = useUi((s) => s.open);
  const showToast = useUi((s) => s.showToast);

  useEffect(() => addRecentlyViewed(product.id), [product.id, addRecentlyViewed]);

  const models = useMemo(() => [...new Map(product.variants.map((v) => [keyOf(v.model), v.model])).entries()], [product.variants]);
  const colors = useMemo(
    () => [...new Map(product.variants.map((v) => [keyOf(v.color), { name: v.color, hex: v.colorHex }])).entries()],
    [product.variants],
  );
  const [model, setModel] = useState(models[0]?.[0] ?? "");
  const [color, setColor] = useState(colors[0]?.[0] ?? "");
  const [qty, setQty] = useState(1);
  const [gift, setGift] = useState<string | null>(null);
  const [video, setVideo] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const isCustom = color === CUSTOM;

  // ?colour=olive-green (from a per-colour collection card) preselects that colour; choosing a colour updates the link.
  // The link is read once, before this effect ever rewrites it.
  const wantedColour = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (wantedColour.current === undefined) wantedColour.current = new URLSearchParams(location.search).get("colour");
    const wanted = wantedColour.current;
    if (wanted) {
      wantedColour.current = null;
      const match = colors.find(([k]) => slugOf(k) === wanted);
      if (match && match[0] !== color) {
        queueMicrotask(() => setColor(match[0]));
        return;
      }
    }
    if (!color || isCustom || colors.length < 2) return;
    const url = new URL(location.href);
    if (url.searchParams.get("colour") === slugOf(color)) return;
    url.searchParams.set("colour", slugOf(color));
    history.replaceState(history.state, "", url);
  }, [color, isCustom, colors]);

  const variant: Variant | undefined =
    product.variants.find((v) => keyOf(v.model) === model && (isCustom || keyOf(v.color) === color)) ??
    product.variants.find((v) => keyOf(v.model) === model);
  const noPrice = !variant || variant.priceInr == null;
  const outOfStock = variant?.stock === 0;
  const canBuy = !!variant && !noPrice && !outOfStock;

  const name = text(product.name, "product name");
  const realSpaces = product.images.filter((i) => i.type === "real_space");
  // Photos tagged with a colour belong to that colour: the gallery shows the chosen colour's set
  // (plus untagged photos). Swatch photos of every colour are always included, so the Swatch tab
  // shows all colour options. Without colour-tagged photos for the choice, every photo is shown.
  const colourSet = isCustom
    ? []
    : [
        ...product.images.filter((i) => !i.color || i.color.toLowerCase() === color.toLowerCase()),
        ...product.images.filter((i) => i.type === "swatch" && i.color && i.color.toLowerCase() !== color.toLowerCase()),
      ];
  const galleryImages = colourSet.some((i) => i.color) ? colourSet : product.images;

  const fmtDate = (d: Date) => d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-IN", { month: "short", day: "numeric" });
  const delivery =
    product.leadMin != null && product.leadMax != null
      ? (() => {
          const a = new Date();
          a.setDate(a.getDate() + product.leadMin!);
          const b = new Date();
          b.setDate(b.getDate() + product.leadMax!);
          return `${fmtDate(a)} – ${fmtDate(b)}, ${b.getFullYear()}`;
        })()
      : null;

  const add = () => {
    if (!variant || !canBuy) return;
    const chosenGift = product.freeGiftEnabled && settings.freeGifts.length ? (gift ?? settings.freeGifts[0].key) : undefined;
    addToCart({ variantId: variant.id, productId: product.id, quantity: qty, customColor: isCustom || undefined, gift: chosenGift });
    openDrawer("cart");
  };

  // Sticky mini bar after the buy box scrolls away.
  const buyRef = useRef<HTMLDivElement>(null);
  const [showMini, setShowMini] = useState(false);
  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowMini(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [openAcc, setOpenAcc] = useState<Set<string>>(() => new Set(["overview", "delivery", "shipping"]));
  const accProps = (key: string) => ({
    open: openAcc.has(key),
    onToggle: (o: boolean) =>
      setOpenAcc((prev) => {
        const next = new Set(prev);
        if (o) next.add(key);
        else next.delete(key);
        return next;
      }),
  });

  return (
    <>
      <div className="px-4 pt-6 md:px-12">
        <Crumb items={[{ label: "Home", href: "/" }, { label: "Products", href: "/collections/all" }, { label: <T text={product.name} field="product name" fallback /> }]} />
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* Gallery column */}
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {product.videos.length > 0 && (
                <button type="button" onClick={() => setVideo(true)} className="inline-flex h-11 items-center gap-2.5 rounded-full bg-ink px-5 text-[13px] font-bold text-white">
                  <Play size={15} aria-hidden />
                  {t("product.video")} <span className="hidden font-medium text-on-dark-muted sm:inline">– {t("product.videoSub")}</span>
                </button>
              )}
              {realSpaces.length > 0 && (
                <a href="#real-spaces" className="inline-flex h-11 items-center gap-2.5 rounded-full bg-dark px-5 text-[13px] font-bold text-white">
                  <Images size={15} aria-hidden />
                  {t("product.realSpaces")} <span className="font-medium text-on-dark-muted">– {t("product.photos", { n: realSpaces.length })}</span>
                </a>
              )}
            </div>
            {/* Re-mounted per colour, so each colour opens on "All" at its first photo. */}
            <Gallery key={color} images={galleryImages} ratioFrom={product.images[0]?.url} tone={product.tone} name={name} />
          </div>

          {/* Buy box */}
          <div ref={buyRef} className="flex flex-col gap-5 lg:sticky lg:top-40 lg:self-start">
            <Eyebrow>{t("product.eyebrow")}</Eyebrow>
            <H as="h1" className="text-[28px] md:text-[38px]">
              <T text={product.name} field="product name" fallback />
            </H>
            {/* Selected colour, shown under the name (updates with the colour picker). */}
            {colors.length > 1 && !isCustom && colors.find(([k]) => k === color) && (
              <span className="-mt-2 flex items-center gap-2 text-[15px] text-ink2">
                <span aria-hidden className="size-3.5 rounded-full ring-1 ring-black/10" style={{ background: colors.find(([k]) => k === color)![1].hex ?? "#ccc" }} />
                {text(colors.find(([k]) => k === color)![1].name, "colour")}
              </span>
            )}
            <RatingSummary reviews={product.reviews} />
            {variant ? <PriceBlock price={variant.priceInr} compareAt={variant.compareAtInr} /> : <Missing field="variants" />}
            <LaunchPriceTimer />
            <PriceCompareHint price={variant?.priceInr ?? null} comparisons={product.comparisons} />
            <EmiLine price={variant?.priceInr ?? null} />
            <RecentBuyers count={product.recentOrders} />

            <div className="rounded-tile border border-line bg-white">
              <div className="grid grid-cols-2 divide-x divide-line border-b border-line text-[13px] font-bold">
                <span className="flex items-center justify-center gap-2 py-3">
                  <Truck size={16} className="text-gold" aria-hidden />
                  {t("card.freeDelivery")}
                </span>
                <span className="flex items-center justify-center gap-2 py-3">
                  <ShieldCheck size={16} className="text-gold" aria-hidden />
                  {t("home.trustDuties")}
                </span>
              </div>
              <div className="flex items-center gap-3 p-4">
                <CalendarDays size={20} className="text-gold" aria-hidden />
                <div className="flex-1">
                  <div className="text-[10px] font-extrabold tracking-[.1em] text-muted">{t("product.estimatedDelivery")}</div>
                  <b>{delivery ?? <Missing field="lead time" />}</b>
                  <div className="text-xs text-muted">{t("product.orderedToday")}</div>
                </div>
              </div>
              <button type="button" aria-expanded={deliveryOpen} onClick={() => setDeliveryOpen(!deliveryOpen)} className="flex w-full items-center justify-between border-t border-line px-4 py-3 text-[13px] font-semibold">
                {t("product.deliveryDetails")}
                <span className="flex items-center gap-2 text-muted">
                  {product.leadMin != null ? t("product.days", { a: product.leadMin, b: product.leadMax ?? product.leadMin }) : null}
                  <ChevronDown size={14} aria-hidden className={clsx("transition-transform", deliveryOpen && "rotate-180")} />
                </span>
              </button>
              {deliveryOpen && <p className="px-4 pb-4 text-[13px] leading-relaxed text-muted">{t("product.deliveryDetailsBody")}</p>}
            </div>

            {/* Model */}
            {models.length > 0 &&
              (models.every(([k]) => MATERIAL_INFO[k]) ? (
                <MaterialPicker
                  materials={models.map(([k]) => k)}
                  selected={model}
                  onSelect={setModel}
                  priceOf={(m) => product.variants.find((v) => keyOf(v.model) === m && (isCustom || keyOf(v.color) === color))?.priceInr ?? product.variants.find((v) => keyOf(v.model) === m)?.priceInr ?? null}
                  tint={isCustom ? null : (colors.find(([k]) => k === color)?.[1].hex ?? null)}
                />
              ) : (
              <fieldset className="flex flex-col gap-2.5">
                <legend className="mb-2.5 text-[13px] font-bold">
                  {t("product.model")}: <span className="font-medium text-muted">{variant ? text(variant.model, "model") : ""}</span>
                </legend>
                <div className="flex flex-col gap-2">
                  {models.map(([k, label]) => {
                    const v = product.variants.find((x) => keyOf(x.model) === k);
                    return (
                      <button
                        key={k}
                        type="button"
                        aria-pressed={model === k}
                        onClick={() => setModel(k)}
                        className={clsx(
                          "flex min-h-12 items-center justify-between gap-3 rounded-field border px-4 py-2.5 text-left text-[13.5px] font-semibold",
                          model === k ? "border-gold bg-gold-soft" : "border-line bg-white hover:border-ink",
                        )}
                      >
                        <T text={label} field="model" fallback />
                        <span className="flex-none text-xs text-muted">{v?.priceInr != null ? <Price cad={v.priceInr} withCode={false} /> : <Missing field="price" />}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              ))}

            {/* Colour */}
            {colors.length > 0 && (
              <fieldset>
                <legend className="mb-2.5 text-[13px] font-bold">
                  {t("product.colour")}: <span className="font-medium text-muted">{isCustom ? t("product.customColor") : colors.find(([k]) => k === color) ? text(colors.find(([k]) => k === color)![1].name, "colour") : ""}</span>
                </legend>
                <div className="flex flex-wrap gap-3">
                  {colors.map(([k, c]) => (
                    <button
                      key={k}
                      type="button"
                      aria-label={text(c.name, "colour")}
                      aria-pressed={color === k}
                      onClick={() => setColor(k)}
                      className="size-[38px] rounded-full"
                      style={{ background: c.hex ?? "#ccc", boxShadow: color === k ? "0 0 0 2px #fff, 0 0 0 4px var(--az-ink)" : "inset 0 0 0 1px rgba(0,0,0,.08)" }}
                    />
                  ))}
                  <button
                    type="button"
                    aria-label={t("product.customColor")}
                    aria-pressed={isCustom}
                    onClick={() => setColor(CUSTOM)}
                    className="flex size-[38px] items-center justify-center rounded-full border-[1.5px] border-dashed border-faint text-faint"
                    style={{ boxShadow: isCustom ? "0 0 0 2px #fff, 0 0 0 4px var(--az-ink)" : undefined }}
                  >
                    <Sparkles size={14} aria-hidden />
                  </button>
                </div>
                {isCustom && (
                  <p role="status" className="mt-3 flex gap-2 rounded-field border border-gold-line bg-gold-soft p-3 text-[13px] leading-snug text-ink2">
                    <CircleAlert size={16} className="mt-0.5 flex-none text-gold" aria-hidden />
                    {t("product.customNote")}
                  </p>
                )}
              </fieldset>
            )}

            {product.freeGiftEnabled && <FreeGiftPicker value={gift ?? settings.freeGifts[0]?.key ?? null} onChange={setGift} quantity={qty} />}
            <OfferStack price={variant?.priceInr ?? null} bonuses={[...product.bonuses, ...settings.bonusesDefault]} guaranteeDays={product.guaranteeDays} guaranteeText={product.guaranteeText} />
            <LowStock stock={variant?.stock ?? null} />

            <div className="flex items-center gap-3">
              <Stepper value={qty} onChange={setQty} label={t("cart.quantity")} />
              <Btn full size="lg" disabled={!canBuy} onClick={add} className="flex-1">
                {outOfStock ? t("product.outOfStock") : noPrice ? t("product.unavailable") : t("product.addToCart")}
              </Btn>
              <WishHeart productId={product.id} size={54} className="flex-none border border-line" />
              <ShareMenu name={name} onCopied={() => showToast(t("product.linkCopied"))} />
            </div>
            <BuyMoreSaveMore price={variant?.priceInr ?? null} />
            <TrustBadges />
            {noPrice && variant && (
              <p className="text-xs text-red">
                <Missing field="price" /> — {t("product.noPriceNote")}
              </p>
            )}

            <div className="flex items-start gap-3 rounded-tile bg-cream/60 p-4 text-[13px]">
              <Truck size={18} className="mt-0.5 flex-none text-gold" aria-hidden />
              <div>
                <b>{t("product.standardDelivery")}</b>
                <p className="text-muted">{t("product.standardDeliveryBody")}</p>
                <button type="button" onClick={() => { setOpenAcc((prev) => new Set(prev).add("delivery")); document.getElementById("acc-delivery")?.scrollIntoView({ behavior: "smooth" }); }} className="mt-1 font-bold underline">
                  {t("product.checkAccess")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PriceComparison azyloPrice={variant?.priceInr ?? product.fromPriceInr} comparisons={product.comparisons} points={product.comparisonPoints} />

      {/* Live photos (image type real_space) */}
      {realSpaces.length > 0 && <RealSpaces images={realSpaces.map((i) => i.url)} name={name} />}

      {/* See in your home (coming soon) */}
      <section className="px-4 pt-16 md:px-12">
        <div className="flex flex-col items-start gap-5 rounded-section bg-dark p-7 text-white md:flex-row md:items-center md:p-10">
          <span className="flex size-14 flex-none items-center justify-center rounded-full bg-gold text-white">
            <Sofa size={24} aria-hidden />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Eyebrow>{t("product.inHomeEyebrow")}</Eyebrow>
              <Badge tone="gold">{t("common.comingSoon")}</Badge>
            </div>
            <div className="mt-2 text-2xl font-extrabold tracking-[-0.02em]">{t("product.inHomeTitle")}</div>
            <p className="mt-1 text-sm text-on-dark-muted">{t("product.inHomeSub")}</p>
          </div>
        </div>
      </section>

      {/* Accordions */}
      <section className="px-4 pt-16 md:px-12">
        <div className="mx-auto max-w-[980px] rounded-card border border-line2 bg-white px-5 shadow-soft md:px-10">
          <AccordionRow number="01" title={t("product.acc1")} {...accProps("overview")}>
            <Markdown source={product.overview[lang] ?? product.overview.en} field="product overview" />
            {product.specs.length > 0 && (
              <dl className="mt-6 grid gap-x-8 gap-y-2 rounded-tile border border-line2 bg-white p-5 sm:grid-cols-2">
                {product.specs.map((s, i) => (
                  <div key={i} className="flex justify-between gap-4 border-b border-line2 py-2 text-sm">
                    <dt className="text-muted">{(lang === "fr" ? s.label_fr : s.label_en) ?? s.label_en ?? <Missing field="spec label" />}</dt>
                    <dd className="font-bold">{(lang === "fr" ? s.value_fr : s.value_en) ?? s.value_en ?? <Missing field="spec value" />}</dd>
                  </div>
                ))}
              </dl>
            )}
          </AccordionRow>
          <AccordionRow id="acc-delivery" number="02" title={t("product.acc2")} {...accProps("delivery")}>
            <Markdown source={product.deliveryAccess[lang] ?? product.deliveryAccess.en} field="delivery & access" />
          </AccordionRow>
          <AccordionRow number="03" title={t("product.acc3")} last {...accProps("shipping")}>
            <P className="mb-2 max-w-[640px]">{t("product.acc3Intro")}</P>
            {(["shipping", "orders", "returns"] as const).map((g) => {
              const rows = faqs.filter((f) => f.group === g && f.showOnProduct);
              return (
                <div key={g} className="mt-8">
                  <div className="mb-2 flex items-center gap-3 border-b border-line pb-3 text-[20px] font-[800] tracking-[-0.01em] md:text-[24px]">
                    <span aria-hidden className="h-0.5 w-5 bg-gold" />
                    {t(`faq.group.${g}`).toLocaleUpperCase("en")}
                  </div>
                  {rows.length === 0 ? (
                    <Missing field={`${g} FAQs`} />
                  ) : (
                    rows.map((f) => (
                      <AccordionRow key={f.id} size="sm" defaultOpen title={<T text={f.question} field="question" fallback />}>
                        <Markdown source={f.answer[lang] ?? f.answer.en} field="answer" />
                      </AccordionRow>
                    ))
                  )}
                </div>
              );
            })}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
              <Link href={routes.shipping} className="underline">{t("footer.links.shipping")}</Link>
              <Link href={routes.refund} className="underline">{t("footer.links.refund")}</Link>
              <Link href={routes.faq} className="underline">FAQ</Link>
            </div>
          </AccordionRow>
        </div>
      </section>

      <ReviewsSection reviews={product.reviews} writeButton={<WriteReview productId={product.id} productName={name} />} />
      <RecentlyViewed excludeId={product.id} />
      {related.length > 0 && <RelatedCarousel title={t("product.alsoLike")} products={related} />}

      {/* Sticky mini add-to-cart */}
      <div
        aria-hidden={!showMini}
        className={clsx(
          "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur transition-transform duration-300",
          showMini ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-center gap-3 px-4 py-3 md:px-12">
          <Media src={product.image} alt="" tone={product.tone} className="hidden size-12 flex-none rounded-xl sm:block" />
          <div className="hidden min-w-0 flex-1 sm:block">
            <div className="truncate text-sm font-bold">{name}</div>
            <div className="truncate text-xs text-muted">{variant ? `${text(variant.model, "model")} · ${isCustom ? t("product.customColor") : text(variant.color, "colour")}` : ""}</div>
          </div>
          <WishHeart productId={product.id} size={48} className="flex-none border border-line sm:hidden" />
          <Btn size="lg" disabled={!canBuy} onClick={add} tabIndex={showMini ? 0 : -1} className="flex-1 sm:flex-none">
            {canBuy ? (
              <>
                {t("product.addToCart")} · <Price cad={(variant?.priceInr ?? 0) * qty} withCode={false} />
              </>
            ) : outOfStock ? (
              t("product.outOfStock")
            ) : (
              t("product.unavailable")
            )}
          </Btn>
        </div>
      </div>

      {video && product.videos.length > 0 && <VideoModal videos={product.videos} onClose={() => setVideo(false)} />}
    </>
  );
}

function RealSpaces({ images, name }: { images: string[]; name: string }) {
  const t = useT();
  const [open, setOpen] = useState<number | null>(null);
  const tones = ["#D8C9B1", "#CBBBA3", "#E2D7C4", "#C9BEA9", "#DCD0BE"];
  const count = images.length;
  const shown = count ? images.slice(0, 8) : [];
  return (
    <section id="real-spaces" className="scroll-mt-40 px-4 pt-16 md:px-12 md:pt-24">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div className="flex flex-col gap-3">
          <Eyebrow>{t("product.rsEyebrow")}</Eyebrow>
          <H className="text-[30px] md:text-[44px]">
            {t("product.rsTitle")} <Serif gold>{t("product.rsAccent")}</Serif>
          </H>
          <P>{t("product.rsSub")}</P>
        </div>
        <span className="flex size-[92px] flex-none flex-col items-center justify-center rounded-full border border-gold-line bg-gold-soft text-center text-[10px] font-extrabold uppercase tracking-[.08em] text-gold">
          <span className="text-2xl tracking-normal text-ink">{count}</span>
          {t("product.realPhotos")}
        </span>
      </div>
      {count === 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6">
          {tones.map((tone, i) => (
            <div key={i} className={clsx(i < 2 ? "md:col-span-3" : "md:col-span-2", i === 4 && "col-span-2 md:col-span-2")}>
              <Media alt="" tone={tone} className="h-[160px] rounded-tile md:h-[280px]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Missing field="real-space photo" />
                </div>
              </Media>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Photos share the row equally (up to 4 per row) and keep their own shape — nothing is cropped. */}
          <div
            className={clsx("mt-8 grid items-start gap-3 md:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]", shown.length === 1 ? "max-w-[560px] grid-cols-1" : "grid-cols-2")}
            style={{ ["--cols" as string]: Math.min(shown.length, 4) }}
          >
            {shown.map((src, i) => (
              <button key={i} type="button" onClick={() => setOpen(i)} className="group relative overflow-hidden rounded-tile bg-bg2">
                <img src={src} alt={`${name} — live photo ${i + 1}`} loading="lazy" className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]" />
                <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100">
                  <Search size={15} aria-hidden />
                </span>
              </button>
            ))}
          </div>
          {count > shown.length && (
            <Btn kind="outline" className="mt-6" onClick={() => setOpen(0)}>
              {t("product.viewAllPhotos", { n: count })}
            </Btn>
          )}
        </>
      )}
      {open != null && <Lightbox urls={images} start={open} onClose={() => setOpen(null)} label={name} />}
    </section>
  );
}

function ShareMenu({ name, onCopied }: { name: string; onCopied: () => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const e = encodeURIComponent;
  const links: [string, string][] = [
    ["WhatsApp", `https://wa.me/?text=${e(`${name} ${url}`)}`],
    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${e(url)}`],
    ["X", `https://twitter.com/intent/tweet?url=${e(url)}&text=${e(name)}`],
    ["Pinterest", `https://pinterest.com/pin/create/button/?url=${e(url)}&description=${e(name)}`],
    ["Telegram", `https://t.me/share/url?url=${e(url)}&text=${e(name)}`],
    ["Email", `mailto:?subject=${e(name)}&body=${e(url)}`],
  ];
  return (
    <div className="relative flex-none">
      <button type="button" aria-label={t("product.share")} aria-expanded={open} onClick={() => setOpen(!open)} className="flex size-[54px] items-center justify-center rounded-full border border-line bg-white hover:border-ink">
        <Share2 size={18} aria-hidden />
      </button>
      {open && (
        <div className="absolute bottom-[calc(100%+8px)] right-0 z-30 w-[230px] rounded-tile border border-line2 bg-white p-2 shadow-float">
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(location.href);
              } catch {
                /* clipboard blocked; still show feedback */
              }
              onCopied();
              setOpen(false);
            }}
            className="flex h-10 w-full items-center gap-2.5 rounded-xl px-3 text-sm font-semibold hover:bg-gold-soft"
          >
            <Link2 size={15} aria-hidden />
            {t("product.copyLink")}
          </button>
          {links.map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm hover:bg-gold-soft">
              {label === "Email" ? <Mail size={15} aria-hidden /> : <Share2 size={15} aria-hidden />}
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className={clsx("flex flex-col gap-1.5", error && "[&_.field]:border-red [&_.field]:bg-[#FFFBFA]")}>
      <span className="text-xs font-bold text-ink2">{label}</span>
      {children}
      {error && (
        <span className="flex items-center gap-1.5 text-xs text-red">
          <CircleAlert size={13} aria-hidden />
          {error}
        </span>
      )}
    </label>
  );
}

