"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { Badge, BtnLink, Eyebrow, H, P } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { routes } from "@/lib/routes";

/** Gift cards / App / Catalog placeholder pages. */
export function ComingSoon({ kind }: { kind: "giftCards" | "app" | "catalog" }) {
  const t = useT();
  return (
    <div className="px-4 pt-10 md:px-12 md:pt-14">
      <div className="mx-auto flex max-w-[760px] flex-col items-center gap-5 rounded-block border border-line2 bg-white px-6 py-16 text-center shadow-card md:rounded-hero md:py-20">
        <span className="flex size-[68px] items-center justify-center rounded-full bg-gold-soft text-gold">
          <Sparkles size={26} aria-hidden />
        </span>
        <Badge>{t("common.comingSoon")}</Badge>
        <Eyebrow center>AZYLO</Eyebrow>
        <H as="h1" className="text-[34px] md:text-[48px]">
          {t(`soon.${kind}Title`)}
        </H>
        <P className="max-w-[520px]">{t(`soon.${kind}Sub`)}</P>
        <div className="flex flex-wrap justify-center gap-3">
          <BtnLink href="/collections/all" icon={ArrowRight}>
            {t("cart.continue")}
          </BtnLink>
          <BtnLink href={routes.contact} kind="outline">
            {t("nav.contact")}
          </BtnLink>
        </div>
      </div>
    </div>
  );
}
