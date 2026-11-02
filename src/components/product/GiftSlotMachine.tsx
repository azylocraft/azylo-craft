"use client";

import { useRef, useState } from "react";
import { Price, useHydrated, useShopCtx } from "@/components/shop/ShopContext";
import { Logo } from "@/components/ui/primitives";
import { drawTwo } from "@/lib/gift-draw";
import { useShop } from "@/lib/shop-store";
import type { FreeGift } from "@/lib/types";

const ITEM = 112; // px height of one reel item
const LOOPS = 9; // gift list repeated in each reel strip
const REEL_MS = [2300, 3100];

/**
 * Gift slot machine (product page): two reels of free-gift photos and a lever.
 * One pull lands two different gifts — every pull wins. Shares the won gifts with the gift clock.
 */
export function GiftSlotMachine() {
  const { settings } = useShopCtx();
  const hydrated = useHydrated();
  const gifts = settings.freeGifts;
  const won = useShop((s) => s.wonGifts);
  const setWon = useShop((s) => s.setWonGifts);
  const [pos, setPos] = useState<[number, number]>([0, 1]); // index into the strip shown in the window
  const [animate, setAnimate] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [lever, setLever] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (gifts.length < 2) return null;
  const n = gifts.length;
  const wins = (hydrated ? won : []).filter((k) => gifts.some((g) => g.key === k));
  const done = wins.length >= 2;
  // After winning, the reels rest on the two won gifts.
  const shown: [number, number] = done ? [gifts.findIndex((g) => g.key === wins[0]), gifts.findIndex((g) => g.key === wins[1])] : [pos[0] % n, pos[1] % n];

  const pull = () => {
    if (spinning || done) return;
    setLever(true);
    setTimeout(() => setLever(false), 380);
    const [a, b] = drawTwo(n);
    // Jump back to the first loop without animation, then roll forward to the last loop.
    setAnimate(false);
    setPos([pos[0] % n, pos[1] % n]);
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setAnimate(true);
        setSpinning(true);
        setPos([(LOOPS - 2) * n + a, (LOOPS - 1) * n + b]);
      }),
    );
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setSpinning(false);
      setWon([gifts[a].key, gifts[b].key]);
    }, REEL_MS[1] + 150);
  };

  const strip = Array.from({ length: LOOPS }, () => gifts).flat();
  const reel = (r: 0 | 1) => {
    const idx = done ? shown[r] : pos[r];
    return (
      <div className="relative h-[168px] flex-1 overflow-hidden rounded-[10px] bg-white shadow-[inset_0_6px_14px_rgba(0,0,0,.18),inset_0_-6px_14px_rgba(0,0,0,.18)]">
        <div
          className="absolute inset-x-0 top-0"
          style={{
            transform: `translateY(${-(idx * ITEM) + (168 - ITEM) / 2}px)`,
            transition: animate && !done ? `transform ${REEL_MS[r]}ms cubic-bezier(.2,.75,.25,1)` : "none",
          }}
        >
          {(done ? gifts : strip).map((g, i) => (
            <div key={i} className="flex items-center justify-center p-2" style={{ height: ITEM }}>
              {g.image ? <img src={g.image} alt="" className="h-full w-auto max-w-full rounded-md object-contain" /> : <span className="text-xs">{g.title}</span>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const result = done ? wins.map((k) => gifts.find((g) => g.key === k)!) : [];

  return (
    <div className="flex flex-col items-center gap-4 p-4 sm:flex-row sm:items-center sm:gap-6">
      {/* Machine */}
      <div className="relative flex-none" style={{ width: 300 }}>
        <div className="rounded-[22px] bg-[#EFE7D6] p-3 shadow-[0_18px_30px_-18px_rgba(60,45,20,.5),inset_0_-4px_0_rgba(0,0,0,.06)]">
          <div className="flex h-11 items-center justify-center rounded-[12px] bg-[#E6DCC6] shadow-[inset_0_2px_4px_rgba(0,0,0,.08)]">
            <Logo size={14} />
          </div>
          <div className="mt-3 rounded-[16px] bg-[#E6DCC6] p-2.5 shadow-[inset_0_2px_6px_rgba(0,0,0,.1)]">
            <div className="flex gap-2">
              {reel(0)}
              {reel(1)}
            </div>
          </div>
          <div className="mt-3 flex justify-between gap-1.5 px-1">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="h-3 flex-1 rounded-sm bg-[#E2D7BF] shadow-[inset_0_-2px_0_rgba(0,0,0,.08)]" />
            ))}
          </div>
          <div className="mt-3 flex flex-col items-center rounded-[12px] bg-[#E6DCC6] py-2.5 shadow-[inset_0_2px_4px_rgba(0,0,0,.08)]">
            <span className="font-serif text-[22px] italic leading-none tracking-tight text-ink">Free gifts</span>
            <span className="mt-1 text-[9px] uppercase tracking-[.3em] text-ink2">with every sofa</span>
          </div>
        </div>
        {/* Lever */}
        <button
          type="button"
          onClick={pull}
          disabled={spinning || done}
          aria-label="Pull the lever to win 2 free gifts"
          className="group absolute -right-7 top-[74px] h-[120px] w-8"
        >
          <span aria-hidden className="absolute bottom-0 left-1/2 h-7 w-4 -translate-x-1/2 rounded bg-gradient-to-b from-[#d9d9d9] to-[#9a9a9a]" />
          <span
            aria-hidden
            className="absolute bottom-6 left-1/2 w-2 origin-bottom -translate-x-1/2 rounded-full bg-gradient-to-r from-[#bdbdbd] to-[#8d8d8d] transition-[height] duration-300"
            style={{ height: lever ? 34 : 84 }}
          />
          <span
            aria-hidden
            className="absolute left-1/2 h-9 w-5 -translate-x-1/2 rounded-md bg-ink shadow transition-[top] duration-300 group-enabled:group-hover:brightness-125"
            style={{ top: lever ? 56 : 6 }}
          />
        </button>
      </div>

      {/* Copy / result */}
      <div className="flex flex-1 flex-col items-center gap-2.5 text-center sm:items-start sm:text-left">
        {done ? (
          <>
            <b className="text-[17px] font-[800] tracking-[-0.02em]">You won 2 free gifts!</b>
            {result.map((g: FreeGift) => (
              <span key={g.key} className="text-sm">
                {g.title}
                {g.value_inr ? (
                  <span className="ml-1.5 text-xs text-green">
                    worth <Price cad={g.value_inr} /> — FREE
                  </span>
                ) : null}
              </span>
            ))}
            <span className="text-xs text-muted">Both come with this sofa when you add it to your cart.</span>
          </>
        ) : (
          <>
            <b className="text-[17px] font-[800] tracking-[-0.02em]">Pull the lever, win 2 free gifts</b>
            <span className="text-[13px] text-muted">Every pull wins — the reels choose 2 of our gifts for your order.</span>
            <button
              type="button"
              onClick={pull}
              disabled={spinning}
              className="mt-1 inline-flex h-10 items-center rounded-full bg-ink px-5 text-[13px] font-semibold lowercase text-white disabled:opacity-60"
            >
              {spinning ? "spinning…" : "pull the lever"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
