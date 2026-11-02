"use client";

import clsx from "clsx";
import { useState } from "react";
import { Check, Gift, Sparkles, X } from "lucide-react";
import { GiftWheel } from "@/components/product/GiftWheel";
import { Modal, Overlay } from "@/components/shop/Overlay";
import { useShop } from "@/lib/shop-store";
import { Price, useHydrated, useShopCtx } from "@/components/shop/ShopContext";
import type { FreeGift } from "@/lib/types";

/** "Choose your FREE gift": one gift per piece, added to the order as a ₹0 item. */
/**
 * Product page gift box. After the gift wheel has been spun twice, the 2 won gifts are included
 * with this piece. Before that, one gift can be chosen — and the wheel can be opened to win 2.
 */
export function FreeGiftPicker({ value, onChange, quantity }: { value: string | null; onChange: (key: string) => void; quantity: number }) {
  const { settings } = useShopCtx();
  const hydrated = useHydrated();
  const won = useShop((s) => s.wonGifts);
  const [wheel, setWheel] = useState(false);
  const gifts = settings.freeGifts;
  if (gifts.length === 0) return null;
  const until = hydrated && settings.campaign ? new Date(settings.campaign.endsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;
  const wins = (hydrated ? won : []).map((k) => gifts.find((g) => g.key === k)).filter((g): g is FreeGift => !!g);
  const hasWon = wins.length >= 2;
  return (
    <div className="overflow-hidden rounded-tile border-2 border-dashed border-ink bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-ink px-4 py-2.5 text-white">
        <span className="flex items-center gap-2 text-sm font-extrabold">
          <Gift size={16} className="text-gold-line" aria-hidden /> {hasWon ? "Your 2 FREE gifts" : "Choose your FREE gift"}
        </span>
        <span className="text-xs text-on-dark-muted">{until ? `With orders placed by ${until}` : "Included with this piece"}</span>
      </div>
      {hasWon ? (
        <div className="grid grid-cols-2 gap-2 p-3">
          {wins.map((g) => (
            <GiftCard key={g.key} g={g} selected />
          ))}
        </div>
      ) : (
        <>
          <div role="radiogroup" aria-label="Free gift" className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
            {gifts.map((g) => (
              <GiftCard key={g.key} g={g} selected={value === g.key} onSelect={() => onChange(g.key)} />
            ))}
          </div>
          {gifts.length >= 2 && (
            <button
              type="button"
              onClick={() => setWheel(true)}
              className="flex w-full items-center justify-center gap-2 border-t border-line2 bg-gold-soft px-4 py-3 text-sm font-semibold text-ink hover:bg-gold-soft/70"
            >
              <Sparkles size={15} className="text-gold" aria-hidden /> Spin the gift wheel to get 2 free gifts instead of 1
            </button>
          )}
        </>
      )}
      {quantity > 1 && (
        <p className="border-t border-line2 px-4 py-2 text-xs text-muted">
          {hasWon ? `Both gifts come with each piece — ${quantity * 2} gifts with this order.` : `You get one gift with each piece — ${quantity} gifts with this order.`}
        </p>
      )}
      {wheel && (
        <Overlay onClose={() => setWheel(false)} label="Gift wheel">
          <Modal className="max-w-[880px]">
            <div className="flex justify-end">
              <button type="button" aria-label="Close" onClick={() => setWheel(false)} className="-mr-2 -mt-2 flex size-9 items-center justify-center rounded-full border border-line">
                <X size={15} aria-hidden />
              </button>
            </div>
            <GiftWheel compact />
          </Modal>
        </Overlay>
      )}
    </div>
  );
}

export function GiftCard({ g, selected, onSelect }: { g: FreeGift; selected?: boolean; onSelect?: () => void }) {
  const content = (
    <>
      <div className="flex items-baseline justify-center gap-1.5 pt-2">
        {g.value_inr ? (
          <s className="text-xs text-faint decoration-red/60">
            <Price cad={g.value_inr} />
          </s>
        ) : null}
        <b className="text-[15px] font-extrabold text-green">FREE</b>
      </div>
      <div className="relative mx-2 mt-1.5 aspect-square overflow-hidden rounded-lg bg-cream">
        {g.image && <img src={g.image} alt={g.title} loading="lazy" className="size-full object-cover" />}
        {selected && (
          <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-green text-white">
            <Check size={14} aria-hidden />
          </span>
        )}
      </div>
      <div className="px-2 pb-2.5 pt-1.5 text-center text-[11.5px] font-bold uppercase leading-tight tracking-wide">
        {g.title}
        <span className="block text-[10px] font-semibold normal-case tracking-normal text-green underline">Included</span>
      </div>
    </>
  );
  if (!onSelect) return <div className="rounded-field border-2 border-line bg-white">{content}</div>;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={clsx("rounded-field border-2 bg-white text-left transition-colors", selected ? "border-green bg-green-soft/40" : "border-line hover:border-ink")}
    >
      {content}
    </button>
  );
}
