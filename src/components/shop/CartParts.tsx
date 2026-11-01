"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { CircleAlert, CircleCheck, Gift, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { Modal, Overlay } from "@/components/shop/Overlay";
import { Price, T, useShopCtx, useText } from "@/components/shop/ShopContext";
import { Btn, BtnLink, H, P } from "@/components/ui/primitives";
import { useCartDetails } from "@/lib/cart-details";
import { useT } from "@/lib/i18n";
import { useShop } from "@/lib/shop-store";
import { supabaseBrowser } from "@/lib/supabase/client";

export function Stepper({
  value,
  onChange,
  onRemove,
  small,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  /** When set, "−" at quantity 1 removes the line instead of being disabled. */
  onRemove?: () => void;
  small?: boolean;
  label: string;
}) {
  const h = small ? "h-9" : "h-12";
  const removes = value <= 1 && !!onRemove;
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full border border-line bg-white px-1.5", h)} role="group" aria-label={label}>
      <button
        type="button"
        aria-label={removes ? "Remove item" : "Decrease quantity"}
        disabled={value <= 1 && !onRemove}
        onClick={() => (removes ? onRemove!() : onChange(value - 1))}
        className="flex size-7 items-center justify-center rounded-full text-muted hover:text-ink disabled:opacity-40"
      >
        <Minus size={14} aria-hidden />
      </button>
      <span aria-live="polite" className="min-w-[18px] text-center text-sm font-bold">
        {value}
      </span>
      <button type="button" aria-label="Increase quantity" disabled={value >= 10} onClick={() => onChange(value + 1)} className="flex size-7 items-center justify-center rounded-full text-muted hover:text-ink disabled:opacity-40">
        <Plus size={14} aria-hidden />
      </button>
    </span>
  );
}

export function DeliveryBanner() {
  const t = useT();
  return (
    <div className="flex items-center gap-3.5 rounded-tile border border-gold-line bg-gold-soft px-4 py-3.5">
      <CircleCheck size={22} className="flex-none text-gold" aria-hidden />
      <div>
        <div className="text-[10.5px] font-extrabold uppercase tracking-[.14em] text-gold">{t("cart.complimentary")}</div>
        <div className="text-[15px] font-extrabold">{t("cart.deliveryOnUs")}</div>
        <div className="text-xs text-muted">{t("cart.deliveryTaxNote")}</div>
      </div>
    </div>
  );
}

function ConfirmRemove({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const t = useT();
  return (
    <Overlay onClose={onCancel} label={t("cart.removeTitle")} className="z-[70]">
      <Modal className="max-w-[460px]">
        <div className="flex flex-col items-start gap-[18px]">
          <span className="flex size-[52px] items-center justify-center rounded-full bg-red-soft text-red">
            <Trash2 size={21} aria-hidden />
          </span>
          <H className="text-[26px]">{t("cart.removeTitle")}</H>
          <P className="text-[14.5px]">{t("cart.removeBody")}</P>
          <div className="mt-1.5 flex w-full gap-2.5">
            <Btn kind="light" full onClick={onCancel} data-autofocus>
              {t("common.cancel")}
            </Btn>
            <Btn full onClick={onConfirm} className="!border-red !bg-red">
              {t("cart.remove")}
            </Btn>
          </div>
        </div>
      </Modal>
    </Overlay>
  );
}

export function CartLines({ compact }: { compact?: boolean }) {
  const t = useT();
  const text = useText();
  const { lines, status, retry } = useCartDetails();
  const setQuantity = useShop((s) => s.setQuantity);
  const removeLine = useShop((s) => s.removeLine);
  const [confirm, setConfirm] = useState<string | null>(null);

  if (status === "error")
    return (
      <div className="flex flex-col items-start gap-3 py-6">
        <P>{t("common.loadError")}</P>
        <Btn kind="outline" size="sm" onClick={retry}>
          {t("common.retry")}
        </Btn>
      </div>
    );

  return (
    <ul className="divide-y divide-line">
      {lines.map((l) => {
        const d = l.detail;
        return (
          <li key={l.variantId} className="flex gap-3.5 py-4">
            {d ? (
              <Link href={`/products/${d.productSlug}`} className="flex-none">
                <Media src={d.image} alt={text(d.name, "product name")} tone={d.tone} className={clsx("rounded-xl", compact ? "size-[70px]" : "size-[88px]")} />
              </Link>
            ) : (
              <div className={clsx("az-skeleton flex-none rounded-xl", compact ? "size-[70px]" : "size-[88px]")} />
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-start justify-between gap-2">
                <b className="line-clamp-2 text-[13.5px] leading-snug">{d ? <T text={d.name} field="product name" fallback /> : <span className="az-skeleton block h-3.5 w-40 rounded" />}</b>
                <button type="button" aria-label={t("cart.remove")} onClick={() => setConfirm(l.variantId)} className="flex size-7 flex-none items-center justify-center rounded-full border border-line text-muted hover:border-ink hover:text-ink">
                  <X size={13} aria-hidden />
                </button>
              </div>
              {d && (
                <span className="text-[11.5px] text-muted">
                  <T text={d.color} field="colour" fallback /> / <T text={d.model} field="model" fallback />
                  {l.customColor && ` · ${t("product.customColor")}`}
                  {l.gift && <GiftLine giftKey={l.gift} qty={l.quantity} />}
                </span>
              )}
              {d && (
                <span className="text-xs text-muted">
                  <Price cad={d.priceInr} withCode={false} />
                </span>
              )}
              <div className="mt-1 flex items-center justify-between">
                <Stepper small value={l.quantity} onChange={(n) => setQuantity(l.variantId, n)} onRemove={() => setConfirm(l.variantId)} label={t("cart.quantity")} />
                <b className="text-[13.5px]">{d ? <Price cad={d.priceInr == null ? null : d.priceInr * l.quantity} withCode={false} /> : null}</b>
              </div>
            </div>
          </li>
        );
      })}
      {confirm && (
        <ConfirmRemove
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            removeLine(confirm);
            setConfirm(null);
          }}
        />
      )}
    </ul>
  );
}

export function NoteBox() {
  const t = useT();
  const note = useShop((s) => s.note);
  const setNote = useShop((s) => s.setNote);
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-ink2">{t("cart.noteLabel")}</span>
      <textarea
        value={note}
        maxLength={500}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t("cart.notePh")}
        className="h-24 resize-none rounded-field border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
      />
    </label>
  );
}

