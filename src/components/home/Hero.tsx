"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, CreditCard, Hammer, Palette, Ruler, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { BtnLink, Eyebrow, H, Missing, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { collectionHref, routes } from "@/lib/routes";

/** Featured product (is_featured flag) shown in the hero image tag. */
type FeaturedProduct = { name: string; slug: string; imageUrl?: string; tone?: string | null } | null;

export function Hero({ featured = null }: { featured?: FeaturedProduct }) {
  const t = useT();
  return (
    <section className="px-4 pt-4 md:px-12 md:pt-7">
      <div className="grid overflow-hidden rounded-block border border-line2 bg-white shadow-card md:rounded-hero lg:h-[600px] lg:grid-cols-[1fr_1.08fr]">
        <div className="order-2 flex flex-col justify-center gap-5 p-[22px] md:gap-6 md:p-12 lg:order-1 lg:px-16 lg:py-[72px]">
          <Eyebrow>{t("home.heroEyebrow")}</Eyebrow>
          <H as="h1" className="text-[34px] md:text-[56px] xl:text-[68px]">
            {t("home.heroTitle")}
            <br />
            <Serif gold>{t("home.heroTitleAccent")}</Serif>
          </H>
          <P className="max-w-[440px] text-base">{t("home.heroSub")}</P>
          <div className="flex flex-col gap-3 sm:flex-row">
            <BtnLink href={collectionHref("all")} icon={ArrowRight} full className="sm:w-auto">
              {t("home.exploreSofas")}
            </BtnLink>
            <BtnLink href={collectionHref("rolling-side-table-with-storage")} kind="outline" full className="sm:w-auto">
              {t("home.exploreTables")}
            </BtnLink>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-[22px] gap-y-2 text-[12.5px] text-muted">
            {[
              [Truck, "home.trustFree"],
              [ShieldCheck, "home.trustDuties"],
              [Ruler, "home.trustSmall"],
            ].map(([Icon, key]) => {
              const I = Icon as typeof Truck;
              return (
                <span key={key as string} className="flex items-center gap-2">
                  <I size={15} className="text-gold" aria-hidden />
                  {t(key as string)}
                </span>
              );
            })}
          </div>
        </div>

        <div className="relative order-1 h-[260px] md:h-[420px] lg:order-2 lg:h-full">
          <Media src={featured?.imageUrl} alt={featured?.name ?? "Hero image"} tone={featured?.tone ?? "#E2D7C4"} label={featured?.imageUrl ? undefined : "hero lifestyle photo"} eager className="size-full" />
          <span className="absolute right-5 top-5 flex h-[30px] items-center gap-1.5 rounded-full bg-white/90 px-3.5 text-[11.5px] font-bold">
            <Sparkles size={13} className="text-gold" aria-hidden />
            {t("home.new2026")}
          </span>
          <Link
            href={featured ? `/products/${featured.slug}` : routes.home}
            className="absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-tile bg-dark/80 px-[18px] py-4 text-white backdrop-blur-md md:inset-x-6 md:bottom-6"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[10.5px] font-extrabold uppercase tracking-[.14em] text-gold-line">{t("home.featured")}</div>
              <div className="truncate text-[15px] font-bold">{featured ? featured.name : <Missing field="featured product" />}</div>
            </div>
            <span className="flex size-[42px] flex-none items-center justify-center rounded-full bg-white text-ink">
              <ArrowUpRight size={17} aria-hidden />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/** "Your order, in good hands" dark strip (spec §5.2 items). */
export function TrustStrip() {
  const t = useT();
  const items = [
    [Truck, "home.strip.free"],
    [ShieldCheck, "home.strip.duties"],
    [CreditCard, "home.strip.payment"],
    [Palette, "home.strip.samples"],
    [Hammer, "home.strip.custom"],
  ] as const;
  return (
    <section className="px-4 pt-10 md:px-12 md:pt-14">
      <div className="overflow-hidden rounded-section border border-line2 bg-white shadow-card">
        <div className="flex flex-col items-start justify-between gap-4 bg-dark px-6 py-[26px] text-white sm:flex-row sm:items-center md:px-9">
          <div>
            <Eyebrow className="mb-2">{t("home.goodHandsEyebrow")}</Eyebrow>
            <div className="text-[22px] font-extrabold tracking-[-0.02em] md:text-[26px]">
              {t("home.goodHandsTitle")} <Serif gold>{t("home.goodHandsAccent")}</Serif>
            </div>
          </div>
          <BtnLink href={routes.shipping} kind="ghostW" size="sm" icon={ArrowRight}>
            {t("home.howDelivery")}
          </BtnLink>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {items.map(([Icon, key], k) => (
            <div key={key} className={`flex flex-col gap-2.5 border-line p-6 lg:px-[26px] lg:py-7 ${k ? "lg:border-l" : ""} border-t lg:border-t-0`}>
              <Icon size={22} className="text-gold" aria-hidden />
              <div className="text-[15px] font-extrabold">{t(key)}</div>
              <P className="text-[13px]">{t(key + "Desc")}</P>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

