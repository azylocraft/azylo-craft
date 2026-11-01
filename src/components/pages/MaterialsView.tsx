"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { T, useLocale, useText } from "@/components/shop/ShopContext";
import { BtnLink, Eyebrow, H, Missing, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { collectionHref, routes } from "@/lib/routes";
import type { I18nText } from "@/lib/types";

type Material = {
  id: string;
  slug: string;
  category: string;
  name: I18nText;
  description: I18nText;
  specs: Record<string, { en?: string; fr?: string }>;
  verifyNote: I18nText;
  sofaImage: string | null;
  swatchImage: string | null;
};

const NAV = [
  ["upholstery", "materials.nav.upholstery"],
  ["color", "materials.nav.color"],
  ["light", "materials.nav.light"],
  ["wood", "materials.nav.wood"],
  ["construction", "materials.nav.construction"],
  ["support", "materials.nav.support"],
  ["foam", "materials.nav.foam"],
  ["layers", "materials.nav.layers"],
  ["checklist", "materials.nav.checklist"],
] as const;

const TONES = ["#E8E1D3", "#C9B48F", "#6B4F3A", "#B7A58E", "#D3C2AB", "#3B3630"];

function DarkSec({ id, title, accent, children }: { id: string; title: string; accent: string; children: React.ReactNode }) {
  return (
  <section id={id} className="scroll-mt-48 px-4 pt-16 md:px-12 md:pt-24">
    <div className="rounded-block bg-dark p-7 text-white md:rounded-hero md:p-14">
      <H className="text-[30px] text-white md:text-[48px]">
        {title} <Serif gold>{accent}</Serif>
      </H>
      <div className="mt-8">{children}</div>
    </div>
  </section>
  );
}
function Sec({ id, title, accent, children }: { id: string; title: string; accent: string; children: React.ReactNode }) {
  return (
  <section id={id} className="scroll-mt-48 px-4 pt-16 md:px-12 md:pt-24">
    <H className="text-[30px] md:text-[48px]">
      {title} <Serif gold>{accent}</Serif>
    </H>
    <div className="mt-8">{children}</div>
  </section>
  );
}
function ImgCard({ k, tone, dark }: { k: string; tone: string; dark?: boolean }) {
  const t = useT();
  return (
  <div className={clsx("overflow-hidden rounded-card border", dark ? "border-dark-line bg-dark2" : "border-line2 bg-white")}>
    <Media alt="" tone={tone} dark={dark} label="MISSING: image" className="h-[180px]" />
    <div className="p-5">
      <div className="text-lg font-extrabold">{t(`materials.${k}`)}</div>
      <p className={clsx("mt-1 text-[13.5px] leading-relaxed", dark ? "text-on-dark-muted" : "text-muted")}>{t(`materials.${k}Sub`)}</p>
    </div>
  </div>
  );
}


/** Sofa Materials Guide (design screens 66–67): 13 sections, sticky sub-nav, accessible upholstery tabs. */
export function MaterialsView({ materials }: { materials: Material[] }) {
  const t = useT();
  const text = useText();
  const { lang } = useLocale();
  const uph = materials.filter((m) => m.category === "upholstery");
  const [tab, setTab] = useState(0);
  const [activeSec, setActiveSec] = useState<string>("upholstery");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const hash = location.hash.slice(1);
    const i = uph.findIndex((m) => m.slug === hash);
    if (i >= 0) {
      queueMicrotask(() => setTab(i));
      document.getElementById("upholstery")?.scrollIntoView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting)[0];
        if (vis) setActiveSec(vis.target.id);
      },
      { rootMargin: "-160px 0px -55% 0px" },
    );
    NAV.forEach(([id]) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const select = (i: number) => {
    setTab(i);
    history.replaceState(null, "", `#${uph[i].slug}`);
  };
  const m = uph[tab];
  const heroImage = uph.find((x) => x.slug === "boucle")?.sofaImage ?? uph.find((x) => x.sofaImage)?.sofaImage ?? null;
  const spec = (k: string) => {
    const s = m?.specs?.[k];
    return (lang === "fr" ? s?.fr : s?.en) ?? s?.en ?? null;
  };

  return (
    <>
      <section className="px-4 pt-6 md:px-12">
        {/* Full-bleed photo hero; the image is the first upholstery material's sofa photo (editable in Admin → Materials). */}
        <div className="relative isolate flex min-h-[560px] items-center overflow-hidden rounded-block bg-dark text-white md:rounded-hero lg:min-h-[660px]">
          {heroImage && <img src={heroImage} alt="" className="az-settle absolute inset-0 -z-20 size-full object-cover" />}
          <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(18,17,15,.55)_0%,rgba(18,17,15,.85)_100%)] md:bg-[linear-gradient(90deg,rgba(18,17,15,.9)_0%,rgba(18,17,15,.7)_42%,rgba(18,17,15,.15)_100%)]" />
          <div className="flex max-w-[680px] flex-col gap-5 p-7 md:p-16 lg:pl-[7%]">
            <div className="az-fade-up">
              <Eyebrow>{t("materials.eyebrow")}</Eyebrow>
            </div>
            <H as="h1" className="az-fade-up text-[40px] text-white md:text-[64px] xl:text-[76px]">
              {t("materials.heroTitle")} <Serif gold>{t("materials.heroAccent")}</Serif>
            </H>
            <div className="az-fade-up flex flex-col gap-5" style={{ ["--d" as string]: "250ms" }}>
              <P className="max-w-[520px] text-[16px] text-on-dark">{t("materials.heroSub")}</P>
              <div className="flex flex-wrap gap-3">
                <BtnLink href="#upholstery" kind="white" icon={ArrowRight}>
                  {t("materials.start")}
                </BtnLink>
                <BtnLink href={collectionHref("all")} kind="ghostW">
                  {t("materials.shop")}
                </BtnLink>
              </div>
              <p className="flex items-start gap-2 text-xs text-on-dark-muted">
                <Info size={14} className="mt-px flex-none" aria-hidden />
                {t("materials.disclaimer")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label={t("materials.navLabel")} className="sticky top-[60px] z-20 mt-6 overflow-x-auto px-4 md:top-[136px] md:px-12 [scrollbar-width:none]">
        <div className="flex w-max gap-1.5 rounded-full border border-line bg-white p-1.5 shadow-soft">
          {NAV.map(([id, key]) => (
            <a key={id} href={`#${id}`} aria-current={activeSec === id ? "true" : undefined} className={clsx("flex h-10 items-center whitespace-nowrap rounded-full px-4 text-[13px] font-bold", activeSec === id ? "bg-ink text-white" : "text-muted hover:text-ink")}>
              {t(key)}
            </a>
          ))}
        </div>
      </nav>

      <section className="grid gap-6 px-4 pt-14 md:grid-cols-2 md:px-12 md:pt-20">
        <H className="text-[28px] md:text-[40px]">{t("materials.introTitle")}</H>
        <P>{t("materials.introSub")}</P>
      </section>

      <section id="upholstery" className="scroll-mt-48 px-4 pt-16 md:px-12 md:pt-24">
        <Eyebrow>01 · {t("materials.nav.upholstery")}</Eyebrow>
        <H className="mt-3 text-[30px] md:text-[48px]">
          {t("materials.uphTitle")} <Serif gold>{t("materials.uphAccent")}</Serif>
        </H>
        {uph.length === 0 ? (
          <div className="mt-8">
            <Missing field="upholstery materials" />
          </div>
        ) : (
          <>
            <div role="tablist" aria-label={t("materials.nav.upholstery")} className="mt-8 flex flex-wrap gap-2">
              {uph.map((x, i) => (
                <button
                  key={x.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`tab-${x.slug}`}
                  role="tab"
                  type="button"
                  aria-selected={i === tab}
                  aria-controls={`panel-${x.slug}`}
                  tabIndex={i === tab ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={(e) => {
                    const n = e.key === "ArrowRight" ? (tab + 1) % uph.length : e.key === "ArrowLeft" ? (tab - 1 + uph.length) % uph.length : e.key === "Home" ? 0 : e.key === "End" ? uph.length - 1 : -1;
                    if (n >= 0) {
                      e.preventDefault();
                      select(n);
                      tabRefs.current[n]?.focus();
                    }
                  }}
                  className={clsx("inline-flex h-11 items-center rounded-full border px-5 text-sm font-bold", i === tab ? "border-ink bg-ink text-white" : "border-line bg-white text-ink2")}
                >
                  {text(x.name, "material name")}
                </button>
              ))}
            </div>
            {m && (
              <div key={m.id} id={`panel-${m.slug}`} role="tabpanel" aria-labelledby={`tab-${m.slug}`} className="mt-6 grid animate-[az-fade_.35s_ease] gap-5 lg:grid-cols-[1.3fr_1fr]">
                <Media src={m.sofaImage} alt={text(m.name, "material name")} tone={TONES[tab % TONES.length]} label={m.sofaImage ? undefined : "MISSING: sofa image"} className="h-[260px] rounded-block md:h-[460px]">
                  <span className="absolute left-4 top-4 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold">{text(m.name, "material name")}</span>
                </Media>
                <div className="flex flex-col gap-5 rounded-block border border-line2 bg-white p-6 md:p-8">
                  <div className="flex items-center gap-4">
                    <Media src={m.swatchImage} alt="" tone={TONES[tab % TONES.length]} className="size-20 flex-none rounded-tile" />
                    <div className="text-[26px] font-extrabold">
                      <T text={m.name} field="material name" fallback />
                    </div>
                  </div>
                  <P>
                    <T text={m.description} field="material description" />
                  </P>
                  <dl className="divide-y divide-line2 rounded-tile border border-line2">
                    {(["surface", "light", "visual_feel"] as const).map((k) => (
                      <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm">
                        <dt className="text-[11px] font-extrabold uppercase tracking-[.14em] text-muted">{t(`materials.spec.${k}`)}</dt>
                        <dd className="text-right font-bold">{spec(k) ?? <Missing field={k.replace("_", " ")} />}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="flex gap-2 text-[13px] text-muted">
                    <Info size={16} className="mt-0.5 flex-none text-gold" aria-hidden />
                    <span>
                      <b className="text-ink">{t("materials.verify")}:</b> <T text={m.verifyNote} field="verify note" />
                    </span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <Sec id="color" title={t("materials.colorTitle")} accent={t("materials.colorAccent")}>
        <div className="grid gap-4 md:grid-cols-3">
          {["c1", "c2", "c3"].map((k, i) => (
            <ImgCard key={k} k={`color.${k}`} tone={TONES[i]} />
          ))}
        </div>
      </Sec>
      <DarkSec id="light" title={t("materials.lightTitle")} accent={t("materials.lightAccent")}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {TONES.map((tone, i) => (
            <div key={i}>
              <Media alt="" tone={tone} dark label="MISSING: close-up" className="h-[140px] rounded-tile md:h-[200px]" />
              <p className="mt-2 text-xs text-on-dark-muted">{t("materials.closeUp", { n: i + 1 })}</p>
            </div>
          ))}
        </div>
      </DarkSec>
      <Sec id="wood" title={t("materials.woodTitle")} accent={t("materials.woodAccent")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["solid", "plywood", "mdf", "particle"].map((k, i) => (
            <ImgCard key={k} k={`wood.${k}`} tone={TONES[(i + 2) % TONES.length]} />
          ))}
        </div>
      </Sec>
      <Sec id="construction" title={t("materials.consTitle")} accent={t("materials.consAccent")}>
        <div className="grid gap-4 md:grid-cols-2">
          <ImgCard k="cons.frame" tone="#C9BEA9" />
          <ImgCard k="cons.joint" tone="#B7A58E" />
        </div>
      </Sec>
      <DarkSec id="support" title={t("materials.supTitle")} accent={t("materials.supAccent")}>
        <div className="grid gap-4 md:grid-cols-2">
          <ImgCard k="sup.springs" tone="#3B3630" dark />
          <ImgCard k="sup.webbing" tone="#4A4640" dark />
        </div>
      </DarkSec>
      <Sec id="foam" title={t("materials.foamTitle")} accent={t("materials.foamAccent")}>
        <div className="grid gap-4 md:grid-cols-2">
          <ImgCard k="foam.hr" tone="#E8E1D3" />
          <ImgCard k="foam.layered" tone="#DCD0BE" />
        </div>
      </Sec>
      <Sec id="layers" title={t("materials.layersTitle")} accent={t("materials.layersAccent")}>
        <div className="grid gap-6 md:grid-cols-2">
          <Media alt="" tone="#D3C2AB" label="MISSING: exploded-layer illustration" className="h-[280px] rounded-block md:h-[380px]" />
          <ol className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <li key={n} className="flex gap-4 rounded-card border border-line2 bg-white p-4">
                <span className="font-mono text-sm text-gold">0{n}</span>
                <span className="font-bold">{t(`materials.layer${n}`)}</span>
              </li>
            ))}
          </ol>
        </div>
      </Sec>
      <Sec id="checklist" title={t("materials.sixTitle")} accent={t("materials.sixAccent")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["composition", "care", "frame", "support", "foam", "actual"].map((k, i) => (
            <div key={k} className="rounded-card border border-line2 bg-white p-6">
              <span className="font-mono text-xs text-gold">0{i + 1}</span>
              <div className="mt-2 text-lg font-extrabold">{t(`materials.six.${k}`)}</div>
            </div>
          ))}
        </div>
      </Sec>
      <section className="px-4 pt-16 md:px-12 md:pt-24">
        <div className="flex flex-col items-start justify-between gap-6 rounded-block bg-cream p-8 md:flex-row md:items-center md:rounded-hero md:p-14">
          <H className="text-[30px] md:text-[44px]">
            {t("materials.ctaTitle")} <Serif gold>{t("materials.ctaAccent")}</Serif>
          </H>
          <div className="flex flex-wrap gap-3">
            <BtnLink href={collectionHref("all")} icon={ArrowRight}>
              {t("materials.shop")}
            </BtnLink>
            <BtnLink href={routes.contact} kind="outline">
              {t("nav.contact")}
            </BtnLink>
          </div>
        </div>
      </section>
    </>
  );
}