export type DiscountResult = { valid: boolean; code?: string; amountInr?: number; message?: string };

export function DiscountBox({ subtotal, onResult }: { subtotal: number; onResult?: (r: DiscountResult | null) => void }) {
  const t = useT();
  const saved = useShop((s) => s.discountCode);
  const setCode = useShop((s) => s.setDiscountCode);
  const [value, setValue] = useState(saved ?? "");
  const [state, setState] = useState<{ kind: "idle" | "busy" | "ok" | "err"; msg?: string }>({ kind: "idle" });

  const apply = async () => {
    const code = value.trim();
    if (!code) return;
    setState({ kind: "busy" });
    const { data, error } = await supabaseBrowser().functions.invoke<DiscountResult>("validate-discount", { body: { code, subtotalInr: subtotal } });
    if (error || !data) {
      setState({ kind: "err", msg: t("cart.discountUnavailable") });
      return;
    }
    if (data.valid) {
      setCode(data.code ?? code);
      setState({ kind: "ok", msg: t("cart.discountApplied", { code: (data.code ?? code).toUpperCase() }) });
    } else {
      setCode(null);
      setState({ kind: "err", msg: data.message ?? t("cart.discountInvalid") });
    }
    onResult?.(data);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-ink2">{t("cart.discountLabel")}</span>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          placeholder={t("cart.discountPh")}
          aria-invalid={state.kind === "err"}
          className={clsx(
            "h-12 min-w-0 flex-1 rounded-field border bg-white px-4 text-sm uppercase outline-none focus:border-ink",
            state.kind === "err" ? "border-red bg-[#FFFBFA]" : "border-line",
          )}
        />
        <Btn kind="dark" onClick={apply} disabled={state.kind === "busy"} className="!h-12">
          {state.kind === "busy" ? "…" : t("cart.apply")}
        </Btn>
      </div>
      {state.msg && (
        <span role="status" className={clsx("flex items-center gap-1.5 text-xs", state.kind === "err" ? "text-red" : "text-green")}>
          {state.kind === "err" ? <CircleAlert size={13} aria-hidden /> : <Tag size={13} aria-hidden />}
          {state.msg}
        </span>
      )}
    </div>
  );
}

export function EmptyCart({ onContinue }: { onContinue?: () => void }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
      <span className="flex size-[68px] items-center justify-center rounded-full bg-gold-soft text-gold">
        <ShoppingBag size={26} aria-hidden />
      </span>
      <H className="text-[26px]">{t("cart.emptyTitle")}</H>
      <P>{t("cart.emptySub")}</P>
      <BtnLink href="/collections/all" onClick={onContinue}>
        {t("cart.continue")}
      </BtnLink>
    </div>
  );
}

export function TotalRow({ subtotal, missingPrice }: { subtotal: number; missingPrice: boolean }) {
  const t = useT();
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-extrabold tracking-[.12em]">{t("cart.estimatedTotal")}</span>
        <b className="text-lg">{missingPrice ? <Price cad={null} /> : <Price cad={subtotal} />}</b>
      </div>
      <span className="text-[11.5px] leading-snug text-muted">{t("cart.taxNote")}</span>
    </div>
  );
}


/** "+ FREE: Bouclé ottoman" under a cart line that carries a free gift. */
function GiftLine({ giftKey, qty }: { giftKey: string; qty: number }) {
  const { settings } = useShopCtx();
  const g = settings.freeGifts.find((x) => x.key === giftKey);
  if (!g) return null;
  return (
    <span className="mt-1 flex items-center gap-1.5 text-[11.5px] font-bold text-green">
      <Gift size={12} aria-hidden /> + FREE: {g.title}
      {qty > 1 ? ` ×${qty}` : ""}
    </span>
  );
}
