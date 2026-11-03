"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Ruler, ShieldCheck, Truck } from "lucide-react";
import { cutoutOf, StudioHero } from "@/components/shop/StudioHero";
import { BtnLink, Eyebrow, P } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { collectionHref } from "@/lib/routes";

/** Featured product (is_featured flag) shown in the hero. */
type FeaturedProduct = { name: string; slug: string; imageUrl?: string; tone?: string | null } | null;

/** "More comfort. More possibility." — white studio hero with the featured sofa floating below. */
export function Hero({ featured = null }: { featured?: FeaturedProduct }) {
  const t = useT();
  const accent = t("home.heroTitleAccent").split(" ");
  const accentLast = accent.pop();
  return (
    <StudioHero
      eyebrow={
        <Eyebrow line={false} className="!text-gold">
          {t("home.heroEyebrow")}
        </Eyebrow>
      }
      title={
        <>
          <span className="az-mask">
            <span className="az-rise" style={{ ["--d" as string]: "100ms" }}>
              {t("home.heroTitle")}
            </span>
          </span>{" "}
          <span className="az-mask">
            <span className="az-rise" style={{ ["--d" as string]: "220ms" }}>
              {accent.join(" ")} <span className="text-gold">{accentLast}</span>
            </span>
          </span>
        </>
      }
      cutout={cutoutOf(featured?.imageUrl)}
      fallback={featured?.imageUrl}
      alt={featured?.name ?? "Featured sofa"}
    >
      {featured && (
        <Link href={`/products/${featured.slug}`} className="az-zoom group inline-flex items-center gap-3 rounded-full border border-line py-1.5 pl-4 pr-1.5 text-[13px]">
          <span className="text-muted">{t("home.featured")}:</span>
          <span className="max-w-[46vw] truncate font-[600] sm:max-w-none">{featured.name}</span>
          <span className="az-card-go flex size-7 items-center justify-center rounded-full bg-ink text-white">
            <ArrowUpRight size={14} aria-hidden />
          </span>
        </Link>
      )}
      <P className="text-base">{t("home.heroSub")}</P>
      <div className="flex flex-col gap-3 sm:flex-row">
        <BtnLink href={collectionHref("all")} icon={ArrowRight}>
          {t("home.exploreSofas")}
        </BtnLink>
      </div>
      <div className="flex flex-wrap justify-center gap-x-[22px] gap-y-2 text-[12.5px] text-muted">
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
    </StudioHero>
  );
}
