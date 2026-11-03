"use client";

import Link from "next/link";
import { MessageCircle, SearchX } from "lucide-react";
import { Crumb, ProductGrid } from "@/components/shop/Listing";
import { BtnLink, Chip, Eyebrow, H, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import type { ProductCardData } from "@/lib/types";

export const POPULAR = ["Power recliner", "Sofa bed", "Bouclé"];

export function SearchResultsHead({ q, total }: { q: string; total: number }) {
  const t = useT();
  return (
    <div className="px-4 pb-6 pt-6 md:px-12">
      <Crumb items={[{ label: "Home", href: "/" }, { label: t("search.crumb") }]} />
      <div className="mt-7 flex flex-col gap-3">
        <Eyebrow>{t("search.resultsEyebrow")}</Eyebrow>
        {q ? (
          <H as="h1" className="text-[32px] md:text-[44px]">
            {t("search.resultsFor")} <Serif gold>“{q}”</Serif>
          </H>
        ) : (
          <H as="h1" className="text-[32px] md:text-[44px]">{t("search.title")}</H>
        )}
        {q && <P>{t("search.count", { n: total })}</P>}
        {!q && (
          <div className="mt-2 flex flex-wrap gap-2">
            {POPULAR.map((p) => (
              <Link key={p} href={`/search?q=${encodeURIComponent(p)}`}>
                <Chip>{p}</Chip>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function SearchEmpty({ q, suggestions }: { q: string; suggestions: ProductCardData[] }) {
  const t = useT();
  return (
    <div className="px-4 pt-6 md:px-12">
      <Crumb items={[{ label: "Home", href: "/" }, { label: t("search.crumb") }]} />
      <div className="flex flex-col items-center gap-4 px-2 pb-10 pt-14 text-center">
        <span className="flex size-[68px] items-center justify-center rounded-full bg-gold-soft text-gold">
          <SearchX size={26} aria-hidden />
        </span>
        <H as="h1" className="text-[30px] md:text-[40px]">
          {t("search.noResults")} <Serif gold>“{q}”</Serif>
        </H>
        <P className="max-w-[480px]">{t("search.noResultsSub")}</P>
        <div className="mt-1.5 flex flex-wrap justify-center gap-2">
          {["Sofa bed", "Recliner", "Modular sofa", "Bouclé"].map((s) => (
            <Link key={s} href={`/search?q=${encodeURIComponent(s)}`}>
              <Chip>{s}</Chip>
            </Link>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-2.5">
          <BtnLink href="/collections/all" kind="outline">
            {t("search.browseAll")}
          </BtnLink>
          <BtnLink href={routes.contact} iconL={MessageCircle}>
            {t("search.askSpecialist")}
          </BtnLink>
        </div>
      </div>
      {suggestions.length > 0 && (
        <>
          <div className="mb-5 text-xl font-extrabold">{t("search.mightLike")}</div>
          <ProductGrid items={suggestions} />
        </>
      )}
    </div>
  );
}
