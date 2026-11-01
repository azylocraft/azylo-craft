"use client";

import clsx from "clsx";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ArticleCardView } from "@/components/home/HomeSections";
import { Media } from "@/components/shop/Media";
import { T, useText } from "@/components/shop/ShopContext";
import { BtnLink, Eyebrow, H, P, Serif } from "@/components/ui/primitives";
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
  const href = (p: number, c = tab) => {
    const qs = new URLSearchParams();
    if (c !== "all") qs.set("tab", c);
    if (p > 1) qs.set("page", String(p));
    const s = qs.toString();
    return `${routes.blogs}${s ? `?${s}` : ""}#guides`;
  };
  return (
    <>
      <section className="px-4 pt-6 md:px-12">
        <div className="relative overflow-hidden rounded-block bg-dark p-7 text-white md:rounded-hero md:p-16">
          <span aria-hidden className="pointer-events-none absolute -bottom-10 right-0 select-none text-[120px] font-extrabold leading-none tracking-[-0.05em] text-white/[.04] md:text-[260px]">
            SOFAS
          </span>
          <div className="relative flex max-w-[720px] flex-col gap-5">
            <Eyebrow>{t("journal.heroEyebrow")}</Eyebrow>
            <H as="h1" className="text-[38px] text-white md:text-[68px]">
              {t("journal.heroTitle")} <Serif gold>{t("journal.heroAccent")}</Serif>
            </H>
            <P className="text-on-dark-muted">{t("journal.heroSub")}</P>
            <div className="flex flex-wrap gap-3">
              <BtnLink href="#guides" kind="white" icon={ArrowRight}>
                {t("journal.explore")}
              </BtnLink>
              <BtnLink href="#latest" kind="ghostW">
                {t("journal.journal")}
              </BtnLink>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Comfort", "Dimensions", "Construction", "Function"].map((c) => (
                <span key={c} className="rounded-full border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-on-dark">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="sticky top-[60px] z-20 mt-6 px-4 md:top-[136px] md:px-12">
        <div role="tablist" className="grid grid-cols-3 gap-1.5 rounded-full border border-line bg-white p-1.5 shadow-soft">
          {TABS.map(([key, label]) => (
            <Link key={key} role="tab" aria-selected={tab === key} href={href(1, key)} scroll={false} className={clsx("flex h-11 items-center justify-center rounded-full text-[13px] font-bold", tab === key ? "bg-ink text-white" : "text-muted hover:text-ink")}>
              {t(label)}
            </Link>
          ))}
        </div>
      </div>

      <section className="grid gap-6 px-4 pt-16 md:grid-cols-2 md:px-12 md:pt-20">
        <H className="text-[32px] md:text-[48px]">
          {t("journal.learnTitle")} <Serif gold>{t("journal.learnAccent")}</Serif>
        </H>
        <P>{t("journal.learnSub")}</P>
      </section>

      {latest && (
        <section id="latest" className="scroll-mt-40 px-4 pt-12 md:px-12">
          <Link href={`/blogs/${latest.slug}`} className="grid overflow-hidden rounded-block border border-line2 bg-white shadow-card hover:shadow-soft md:grid-cols-2 md:rounded-hero">
            <Media src={latest.cover} alt={text(latest.title, "article title")} tone="#3F4A63" dark label={latest.cover ? undefined : "article cover"} className="h-[240px] md:h-[420px]" />
            <div className="flex flex-col justify-center gap-4 p-7 md:p-12">
              <Eyebrow>{t("journal.latest")}</Eyebrow>
              <div className="text-[26px] font-extrabold leading-tight tracking-[-0.02em] md:text-[34px]">
                <T text={latest.title} field="article title" fallback />
              </div>
              <P>
                <T text={latest.excerpt} field="excerpt" />
              </P>
              <span className="flex items-center gap-2 text-sm font-bold">
                {t("journal.readArticle")} <ArrowRight size={15} aria-hidden />
              </span>
            </div>
          </Link>
        </section>
      )}

      <section id="guides" className="scroll-mt-48 px-4 pt-16 md:px-12 md:pt-24">
        <H className="mb-9 text-[32px] md:text-[48px]">
          {t("journal.moreTitle")} <Serif>{t("journal.moreAccent")}</Serif>
        </H>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCardView key={a.id} a={a} imgH={240} />
          ))}
        </div>
        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-2">
            {page > 1 && (
              <Link href={href(page - 1)} aria-label="Previous page" className="flex size-11 items-center justify-center rounded-full border border-line bg-white">
                <ChevronLeft size={16} aria-hidden />
              </Link>
            )}
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={href(n)} aria-current={n === page ? "page" : undefined} className={clsx("flex size-11 items-center justify-center rounded-full border text-sm font-bold", n === page ? "border-ink bg-ink text-white" : "border-line bg-white")}>
                {n}
              </Link>
            ))}
            {page < pages && (
              <Link href={href(page + 1)} aria-label="Next page" className="flex size-11 items-center justify-center rounded-full border border-line bg-white">
                <ChevronRight size={16} aria-hidden />
              </Link>
            )}
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

