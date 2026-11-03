"use client";

import clsx from "clsx";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { T, useLocale, useText } from "@/components/shop/ShopContext";
import { BtnLink, H, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { collectionHref, routes } from "@/lib/routes";
import type { ArticleCard } from "@/lib/types";

const TABS = [
  ["all", "journal.tabAll"],
  ["sofa_guides", "journal.tabSofa"],
  ["home_decor", "journal.tabHome"],
] as const;

/** Guides landing page (design screen 62). */
export function JournalView({ latest, articles, page, pages, tab }: { latest: ArticleCard | null; articles: ArticleCard[]; page: number; pages: number; tab: string }) {
  const t = useT();
  const text = useText();
  const { lang } = useLocale();
  const date = (d: string | null) => (d ? new Date(d).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-IN", { month: "short", day: "2-digit", year: "numeric" }) : null);
  const cat = (a: ArticleCard) => t(a.category === "home_decor" ? "journal.catHome" : "journal.catSofa");
  const href = (p: number, c = tab) => {
    const qs = new URLSearchParams();
    if (c !== "all") qs.set("tab", c);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `${routes.blogs}${s ? `?${s}` : ""}#guides`;
  };
  return (
    <>
      {/* Full-width editorial hero */}
      <section className="relative overflow-hidden bg-dark text-white">
        <span aria-hidden className="pointer-events-none absolute -bottom-[0.18em] right-[-0.04em] select-none text-[130px] font-extrabold leading-none tracking-[-0.06em] text-white/[.035] md:text-[300px]">
          SOFAS
        </span>
        <div className="relative mx-auto grid max-w-[1312px] gap-12 px-4 pb-20 pt-12 md:px-12 md:pb-28 md:pt-16 lg:grid-cols-[1fr_320px] lg:items-end">
          <div className="flex flex-col gap-7">
            <span className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.18em] text-on-dark-muted">
              <span aria-hidden className="h-px w-10 bg-on-dark-faint" />
              {t("journal.heroEyebrow")}
            </span>
            <h1 className="max-w-[760px] text-[52px] font-extrabold leading-[0.95] tracking-[-0.045em] md:text-[104px]">
              {t("journal.heroTitle")}
              <span className="block font-display text-[0.98em] font-normal italic tracking-[-0.03em] text-cream">{t("journal.heroAccent")}</span>
            </h1>
            <P className="max-w-[640px] text-[15.5px] text-on-dark-muted md:text-[18px]">{t("journal.heroSub")}</P>
            <div className="flex flex-wrap items-center gap-6">
              <BtnLink href="#guides" kind="white" icon={ArrowDown}>
                {t("journal.explore")}
              </BtnLink>
              <Link href="#latest" className="flex items-center gap-2 text-sm font-bold hover:text-cream">
                {t("journal.journal")} <ArrowRight size={15} aria-hidden />
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-5 border-l border-dark-line pl-7">
            <span className="text-[10.5px] font-semibold uppercase tracking-[.2em] text-on-dark-faint">{t("journal.exploresLabel")}</span>
            <div className="flex flex-wrap gap-2">
              {["Comfort", "Dimensions", "Construction", "Function"].map((c) => (
                <span key={c} className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs text-on-dark">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-6 font-display text-[21px] leading-[1.45] text-cream">{t("journal.quote")}</p>
          </div>
        </div>
      </section>

      {/* Underlined text tabs */}
      <div className="sticky top-[60px] z-20 border-b border-line2 bg-bg md:top-[136px]">
        <div role="tablist" className="mx-auto flex max-w-[1312px] items-center gap-8 overflow-x-auto px-4 md:px-12">
          <span className="text-[10.5px] font-semibold uppercase tracking-[.2em] text-faint">{t("journal.exploreLabel")}</span>
          {TABS.map(([key, label]) => (
            <Link key={key} role="tab" aria-selected={tab === key} href={href(1, key)} scroll={false} className={clsx("-mb-px flex h-14 items-center whitespace-nowrap border-b-2 text-[13.5px] font-bold", tab === key ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink")}>
              {t(label)}
            </Link>
          ))}
        </div>
      </div>

      {/* Intro */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-[1312px] gap-4 px-4 py-16 md:grid-cols-[80px_1fr] md:px-12 md:py-24">
          <span className="font-mono text-xs text-faint md:pt-1">01</span>
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-gold">{t("journal.learnEyebrow")}</span>
              <H className="text-[38px] md:text-[64px]">
                {t("journal.learnTitle")} <span className="font-display font-normal italic tracking-[-0.02em] text-gold">{t("journal.learnAccent")}</span>
              </H>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
              <p className="font-display text-[26px] leading-[1.35] text-ink md:text-[36px]">{t("journal.learnLead")}</p>
              <div className="flex flex-col gap-5 lg:pt-3">
                <P>{t("journal.learnSub")}</P>
                <P>{t("journal.learnSub2")}</P>
              </div>
            </div>
          </div>
        </div>
      </section>

      {latest && (
        <section id="latest" className="mx-auto max-w-[1312px] scroll-mt-40 px-4 pt-16 md:px-12 md:pt-24">
          <Link href={`/blogs/${latest.slug}`} className="group grid overflow-hidden border border-line2 bg-white md:grid-cols-[1.4fr_1fr]">
            <div className="overflow-hidden">
              <Media src={latest.cover} alt={text(latest.title, "article title")} tone="#CBBBA3" label={latest.cover ? undefined : "article cover"} className="h-[300px] transition-transform duration-700 group-hover:scale-[1.02] md:h-[620px]" />
            </div>
            <div className="flex flex-col justify-center gap-6 p-7 md:p-14">
              <div className="flex items-center justify-between text-[11px] font-semibold text-faint">
                <span>{cat(latest)}</span>
                <span>{date(latest.publishedAt)}</span>
              </div>
              <div className="text-[32px] font-extrabold leading-[1.05] tracking-[-0.03em] md:text-[46px]">
                <T text={latest.title} field="article title" fallback />
              </div>
              <P className="text-[14.5px]">
                <T text={latest.excerpt} field="excerpt" />
              </P>
              <span className="flex w-fit items-center gap-2 border-b border-ink pb-1 text-[13px] font-bold">
                {t("journal.readGuide")} <ArrowRight size={15} aria-hidden />
              </span>
            </div>
          </Link>
        </section>
      )}

      <section id="guides" className="mx-auto max-w-[1312px] scroll-mt-48 px-4 pt-16 md:px-12 md:pt-24">
        <span className="text-[11px] font-semibold uppercase tracking-[.2em] text-muted">{t("journal.moreEyebrow")}</span>
        <div className="mb-10 mt-3 flex items-end justify-between gap-4">
          <H className="text-[38px] md:text-[64px]">
            {t("journal.moreTitle")} <span className="font-display font-normal italic tracking-[-0.02em] text-gold">{t("journal.moreAccent")}.</span>
          </H>
          {pages > 1 && <span className="hidden pb-3 text-[11px] font-semibold uppercase tracking-[.16em] text-faint sm:block">{t("journal.pageOf", { p: page, n: pages })}</span>}
        </div>
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <Link key={a.id} href={`/blogs/${a.slug}`} className="group flex flex-col gap-4">
              <div className="overflow-hidden">
                <Media src={a.cover} alt={text(a.title, "article title")} tone="#CBBBA3" label={a.cover ? undefined : "article cover"} className="aspect-[4/3] transition-transform duration-700 group-hover:scale-[1.03]" />
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-faint">
                <span>{cat(a)}</span>
                <span>{date(a.publishedAt)}</span>
              </div>
              <div className="text-[22px] font-extrabold leading-[1.2] tracking-[-0.02em] md:text-[25px]">
                <T text={a.title} field="article title" fallback />
              </div>
              <P className="line-clamp-2 text-[13.5px]">
                <T text={a.excerpt} field="excerpt" />
              </P>
              <span className="mt-auto flex items-center gap-2 text-[12.5px] font-bold">
                {t("journal.readGuide")} <ArrowRight size={14} aria-hidden />
              </span>
            </Link>
          ))}
        </div>
        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-16 grid grid-cols-[1fr_auto_1fr] items-center border-t border-line2 pt-10">
            <span>
              {page > 1 && (
                <Link href={href(page - 1)} className="flex w-fit items-center gap-2 text-sm font-bold">
                  <ArrowLeft size={15} aria-hidden /> {t("journal.prev")}
                </Link>
              )}
            </span>
            <span className="flex items-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={href(n)} aria-current={n === page ? "page" : undefined} className={clsx("flex size-11 items-center justify-center rounded-full text-sm font-bold", n === page ? "bg-ink text-white" : "text-muted hover:text-ink")}>
                  {n}
                </Link>
              ))}
            </span>
            <span className="flex justify-end">
              {page < pages && (
                <Link href={href(page + 1)} className="flex items-center gap-2 text-sm font-bold">
                  {t("journal.next")} <ArrowRight size={15} aria-hidden />
                </Link>
              )}
            </span>
          </nav>
        )}
      </section>

      <section className="px-4 pt-16 md:px-12 md:pt-24">
        <div className="rounded-block bg-dark p-8 text-center text-white md:rounded-hero md:p-16">
          <H className="text-[32px] text-white md:text-[52px]">
            {t("journal.beyondTitle")} <Serif gold>{t("journal.beyondAccent")}</Serif>
          </H>
          <P className="mx-auto mt-4 max-w-[620px] text-on-dark-muted">{t("journal.beyondSub")}</P>
        </div>
      </section>

      <section className="px-4 pt-16 md:px-12 md:pt-24">
        <H className="text-[32px] md:text-[48px]">
          {t("journal.sixTitle")} <Serif gold>{t("journal.sixAccent")}</Serif>
        </H>
        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(["dims", "access", "clearance", "materials", "config", "delivery"] as const).map((k, i) => (
            <div key={k} className="rounded-card border border-line2 bg-white p-6">
              <span className="font-mono text-xs text-gold">0{i + 1}</span>
              <div className="mt-2 text-lg font-extrabold">{t(`journal.six.${k}`)}</div>
              <P className="mt-1 text-[13.5px]">{t(`journal.six.${k}Sub`)}</P>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-16 md:px-12 md:pt-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-block bg-cream p-8 md:flex-row md:items-center md:rounded-hero md:p-14">
          <H className="text-[30px] md:text-[44px]">
            {t("journal.ctaTitle")} <Serif gold>{t("journal.ctaAccent")}</Serif>
          </H>
          <div className="flex flex-wrap gap-3">
            <BtnLink href={collectionHref("all")} icon={ArrowRight}>
              {t("journal.ctaShop")}
            </BtnLink>
            <BtnLink href={routes.materials} kind="outline">
              {t("nav.materials")}
            </BtnLink>
          </div>
        </div>
      </section>
    </>
  );
}

