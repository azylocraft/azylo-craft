"use client";

import Link from "next/link";
import { ArrowRight, Check, Compass, Factory, Route, Search } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { useLocale } from "@/components/shop/ShopContext";
import { BtnLink, Eyebrow, H, Missing, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { collectionHref, routes } from "@/lib/routes";

type Blocks = Record<string, { en?: string; fr?: string }>;

/** About us (design screen 68). Headings are UI copy; body copy comes from pages.blocks (MISSING until supplied). */
export function AboutView({ blocks }: { blocks: Blocks }) {
  const t = useT();
  const { lang } = useLocale();
  const copy = (k: string) => {
    const v = blocks[k]?.[lang] ?? blocks[k]?.en ?? null;
    return v ? <>{v}</> : <Missing field={`about.${k}`} />;
  };
  return (
    <>
      <section className="px-4 pt-6 md:px-12">
        <div className="grid gap-10 rounded-block bg-dark p-7 text-white md:rounded-hero md:p-16 lg:grid-cols-[1.3fr_1fr]">
          <div className="flex flex-col gap-5">
            <Eyebrow>{t("about.eyebrow")}</Eyebrow>
            <H as="h1" className="text-[36px] text-white md:text-[64px]">
              {t("about.heroTitle")} <Serif gold>{t("about.heroAccent")}</Serif> {t("about.heroTail")}
            </H>
            <P className="text-on-dark-muted">{copy("hero")}</P>
            <div className="flex flex-wrap gap-3">
              <BtnLink href={collectionHref("all")} kind="white" icon={ArrowRight}>
                {t("about.explore")}
              </BtnLink>
              <BtnLink href="#approach" kind="ghostW">
                {t("about.approach")}
              </BtnLink>
            </div>
          </div>
          <div className="flex flex-col justify-end gap-4 border-t border-dark-line pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="font-serif text-2xl italic text-gold-bright">{copy("statement")}</p>
            <div className="flex flex-wrap gap-2">
              {["Purpose", "Proportion", "Durability"].map((c) => (
                <span key={c} className="rounded-full border border-white/20 px-3 py-1.5 text-xs">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 px-4 pt-16 md:grid-cols-2 md:px-12 md:pt-24">
        <H className="text-[30px] md:text-[48px]">
          {t("about.s2Title")} <Serif gold>{t("about.s2Accent")}</Serif>
        </H>
        <P>{copy("problems")}</P>
      </section>

      <section className="px-4 pt-16 md:px-12 md:pt-24">
        <div className="rounded-block bg-dark p-7 text-white md:rounded-hero md:p-14">
          <H className="text-[30px] text-white md:text-[48px]">
            {t("about.s3Title")} <Serif gold>{t("about.s3Accent")}</Serif>
          </H>
          <Media alt="" tone="#3B3630" dark label="MISSING: brand image" className="mt-8 h-[220px] rounded-block md:h-[420px]" />
          <p className="mt-4 text-sm text-on-dark-muted">{copy("imageCaption")}</p>
        </div>
      </section>

      <section id="approach" className="scroll-mt-40 px-4 pt-16 md:px-12 md:pt-24">
        <H className="text-[30px] md:text-[48px]">
          {t("about.s4Title")} <Serif gold>{t("about.s4Accent")}</Serif>
        </H>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              [Compass, "purpose"],
              [Search, "understand"],
              [Factory, "manufacturing"],
              [Route, "journey"],
            ] as const
          ).map(([Icon, k]) => (
            <div key={k} className="rounded-card border border-line2 bg-white p-6">
              <span className="flex size-11 items-center justify-center rounded-full bg-gold-soft text-gold">
                <Icon size={18} aria-hidden />
              </span>
              <div className="mt-4 text-lg font-extrabold">{t(`about.pillars.${k}`)}</div>
              <P className="mt-1 text-[13.5px]">{copy(`pillar_${k}`)}</P>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-16 md:px-12 md:pt-24">
        <div className="rounded-block bg-dark p-7 text-white md:rounded-hero md:p-14">
          <H className="text-[30px] text-white md:text-[48px]">
            {t("about.s5Title")} <Serif gold>{t("about.s5Accent")}</Serif>
          </H>
          <ol className="mt-8 divide-y divide-dark-line">
            {["problem", "study", "manufacturer", "journey"].map((k, i) => (
              <li key={k} className="relative grid gap-3 py-7 md:grid-cols-[160px_1fr_1.3fr] md:items-center">
                <span className="text-[56px] font-extrabold leading-none text-white/10 md:text-[80px]">0{i + 1}</span>
                <span className="text-xl font-extrabold">{t(`about.steps.${k}`)}</span>
                <span className="text-sm text-on-dark-muted">{copy(`step_${k}`)}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid gap-8 px-4 pt-16 md:px-12 md:pt-24 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <H className="text-[30px] md:text-[48px]">
            {t("about.s6Title")} <Serif gold>{t("about.s6Accent")}</Serif>
          </H>
          <P>{copy("considered")}</P>
        </div>
        <ul className="flex flex-col gap-3 rounded-block border border-line2 bg-white p-6 shadow-card">
          {["dims", "materials", "function", "config", "delivery", "policies"].map((k) => (
            <li key={k} className="flex items-center gap-3 border-b border-line2 pb-3 last:border-0 last:pb-0">
              <span className="flex size-7 items-center justify-center rounded-full bg-gold-soft text-gold">
                <Check size={14} aria-hidden />
              </span>
              <span className="font-bold">{t(`about.check.${k}`)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-4 pt-16 md:px-12 md:pt-24">
        <H className="text-[30px] md:text-[48px]">
          {t("about.s7Title")} <Serif gold>{t("about.s7Accent")}</Serif>
        </H>
        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {(
            [
              ["power-reclining-sofas", "nav.powerReclining", "#E4DACA"],
              ["convertible-sofa-beds", "nav.sofaBeds", "#CDBEA6"],
              ["small-space-sofas", "nav.smallSpace", "#D9D3C8"],
              ["rolling-side-table-with-storage", "about.functionalTables", "#E0D8CC"],
            ] as const
          ).map(([slug, key, tone]) => (
            <Link key={slug} href={collectionHref(slug)} className="group overflow-hidden rounded-block border border-line2 bg-white">
              <Media alt="" tone={tone} label="collection photo" className="h-[200px]" />
              <div className="flex items-center justify-between p-5">
                <span className="text-lg font-extrabold">{t(key)}</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pt-16 md:px-12 md:pt-24">
        <div className="relative overflow-hidden rounded-block bg-dark px-7 py-16 text-center text-white md:rounded-hero md:py-24">
          <span aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center text-[100px] font-extrabold tracking-[.3em] text-white/[.04] md:text-[220px]">
            AZYLO
          </span>
          <p className="relative mx-auto max-w-[760px] font-serif text-[26px] italic leading-snug text-gold-bright md:text-[40px]">{copy("quote")}</p>
        </div>
      </section>

      <section className="px-4 pt-16 md:px-12 md:pt-24">
        <div className="flex flex-col items-start gap-6 rounded-block bg-cream p-8 md:rounded-hero md:p-14">
          <H className="max-w-[900px] text-[28px] md:text-[44px]">
            {t("about.ctaTitle")} <Serif gold>{t("about.ctaAccent")}</Serif>
          </H>
          <div className="flex flex-wrap gap-3">
            <BtnLink href={collectionHref("all")} icon={ArrowRight}>
              {t("about.ctaExplore")}
            </BtnLink>
            <BtnLink href={routes.contact} kind="outline">
              {t("about.ctaTalk")}
            </BtnLink>
          </div>
        </div>
      </section>
    </>
  );
}
