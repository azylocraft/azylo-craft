"use client";

import { useState } from "react";
import { Check, PartyPopper, RotateCw } from "lucide-react";
import { Price, useHydrated, useShopCtx } from "@/components/shop/ShopContext";
import { Btn } from "@/components/ui/primitives";
import { drawIndex } from "@/lib/gift-draw";
import { useShop } from "@/lib/shop-store";

const SPIN_MS = 4200;

/**
 * Gift clock (Gifts page): the free gifts sit around a clock face. Spin 1 sends the long hand
 * round to gift 1, spin 2 the short hand to gift 2 — two different gifts, every spin wins.
 * The result is saved on this device (shared with the product page slot machine).
 */
export function GiftWheel() {
  const { settings } = useShopCtx();
  const hydrated = useHydrated();
  const gifts = settings.freeGifts;
  const won = useShop((s) => s.wonGifts);
  const setWon = useShop((s) => s.setWonGifts);
  const [hands, setHands] = useState({ long: 0, short: 90 });
  const [spinning, setSpinning] = useState(false);

  if (gifts.length < 2) return null;
  const wins = (hydrated ? won : []).filter((k) => gifts.some((g) => g.key === k));
  const done = wins.length >= 2;
  const step = 360 / gifts.length;
  const angleOf = (i: number) => i * step; // 0° = 12 o'clock

  const spin = () => {
    if (spinning || done) return;
    const pool = gifts.map((_, i) => i).filter((i) => !wins.includes(gifts[i].key));
    const pick = drawIndex(pool);
    const hand = wins.length === 0 ? "long" : "short";
    const current = hands[hand];
    const turns = hand === "long" ? 4 : 2;
    const target = current - (current % 360) + turns * 360 + angleOf(pick);
    setSpinning(true);
    setHands((h) => ({ ...h, [hand]: target }));
    setTimeout(() => {
      setSpinning(false);
      setWon([...wins, gifts[pick].key]);
    }, SPIN_MS);
  };

  const wonGifts = wins.map((k) => gifts.find((g) => g.key === k)!);
  // Hands rest on the won gifts (also when they were won on another page).
  const rest = (current: number, key?: string) => {
    const i = key ? gifts.findIndex((g) => g.key === key) : -1;
    return i < 0 || spinning ? current : current - (((current % 360) + 360) % 360) + angleOf(i);
  };
  const shownHands = { long: rest(hands.long, wins[0]), short: rest(hands.short, wins[1]) };
  const ring = 41; // % radius of the gift ring

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center lg:gap-16">
      {/* Clock */}
      <div className="relative aspect-square w-full max-w-[440px] flex-none">
        <div aria-hidden className="absolute inset-[16%] rounded-full bg-gradient-to-b from-white to-bg2 shadow-[inset_0_2px_12px_rgba(0,0,0,.06)]" />
        {gifts.map((g, i) => {
          const a = ((angleOf(i) - 90) * Math.PI) / 180;
          const isWon = wins.includes(g.key);
          return (
            <div
              key={g.key}
              className="absolute flex w-[22%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `${50 + Math.cos(a) * ring}%`, top: `${50 + Math.sin(a) * ring}%` }}
            >
              <span className={`relative block aspect-square w-full overflow-hidden rounded-full bg-white transition-all duration-500 ${isWon ? "scale-110 ring-[3px] ring-gold" : "ring-1 ring-line"}`}>
                {g.image && <img src={g.image} alt={g.title} className="size-full object-cover" />}
                {isWon && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                    <span className="flex size-7 items-center justify-center rounded-full bg-gold text-white">
                      <Check size={15} aria-hidden />
                    </span>
                  </span>
                )}
              </span>
              <span className="hidden text-center text-[11px] leading-tight text-muted sm:block">{g.title.toLowerCase()}</span>
            </div>
          );
        })}
        {/* Hands */}
        {(["long", "short"] as const).map((h) => (
          <span
            key={h}
            aria-hidden
            className="absolute bottom-1/2 left-1/2 origin-bottom rounded-full bg-ink"
            style={{
              width: h === "long" ? 4 : 6,
              height: h === "long" ? "27%" : "18%",
              marginLeft: h === "long" ? -2 : -3,
              transform: `rotate(${shownHands[h]}deg)`,
              transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(.15,.75,.15,1)` : "none",
            }}
          />
        ))}
        <button
          type="button"
          onClick={spin}
          disabled={spinning || done}
          aria-label="Spin the gift clock"
          className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-[12px] font-semibold lowercase text-white shadow-soft transition-transform hover:scale-105 disabled:hover:scale-100"
        >
          {done ? <PartyPopper size={20} aria-hidden /> : spinning ? "…" : "spin"}
        </button>
      </div>

      {/* Status */}
      <div className="flex max-w-[380px] flex-col items-center gap-4 text-center lg:items-start lg:text-left">
        <span className="text-[12.5px] text-muted">{done ? "You've won 2 free gifts" : `Spin ${wins.length + 1} of 2 · every spin wins`}</span>
        <h3 className="text-balance text-[26px] font-[800] leading-[1.1] tracking-[-0.03em] md:text-[32px]">
          {done ? (
            <>
              Your 2 gifts are <span className="text-gold">unlocked.</span>
            </>
          ) : wins.length ? (
            <>
              You won the <span className="text-gold">{wonGifts[0].title.toLowerCase()}!</span> Spin once more.
            </>
          ) : (
            <>
              Spin the clock, win <span className="text-gold">2 free gifts.</span>
            </>
          )}
        </h3>
        <div className="flex w-full flex-col gap-2">
          {[0, 1].map((n) => {
            const g = wonGifts[n];
            return (
              <div key={n} className="flex items-center gap-3 rounded-tile border border-line bg-white p-2.5">
                <span className="size-12 flex-none overflow-hidden rounded-lg bg-cream">{g?.image && <img src={g.image} alt="" className="size-full object-cover" />}</span>
                <span className="flex-1 text-left text-sm">
                  {g ? (
                    <>
                      <b className="font-semibold">{g.title}</b>
                      <span className="block text-xs text-green">{g.value_inr ? <>Worth <Price cad={g.value_inr} /> — FREE</> : "FREE"}</span>
                    </>
                  ) : (
                    <span className="text-muted">Gift {n + 1} — spin to reveal</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        {!done ? (
          <Btn onClick={spin} disabled={spinning} iconL={RotateCw}>
            {spinning ? "spinning…" : wins.length ? "spin again" : "spin the clock"}
          </Btn>
        ) : (
          <p className="text-xs text-muted">Both gifts are added free with every sofa you order and delivered with it.</p>
        )}
      </div>
    </div>
  );
}
