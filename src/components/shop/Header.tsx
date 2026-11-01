"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Diamond,
  Gift,
  Globe,
  Grip,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { Eyebrow, Logo, Round } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { CURRENCIES, LANGS, usePrefs } from "@/lib/prefs";
import { categoriesPanel, categoryPills, discoverMenu, routes } from "@/lib/routes";
import { useCartCount, useWishCount } from "@/lib/shop-store";
import { useDismiss } from "@/lib/use-dismiss";
import { useUi } from "@/lib/ui-store";
import { firstName, useAuth } from "@/lib/auth";

type Menu = "cat" | "disc" | "lang" | null;

/** Badge counts only exist in the browser (localStorage), so render 0 until mounted. */
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function CountBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span className="absolute -right-2 -top-[7px] flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9.5px] font-extrabold text-white">
      {n}
    </span>
  );
}

function HeaderAction({
  icon: Icon,
  label,
  count = 0,
  href,
  onClick,
  hideLabel,
}: {
  icon: typeof Heart;
  label: string;
  count?: number;
  href?: string;
  onClick?: () => void;
  hideLabel?: boolean;
}) {
  const inner = (
    <>
      <span className="relative inline-flex">
        <Icon size={20} aria-hidden />
        <CountBadge n={count} />
      </span>
      <span className={clsx(hideLabel && "sr-only")}>{label}</span>
    </>
  );
  const cls = "inline-flex items-center gap-2 text-[13px] font-bold text-ink hover:text-gold transition-colors";
  const aria = count > 0 ? `${label} (${count})` : label;
  return href ? (
    <Link href={href} className={cls} aria-label={aria}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls} aria-label={aria}>
      {inner}
    </button>
  );
}

function Panel({ children, className, id }: { children: ReactNode; className?: string; id: string }) {
  return (
    <div id={id} className={clsx("absolute top-[calc(100%+10px)] z-40 rounded-panel border border-line2 bg-white shadow-float", className)}>
      {children}
    </div>
  );
}

