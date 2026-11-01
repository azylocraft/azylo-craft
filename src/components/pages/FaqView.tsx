"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Package, RotateCcw, Search, Sofa, Truck } from "lucide-react";
import { useLocale } from "@/components/shop/ShopContext";
import { AccordionRow } from "@/components/ui/Accordion";
import { Markdown } from "@/components/ui/Markdown";
import { Eyebrow, H, Missing, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import type { I18nText } from "@/lib/types";

type Faq = { id: string; slug: string; group: "shipping" | "orders" | "returns" | "products"; question: I18nText; answer: I18nText };
const GROUPS = [
  ["shipping", Truck],
  ["orders", Package],
  ["returns", RotateCcw],
  ["products", Sofa],
] as const;

/** FAQ page (design screens 72–73): live search, chips, grouped accordions, #slug deep links. */
export function FaqView({ faqs }: { faqs: Faq[] }) {
  const t = useT();
  const { lang } = useLocale();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState<"all" | Faq["group"]>("all");
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const hash = decodeURIComponent(location.hash.slice(1));
    if (!hash) return;
    queueMicrotask(() => setOpen(hash));
    setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
  }, []);

  const term = q.trim().toLowerCase();
  const shown = useMemo(
    () =>
      faqs.filter((f) => {
        if (chip !== "all" && f.group !== chip) return false;
        if (!term) return true;
        const hay = `${f.question[lang] ?? f.question.en ?? ""} ${f.answer[lang] ?? f.answer.en ?? ""}`.toLowerCase();
        return hay.includes(term);
      }),
    [faqs, chip, term, lang],
  );

  return (
    <div className="px-4 pt-10 md:px-12 md:pt-14">
      <div className="flex flex-col items-center gap-3 text-center">
        <Eyebrow center>{t("faq.eyebrow")}</Eyebrow>
        <H as="h1" className="text-[38px] md:text-[60px]">
          {t("faq.title")} <Serif gold>{t("faq.titleAccent")}</Serif>
        </H>
        <P className="max-w-[560px]">{t("faq.sub")}</P>
        <label className="mt-4 flex h-14 w-full max-w-[640px] items-center gap-3 rounded-full border border-line bg-white px-6 focus-within:border-ink">
          <Search size={18} className="text-muted" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("faq.search")} aria-label={t("faq.search")} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
        </label>
        <div className="mt-2 flex flex-wrap justify-center gap-2" role="group" aria-label={t("faq.filter")}>
          {(["all", ...GROUPS.map((g) => g[0])] as const).map((c) => (
            <button key={c} type="button" aria-pressed={chip === c} onClick={() => setChip(c)} className={clsx("inline-flex h-9 items-center rounded-full border px-4 text-[13px] font-semibold", chip === c ? "border-ink bg-ink text-white" : "border-line bg-white text-ink2")}>
              {t(`faq.chip.${c}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="self-start rounded-block bg-dark p-7 text-white lg:sticky lg:top-40">
          <div className="text-xl font-extrabold">{t("faq.stillTitle")}</div>
          <P className="mt-2 text-on-dark-muted">{t("faq.stillSub")}</P>
          <Link href={routes.contact} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-gold-line hover:text-white">
            {t("faq.contactSupport")} <ArrowRight size={15} aria-hidden />
          </Link>
        </aside>
        <div>
          {faqs.length === 0 ? (
            <Missing field="FAQ entries" />
          ) : shown.length === 0 ? (
            <div className="flex flex-col items-start gap-3 rounded-block border border-line2 bg-white p-8">
              <H className="text-2xl">{t("faq.noResults", { q })}</H>
              <P>{t("faq.noResultsSub")}</P>
              <Link href={routes.contact} className="font-bold underline">
                {t("faq.contactSupport")}
              </Link>
            </div>
          ) : (
            GROUPS.map(([g, Icon]) => {
              const rows = shown.filter((f) => f.group === g);
              if (!rows.length) return null;
              return (
                <section key={g} className="mb-10">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-full bg-gold-soft text-gold">
                      <Icon size={16} aria-hidden />
                    </span>
                    <h2 className="text-xs font-extrabold uppercase tracking-[.16em]">{t(`faq.group.${g}`)}</h2>
                  </div>
                  <div className="border-t border-line">
                    {rows.map((f) => (
                      <AccordionRow
                        key={f.id}
                        id={f.slug}
                        size="sm"
                        open={open === f.slug}
                        onToggle={(o) => {
                          setOpen(o ? f.slug : null);
                          if (o) history.replaceState(null, "", `#${f.slug}`);
                        }}
                        title={f.question[lang] ?? f.question.en ?? <Missing field="question" />}
                      >
                        <Markdown source={f.answer[lang] ?? f.answer.en} field="answer" />
                      </AccordionRow>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
