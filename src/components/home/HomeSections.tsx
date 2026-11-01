"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import {
  Armchair,
  ArrowRight,

  BedDouble,
  Camera,
  Clock,
  Heart,
  LayoutGrid,
  MessageCircle,
  Minimize2,
  PackageCheck,
  Play,
  Scan,
  Truck,
  Upload,
} from "lucide-react";
import { Carousel } from "@/components/shop/Carousel";
import { Media } from "@/components/shop/Media";
import { GCard, PCard } from "@/components/shop/ProductCards";
import { T, useLocale, useShopCtx, useText } from "@/components/shop/ShopContext";
import { Badge, BtnLink, Eyebrow, H, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { collectionHref, routes } from "@/lib/routes";
import type { ArticleCard, I18nText, ProductCardData } from "@/lib/types";

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx("px-4 pt-16 md:px-12 md:pt-24", className)}>{children}</section>;
}

function SecHead({ eb, title, sub, right }: { eb?: string; title: React.ReactNode; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-8">
      <div className="flex max-w-[760px] flex-col gap-3.5">
        {eb && <Eyebrow>{eb}</Eyebrow>}
        <H className="text-[32px] md:text-[48px]">{title}</H>
        {sub && <P>{sub}</P>}
      </div>
      {right && <div className="flex flex-none items-center gap-2.5">{right}</div>}
    </div>
  );
}

function Empty({ what }: { what: string }) {
  return (
    <div className="rounded-card border border-dashed border-line bg-white p-8 text-center text-sm text-muted">
      {what}
    </div>
  );
}

export function BestSellers({ products }: { products: ProductCardData[] }) {
  const t = useT();
  return (
    <Section>
      <SecHead
        eb={t("home.bestEyebrow")}
        title={t("home.bestTitle")}
        sub={t("home.bestSub")}
        right={
          <BtnLink href={collectionHref("best-selling-sofas")} kind="outline" icon={ArrowRight}>
            {t("home.viewAllSofas")}
          </BtnLink>
        }
      />
      <div className="mt-9">
        {products.length ? (
          <Carousel label={t("home.bestTitle")}>
            {products.map((p) => (
              <PCard key={p.id} p={p} />
            ))}
          </Carousel>
        ) : (
          <Empty what={t("home.noProducts")} />
        )}
      </div>
    </Section>
  );
}

export type TypeTab = { key: string; slug: string; title: string; count: number; products: ProductCardData[] };
const TAB_ICONS = [Armchair, BedDouble, LayoutGrid, Minimize2];

export function ExploreTypes({ tabs }: { tabs: TypeTab[] }) {
  const t = useT();
  const [active, setActive] = useState(0);
  const tab = tabs[active];
  return (
    <Section>
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="flex flex-col gap-3">
          <Eyebrow>{t("home.typesEyebrow")}</Eyebrow>
          <H className="text-[32px] md:text-[48px]">
            {t("home.typesTitle")} <Serif>{t("home.typesAccent")}</Serif>
          </H>
          <P>{t("home.typesSub")}</P>
        </div>
        <span className="flex h-10 items-center gap-2 self-start rounded-full border border-line bg-white px-[18px] text-xs text-muted lg:self-auto">
          <Truck size={15} className="text-gold" aria-hidden />
          {t("home.typesTrust")}
        </span>
      </div>
      <div role="tablist" aria-label={t("home.typesTitle")} className="mt-7 grid grid-cols-2 gap-1.5 rounded-[26px] border border-line bg-white p-1.5 md:grid-cols-4 md:rounded-full">
        {tabs.map((x, i) => {
          const Icon = TAB_ICONS[i] ?? Armchair;
          return (
            <button
              key={x.slug}
              role="tab"
              type="button"
              id={`type-tab-${i}`}
              aria-selected={i === active}
              aria-controls="type-panel"
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") setActive((active + 1) % tabs.length);
                if (e.key === "ArrowLeft") setActive((active - 1 + tabs.length) % tabs.length);
              }}
              className={clsx(
                "flex h-12 items-center justify-center gap-2.5 rounded-full text-[13.5px] font-bold transition-colors md:h-[52px]",
                i === active ? "bg-ink text-white" : "text-muted hover:text-ink",
              )}
            >
              <Icon size={17} aria-hidden />
              {t(x.key)}
            </button>
          );
        })}
      </div>
      <div id="type-panel" role="tabpanel" aria-labelledby={`type-tab-${active}`}>
        <div className="mb-5 mt-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="text-[22px] font-extrabold">{tab.title}</div>
            <div className="text-[12.5px] text-muted">{t("home.modelsInCollection", { n: tab.count })}</div>
          </div>
          <BtnLink href={collectionHref(tab.slug)} kind="outline" icon={ArrowRight}>
            {t("home.viewCollection")}
          </BtnLink>
        </div>
        {tab.products.length ? (
          <Carousel key={tab.slug} label={tab.title}>
            {tab.products.map((p) => (
              <PCard key={p.id} p={p} />
            ))}
          </Carousel>
        ) : (
          <Empty what={t("home.noProducts")} />
        )}
      </div>
    </Section>
  );
}

