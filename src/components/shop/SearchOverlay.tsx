"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Armchair, ArrowRight, BadgeDollarSign, BedDouble, CircleAlert, Package, PawPrint, Ruler, Search, TrendingUp, X } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { Price, T, useHydrated, useText } from "@/components/shop/ShopContext";
import { POPULAR } from "@/components/shop/SearchParts";
import { Btn, Chip, Eyebrow, Logo } from "@/components/ui/primitives";
import { useProductCards } from "@/lib/cart-details";
import { useT } from "@/lib/i18n";
import { mediaUrl } from "@/lib/media";
import { collectionHref, routes } from "@/lib/routes";
import { useShop } from "@/lib/shop-store";
import { supabaseBrowser } from "@/lib/supabase/client";
import { tx, type I18nText } from "@/lib/types";
import { useUi } from "@/lib/ui-store";

type Suggestion = { id: string; slug: string; name: I18nText; price: number | null; image: string | null; tone: string | null };

const NEEDS = [
  [Ruler, "search.need.small", "small-space-sofas", "#E5DCCD"],
  [BedDouble, "search.need.sleep", "convertible-sofa-beds", "#D2C3AA"],
  [Armchair, "search.need.recline", "power-reclining-sofas", "#DED6CA"],
  [PawPrint, "search.need.pets", "all", "#C8BBA6"],
  [Package, "search.need.box", "compressed-sofas", "#E9E3D8"],
  [BadgeDollarSign, "search.need.modular", "modular-sectional-sofas", "#D9CCB8"],
] as const;

export function SearchOverlay() {
  const open = useUi((s) => s.drawer === "search");
  const hydrated = useHydrated();
  if (!open || !hydrated) return null;
  return <SearchBody />;
}