export function Header() {
  const t = useT();
  const pathname = usePathname();
  const mounted = useMounted();
  const cartCount = useCartCount();
  const wishCount = useWishCount();
  const { lang, currency, setLang, setCurrency } = usePrefs();
  const openDrawer = useUi((s) => s.open);

  const [menu, setMenu] = useState<Menu>(null);
  const [drawer, setDrawer] = useState(false);
  const close = useCallback(() => setMenu(null), []);
  const catRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const refs = useMemo(() => [catRef, discRef, langRef], []);
  useDismiss(menu !== null, refs, close);

  // Close menus on navigation (reset during render when the path changes).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMenu(null);
    setDrawer(false);
  }

  const toggle = (m: Menu) => setMenu((cur) => (cur === m ? null : m));
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const curLabel = currency === "EUR" ? "€ EUR" : currency === "GBP" ? "£ GBP" : `$${currency}`;

  const cartN = mounted ? cartCount : 0;
  const wishN = mounted ? wishCount : 0;

  return (
    <header className="sticky top-0 z-30">
      {/* Mobile bar (< 768px) */}
      <div className="flex h-[60px] items-center justify-between border-b border-line bg-bg2 px-[18px] md:hidden">
        <button type="button" aria-label={t("header.menu")} aria-expanded={drawer} onClick={() => setDrawer(true)} className="p-1 -ml-1">
          <Menu size={22} aria-hidden />
        </button>
        <Link href={routes.home} aria-label="AZYLO home">
          <Logo size={16} />
        </Link>
        <span className="flex items-center gap-4">
          <button type="button" onClick={() => openDrawer("search")} aria-label={t("header.search")}>
            <Search size={20} aria-hidden />
          </button>
          <HeaderAction icon={ShoppingBag} label={t("header.cart")} count={cartN} onClick={() => openDrawer("cart")} hideLabel />
        </span>
      </div>

      {/* Desktop row 1 */}
      <div className="hidden h-[76px] items-center gap-8 bg-bg2 px-6 md:flex lg:px-12">
        <div className="flex-none lg:w-[260px]">
          <Link href={routes.home} aria-label="AZYLO home">
            <Logo />
          </Link>
        </div>
        <div className="flex min-w-0 flex-1 justify-center">
          <button
            type="button"
            onClick={() => openDrawer("search")}
            className="flex h-[46px] w-full max-w-[560px] items-center gap-3 rounded-full border border-ink bg-white px-5 text-left text-sm text-muted hover:border-gold"
          >
            <span className="flex-1 truncate">{t("header.search")}</span>
            <Search size={18} className="text-ink" aria-hidden />
          </button>
        </div>
        <nav aria-label="Account" className="flex flex-none items-center justify-end gap-5 lg:gap-7">
          <AccountAction />
          <HeaderAction icon={Heart} label={t("header.wishlist")} count={wishN} onClick={() => openDrawer("wish")} />
          <HeaderAction icon={Gift} label={t("header.giftCards")} href={routes.giftCards} />
          <HeaderAction icon={ShoppingBag} label={t("header.cart")} count={cartN} onClick={() => openDrawer("cart")} />
        </nav>
      </div>

      {/* Desktop row 2 */}
      <div className="relative hidden h-[60px] items-center gap-1.5 border-b border-line bg-white px-6 shadow-bar md:flex lg:px-10">
        <div ref={catRef} className="relative flex-none">
          <button
            type="button"
            aria-expanded={menu === "cat"}
            aria-controls="az-cat-panel"
            onClick={() => toggle("cat")}
            className="inline-flex h-10 items-center gap-2.5 rounded-full bg-dark px-[18px] text-[13px] font-bold text-white"
          >
            <Grip size={16} className="text-gold-line" aria-hidden />
            {t("header.categories")}
            <ChevronDown size={14} aria-hidden className={clsx("transition-transform", menu === "cat" && "rotate-180")} />
          </button>
          {menu === "cat" && (
            <Panel id="az-cat-panel" className="left-0 w-[340px] p-3">
              <ul>
                {categoriesPanel.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <li key={item.href + item.key}>
                      <Link
                        href={item.href}
                        className={clsx(
                          "flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold text-ink2 hover:bg-gold-soft",
                          active && "bg-gold-soft",
                        )}
                      >
                        <span aria-hidden className={clsx("size-1.5 rounded-full", active ? "bg-gold" : "bg-line")} />
                        {t(item.key)}
                        <span className="flex-1" />
                        {active && <ArrowRight size={15} className="text-gold" aria-hidden />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Panel>
          )}
        </div>

        <nav aria-label="Categories" className="flex min-w-0 items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {categoryPills.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "inline-flex h-[38px] flex-none items-center gap-[7px] whitespace-nowrap rounded-full border px-[11px] text-xs font-bold text-ink2 hover:border-ink",
                  active ? "border-ink bg-gold-soft" : "border-line bg-white",
                )}
              >
                <span aria-hidden className="size-[5px] rounded-full bg-gold" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div ref={discRef} className="relative flex-none">
          <button
            type="button"
            aria-expanded={menu === "disc"}
            aria-controls="az-disc-panel"
            onClick={() => toggle("disc")}
            className="inline-flex h-[38px] items-center gap-2 rounded-full border border-gold-line bg-gold-soft px-3.5 text-[12.5px] font-bold text-gold"
          >
            <Diamond size={12} aria-hidden />
            {t("header.discover")}
            <ChevronDown size={13} aria-hidden className={clsx("transition-transform", menu === "disc" && "rotate-180")} />
          </button>
          {menu === "disc" && (
            <Panel id="az-disc-panel" className="right-0 grid w-[520px] grid-cols-2 gap-1.5 p-3.5 lg:left-0 lg:right-auto">
              {discoverMenu.map((item) => (
                <Link key={item.key} href={item.href} className="flex gap-3.5 rounded-2xl p-3.5 hover:bg-gold-soft">
                  <Round icon={item.icon} size={38} className="!border-gold-line !text-gold" />
                  <span>
                    <span className="block text-sm font-bold text-ink">{t(item.key)}</span>
                    <span className="block text-xs text-muted">{t(item.sub)}</span>
                  </span>
                </Link>
              ))}
            </Panel>
          )}
        </div>

        <span className="flex-1" />

        <div ref={langRef} className="relative flex-none">
          <button
            type="button"
            aria-expanded={menu === "lang"}
            aria-controls="az-lang-panel"
            onClick={() => toggle("lang")}
            className={clsx(
              "inline-flex h-[38px] items-center gap-2.5 rounded-full border bg-bg2 px-3.5 text-[12.5px] font-bold",
              menu === "lang" ? "border-ink" : "border-line",
            )}
          >
            <Globe size={15} className="text-gold" aria-hidden />
            {mounted ? lang.toUpperCase() : "EN"}
            <span aria-hidden className="h-3.5 w-px bg-line" />
            {mounted ? curLabel : "$CAD"}
            <ChevronDown size={13} aria-hidden />
          </button>
          {menu === "lang" && (
            <Panel id="az-lang-panel" className="right-0 flex w-[300px] flex-col gap-3.5 p-[18px]">
              <LocaleControls
                t={t}
                lang={lang}
                currency={currency}
                onLang={setLang}
                onCurrency={setCurrency}
              />
            </Panel>
          )}
        </div>
      </div>

      {drawer && <MobileDrawer onClose={() => setDrawer(false)} wishCount={wishN} onWishlist={() => { setDrawer(false); openDrawer("wish"); }} />}
    </header>
  );
}

/** "Log in" or "Hi, <first name>" (opens the account drawer). */
function AccountAction() {
  const t = useT();
  const { user, profile } = useAuth();
  const open = useUi((s) => s.open);
  if (!user) return <HeaderAction icon={UserRound} label={t("header.login")} href={routes.login} />;
  return <HeaderAction icon={UserRound} label={t("header.hi", { name: firstName(profile, user) })} onClick={() => open("account")} />;
}

