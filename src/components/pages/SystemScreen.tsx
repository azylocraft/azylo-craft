"use client";

import { ArrowRight, RefreshCw, SearchX, TriangleAlert, WifiOff } from "lucide-react";
import { Btn, BtnLink, H, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { routes } from "@/lib/routes";

/** System states (design screens 82–84). */
export function SystemScreen({ kind, onRetry }: { kind: "notFound" | "error" | "offline"; onRetry?: () => void }) {
  const t = useT();
  const Icon = kind === "notFound" ? SearchX : kind === "offline" ? WifiOff : TriangleAlert;
  return (
    <div className="px-4 pt-10 md:px-12 md:pt-16">
      <div className="mx-auto flex max-w-[720px] flex-col items-center gap-5 py-12 text-center">
        {kind === "notFound" ? (
          <div className="text-[110px] font-extrabold leading-none tracking-[-0.05em] md:text-[160px]">
            4<Serif gold>0</Serif>4
          </div>
        ) : (
          <span className="flex size-[76px] items-center justify-center rounded-full bg-gold-soft text-gold">
            <Icon size={30} aria-hidden />
          </span>
        )}
        <H as="h1" className="text-[30px] md:text-[44px]">
          {t(`system.${kind}Title`)}
        </H>
        <P className="max-w-[480px]">{t(`system.${kind}Sub`)}</P>
        <div className="flex flex-wrap justify-center gap-3">
          {onRetry && (
            <Btn iconL={RefreshCw} onClick={onRetry}>
              {t("common.retry")}
            </Btn>
          )}
          <BtnLink href="/" kind={onRetry ? "outline" : "dark"} icon={ArrowRight}>
            {t("system.home")}
          </BtnLink>
          {kind === "notFound" && (
            <BtnLink href={routes.contact} kind="outline">
              {t("nav.contact")}
            </BtnLink>
          )}
        </div>
      </div>
    </div>
  );
}