export function NewArrivals({ products }: { products: ProductCardData[] }) {
  const t = useT();
  return (
    <Section>
      <SecHead
        eb={t("home.newEyebrow")}
        title={
          <>
            {t("home.newTitle")} <Serif>{t("home.newAccent")}</Serif>
          </>
        }
        sub={t("home.newSub")}
        right={
          <BtnLink href={collectionHref("new-arrivals")} kind="outline" icon={ArrowRight}>
            {t("home.viewAllNew")}
          </BtnLink>
        }
      />
      <div className="mt-9">
        {products.length ? (
          <Carousel label={t("home.newTitle")}>
            {products.map((p) => (
              <GCard key={p.id} p={p} />
            ))}
          </Carousel>
        ) : (
          <Empty what={t("home.noProducts")} />
        )}
      </div>
    </Section>
  );
}

function ComingSoon() {
  const t = useT();
  return (
    <Badge tone="gold" className="ml-1">
      {t("common.comingSoon")}
    </Badge>
  );
}

export function AppPromo({ photo }: { photo?: string | null }) {
  const t = useT();
  const { settings } = useShopCtx();
  return (
    <Section>
      <div className="grid items-center gap-10 rounded-block border border-line2 bg-white p-6 shadow-card md:rounded-hero md:p-14 lg:grid-cols-2 lg:px-16">
        <div className="flex flex-col gap-5">
          <Eyebrow>{t("home.appEyebrow")}</Eyebrow>
          <H className="text-[32px] md:text-[48px]">
            {t("home.appTitle")}
            <br />
            <Serif gold>{t("home.appAccent")}</Serif>
          </H>
          <P className="max-w-[420px]">{t("home.appSub")}</P>
          <div className="flex flex-wrap items-center gap-3">
            {settings.playStoreUrl ? (
              <a href={settings.playStoreUrl} target="_blank" rel="noreferrer" className="inline-flex h-[46px] items-center gap-2.5 rounded-full bg-ink px-[26px] text-sm font-bold text-white">
                <Play size={16} aria-hidden />
                {t("home.googlePlay")}
              </a>
            ) : (
              <span className="inline-flex h-[46px] items-center gap-2.5 rounded-full bg-ink px-[26px] text-sm font-bold text-white opacity-80" aria-disabled>
                <Play size={16} aria-hidden />
                {t("home.googlePlay")}
                <ComingSoon />
              </span>
            )}
            <span className="text-xs text-muted">{t("home.iosSoon")}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-7 gap-y-2">
            {[
              [Scan, "home.appFeat1"],
              [PackageCheck, "home.appFeat2"],
              [Heart, "home.appFeat3"],
            ].map(([Icon, k]) => {
              const I = Icon as typeof Scan;
              return (
                <span key={k as string} className="flex items-center gap-2 text-[12.5px] font-semibold text-ink2">
                  <I size={16} className="text-gold" aria-hidden />
                  {t(k as string)}
                </span>
              );
            })}
          </div>
        </div>
        <div className="relative h-[300px] overflow-hidden rounded-block bg-gold-soft md:h-[380px]">
          {[260, 380, 500].map((s) => (
            <span
              key={s}
              aria-hidden
              className="absolute rounded-full border border-gold-line"
              style={{ width: s, height: s, right: 150 - s / 2, top: 190 - s / 2 }}
            />
          ))}
          <Media src={photo} alt="App screenshot" tone="#2B2926" dark className="absolute right-6 top-6 h-[260px] w-[150px] rounded-[30px] border-[6px] border-ink md:right-[60px] md:h-[330px] md:w-[190px]" />
          <Media src={photo} alt="Sofa photo" tone="#E2D7C4" className="absolute left-6 top-[120px] size-[130px] rounded-tile md:left-[60px] md:top-[150px] md:size-[170px]" />
        </div>
      </div>
    </Section>
  );
}