function MobileAccount({ onClose }: { onClose: () => void }) {
  const t = useT();
  const { user, profile } = useAuth();
  const open = useUi((s) => s.open);
  const cls = "inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-bold";
  if (!user)
    return (
      <Link href={routes.login} className={cls}>
        <UserRound size={16} aria-hidden />
        {t("header.login")}
      </Link>
    );
  return (
    <button type="button" className={cls} onClick={() => { onClose(); open("account"); }}>
      <UserRound size={16} aria-hidden />
      {t("header.hi", { name: firstName(profile, user) })}
    </button>
  );
}

function LocaleControls({
  t,
  lang,
  currency,
  onLang,
  onCurrency,
}: {
  t: ReturnType<typeof useT>;
  lang: (typeof LANGS)[number];
  currency: (typeof CURRENCIES)[number];
  onLang: (l: (typeof LANGS)[number]) => void;
  onCurrency: (c: (typeof CURRENCIES)[number]) => void;
}) {
  return (
    <>
      <Eyebrow line={false}>{t("header.language")}</Eyebrow>
      <div className="flex gap-2" role="radiogroup" aria-label={t("header.language")}>
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={lang === l}
            onClick={() => onLang(l)}
            className={clsx(
              "inline-flex h-9 items-center rounded-full border px-4 text-[13px] font-semibold",
              lang === l ? "border-ink bg-ink text-white" : "border-line bg-white text-ink2",
            )}
          >
            {t(`langNames.${l}`)}
          </button>
        ))}
      </div>
      <Eyebrow line={false}>{t("header.currency")}</Eyebrow>
      <div role="radiogroup" aria-label={t("header.currency")} className="flex flex-col gap-2.5">
        {CURRENCIES.map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={currency === c}
            onClick={() => onCurrency(c)}
            className="flex items-center gap-3 text-left text-sm"
          >
            <span
              aria-hidden
              className={clsx(
                "inline-flex size-[18px] flex-none items-center justify-center rounded-full border-[1.5px]",
                currency === c ? "border-ink" : "border-[#CFC8BC]",
              )}
            >
              {currency === c && <span className="size-[9px] rounded-full bg-ink" />}
            </span>
            <b className="w-10">{c}</b>
            <span className="text-muted">{t(`currencyNames.${c}`)}</span>
          </button>
        ))}
      </div>
      <p className="text-[11.5px] leading-normal text-faint">{t("header.rateNote")}</p>
    </>
  );
}

function MobileDrawer({ onClose, wishCount, onWishlist }: { onClose: () => void; wishCount: number; onWishlist: () => void }) {
  const t = useT();
  const { lang, currency, setLang, setCurrency } = usePrefs();
  const [localeOpen, setLocaleOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={t("header.menu")} className="fixed inset-0 z-50 overflow-y-auto bg-bg md:hidden">
      <div className="flex h-[60px] items-center justify-between border-b border-line bg-bg2 px-[18px]">
        <button type="button" aria-label={t("header.closeMenu")} onClick={onClose} className="p-1 -ml-1">
          <X size={22} aria-hidden />
        </button>
        <Logo size={16} />
        <span className="w-[22px]" />
      </div>
      <div className="flex flex-col px-[22px] py-5">
        <Link href={routes.home} className="flex h-14 items-center justify-between border-b border-line text-[17px] font-bold">
          {t("nav.home")}
          <ChevronRight size={18} className="text-faint" aria-hidden />
        </Link>
        {categoryPills.map((item) => (
          <Link key={item.href} href={item.href} className="flex h-14 items-center justify-between border-b border-line text-[17px] font-bold">
            {t(item.key)}
            <ChevronRight size={18} className="text-faint" aria-hidden />
          </Link>
        ))}
        <Eyebrow className="mb-3 mt-6">{t("header.discover")}</Eyebrow>
        {discoverMenu.map((item) => (
          <Link key={item.key} href={item.href} className="flex h-10 items-center text-[15px] text-ink2">
            {t(item.key)}
          </Link>
        ))}
        <Link href={routes.blogs} className="flex h-10 items-center text-[15px] text-ink2">
          {t("nav.blogs")}
        </Link>
        <Link href={routes.giftCards} className="flex h-10 items-center text-[15px] text-ink2">
          {t("header.giftCards")}
        </Link>
        <div className="mt-[18px] flex flex-wrap gap-2.5">
          <MobileAccount onClose={onClose} />
          <button type="button" onClick={onWishlist} className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-bold">
            <Heart size={16} aria-hidden />
            {t("header.wishlist")}
            {wishCount > 0 && ` · ${wishCount}`}
          </button>
        </div>
        <button
          type="button"
          aria-expanded={localeOpen}
          onClick={() => setLocaleOpen((v) => !v)}
          className="mt-4 flex items-center gap-2 text-[13px] text-muted"
        >
          <Globe size={15} className="text-gold" aria-hidden />
          {t(`langNames.${lang}`)} · ${currency}
          <ChevronDown size={13} aria-hidden className={clsx("transition-transform", localeOpen && "rotate-180")} />
        </button>
        {localeOpen && (
          <div className="mt-3 flex flex-col gap-3.5 rounded-panel border border-line2 bg-white p-[18px]">
            <LocaleControls t={t} lang={lang} currency={currency} onLang={setLang} onCurrency={setCurrency} />
          </div>
        )}
      </div>
    </div>
  );
}