function SearchBody() {
  const t = useT();
  const text = useText();
  const router = useRouter();
  const close = useUi((s) => s.close);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Suggestion[] | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "error">("idle");
  const [attempt, setAttempt] = useState(0);
  const recent = useProductCards(useShop((s) => s.recentlyViewed).slice(0, 4)).cards;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      queueMicrotask(() => setResults(null));
      return;
    }
    let cancelled = false;
    const id = setTimeout(async () => {
      setState("busy");
      if (!navigator.onLine) return setState("error");
      const like = `%${term.replace(/[%_,()]/g, " ")}%`;
      const { data, error } = await supabaseBrowser()
        .from("products")
        .select("id, slug, name_en, name_fr, placeholder_tone, product_variants ( price_cad ), product_images ( storage_path, sort_order )")
        .or(`name_en.ilike.${like},name_fr.ilike.${like},eyebrow_en.ilike.${like}`)
        .order("sort_order")
        .limit(6);
      if (cancelled) return;
      if (error) return setState("error");
      setState("idle");
      setResults(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data ?? []).map((r: any) => {
          const prices = (r.product_variants ?? []).filter((v: { price_cad: number | null }) => v.price_cad != null).map((v: { price_cad: number }) => Number(v.price_cad));
          const img = [...(r.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
          return { id: r.id, slug: r.slug, name: tx(r.name_en, r.name_fr), price: prices.length ? Math.min(...prices) : null, image: mediaUrl(img?.storage_path), tone: r.placeholder_tone };
        }),
      );
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [q, attempt]);

  const go = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={t("search.title")} className="fixed inset-0 z-[70] overflow-y-auto bg-bg2 text-ink">
      <div className="flex min-h-[72px] items-center gap-4 border-b border-line px-4 py-3 md:h-[100px] md:gap-8 md:px-12">
        <span className="hidden md:block">
          <Logo />
        </span>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
          }}
          className="flex h-12 flex-1 items-center gap-3 rounded-full border-[1.5px] border-ink bg-white px-5 md:h-[58px] md:px-6"
        >
          <Search size={20} aria-hidden />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search.placeholder")}
            aria-label={t("search.placeholder")}
            className="min-w-0 flex-1 bg-transparent text-base outline-none md:text-lg"
          />
          {q && <span className="hidden text-xs text-muted md:inline">{t("search.enterHint")}</span>}
        </form>
        <button type="button" onClick={close} className="flex items-center gap-2 text-[13px] font-bold">
          <span className="flex size-11 items-center justify-center rounded-full border border-line bg-white">
            <X size={18} aria-hidden />
          </span>
          <span className="hidden md:inline">{t("common.close")}</span>
        </button>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-col gap-11 px-4 py-8 md:px-12 md:py-11">
        <div className="mb-[-12px] flex flex-col gap-2">
          <Eyebrow>{t("search.eyebrow")}</Eyebrow>
          <div className="text-[30px] font-extrabold tracking-[-0.03em] md:text-[44px]">{t("search.title")}</div>
        </div>

        {state === "error" ? (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-card border border-line2 bg-white p-6">
            <span className="flex items-center gap-2 text-sm font-bold text-red">
              <CircleAlert size={16} aria-hidden />
              {t("search.unavailable")}
            </span>
            <Btn kind="outline" size="sm" onClick={() => setAttempt((n) => n + 1)}>
              {t("common.retry")}
            </Btn>
          </div>
        ) : results ? (
          <div>
            <div className="mb-3.5 flex justify-between">
              <Eyebrow line={false}>{t("search.productsN", { n: results.length })}</Eyebrow>
              <button type="button" onClick={() => go(`/search?q=${encodeURIComponent(q.trim())}`)} className="flex items-center gap-1.5 text-[13px] font-bold">
                {t("search.seeAll")} <ArrowRight size={14} aria-hidden />
              </button>
            </div>
            {results.length === 0 ? (
              <p className="text-sm text-muted">{t("search.noSuggestions")}</p>
            ) : (
              <ul className="flex flex-col gap-2.5">
                {results.map((r) => (
                  <li key={r.id}>
                    <Link href={`/products/${r.slug}`} onClick={close} className="flex items-center gap-4 rounded-tile border border-transparent p-3 hover:border-line hover:bg-white">
                      <Media src={r.image} alt={text(r.name, "product name")} tone={r.tone} className="h-[70px] w-[84px] flex-none rounded-xl" />
                      <span className="min-w-0 flex-1 text-[15px] font-bold">
                        <T text={r.name} field="product name" fallback />
                      </span>
                      <span className="flex-none text-sm font-extrabold">
                        <Price cad={r.price} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <>
            <div>
              <Eyebrow className="mb-4">{t("search.popular")}</Eyebrow>
              <div className="flex flex-wrap gap-2.5">
                {POPULAR.map((p) => (
                  <button key={p} type="button" onClick={() => setQ(p)}>
                    <Chip>
                      <TrendingUp size={14} className="text-gold" aria-hidden />
                      {p}
                    </Chip>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Eyebrow className="mb-4">{t("search.byNeed")}</Eyebrow>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {NEEDS.map(([Icon, key, slug, tone]) => (
                  <Link key={key} href={collectionHref(slug)} onClick={close} className="flex items-center gap-4 rounded-card border border-line2 bg-white p-3.5 hover:border-ink">
                    <Media alt="" tone={tone} className="h-[72px] w-[84px] flex-none rounded-xl" />
                    <span className="flex flex-1 items-center gap-2 text-[15px] font-extrabold">
                      <Icon size={16} className="text-gold" aria-hidden />
                      {t(key)}
                    </span>
                    <ArrowRight size={16} aria-hidden />
                  </Link>
                ))}
              </div>
            </div>
            {recent.length > 0 && (
              <div>
                <Eyebrow className="mb-4">{t("recent.title")}</Eyebrow>
                <div className="flex flex-wrap gap-3">
                  {recent.map((p) => (
                    <Link key={p.id} href={`/products/${p.slug}`} onClick={close} className="flex items-center gap-3 rounded-full border border-line2 bg-white py-2 pl-2 pr-4 text-[13px] font-semibold">
                      <Media src={p.image} alt="" tone={p.tone} className="size-9 rounded-full" />
                      <span className="max-w-[220px] truncate">
                        <T text={p.name} field="product name" fallback />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        <Link href={routes.contact} onClick={close} className="flex items-center gap-2 self-start text-sm font-bold underline">
          {t("search.needHelp")}
        </Link>
      </div>
    </div>
  );
}