export function ImageSearch({ photo }: { photo?: string | null }) {
  const t = useT();
  return (
    <section className="px-4 pt-10 md:px-12 md:pt-14">
      <div className="flex flex-col items-start gap-6 rounded-section border border-line2 bg-[linear-gradient(90deg,#fff,var(--az-gold-soft))] p-6 md:p-10 lg:flex-row lg:items-center lg:gap-10">
        <span className="flex size-14 flex-none items-center justify-center rounded-full bg-ink text-white">
          <Camera size={22} aria-hidden />
        </span>
        <div className="flex flex-1 flex-col gap-2">
          <Eyebrow>{t("home.visualEyebrow")}</Eyebrow>
          <div className="text-[22px] font-extrabold tracking-[-0.02em] md:text-2xl">
            {t("home.visualTitle")} <ComingSoon />
          </div>
          <P className="text-[13.5px]">{t("home.visualSub")}</P>
        </div>
        <Media src={photo} alt="Example upload" tone="#C9BEA9" className="hidden h-[150px] w-[280px] flex-none rounded-2xl lg:block" />
        <span aria-disabled className="inline-flex h-[46px] items-center gap-2.5 rounded-full bg-line2 px-[26px] text-sm font-bold text-faint">
          {t("home.visualCta")}
          <Upload size={16} aria-hidden />
        </span>
      </div>
    </section>
  );
}

export function FitLife({ photo }: { photo?: string | null }) {
  const t = useT();
  return (
    <Section>
      <div className="grid overflow-hidden rounded-block md:rounded-hero lg:h-[560px] lg:grid-cols-2">
        <Media src={photo} alt="Sofa in warm evening light" tone="#D8C9B1" className="h-[260px] lg:h-full" />
        <div className="flex flex-col justify-center gap-5 bg-dark p-7 text-white md:p-16">
          <Eyebrow>{t("home.fitEyebrow")}</Eyebrow>
          <H className="text-[34px] text-white md:text-[52px]">
            {t("home.fitTitle")} <Serif gold>{t("home.fitAccent")}</Serif>
          </H>
          <P className="max-w-[440px] text-on-dark-muted">{t("home.fitSub")}</P>
          <div className="flex flex-col gap-3 sm:flex-row">
            <BtnLink href={collectionHref("all")} kind="white" icon={ArrowRight}>
              {t("home.fitCta1")}
            </BtnLink>
            <BtnLink href={routes.contact} kind="ghostW" iconL={MessageCircle}>
              {t("home.fitCta2")}
            </BtnLink>
          </div>
          <span className="flex items-center gap-2 text-[12.5px] text-on-dark-muted">
            <Clock size={14} className="text-gold" aria-hidden />
            {t("home.fitNote")}
          </span>
        </div>
      </div>
    </Section>
  );
}

