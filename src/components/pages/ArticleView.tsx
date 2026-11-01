"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, Link2, Mail, Share2 } from "lucide-react";
import { ArticleCardView } from "@/components/home/HomeSections";
import { Carousel } from "@/components/shop/Carousel";
import { Crumb } from "@/components/shop/Listing";
import { Media } from "@/components/shop/Media";
import { Price, T, useHydrated, useLocale, useText } from "@/components/shop/ShopContext";
import { Markdown, slugify } from "@/components/ui/Markdown";
import { BtnLink, Eyebrow, H, Missing, P } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { useUi } from "@/lib/ui-store";
import type { ArticleCard, I18nText, ProductDetail } from "@/lib/types";

type Article = ArticleCard & {
  body: I18nText;
  authorName: string | null;
  authorBio: I18nText;
  authorAvatar: string | null;
  prev: ArticleCard | null;
  next: ArticleCard | null;
  related: ArticleCard[];
  linkedProduct: ProductDetail | null;
};

/** Guide + product-review article templates (design screens 63–65). */
export function ArticleView({ a }: { a: Article }) {
  const t = useT();
  const text = useText();
  const { lang } = useLocale();
  const showToast = useUi((s) => s.showToast);
  const body = a.body[lang] ?? a.body.en;
  const headings = useMemo(() => (body ? [...body.matchAll(/^##\s+(.+)$/gm)].map((m) => ({ text: m[1].trim(), id: slugify(m[1].trim()) })) : []), [body]);
  const [active, setActive] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(true);

  useEffect(() => {
    if (!headings.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: "-140px 0px -60% 0px" },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [headings]);

  const date = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-IN", { month: "long", day: "numeric", year: "numeric" }) : null;
  const hydrated = useHydrated();
  const url = hydrated ? location.href : "";
  const title = text(a.title, "article title");

  return (
    <>
      <div className="px-4 pt-6 md:px-12">
        <Crumb items={[{ label: "Home", href: "/" }, { label: t("journal.crumb"), href: routes.blogs }, { label: <T text={a.title} field="article title" fallback /> }]} />
        <header className="mx-auto mt-10 flex max-w-[860px] flex-col items-center gap-5 text-center">
          <Eyebrow center>{a.template === "product_review" ? t("journal.review") : t("journal.sofaGuide")}</Eyebrow>
          <H as="h1" className="text-[34px] md:text-[56px]">
            <T text={a.title} field="article title" fallback />
          </H>
          <div className="flex items-center gap-3 text-[13px] text-muted">
            <Media src={a.authorAvatar} alt="" tone="#CBBBA3" className="size-9 rounded-full" />
            <span>
              <b className="text-ink">{a.authorName ?? <Missing field="author" />}</b>
              {date && ` · ${date}`}
              {a.readMinutes ? ` · ${t("journal.minRead", { n: a.readMinutes })}` : ""}
            </span>
          </div>
        </header>
        <Media src={a.cover} alt={title} tone="#3F4A63" dark label={a.cover ? undefined : "article hero image"} eager className="mt-10 h-[240px] rounded-block md:h-[520px] md:rounded-hero" />
      </div>

      <div className="grid gap-10 px-4 pt-12 md:px-12 lg:grid-cols-[280px_1fr]">
        <aside className="self-start lg:sticky lg:top-40">
          <div className="rounded-card border border-line2 bg-white p-5">
            <button type="button" aria-expanded={tocOpen} onClick={() => setTocOpen(!tocOpen)} className="flex w-full items-center justify-between text-xs font-extrabold uppercase tracking-[.16em]">
              {t("journal.contents")}
              <ChevronDown size={14} aria-hidden className={clsx("transition-transform", tocOpen && "rotate-180")} />
            </button>
            {tocOpen && (
              <ol className="mt-4 flex flex-col gap-1">
                {headings.length === 0 ? (
                  <li className="text-xs text-muted">{t("journal.noSections")}</li>
                ) : (
                  headings.map((h, i) => (
                    <li key={h.id}>
                      <a href={`#${h.id}`} className={clsx("flex gap-2 rounded-lg px-2 py-1.5 text-[13px] leading-snug", active === h.id ? "bg-gold-soft font-bold text-ink" : "text-muted hover:text-ink")}>
                        <span className="font-mono text-[11px] text-gold">{String(i + 1).padStart(2, "0")}</span>
                        {h.text}
                      </a>
                    </li>
                  ))
                )}
              </ol>
            )}
            <div className="mt-5 flex gap-2 border-t border-line2 pt-4">
              <button
                type="button"
                aria-label={t("product.copyLink")}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(location.href);
                  } catch {}
                  showToast(t("product.linkCopied"));
                }}
                className="flex size-9 items-center justify-center rounded-full border border-line"
              >
                <Link2 size={14} aria-hidden />
              </button>
              <a aria-label="Share on Facebook" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" className="flex size-9 items-center justify-center rounded-full border border-line">
                <Share2 size={14} aria-hidden />
              </a>
              <a aria-label="Share by email" href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`} className="flex size-9 items-center justify-center rounded-full border border-line">
                <Mail size={14} aria-hidden />
              </a>
            </div>
          </div>
        </aside>

        <article className="max-w-[760px]">
          <Markdown source={body} field="article content" className="text-[16px]" />
          {a.template === "product_review" && (
            <div className="mt-12 grid overflow-hidden rounded-block border border-line2 bg-white shadow-card sm:grid-cols-[200px_1fr]">
              {a.linkedProduct ? (
                <>
                  <Media src={a.linkedProduct.image} alt="" tone={a.linkedProduct.tone} className="h-[180px] sm:h-full" />
                  <div className="flex flex-col gap-3 p-6">
                    <Eyebrow>{t("journal.ctaEyebrow")}</Eyebrow>
                    <div className="text-xl font-extrabold">{t("journal.ctaFits")}</div>
                    <div className="text-sm text-muted">
                      <T text={a.linkedProduct.name} field="product name" fallback /> · {t("card.from")} <Price cad={a.linkedProduct.fromPriceInr} />
                    </div>
                    <BtnLink href={`/products/${a.linkedProduct.slug}`} icon={ArrowRight} className="self-start">
                      {t("journal.viewProduct")}
                    </BtnLink>
                  </div>
                </>
              ) : (
                <div className="p-6 sm:col-span-2">
                  <Missing field="linked product" />
                </div>
              )}
            </div>
          )}

          <div className="mt-14 flex flex-col gap-4 rounded-block bg-cream p-6 sm:flex-row sm:items-center">
            <Media src={a.authorAvatar} alt="" tone="#CBBBA3" className="size-16 flex-none rounded-full" />
            <div>
              <div className="text-xs font-bold uppercase tracking-[.14em] text-gold">{t("journal.aboutAuthor")}</div>
              <div className="text-lg font-extrabold">{a.authorName ?? <Missing field="author" />}</div>
              <P className="text-sm">
                <T text={a.authorBio} field="author bio" />
              </P>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {a.prev ? (
              <Link href={`/blogs/${a.prev.slug}`} className="flex flex-col gap-1 rounded-card border border-line2 bg-white p-5 hover:border-ink">
                <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
                  <ArrowLeft size={13} aria-hidden /> {t("journal.prev")}
                </span>
                <span className="font-bold">
                  <T text={a.prev.title} field="article title" fallback />
                </span>
              </Link>
            ) : (
              <span />
            )}
            {a.next && (
              <Link href={`/blogs/${a.next.slug}`} className="flex flex-col items-end gap-1 rounded-card border border-line2 bg-white p-5 text-right hover:border-ink">
                <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
                  {t("journal.next")} <ArrowRight size={13} aria-hidden />
                </span>
                <span className="font-bold">
                  <T text={a.next.title} field="article title" fallback />
                </span>
              </Link>
            )}
          </div>
        </article>
      </div>

      {a.related.length > 0 && (
        <section className="px-4 pt-16 md:px-12 md:pt-24">
          <div className="mb-8 flex items-end justify-between gap-4">
            <H className="text-[30px] md:text-[40px]">{t("journal.related")}</H>
            <BtnLink href={routes.blogs} kind="outline" icon={ArrowRight}>
              {t("journal.viewAll")}
            </BtnLink>
          </div>
          <Carousel label={t("journal.related")}>
            {a.related.map((r) => (
              <ArticleCardView key={r.id} a={r} imgH={220} />
            ))}
          </Carousel>
        </section>
      )}
    </>
  );
}
