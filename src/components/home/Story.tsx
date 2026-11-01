"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Armchair,
  ArrowRight,
  BadgeIndianRupee,
  Camera,
  Check,
  DoorOpen,
  Gift,
  Hammer,
  Receipt,
  Ruler,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { useShopCtx } from "@/components/shop/ShopContext";
import { BtnLink, Eyebrow, P } from "@/components/ui/primitives";
import { collectionHref, routes } from "@/lib/routes";

/*
 * Home-page story: the outcome customers get, the obstacles of buying a sofa online,
 * how AZYLO removes each one, how ordering works, and why getting it right matters.
 * Every claim here must match what the store actually offers.
 */

const CARE_GUIDE = "/pages/sofa-care-guide";

/** Bold sentence-case section title with an olive accent ending (matches the hero). */
function Title({ children, accent, className = "" }: { children: React.ReactNode; accent?: string; className?: string }) {
  return (
    <h2 className={`text-balance text-[30px] font-[800] leading-[1.05] tracking-[-0.04em] md:text-[46px] ${className}`}>
      {children} {accent && <span className="text-gold">{accent}</span>}
    </h2>
  );
}

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`px-4 pt-16 md:px-12 md:pt-24 ${className}`}>{children}</section>;
}

/* 1. Outcome ------------------------------------------------------------ */

const OUTCOMES: [LucideIcon, string, string][] = [
  [Ruler, "It fits — the first time", "Sized for Indian homes, with clear dimensions on every product so it goes through your door and suits your room."],
  [Armchair, "Comfort that suits your day", "Recline after work, open a bed for guests or sink into a deep seat — chosen for how you live, not for a showroom."],
  [Wallet, "A price you can plan for", "The price you see is the price you pay. Free doorstep delivery, launch offers and easy EMI on eligible cards."],
];

