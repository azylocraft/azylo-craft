"use client";

import { ArrowRight, BadgeCheck, Gift, Sparkles } from "lucide-react";
import { GiftCard } from "@/components/product/Gifts";
import { GiftWheel } from "@/components/product/GiftWheel";
import { Price, useShopCtx } from "@/components/shop/ShopContext";
import { Badge, BtnLink, Eyebrow, P } from "@/components/ui/primitives";

/** /pages/gift-cards — the gift clock game, the free gifts, bonuses included with every order, and gift cards. */
export function GiftsShowcase() {
  const { settings } = useShopCtx();
  const gifts = settings.freeGifts;
  const bonuses = settings.bonusesDefault;
  const total = gifts.reduce((s, g) => s + (g.value_inr ?? 0), 0);
  const top2 = gifts
    .map((g) => g.value_inr ?? 0)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((a, b) => a + b, 0);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-6 pt-6 md:px-12 md:pt-10">
      {/* Title row */}
      <header className="grid items-end gap-4 md:grid-cols-[1.3fr_1fr] md:gap-10">
        <div className="flex flex-col gap-3">
          <Eyebrow>azylo · gifts</Eyebrow>
          <h1 className="text-balance text-[38px] font-[800] leading-[1.02] tracking-[-0.045em] md:text-[64px]">
            Play once, take home <span className="text-gold">2 free gifts.</span>
          </h1>
        </div>
        <P className="max-w-[420px] text-[15px] md:pb-2">
          Spin the clock and win 2 of our gifts
          {top2 ? (
            <>
              {" "}— worth up to <b className="text-ink"><Price cad={top2} /></b> —
            </>
          ) : null}{" "}
          with every sofa you order. Every spin wins, and both arrive with your sofa at no extra cost.
        </P>
      </header>

      {/* Game */}
      {gifts.length >= 2 && (
        <section id="gift-wheel" className="mt-8 scroll-mt-40 rounded-hero border border-line2 bg-gradient-to-b from-bg2 to-white px-5 py-8 md:mt-10 md:px-12 md:py-12">
          <GiftWheel />
        </section>
      )}

      {/* The gifts */}
      {gifts.length > 0 && (
        <section className="mt-12 md:mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <Eyebrow>the gifts</Eyebrow>
              <h2 className="mt-1 text-[26px] font-[800] tracking-[-0.03em] md:text-[34px]">What you can win</h2>
            </div>
            {total > 0 && (
              <span className="text-sm text-muted">
                {gifts.length} gifts · worth <Price cad={total} /> together
              </span>
            )}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gifts.map((g) => (
              <GiftCard key={g.key} g={g} />
            ))}
          </div>
        </section>
      )}

      {/* Bonuses */}
      {bonuses.length > 0 && (
        <section className="mt-12 grid gap-6 rounded-hero bg-cream p-6 md:mt-16 md:grid-cols-[0.9fr_2fr] md:items-center md:p-10">
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2 text-[12.5px] text-gold">
              <Sparkles size={14} aria-hidden /> also included
            </span>
            <h2 className="text-[24px] font-[800] leading-[1.1] tracking-[-0.03em] md:text-[30px]">With every order, on top of your gifts</h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {bonuses.map((b) => (
              <li key={b.title} className="flex flex-col gap-2 rounded-card bg-white p-5 text-sm">
                <BadgeCheck size={20} className="text-gold" aria-hidden />
                {b.href ? (
                  <a href={b.href} className="font-semibold underline underline-offset-4">
                    {b.title}
                  </a>
                ) : (
                  <b className="font-semibold">{b.title}</b>
                )}
                {b.value_inr ? (
                  <span className="mt-auto text-xs text-muted">
                    Worth <Price cad={b.value_inr} /> — included
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Gift cards */}
      <section className="mt-6 flex flex-col items-start gap-4 rounded-hero border border-line2 bg-white p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-center gap-4">
          <span className="flex size-12 flex-none items-center justify-center rounded-full bg-gold-soft text-gold">
            <Gift size={22} aria-hidden />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <b className="text-lg font-semibold">AZYLO gift cards</b>
              <Badge>Coming soon</Badge>
            </div>
            <P className="text-sm">Send a gift card to someone setting up a new home. Until then, write to us and we&apos;ll help you plan a gift.</P>
          </div>
        </div>
        <BtnLink href="/pages/contact" kind="outline" icon={ArrowRight}>
          Contact us
        </BtnLink>
      </section>
    </div>
  );
}
