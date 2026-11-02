"use client";

import clsx from "clsx";
import { Check, Gift, Sparkles } from "lucide-react";
import { GiftSlotMachine } from "@/components/product/GiftSlotMachine";
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
  const gifts = settings.freeGifts;
  if (gifts.length === 0) return null;
  const until = hydrated && settings.campaign ? new Date(settings.campaign.endsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : null;
  const wins = (hydrated ? won : []).map((k) => gifts.find((g) => g.key === k)).filter((g): g is FreeGift => !!g);
  const hasWon = wins.length >= 2;
  return (
    <div className="overflow-hidden rounded-tile border-2 border-dashed border-ink bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-ink px-4 py-2.5 text-white">
        <span className="flex items-center gap-2 text-sm font-extrabold">
          <Gift size={16} className="text-gold-line" aria-hidden /> {hasWon ? "Your 2 FREE gifts" : "Win 2 FREE gifts"}
        </span>
        <span className="text-xs text-on-dark-muted">{until ? `With orders placed by ${until}` : "Included with this piece"}</span>
      </div>
      {gifts.length >= 2 && <GiftSlotMachine />}
      {!hasWon && (
        <details className="group border-t border-line2">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-2 px-4 py-2.5 text-[12.5px] text-muted hover:text-ink">
            <Sparkles size={13} className="text-gold" aria-hidden />
            {gifts.length >= 2 ? "Not playing? Pick 1 free gift instead" : "Choose your free gift"}
            <span className="group-open:hidden">▾</span>
          </summary>
          <div role="radiogroup" aria-label="Free gift" className="grid grid-cols-2 gap-2 p-3 pt-0 sm:grid-cols-4">
            {gifts.map((g) => (
              <GiftCard key={g.key} g={g} selected={value === g.key} onSelect={() => onChange(g.key)} />
            ))}
          </div>
        </details>
      )}
      {quantity > 1 && (
        <p className="border-t border-line2 px-4 py-2 text-xs text-muted">
          {hasWon ? `Both gifts come with each piece — ${quantity * 2} gifts with this order.` : `You get one gift with each piece — ${quantity} gifts with this order.`}
        </p>
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
