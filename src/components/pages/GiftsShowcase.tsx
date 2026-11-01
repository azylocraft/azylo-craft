"use client";

import { ArrowRight, BadgeCheck, Gift, Sparkles } from "lucide-react";
import { GiftCard } from "@/components/product/Gifts";
import { Price, useShopCtx } from "@/components/shop/ShopContext";
import { Badge, BtnLink, Eyebrow, H, P, Serif } from "@/components/ui/primitives";

/** /pages/gift-cards — free gifts and bonuses with every sofa, plus gift cards (coming soon). */
export function GiftsShowcase() {
  const { settings } = useShopCtx();
  const gifts = settings.freeGifts;
  const bonuses = settings.bonusesDefault;
  const top = gifts.reduce((m, g) => Math.max(m, g.value_inr ?? 0), 0);
  return (
    <div className="px-4 pt-8 md:px-12">
      <section className="flex flex-col items-center gap-4 rounded-block bg-dark px-6 py-12 text-center text-white md:rounded-hero md:py-16">
        <span className="flex size-14 items-center justify-center rounded-full bg-gold text-white">
          <Gift size={26} aria-hidden />
        </span>
        <Eyebrow center>AZYLO · Gifts</Eyebrow>
        <H as="h1" className="text-[34px] text-white md:text-[56px]">
          A free gift <Serif gold>with every sofa.</Serif>
        </H>
        <P className="max-w-[560px] text-on-dark-muted">
          Choose one of these with each sofa you order{top ? <> — worth up to <b className="text-white"><Price cad={top} /></b></> : null}. It&apos;s delivered with your sofa, at no
          extra cost.
        </P>
        <BtnLink href="/collections/all" kind="white" icon={ArrowRight}>
          Choose your sofa
        </BtnLink>
      </section>

      {gifts.length > 0 && (
        <section className="mx-auto mt-10 grid max-w-[980px] grid-cols-2 gap-3 md:grid-cols-4">
          {gifts.map((g) => (
            <GiftCard key={g.key} g={g} />
          ))}
        </section>
      )}

      {bonuses.length > 0 && (
        <section className="mx-auto mt-10 max-w-[980px] rounded-block border border-gold-line bg-white p-6 md:p-8">
          <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.14em] text-gold">
            <Sparkles size={14} aria-hidden /> Also included with every order
          </div>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {bonuses.map((b) => (
              <li key={b.title} className="flex items-start gap-2.5 rounded-field bg-gold-soft/60 p-4 text-sm">
                <BadgeCheck size={18} className="mt-0.5 flex-none text-green" aria-hidden />
                <span>
                  {b.href ? (
                    <a href={b.href} className="font-bold underline">
                      {b.title}
                    </a>
                  ) : (
                    <b>{b.title}</b>
                  )}
                  {b.value_inr ? (
                    <span className="mt-0.5 block text-xs text-muted">
                      Worth <Price cad={b.value_inr} /> — included free
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto mt-10 flex max-w-[980px] flex-col items-start gap-3 rounded-block border border-line2 bg-white p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <div className="flex items-center gap-2">
            <b className="text-lg">AZYLO gift cards</b>
            <Badge>Coming soon</Badge>
          </div>
          <P className="text-sm">Send a gift card to someone setting up a new home. Until then, ask us — we&apos;re happy to help you plan a gift.</P>
        </div>
        <BtnLink href="/pages/contact" kind="outline">
          Contact us
        </BtnLink>
      </section>
    </div>
  );
}