export function ArticleCardView({ a, imgH = 260 }: { a: ArticleCard; imgH?: number }) {
  const t = useT();
  const text = useText();
  const { lang } = useLocale();
  const date = a.publishedAt
    ? new Date(a.publishedAt).toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", { month: "short", day: "numeric", year: "numeric" })
    : null;
  return (
    <Link href={`/blogs/${a.slug}`} className="flex h-full flex-col overflow-hidden rounded-card border border-line2 bg-white shadow-card hover:shadow-soft">
      <Media src={a.cover} alt={text(a.title, "article title")} tone="#CBBBA3" label={a.cover ? undefined : "article cover"}>
        <div style={{ height: imgH }} />
        <span className="absolute left-3.5 top-3.5 flex h-[26px] items-center rounded-full bg-ink px-3 text-[10px] font-extrabold uppercase tracking-[.08em] text-white">
          {a.template === "product_review" ? t("journal.review") : t("journal.sofaGuide")}
        </span>
      </Media>
      <div className="flex flex-1 flex-col gap-2.5 px-5 pb-[22px] pt-[18px]">
        <span className="text-[11.5px] text-faint">
          {date}
          {a.readMinutes ? ` · ${t("journal.minRead", { n: a.readMinutes })}` : ""}
        </span>
        <div className="text-[17px] font-extrabold leading-[1.3] tracking-[-0.01em]">
          <T text={a.title} field="article title" fallback />
        </div>
        <P className="line-clamp-3 text-[13.5px]">
          <T text={a.excerpt} field="excerpt" />
        </P>
        <span className="mt-auto flex items-center gap-2 pt-1 text-[13px] font-bold">
          {t("journal.readArticle")}
          <ArrowRight size={15} aria-hidden />
        </span>
      </div>
    </Link>
  );
}

export function JournalRow({ articles }: { articles: ArticleCard[] }) {
  const t = useT();
  return (
    <Section>
      <SecHead
        eb={t("home.journalEyebrow")}
        title={t("home.journalTitle")}
        sub={t("home.journalSub")}
        right={
          <BtnLink href={routes.blogs} kind="outline" icon={ArrowRight}>
            {t("home.viewAllGuides")}
          </BtnLink>
        }
      />
      <div className="mt-9">
        <Carousel label={t("home.journalTitle")}>
          {articles.map((a) => (
            <ArticleCardView key={a.id} a={a} />
          ))}
        </Carousel>
      </div>
    </Section>
  );
}


type MaterialTile = { slug: string; name: I18nText; image: string | null };

/** Homepage teaser for the Sofa Materials Guide (links to the full guide page). */
export function MaterialsTeaser({ materials }: { materials: MaterialTile[] }) {
  const t = useT();
  const text = useText();
  return (
    <Section>
      <div className="grid overflow-hidden rounded-block bg-dark text-white md:rounded-hero lg:grid-cols-[1fr_1.25fr]">
        <div className="flex flex-col justify-center gap-5 p-7 md:p-14">
          <Eyebrow>{t("home.matEyebrow")}</Eyebrow>
          <H className="text-[32px] text-white md:text-[48px]">
            {t("home.matTitle")} <Serif gold>{t("home.matAccent")}</Serif>
          </H>
          <P className="max-w-[440px] text-on-dark-muted">{t("home.matSub")}</P>
          <BtnLink href={routes.materials} kind="white" icon={ArrowRight} className="self-start">
            {t("home.matCta")}
          </BtnLink>
        </div>
        <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 md:p-3">
          {materials.map((m) => (
            <Link key={m.slug} href={`${routes.materials}#${m.slug}`} className="group relative overflow-hidden rounded-tile">
              <Media src={m.image} alt={text(m.name, "material name")} tone="#B7A58E" className="h-[150px] transition-transform duration-500 group-hover:scale-105 md:h-[200px]" />
              <span className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-full bg-white/92 px-3 py-1.5 text-xs font-bold text-ink">
                {text(m.name, "material name")}
                <ArrowRight size={13} aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}
