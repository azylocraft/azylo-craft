"use client";

import { Crumb } from "@/components/shop/Listing";
import { T, useLocale } from "@/components/shop/ShopContext";
import { Markdown } from "@/components/ui/Markdown";
import { H } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import type { I18nText } from "@/lib/types";

/** Centered policy card (design screens 74–77). Body comes from the pages table. */
export function PolicyView({ title, body, lastUpdated }: { title: I18nText; body: I18nText; lastUpdated: string }) {
  const t = useT();
  const { lang } = useLocale();
  const date = new Date(lastUpdated).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-IN", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div className="px-4 pb-4 pt-6 md:px-12">
      <Crumb items={[{ label: "Home", href: "/" }, { label: <T text={title} field="page title" fallback /> }]} />
      <article className="mx-auto mt-8 max-w-[760px] rounded-block border border-line2 bg-white p-7 shadow-card md:p-14">
        <H as="h1" className="text-[32px] md:text-[44px]">
          <T text={title} field="page title" fallback />
        </H>
        <span aria-hidden className="mt-5 block h-1 w-12 rounded bg-gold" />
        <p className="mt-4 text-[11px] font-bold uppercase tracking-[.16em] text-gold">{t("policy.lastUpdated", { date })}</p>
        <div className="mt-8 border-t border-line pt-8">
          <Markdown source={body[lang] ?? body.en} field="policy text" />
        </div>
      </article>
    </div>
  );
}
