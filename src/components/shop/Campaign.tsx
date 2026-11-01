"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Gift, X } from "lucide-react";
import { Modal, Overlay } from "@/components/shop/Overlay";
import { useHydrated, useShopCtx } from "@/components/shop/ShopContext";
import { Btn, H, P } from "@/components/ui/primitives";
import { useShop } from "@/lib/shop-store";
import { supabaseBrowser } from "@/lib/supabase/client";

function remaining(endsAt: string) {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s };
}

/**
 * Site-wide offer bar with a countdown to the campaign's real end date (set in Admin → Settings).
 * The timer never restarts; the bar disappears when the offer ends. The code is applied at checkout.
 */
export function CampaignBar() {
  const { settings } = useShopCtx();
  const hydrated = useHydrated();
  const setCode = useShop((s) => s.setDiscountCode);
  const current = useShop((s) => s.discountCode);
  const [left, setLeft] = useState<ReturnType<typeof remaining>>(null);
  const campaign = settings.campaign;

  useEffect(() => {
    if (!campaign) return;
    const tick = () => setLeft(remaining(campaign.endsAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [campaign]);

  // Pre-apply the campaign code so shoppers don't have to remember it.
  useEffect(() => {
    if (hydrated && campaign && left && !current) setCode(campaign.code);
  }, [hydrated, campaign, left, current, setCode]);

  if (!campaign || !hydrated || !left) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div className="bg-ink px-4 py-2 text-center text-[12.5px] text-white md:text-[13px]">
      <span className="font-bold text-gold-line">{campaign.title}</span>
      <span className="mx-2 hidden text-on-dark-faint sm:inline">·</span>
      <span className="block sm:inline">
        Code <b className="rounded bg-white/10 px-1.5 py-0.5 tracking-wide">{campaign.code}</b> applied at checkout · ends in{" "}
        <b className="tabular-nums">
          {left.d > 0 ? `${left.d}d ` : ""}
          {pad(left.h)}:{pad(left.m)}:{pad(left.s)}
        </b>
      </span>
    </div>
  );
}

const SEEN_KEY = "azylo-email-popup-seen";

/** One-time email capture (after 25 s or when the mouse leaves the page). Reveals the welcome code. */
export function EmailPopup() {
  const { settings } = useShopCtx();
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [copied, setCopied] = useState(false);
  const cfg = settings.emailPopup;

  useEffect(() => {
    if (!hydrated || !cfg.enabled || !cfg.code) return;
    try {
      if (localStorage.getItem(SEEN_KEY)) return;
    } catch {
      return;
    }
    const show = () => {
      setOpen(true);
      try {
        localStorage.setItem(SEEN_KEY, "1");
      } catch {}
      cleanup();
    };
    const onLeave = (e: MouseEvent) => e.clientY <= 0 && show();
    const timer = setTimeout(show, 25000);
    document.addEventListener("mouseout", onLeave);
    const cleanup = () => {
      clearTimeout(timer);
      document.removeEventListener("mouseout", onLeave);
    };
    return cleanup;
  }, [hydrated, cfg.enabled, cfg.code]);

  if (!open || !cfg.code) return null;
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setState("error");
    setState("busy");
    const { error } = await supabaseBrowser().functions.invoke("newsletter", { body: { email, source: "popup" } });
    setState(error ? "error" : "done");
  };
  return (
    <Overlay onClose={() => setOpen(false)} label="Welcome offer">
      <Modal className="max-w-[460px] text-center">
        <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="absolute right-5 top-5 hidden" />
        <div className="flex justify-end">
          <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="-mr-2 -mt-2 flex size-9 items-center justify-center rounded-full border border-line">
            <X size={15} aria-hidden />
          </button>
        </div>
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-gold-soft text-gold">
          <Gift size={24} aria-hidden />
        </span>
        <H className="mt-4 text-[28px]">{state === "done" ? "Your gift is unlocked" : "A welcome gift for you"}</H>
        {settings.freeGifts.length > 0 && (
          <div className="mt-4 grid grid-cols-4 gap-2">
            {settings.freeGifts.slice(0, 4).map((g) => (
              <div key={g.key} className="flex flex-col items-center gap-1">
                <span className="aspect-square w-full overflow-hidden rounded-lg bg-cream">
                  {g.image && <img src={g.image} alt={g.title} className="size-full object-cover" />}
                </span>
                <span className="text-[10px] font-bold leading-tight">{g.title}</span>
                <b className="text-[10px] text-green">FREE</b>
              </div>
            ))}
          </div>
        )}
        {state === "done" ? (
          <>
            <P className="mt-3">Pick your free gift on any sofa page. Plus, use this code at checkout:</P>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(cfg.code!);
                } catch {}
                useShop.getState().setDiscountCode(cfg.code!);
                setCopied(true);
              }}
              className="mx-auto mt-3 flex items-center gap-2 rounded-full border-2 border-dashed border-gold px-5 py-2.5 text-lg font-extrabold tracking-widest"
            >
              {cfg.code} {copied ? <Check size={16} className="text-green" aria-hidden /> : <Copy size={16} aria-hidden />}
            </button>
            <p className="mt-2 text-xs text-muted">{copied ? "Copied and saved to your cart." : "Tap to copy — we've also saved it to your cart."}</p>
            <Btn full className="mt-5" onClick={() => setOpen(false)}>Start shopping</Btn>
          </>
        ) : (
          <form onSubmit={submit} className="mt-2 flex flex-col gap-3">
            <P>
              Get one of these <b className="text-ink">free</b> with your first sofa — tea table, bean bag, ottoman or cushion set — plus a welcome discount code. Just
              join the AZYLO list.
            </P>
            <input type="email" required className="field text-center" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
            {state === "error" && <p className="text-sm text-red">Enter a valid email address.</p>}
            <Btn type="submit" full disabled={state === "busy"}>{state === "busy" ? "…" : "Get my code"}</Btn>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-muted underline">No thanks</button>
          </form>
        )}
      </Modal>
    </Overlay>
  );
}
