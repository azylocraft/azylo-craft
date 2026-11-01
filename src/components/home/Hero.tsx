"use client";

import Link from "next/link";
import { ArrowRight, CreditCard, Hammer, Palette, ShieldCheck, Truck } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { BtnLink, Eyebrow, H, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { collectionHref, routes } from "@/lib/routes";

/** Featured product (is_featured flag) shown in the hero. */
type FeaturedProduct = { name: string; slug: string; imageUrl?: string; tone?: string | null } | null;

const HERO_WORDS = ["sofa", "bed"];

/**
 * Bau hero (design screen 9): giant "sofa bed" headline with the featured sofa laid over it,
 * then the dark "what about us" band. Stacks on small screens.
 */
export function Hero({ featured = null }: { featured?: FeaturedProduct }) {
  const t = useT();
  return (
    <section className="px-4 pt-4 md:px-12 md:pt-6">
      <div className="relative overflow-hidden rounded-t-[28px] bg-white px-5 pb-8 pt-6 md:rounded-t-hero lg:h-[clamp(470px,42vw,600px)] lg:p-0">
        <h1 className="az-h text-center text-[22vw] font-extrabold leading-none tracking-[-0.06em] lg:absolute lg:inset-x-0 lg:top-10 lg:text-[clamp(120px,17.4vw,250px)]">
          {HERO_WORDS.map((w, i) => (
            <span key={w}>
              {i > 0 && " "}
              <span className="az-mask">
                <span className="az-rise" style={{ ["--d" as string]: `${120 + i * 120}ms` }}>
                  {w}
                </span>
              </span>
            </span>
          ))}
          <span className="sr-only"> — {t("home.heroTitle")} {t("home.heroTitleAccent")}</span>
        </h1>

        <Link
          href={featured ? `/products/${featured.slug}` : collectionHref("convertible-sofa-beds")}
          aria-label={featured?.name ?? "Featured sofa bed"}
          className="az-settle az-card relative z-[2] -mt-[3vw] block overflow-hidden rounded-[28px] shadow-[0_60px_60px_-50px_rgba(0,0,0,.4)] md:rounded-[40px] lg:absolute lg:left-[22.3%] lg:top-[35%] lg:mt-0 lg:h-[55%] lg:w-[46%]"
          style={{ ["--d" as string]: "300ms" }}
        >
          <Media
            src={featured?.imageUrl}
            alt={featured?.name ?? "Featured sofa bed"}
            tone={featured?.tone ?? "#E2E2DE"}
            label={featured?.imageUrl ? undefined : "product cut-out"}
            eager
            className="h-[240px] w-full md:h-[360px] lg:h-full"
          />
        </Link>

        <div className="az-fade-up relative z-[3] mt-6 flex flex-col items-start gap-5 lg:absolute lg:left-[71.4%] lg:top-[53%] lg:mt-0 lg:max-w-[23%]" style={{ ["--d" as string]: "650ms" }}>
          <p className="m-0 text-[13px] lowercase leading-[1.4] text-ink2">{featured?.name ?? t("home.heroSub")}</p>
          <BtnLink href={collectionHref("convertible-sofa-beds")} size="sm" icon={ArrowRight} className="lg:ml-[26%]">
            to collection
          </BtnLink>
        </div>
      </div>

      <div className="grid items-center gap-8 rounded-b-[28px] bg-dark px-6 py-10 text-white md:rounded-b-hero md:px-16 md:py-14 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-1.5">
          <span className="text-[12.5px] text-on-dark-muted">01/ who we are</span>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
            <H className="text-[30px] text-white md:text-[36px]">what about us</H>
            <BtnLink href={routes.about} kind="ghostW" size="sm" icon={ArrowRight} className="border-white">
              more about azylo
            </BtnLink>
          </div>
        </div>
        <P className="text-[18px] leading-[1.45] text-white">
          made-to-order recliners, sofa beds and small-space sofas. delivered free across india, sized for real homes.
        </P>
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

