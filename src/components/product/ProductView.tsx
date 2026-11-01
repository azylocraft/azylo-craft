"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Images,
  Link2,
  Mail,
  MessageCircle,
  Phone,
  Play,
  Search,
  Share2,
  ShieldCheck,
  Sofa,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import { Gallery, Lightbox } from "@/components/product/Gallery";
import { VideoModal } from "@/components/product/VideoModal";
import { PriceComparison } from "@/components/product/PriceComparison";
import { RelatedCarousel } from "@/components/product/Related";
import { Stepper } from "@/components/shop/CartParts";
import { Crumb, RecentlyViewed } from "@/components/shop/Listing";
import { Media } from "@/components/shop/Media";
import { Modal, Overlay } from "@/components/shop/Overlay";
import { WishHeart } from "@/components/shop/ProductCards";
import { Price, T, useLocale, useShopCtx, useText } from "@/components/shop/ShopContext";
import { AccordionRow } from "@/components/ui/Accordion";
import { Markdown } from "@/components/ui/Markdown";
import { Badge, Btn, Eyebrow, H, Missing, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { useShop } from "@/lib/shop-store";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { I18nText, ProductCardData, ProductDetail, Variant } from "@/lib/types";
import { useUi } from "@/lib/ui-store";

type Faq = { id: string; slug: string; group: string; question: I18nText; answer: I18nText; showOnProduct: boolean };

const CUSTOM = "__custom__";
const keyOf = (t: I18nText) => t.en ?? t.fr ?? "";

export function ProductView({ product, related, faqs }: { product: ProductDetail; related: ProductCardData[]; faqs: Faq[] }) {
  const t = useT();
  const text = useText();
  const { lang } = useLocale();
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
  const [video, setVideo] = useState(false);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const isCustom = color === CUSTOM;

  const variant: Variant | undefined =
    product.variants.find((v) => keyOf(v.model) === model && (isCustom || keyOf(v.color) === color)) ??
    product.variants.find((v) => keyOf(v.model) === model);
  const noPrice = !variant || variant.priceInr == null;
  const outOfStock = variant?.stock === 0;
  const canBuy = !!variant && !noPrice && !outOfStock;

  const name = text(product.name, "product name");
  const realSpaces = product.images.filter((i) => i.type === "real_space");
  const livePhotos = product.images.filter((i) => i.type === "live");
  const galleryImages = product.images.filter((i) => i.type !== "real_space");

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
    addToCart({ variantId: variant.id, productId: product.id, quantity: qty, customColor: isCustom || undefined });
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

  const [ask, setAsk] = useState(false);
  const [speak, setSpeak] = useState(false);
  const [openAcc, setOpenAcc] = useState<string | null>("overview");

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
              <a href="#real-spaces" className="inline-flex h-11 items-center gap-2.5 rounded-full bg-dark px-5 text-[13px] font-bold text-white">
                <Images size={15} aria-hidden />
                {t("product.realSpaces")} <span className="font-medium text-on-dark-muted">– {t("product.photos", { n: realSpaces.length })}</span>
              </a>
            </div>
            <Gallery images={galleryImages} tone={product.tone} name={name} />
          </div>

          {/* Buy box */}
          <div ref={buyRef} className="flex flex-col gap-5 lg:sticky lg:top-40 lg:self-start">
            <Eyebrow>{t("product.eyebrow")}</Eyebrow>
            <H as="h1" className="text-[28px] md:text-[38px]">
              <T text={product.name} field="product name" fallback />
            </H>
            {product.reviewCount > 0 && (
              <span className="inline-flex h-7 self-start items-center gap-1.5 rounded-full bg-gold-soft px-3 text-xs font-bold text-gold">★ {t("card.experiences", { n: product.reviewCount })}</span>
            )}
            <div className="text-[28px] font-extrabold" aria-live="polite">
              {variant ? <Price cad={variant.priceInr} /> : <Missing field="variants" />}
            </div>

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
            {models.length > 0 && (
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
            )}

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

            <div className="flex items-center gap-3">
              <Stepper value={qty} onChange={setQty} label={t("cart.quantity")} />
              <Btn full size="lg" disabled={!canBuy} onClick={add} className="flex-1">
                {outOfStock ? t("product.outOfStock") : noPrice ? t("product.unavailable") : t("product.addToCart")}
              </Btn>
              <WishHeart productId={product.id} size={54} className="flex-none border border-line" />
              <ShareMenu name={name} onCopied={() => showToast(t("product.linkCopied"))} />
            </div>
            {noPrice && variant && (
              <p className="text-xs text-red">
                <Missing field="price" /> — {t("product.noPriceNote")}
              </p>
            )}

            <div className="rounded-tile border border-line2 bg-white p-5">
              <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.14em] text-gold">{t("product.concierge")}</div>
              <div className="mt-1.5 text-base font-extrabold">{t("product.conciergeTitle")}</div>
              <div className="mt-3.5 grid grid-cols-2 gap-2">
                <Btn kind="outline" size="sm" iconL={MessageCircle} onClick={() => setAsk(true)}>
                  {t("product.ask")}
                </Btn>
                <Btn kind="light" size="sm" iconL={Phone} onClick={() => setSpeak(true)}>
                  {t("product.speak")}
                </Btn>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-tile bg-cream/60 p-4 text-[13px]">
              <Truck size={18} className="mt-0.5 flex-none text-gold" aria-hidden />
              <div>
                <b>{t("product.standardDelivery")}</b>
                <p className="text-muted">{t("product.standardDeliveryBody")}</p>
                <button type="button" onClick={() => { setOpenAcc("delivery"); document.getElementById("acc-delivery")?.scrollIntoView({ behavior: "smooth" }); }} className="mt-1 font-bold underline">
                  {t("product.checkAccess")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PriceComparison azyloPrice={variant?.priceInr ?? product.fromPriceInr} comparisons={product.comparisons} points={product.comparisonPoints} />

      {/* Real spaces */}
      <RealSpaces images={realSpaces.map((i) => i.url)} name={name} />

      {livePhotos.length > 0 && (
        <section className="px-4 pt-16 md:px-12">
          <Eyebrow>{t("product.liveEyebrow")}</Eyebrow>
          <H className="mt-3 text-[28px] md:text-[40px]">{t("product.liveTitle")}</H>
          <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
            {livePhotos.map((img) => (
              <Media key={img.id} src={img.url} alt={text(img.alt, "image alt")} className="aspect-square rounded-tile" />
            ))}
          </div>
        </section>
      )}

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
        <div className="mx-auto max-w-[980px] border-t border-line">
          <AccordionRow number="01" title={t("product.acc1")} open={openAcc === "overview"} onToggle={(o) => setOpenAcc(o ? "overview" : null)}>
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
          <AccordionRow id="acc-delivery" number="02" title={t("product.acc2")} open={openAcc === "delivery"} onToggle={(o) => setOpenAcc(o ? "delivery" : null)}>
            <Markdown source={product.deliveryAccess[lang] ?? product.deliveryAccess.en} field="delivery & access" />
          </AccordionRow>
          <AccordionRow number="03" title={t("product.acc3")} open={openAcc === "shipping"} onToggle={(o) => setOpenAcc(o ? "shipping" : null)}>
            {(["shipping", "orders", "returns"] as const).map((g) => {
              const rows = faqs.filter((f) => f.group === g && f.showOnProduct);
              return (
                <div key={g} className="mb-5">
                  <div className="mb-1 text-[11px] font-extrabold uppercase tracking-[.14em] text-gold">{t(`faq.group.${g}`)}</div>
                  {rows.length === 0 ? (
                    <Missing field={`${g} FAQs`} />
                  ) : (
                    rows.map((f) => (
                      <AccordionRow key={f.id} size="sm" title={<T text={f.question} field="question" fallback />}>
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
      {ask && <AskQuestion productId={product.id} productName={name} onClose={() => setAsk(false)} />}
      {speak && <SpeakModal onClose={() => setSpeak(false)} />}
    </>
  );
}

function RealSpaces({ images, name }: { images: string[]; name: string }) {
  const t = useT();
  const [open, setOpen] = useState<number | null>(null);
  const tones = ["#D8C9B1", "#CBBBA3", "#E2D7C4", "#C9BEA9", "#DCD0BE"];
  const count = images.length;
  const shown = count ? images.slice(0, 5) : [];
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
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-6">
            {shown.map((src, i) => (
              <button key={i} type="button" onClick={() => setOpen(i)} className={clsx("group relative overflow-hidden rounded-tile", i < 2 ? "md:col-span-3" : "md:col-span-2", i === 4 && "col-span-2 md:col-span-2")}>
                <img src={src} alt={`${name} — real space ${i + 1}`} loading="lazy" className="h-[160px] w-full object-cover transition-transform duration-500 group-hover:scale-105 md:h-[280px]" />
                <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 opacity-0 transition-opacity group-hover:opacity-100">
                  <Search size={15} aria-hidden />
                </span>
              </button>
            ))}
          </div>
          <Btn kind="outline" className="mt-6" onClick={() => setOpen(0)}>
            {t("product.viewAllPhotos", { n: count })}
          </Btn>
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

function AskQuestion({ productId, productName, onClose }: { productId: string; productName: string; onClose: () => void }) {
  const t = useT();
  const [form, setForm] = useState({ name: "", email: "", question: "", website: "" });
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = t("form.required");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = t("form.email");
    if (form.question.trim().length < 5) errs.question = t("form.required");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("busy");
    const { error } = await supabaseBrowser().functions.invoke("product-question", { body: { ...form, productId } });
    setState(error ? "error" : "sent");
  };
  return (
    <Overlay onClose={onClose} label={t("product.ask")}>
      <Modal>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <Eyebrow>{t("product.concierge")}</Eyebrow>
            <H className="mt-2 text-[26px]">{state === "sent" ? t("product.askSentTitle") : t("product.ask")}</H>
            <p className="mt-1 text-[13px] text-muted">{productName}</p>
          </div>
          <button type="button" aria-label={t("common.close")} onClick={onClose} className="flex size-10 flex-none items-center justify-center rounded-full border border-line">
            <X size={16} aria-hidden />
          </button>
        </div>
        {state === "sent" ? (
          <div className="flex flex-col items-start gap-4">
            <span className="flex size-[52px] items-center justify-center rounded-full bg-green-soft text-green">
              <Check size={22} aria-hidden />
            </span>
            <P>{t("product.askSentBody")}</P>
            <Btn onClick={onClose}>{t("common.close")}</Btn>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-3.5">
            <Field label={t("form.name")} error={errors.name}>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" autoComplete="name" />
            </Field>
            <Field label={t("form.emailLabel")} error={errors.email}>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" autoComplete="email" />
            </Field>
            <Field label={t("product.yourQuestion")} error={errors.question}>
              <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="field h-32 resize-none py-3" maxLength={2000} />
            </Field>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            {state === "error" && (
              <p role="alert" className="flex items-center gap-2 text-sm text-red">
                <CircleAlert size={15} aria-hidden />
                {t("form.sendError")}
              </p>
            )}
            <Btn type="submit" full size="lg" disabled={state === "busy"}>
              {state === "busy" ? t("form.sending") : state === "error" ? t("common.retry") : t("form.send")}
            </Btn>
          </form>
        )}
      </Modal>
    </Overlay>
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

function SpeakModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { settings } = useShopCtx();
  return (
    <Overlay onClose={onClose} label={t("product.speak")}>
      <Modal className="max-w-[460px]">
        <div className="mb-5 flex items-start justify-between">
          <H className="text-[26px]">{t("product.speakTitle")}</H>
          <button type="button" aria-label={t("common.close")} onClick={onClose} className="flex size-10 items-center justify-center rounded-full border border-line">
            <X size={16} aria-hidden />
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {settings.phone ? (
            <a href={`tel:${settings.phone}`} className="flex items-center gap-3 rounded-field border border-line p-4 font-bold hover:border-ink">
              <Phone size={18} className="text-gold" aria-hidden />
              {settings.phone}
            </a>
          ) : (
            null
          )}
          {settings.email ? (
            <a href={`mailto:${settings.email}`} className="flex items-center gap-3 rounded-field border border-line p-4 font-bold hover:border-ink">
              <Mail size={18} className="text-gold" aria-hidden />
              {settings.email}
            </a>
          ) : (
            null
          )}
          <Link href={routes.contact} onClick={onClose} className="flex items-center gap-3 rounded-field border border-line p-4 font-bold hover:border-ink">
            <MessageCircle size={18} className="text-gold" aria-hidden />
            {t("product.contactForm")}
          </Link>
        </div>
      </Modal>
    </Overlay>
  );
}
