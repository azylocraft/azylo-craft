"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Ruler, ShieldCheck, Truck } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { BtnLink, Eyebrow, Missing, P } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { collectionHref, routes } from "@/lib/routes";

/** Featured product (is_featured flag) shown in the hero image tag. */
type FeaturedProduct = { name: string; slug: string; imageUrl?: string; tone?: string | null } | null;

/** "More comfort. More possibility." — bold headline, olive accent word, featured sofa on the right. */
export function Hero({ featured = null }: { featured?: FeaturedProduct }) {
  const t = useT();
  const accent = t("home.heroTitleAccent").split(" ");
  const accentLast = accent.pop();
  return (
    <section className="px-4 pt-4 md:px-12 md:pt-7">
      <div className="grid overflow-hidden rounded-block border border-line2 bg-white md:rounded-hero lg:min-h-[600px] lg:grid-cols-[1fr_1.08fr]">
        <div className="order-2 flex flex-col justify-center gap-5 p-[22px] md:gap-6 md:p-12 lg:order-1 lg:px-16 lg:py-[72px]">
          <div className="az-fade-up">
            <Eyebrow line={false} className="!text-gold">
              {t("home.heroEyebrow")}
            </Eyebrow>
          </div>
          <h1 className="text-balance text-[40px] font-[800] leading-[1.02] tracking-[-0.045em] md:text-[58px] xl:text-[72px]">
            <span className="az-mask">
              <span className="az-rise" style={{ ["--d" as string]: "100ms" }}>
                {t("home.heroTitle")}
              </span>
            </span>
            <br />
            <span className="az-mask">
              <span className="az-rise" style={{ ["--d" as string]: "220ms" }}>
                {accent.join(" ")} <span className="text-gold">{accentLast}</span>
              </span>
            </span>
          </h1>
          <div className="az-fade-up flex flex-col gap-5 md:gap-6" style={{ ["--d" as string]: "400ms" }}>
            <P className="max-w-[440px] text-base">{t("home.heroSub")}</P>
            <div className="flex flex-col gap-3 sm:flex-row">
              <BtnLink href={collectionHref("all")} icon={ArrowRight} full className="sm:w-auto">
                {t("home.exploreSofas")}
              </BtnLink>
              <BtnLink href={collectionHref("rolling-side-table-with-storage")} kind="outline" full className="sm:w-auto">
                {t("home.exploreTables")}
              </BtnLink>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-[22px] gap-y-2 border-t border-line2 pt-5 text-[12.5px] text-muted">
              {(
                [
                  [Truck, "home.trustFree"],
                  [ShieldCheck, "home.trustDuties"],
                  [Ruler, "home.trustSmall"],
                ] as const
              ).map(([Icon, key]) => (
                <span key={key} className="flex items-center gap-2">
                  <Icon size={15} className="text-gold" aria-hidden />
                  {t(key)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="az-settle relative order-1 h-[280px] md:h-[440px] lg:order-2 lg:h-auto" style={{ ["--d" as string]: "150ms" }}>
          <Link href={featured ? `/products/${featured.slug}` : routes.home} className="az-zoom group absolute inset-0 block">
            <Media src={featured?.imageUrl} alt={featured?.name ?? "Featured sofa"} tone={featured?.tone ?? "#E2D7C4"} label={featured?.imageUrl ? undefined : "hero lifestyle photo"} eager className="size-full" />
            <span className="absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-tile bg-dark/80 px-[18px] py-4 text-white backdrop-blur-md md:inset-x-6 md:bottom-6">
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] text-gold-line">{t("home.featured")} design</span>
                <span className="block truncate text-[15px] font-[700]">{featured ? featured.name : <Missing field="featured product" />}</span>
              </span>
              <span className="az-card-go flex size-[42px] flex-none items-center justify-center rounded-full bg-white text-ink">
                <ArrowUpRight size={17} aria-hidden />
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
