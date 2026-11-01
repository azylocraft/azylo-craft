"use client";

import Link from "next/link";
import { ArrowRight, Heart, X } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { DrawerPanel, Overlay } from "@/components/shop/Overlay";
import { Price, T, useHydrated, useText } from "@/components/shop/ShopContext";
import { BtnLink, Eyebrow, H, P } from "@/components/ui/primitives";
import { useWishlistCards } from "@/lib/cart-details";
import { useT } from "@/lib/i18n";
import { useShop } from "@/lib/shop-store";
import { useUi } from "@/lib/ui-store";

export function WishDrawer() {
  const t = useT();
  const open = useUi((s) => s.drawer === "wish");
  const close = useUi((s) => s.close);
  const hydrated = useHydrated();
  if (!open || !hydrated) return null;
  return (
    <Overlay onClose={close} label={t("wish.title")}>
      <DrawerPanel>
        <WishBody onClose={close} />
      </DrawerPanel>
    </Overlay>
  );
}

function WishBody({ onClose }: { onClose: () => void }) {
  const t = useT();
  const text = useText();
  const { cards, status } = useWishlistCards();
  const toggle = useShop((s) => s.toggleWishlist);
  const count = useShop((s) => s.wishlist.length);

  return (
    <>
      <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
        <div className="flex flex-col gap-2">
          <Eyebrow>{t("wish.eyebrow")}</Eyebrow>
          <H className="text-[30px]">{t("wish.title")}</H>
          <P className="text-[13.5px]">{t("wish.sub")}</P>
        </div>
        <button type="button" aria-label={t("common.close")} onClick={onClose} className="flex size-10 flex-none items-center justify-center rounded-full border border-line bg-white hover:border-ink">
          <X size={16} aria-hidden />
        </button>
      </div>
      {count === 0 ? (
        <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <span className="flex size-[68px] items-center justify-center rounded-full bg-gold-soft text-gold">
            <Heart size={26} aria-hidden />
          </span>
          <H className="text-2xl">{t("wish.emptyTitle")}</H>
          <P>{t("wish.emptySub")}</P>
          <BtnLink href="/collections/all" onClick={onClose}>
            {t("cart.continue")}
          </BtnLink>
        </div>
      ) : (
        <ul className="flex flex-1 flex-col gap-3 overflow-y-auto px-6 pb-8">
          {status !== "ready" && cards.length === 0
            ? Array.from({ length: count }).map((_, i) => <li key={i} className="az-skeleton h-[120px] rounded-card" />)
            : cards.map((c) => (
                <li key={c.id} className="flex gap-4 rounded-card border border-line2 bg-white p-3">
                  <Media src={c.image} alt={text(c.name, "product name")} tone={c.tone} className="h-[96px] w-[110px] flex-none rounded-xl" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-[10.5px] font-extrabold tracking-[.16em] text-gold">AZYLO</span>
                    <b className="line-clamp-2 text-sm leading-snug">
                      <T text={c.name} field="product name" fallback />
                    </b>
                    <span className="text-[13px] font-bold text-gold">
                      {t("wish.from")} <Price cad={c.fromPriceInr} />
                    </span>
                    <Link href={`/products/${c.slug}`} onClick={onClose} className="mt-auto flex items-center gap-1.5 text-[13px] font-bold hover:text-gold">
                      {t("wish.view")}
                      <ArrowRight size={14} aria-hidden />
                    </Link>
                  </div>
                  <button type="button" aria-label={t("wish.remove")} onClick={() => toggle(c.id)} className="flex size-8 flex-none items-center justify-center rounded-full border border-line text-muted hover:border-ink hover:text-ink">
                    <X size={14} aria-hidden />
                  </button>
                </li>
              ))}
        </ul>
      )}
    </>
  );
}
