"use client";

import { CartLines, DeliveryBanner, DiscountBox, EmptyCart, NoteBox, TotalRow } from "@/components/shop/CartParts";
import { Crumb } from "@/components/shop/Listing";
import { useHydrated } from "@/components/shop/ShopContext";
import { BtnLink, Eyebrow, H } from "@/components/ui/primitives";
import { useCartDetails } from "@/lib/cart-details";
import { useT } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { useCartCount } from "@/lib/shop-store";

/** Full cart page (design screen 35). */
export function CartPageView() {
  const t = useT();
  const hydrated = useHydrated();
  const count = useCartCount();
  const { subtotal, missingPrice } = useCartDetails();
  return (
    <div className="px-4 pt-6 md:px-12">
      <Crumb items={[{ label: "Home", href: "/" }, { label: t("cart.title") }]} />
      <div className="mt-6 flex items-end justify-between">
        <div>
          <Eyebrow>{t("cart.eyebrow")}</Eyebrow>
          <H as="h1" className="mt-3 text-[34px] md:text-[48px]">{t("cart.title")}</H>
        </div>
        {hydrated && <span className="text-sm text-muted">{t("cart.items", { n: count })}</span>}
      </div>
      {!hydrated ? (
        <div className="az-skeleton mt-8 h-[300px] rounded-block" />
      ) : count === 0 ? (
        <div className="mt-8 rounded-block border border-line2 bg-white">
          <EmptyCart />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-block border border-line2 bg-white px-5 md:px-7">
            <CartLines />
          </div>
          <div className="flex flex-col gap-4 self-start rounded-block border border-line2 bg-white p-6 lg:sticky lg:top-40">
            <DeliveryBanner />
            <NoteBox />
            <DiscountBox subtotal={subtotal} />
            <TotalRow subtotal={subtotal} missingPrice={missingPrice} />
            <BtnLink href={routes.checkout} full size="lg">
              {t("cart.checkout")}
            </BtnLink>
            <BtnLink href="/collections/all" kind="outline" full>
              {t("cart.continue")}
            </BtnLink>
          </div>
        </div>
      )}
    </div>
  );
}
