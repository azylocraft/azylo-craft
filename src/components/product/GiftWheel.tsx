"use client";

import { useState } from "react";
import { Gift, PartyPopper, RotateCw } from "lucide-react";
import { Price, useHydrated, useShopCtx } from "@/components/shop/ShopContext";
import { Btn } from "@/components/ui/primitives";
import { useShop } from "@/lib/shop-store";

const SPIN_MS = 5200;
const SLICE_COLOURS = ["#F1EFE6", "#E4E2D4", "#D9D7C2", "#ECEADF"];

/**
 * Gift wheel: every slice is a free gift from Admin → Settings (more gifts = more slices).
 * Two spins win two different gifts — every spin wins. The result is saved on this device and
 * included with every eligible piece added to the cart (the server checks the gift keys).
 */
export function GiftWheel({ compact }: { compact?: boolean }) {
  const { settings } = useShopCtx();
  const hydrated = useHydrated();
  const gifts = settings.freeGifts;
  const won = useShop((s) => s.wonGifts);
  const setWon = useShop((s) => s.setWonGifts);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [latest, setLatest] = useState<string | null>(null);

  if (gifts.length < 2) return null;
  const wins = (hydrated ? won : []).filter((k) => gifts.some((g) => g.key === k));
  const done = wins.length >= 2;
  const slice = 360 / gifts.length;
  const size = compact ? 300 : 380;
  const r = size / 2;

  const spin = () => {
    if (spinning || done) return;
    const options = gifts.map((g, i) => ({ g, i })).filter(({ g }) => !wins.includes(g.key));
    const pick = options[crypto.getRandomValues(new Uint32Array(1))[0] % options.length];
    // Land the middle of the picked slice under the pointer (top), after several full turns.
    const target = 360 - (pick.i * slice + slice / 2);
    const turns = 5 + (crypto.getRandomValues(new Uint8Array(1))[0] % 3);
    const jitter = ((crypto.getRandomValues(new Uint8Array(1))[0] / 255) - 0.5) * slice * 0.5;
    const next = angle - (angle % 360) + turns * 360 + target + jitter;
    setSpinning(true);
    setAngle(next);
    setTimeout(() => {
      setSpinning(false);
      setLatest(pick.g.key);
      setWon([...wins, pick.g.key]);
    }, SPIN_MS);
  };

  const wonGifts = wins.map((k) => gifts.find((g) => g.key === k)!);
  const latestGift = latest ? gifts.find((g) => g.key === latest) : null;

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-center lg:justify-center lg:gap-14">
      {/* Wheel */}
      <div className="relative flex-none" style={{ width: size, height: size }}>
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="size-full drop-shadow-[0_24px_40px_rgba(20,19,17,.22)]"
          style={{ transform: `rotate(${angle}deg)`, transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(.12,.8,.12,1)` : "none" }}
          aria-hidden
        >
          <defs>
            {gifts.map((g, i) => (
              <clipPath key={g.key} id={`gw-clip-${i}`}>
                <circle cx={0} cy={0} r={r * 0.17} />
              </clipPath>
            ))}
          </defs>
          <circle cx={r} cy={r} r={r - 2} fill="#fff" stroke="var(--az-ink)" strokeWidth={4} />
          {gifts.map((g, i) => {
            const a0 = ((i * slice - 90) * Math.PI) / 180;
            const a1 = (((i + 1) * slice - 90) * Math.PI) / 180;
            const R = r - 8;
            const large = slice > 180 ? 1 : 0;
            const mid = ((i + 0.5) * slice - 90) * (Math.PI / 180);
            const cx = r + Math.cos(mid) * R * 0.62;
            const cy = r + Math.sin(mid) * R * 0.62;
            const isWon = wins.includes(g.key);
            return (
              <g key={g.key}>
                <path
                  d={`M${r},${r} L${r + R * Math.cos(a0)},${r + R * Math.sin(a0)} A${R},${R} 0 ${large} 1 ${r + R * Math.cos(a1)},${r + R * Math.sin(a1)} Z`}
                  fill={isWon ? "var(--az-gold-soft)" : SLICE_COLOURS[i % SLICE_COLOURS.length]}
                  stroke="#fff"
                  strokeWidth={3}
                />
                <g transform={`translate(${cx} ${cy}) rotate(${(i + 0.5) * slice})`}>
                  <circle r={r * 0.17 + 3} fill="#fff" />
                  {g.image ? (
                    <image href={g.image} x={-r * 0.17} y={-r * 0.17} width={r * 0.34} height={r * 0.34} clipPath={`url(#gw-clip-${i})`} preserveAspectRatio="xMidYMid slice" />
                  ) : (
                    <circle r={r * 0.17} fill="var(--az-cream)" />
                  )}
                </g>
              </g>
            );
          })}
          <circle cx={r} cy={r} r={r * 0.15} fill="var(--az-ink)" />
        </svg>
        {/* Pointer */}
        <span aria-hidden className="absolute left-1/2 top-[-6px] -translate-x-1/2" style={{ width: 0, height: 0, borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "26px solid var(--az-gold)" }} />
        <button
          type="button"
          onClick={spin}
          disabled={spinning || done}
          className="absolute left-1/2 top-1/2 flex size-[22%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ink text-[13px] font-semibold lowercase text-white transition-transform hover:scale-105 disabled:cursor-default disabled:hover:scale-100"
          aria-label="Spin the gift wheel"
        >
          {done ? <Gift size={22} aria-hidden /> : spinning ? "…" : "spin"}
        </button>
      </div>

      {/* Status */}
      <div className="flex max-w-[380px] flex-col items-center gap-4 text-center lg:items-start lg:text-left">
        <span className="text-[12.5px] text-muted">
          {done ? "You've won 2 free gifts" : `Spin ${wins.length + 1} of 2 · every spin wins`}
        </span>
        <h3 className="text-balance text-[26px] font-[800] leading-[1.1] tracking-[-0.03em] md:text-[32px]">
          {done ? (
            <>
              Your 2 gifts are <span className="text-gold">unlocked.</span>
            </>
          ) : latestGift ? (
            <>
              You won the <span className="text-gold">{latestGift.title.toLowerCase()}!</span> One more spin.
            </>
          ) : (
            <>
              Spin twice, win <span className="text-gold">2 free gifts.</span>
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
                      <span className="block text-xs text-green">
                        {g.value_inr ? (
                          <>
                            Worth <Price cad={g.value_inr} /> — FREE
                          </>
                        ) : (
                          "FREE"
                        )}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted">Gift {n + 1} — spin to reveal</span>
                  )}
                </span>
                {g && <PartyPopper size={18} className="text-gold" aria-hidden />}
              </div>
            );
          })}
        </div>
        {!done ? (
          <Btn onClick={spin} disabled={spinning} iconL={RotateCw}>
            {spinning ? "spinning…" : wins.length ? "spin again" : "spin the wheel"}
          </Btn>
        ) : (
          <p className="text-xs text-muted">Both gifts are added free with every sofa you order. Delivered with your sofa.</p>
        )}
      </div>
    </div>
  );
}
