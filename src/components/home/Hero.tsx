"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, CreditCard, Hammer, Palette, ShieldCheck, Truck } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { BtnLink, Eyebrow, H, P } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { collectionHref, routes } from "@/lib/routes";

/** Featured product (is_featured flag) shown in the hero. */
type FeaturedProduct = { name: string; slug: string; imageUrl?: string; tone?: string | null } | null;

const HERO_WORDS = ["azylo", "sofa"];

/** Giant lowercase wordmark headline with the featured sofa rising underneath it. */
export function Hero({ featured = null }: { featured?: FeaturedProduct }) {
  const t = useT();
  return (
    <section className="relative px-4 pt-6 md:px-12 md:pt-8">
      <h1 className="az-h relative text-center text-[24vw] font-bold leading-[.82] tracking-[-0.065em] md:text-[17vw] xl:text-[230px]">
        {HERO_WORDS.map((w, i) => (
          <span key={w}>
            {i > 0 && " "}
            <span className="az-mask">
              <span className="az-rise" style={{ ["--d" as string]: `${120 + i * 110}ms` }}>
                {w}
                {i === HERO_WORDS.length - 1 && <span className="text-gold">.</span>}
              </span>
            </span>
          </span>
        ))}
        <span className="sr-only"> — {t("home.heroTitle")} {t("home.heroTitleAccent")}</span>
      </h1>

      <div className="az-settle relative z-10 -mt-[1.6vw] xl:-mt-[18px]" style={{ ["--d" as string]: "250ms" }}>
        <Link href={featured ? `/products/${featured.slug}` : collectionHref("all")} className="az-card group block overflow-hidden rounded-block md:rounded-hero">
          <Media
            src={featured?.imageUrl}
            alt={featured?.name ?? "Featured sofa"}
            tone={featured?.tone ?? "#E7E6E1"}
            label={featured?.imageUrl ? undefined : "hero photo"}
            eager
            className="h-[300px] w-full md:h-[520px] xl:h-[600px]"
          />
          {featured && (
            <span className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-white/90 py-1.5 pl-4 pr-1.5 text-[13px] font-semibold lowercase backdrop-blur md:bottom-6 md:left-6">
              {featured.name}
              <span className="az-card-go flex size-8 items-center justify-center rounded-full bg-ink text-white">
                <ArrowUpRight size={15} aria-hidden />
              </span>
            </span>
          )}
        </Link>
      </div>

      <div className="az-fade-up mt-6 flex flex-col items-start justify-between gap-5 md:mt-8 md:flex-row md:items-end" style={{ ["--d" as string]: "500ms" }}>
        <P className="max-w-[420px] text-[15px] lowercase text-ink2">{t("home.heroSub")}</P>
        <div className="flex flex-wrap gap-3">
          <BtnLink href={collectionHref("all")} icon={ArrowRight}>
            {t("home.exploreSofas")}
          </BtnLink>
          <BtnLink href={collectionHref("rolling-side-table-with-storage")} kind="outline">
            {t("home.exploreTables")}
          </BtnLink>
        </div>
      </div>
    </section>
  );
}

/** Full-bleed black "what about us" band with a slow trust ribbon. */
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
    <section className="mt-14 bg-dark text-white md:mt-20">
      <div className="grid gap-8 px-4 py-12 md:grid-cols-[1fr_1.1fr] md:px-12 md:py-16">
        <div className="flex flex-col items-start gap-5">
          <div>
            <Eyebrow>who we are</Eyebrow>
            <H className="mt-1 text-[28px] md:text-[40px]">what about us</H>
          </div>
          <BtnLink href={routes.about} kind="ghostW" size="sm" icon={ArrowUpRight}>
            more about azylo
          </BtnLink>
        </div>
        <p className="max-w-[560px] text-[18px] leading-[1.45] text-on-dark md:text-[24px]">
          furniture shaped by how you live, not by trends. soft forms, honest materials, made to order and delivered free to your door.
        </p>
      </div>
      <div className="overflow-hidden border-t border-dark-line py-5" aria-label={t("home.goodHandsEyebrow")}>
        <div className="az-marquee gap-12 pr-12">
          {[0, 1].map((copy) =>
            items.map(([Icon, key]) => (
              <span key={copy + key} aria-hidden={copy === 1} className="flex items-center gap-3 whitespace-nowrap text-[15px] lowercase">
                <Icon size={18} className="text-gold-bright" aria-hidden />
                <b className="font-semibold">{t(key)}</b>
                <span className="text-on-dark-faint">{t(key + "Desc")}</span>
              </span>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