export function Outcomes() {
  return (
    <Section>
      <div className="grid gap-5 md:grid-cols-2 md:gap-10">
        <div className="flex flex-col gap-3">
          <Eyebrow>what you get</Eyebrow>
          <Title accent="and your budget.">A sofa that fits your room, your body</Title>
        </div>
        <P className="max-w-[440px] self-end text-[16px] text-ink2">
          Not just a nice photo — a piece you&apos;ll use every day for years, and still be glad you chose.
        </P>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {OUTCOMES.map(([Icon, title, body], i) => (
          <div key={title} className="flex flex-col gap-4 rounded-card bg-cream p-7 md:p-8">
            <div className="flex items-center justify-between">
              <span className="flex size-12 items-center justify-center rounded-full bg-white">
                <Icon size={22} className="text-gold" aria-hidden />
              </span>
              <span className="text-[13px] text-faint">0{i + 1}</span>
            </div>
            <div className="mt-6 text-[22px] font-[700] leading-[1.15] tracking-[-0.03em]">{title}</div>
            <P className="text-[14.5px]">{body}</P>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* 2. Obstacles → how we remove them -------------------------------------- */

type Fix = { icon: LucideIcon; worry: string; fix: string; link?: [string, string] };

export function Obstacles() {
  const { settings } = useShopCtx();
  const fixes: Fix[] = [
    {
      icon: DoorOpen,
      worry: "“Will it even fit through my door?”",
      fix: "Every product lists its dimensions and delivery access. Compressed and modular sofas arrive in boxes that fit lifts and narrow stairs, and our free guide shows you how to measure first.",
      link: ["How to measure", CARE_GUIDE],
    },
    {
      icon: Camera,
      worry: "“It looked great online. What if it disappoints in person?”",
      fix: "See it in real rooms, not just studio shots — real-space photos and videos on product pages, plus reviews with customers’ own photos.",
    },
    {
      icon: Receipt,
      worry: "“There’ll be extra charges at checkout.”",
      fix: "No surprises. Delivery to your door is free and the price on the page is the final price.",
    },
    {
      icon: Hammer,
      worry: "“It’ll start sagging in a year.”",
      fix: "Every sofa comes with a 5-year warranty, then repairs for a small convenience fee. We explain the frame, springs and foam inside so you know what you’re buying.",
      link: ["What’s inside a sofa", routes.materials],
    },
    {
      icon: Store,
      worry: "“Showroom prices are too high.”",
      fix: "We make to order and sell directly, so you skip showroom mark-ups. Many product pages compare our price with other sellers.",
    },
    {
      icon: BadgeIndianRupee,
      worry: "“It’s a lot to pay at once.”",
      fix: settings.emiNoCost
        ? "Spread it with no-cost EMI on eligible credit cards, and save more with launch offers and buy-more-save-more pricing."
        : "Spread it with EMI on eligible credit cards, and save more with launch offers and buy-more-save-more pricing.",
    },
  ];
  return (
    <Section>
      <div className="grid gap-5 md:grid-cols-2 md:gap-10">
        <div className="flex flex-col gap-3">
          <Eyebrow>the problem</Eyebrow>
          <Title accent="a gamble.">Buying a sofa online shouldn’t feel like</Title>
        </div>
        <P className="max-w-[440px] self-end text-[16px] text-ink2">These are the worries we hear most — and exactly what we do about each one.</P>
      </div>
      <ul className="mt-10 flex flex-col gap-3">
        {fixes.map(({ icon: Icon, worry, fix, link }) => (
          <li key={worry} className="grid overflow-hidden rounded-card border border-line2 md:grid-cols-[1fr_1.35fr]">
            <div className="flex items-start gap-4 bg-bg2 p-6 md:p-7">
              <span className="flex size-10 flex-none items-center justify-center rounded-full bg-white text-muted">
                <Icon size={18} aria-hidden />
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="flex items-center gap-1.5 text-[11.5px] text-red">
                  <X size={13} aria-hidden /> the worry
                </span>
                <span className="text-[18px] font-[700] leading-[1.25] tracking-[-0.02em] md:text-[20px]">{worry}</span>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-2 bg-white p-6 md:p-7">
              <span className="flex items-center gap-1.5 text-[11.5px] text-green">
                <Check size={13} aria-hidden /> with azylo
              </span>
              <P className="text-[15px] text-ink2">{fix}</P>
              {link && (
                <Link href={link[1]} className="mt-1 inline-flex items-center gap-1.5 self-start text-[13px] font-[600] underline underline-offset-4">
                  {link[0]} <ArrowRight size={14} aria-hidden />
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* 3. How it works --------------------------------------------------------- */

export function HowItWorks() {
  const { settings } = useShopCtx();
  const steps: [LucideIcon, string, string][] = [
    [Armchair, "Choose your sofa", "Pick the model, fabric and colour online in a few minutes. Every page shows dimensions, photos and the final price."],
    [Hammer, "We make it for you", "Your sofa is made to order — built for you, not pulled from a dusty warehouse."],
    [Truck, "Free delivery to your door", "We deliver to your doorstep at no extra cost and keep you updated by email."],
    [
      ShieldCheck,
      "Enjoy it for years",
      `5-year warranty, a free care e-book${settings.freeGifts.length ? " and a free gift with every sofa" : ""}.`,
    ],
  ];
  return (
    <Section>
      <div className="flex flex-col gap-3">
        <Eyebrow>how it works</Eyebrow>
        <Title accent="no guesswork.">Four simple steps,</Title>
      </div>
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([Icon, title, body], i) => (
          <li key={title} className="relative flex flex-col gap-3 border-t-2 border-ink pt-6">
            <span className="text-[44px] font-[800] leading-none tracking-[-0.05em] text-line">0{i + 1}</span>
            <span className="flex items-center gap-2.5 text-[18px] font-[700] tracking-[-0.02em]">
              <Icon size={18} className="text-gold" aria-hidden />
              {title}
            </span>
            <P className="text-[14px]">{body}</P>
          </li>
        ))}
      </ol>
      {settings.freeGifts.length > 0 && (
        <Link
          href={routes.giftCards}
          className="az-zoom mt-8 flex items-center gap-4 rounded-card bg-gold-soft px-6 py-5 text-[15px] md:px-8"
        >
          <Gift size={22} className="flex-none text-gold" aria-hidden />
          <span className="flex-1">
            <b className="font-[700]">A free gift with every sofa</b> — choose a tea table, bean bag, ottoman or cushion set.
          </span>
          <span className="az-card-go flex size-9 flex-none items-center justify-center rounded-full bg-ink text-white">
            <ArrowRight size={16} aria-hidden />
          </span>
        </Link>
      )}
    </Section>
  );
}

/* 4. Why it matters ------------------------------------------------------- */

export function WhyItMatters() {
  return (
    <Section>
      <div className="grid gap-8 rounded-hero bg-dark px-6 py-12 text-white md:grid-cols-[1.2fr_1fr] md:items-end md:px-16 md:py-16">
        <div className="flex flex-col gap-4">
          <Eyebrow>why it matters</Eyebrow>
          <Title accent="Choose it right." className="text-white">
            You&apos;ll use it every day for years.
          </Title>
        </div>
        <div className="flex flex-col items-start gap-6">
          <P className="text-[16px] text-on-dark-muted">
            A sofa is where you rest, host, work and sometimes sleep. The wrong one costs you twice — once to buy it, and again to replace it. We help you get it
            right the first time.
          </P>
          <div className="flex flex-wrap gap-3">
            <BtnLink href={collectionHref("all")} kind="white" icon={ArrowRight}>
              Find your sofa
            </BtnLink>
            <BtnLink href={CARE_GUIDE} kind="ghostW">
              Read the free guide
            </BtnLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
