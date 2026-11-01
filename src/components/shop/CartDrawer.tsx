"use client";

import clsx from "clsx";
import { useState } from "react";
import { NotebookPen, Tag, X } from "lucide-react";
import { CartLines, DeliveryBanner, DiscountBox, EmptyCart, NoteBox, TotalRow } from "@/components/shop/CartParts";
import { DrawerPanel, Overlay } from "@/components/shop/Overlay";
import { useHydrated } from "@/components/shop/ShopContext";
import { BtnLink } from "@/components/ui/primitives";
import { useCartDetails } from "@/lib/cart-details";
import { useT } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { useCartCount } from "@/lib/shop-store";
import { useUi } from "@/lib/ui-store";

export function CartDrawer() {
  const t = useT();
  const open = useUi((s) => s.drawer === "cart");
  const close = useUi((s) => s.close);
  const hydrated = useHydrated();
  if (!open || !hydrated) return null;
  return (
    <Overlay onClose={close} label={t("cart.title")}>
      <DrawerPanel>
        <CartDrawerBody onClose={close} />
      </DrawerPanel>
    </Overlay>
  );
}

function CartDrawerBody({ onClose }: { onClose: () => void }) {
  const t = useT();
  const count = useCartCount();
  const { subtotal, missingPrice } = useCartDetails();
  const [panel, setPanel] = useState<"note" | "discount" | null>(null);

  return (
    <>
      <div className="mx-auto mt-2.5 h-1 w-10 rounded bg-line sm:hidden" aria-hidden />
      <div className="flex items-center justify-between px-6 pb-3 pt-4 sm:pt-6">
        <div>
          <b className="text-[22px] tracking-[-0.02em]">{t("cart.title")}</b>
          <div className="text-[12.5px] text-muted">{t("cart.items", { n: count })}</div>
        </div>
        <button type="button" aria-label={t("common.close")} onClick={onClose} className="flex size-10 items-center justify-center rounded-full border border-line bg-white hover:border-ink">
          <X size={16} aria-hidden />
        </button>
      </div>
      {count === 0 ? (
        <EmptyCart onContinue={onClose} />
      ) : (
        <>
          <div className="px-6">
            <DeliveryBanner />
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            <CartLines compact />
          </div>
          <div className="flex flex-col gap-3 border-t border-line bg-white px-6 pb-7 pt-4">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["note", NotebookPen, "cart.note"],
                  ["discount", Tag, "cart.discount"],
                ] as const
              ).map(([key, Icon, label]) => (
                <button
                  key={key}
                  type="button"
                  aria-expanded={panel === key}
                  onClick={() => setPanel(panel === key ? null : key)}
                  className={clsx(
                    "flex h-10 items-center justify-center gap-2 rounded-full border text-[13px] font-bold",
                    panel === key ? "border-ink bg-ink text-white" : "border-line bg-white",
                  )}
                >
                  <Icon size={15} aria-hidden />
                  {t(label)}
                </button>
              ))}
            </div>
            {panel === "note" && <NoteBox />}
            {panel === "discount" && <DiscountBox subtotal={subtotal} />}
            <TotalRow subtotal={subtotal} missingPrice={missingPrice} />
            <BtnLink href={routes.checkout} full size="lg" onClick={onClose}>
              {t("cart.checkout")}
            </BtnLink>
            <BtnLink href={routes.cart} kind="outline" full onClick={onClose}>
              {t("cart.viewCart")}
            </BtnLink>
          </div>
        </>
      )}
    </>
  );
}
