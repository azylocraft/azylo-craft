"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import { Price } from "@/components/shop/ShopContext";
import { MATERIAL_INFO, materialLabel } from "@/lib/material-info";

/** Rating bar out of 5. */
function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3 text-[13px] text-muted">
      <span className="w-[72px] flex-none">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line2">
        <span className="block h-full rounded-full bg-gold transition-[width] duration-500" style={{ width: `${(value / 5) * 100}%` }} />
      </span>
    </div>
  );
}

/**
 * Material cards (texture, badge, name, tagline, price difference from the cheapest material)
 * plus a "Why <material>?" panel. Fabric textures are tinted with the selected colour.
 */
export function MaterialPicker({
  materials,
  selected,
  onSelect,
  priceOf,
  tint,
}: {
  materials: string[];
  selected: string;
  onSelect: (m: string) => void;
  priceOf: (m: string) => number | null;
  tint: string | null;
}) {
  const prices = materials.map(priceOf).filter((p): p is number => p != null);
  const base = prices.length ? Math.min(...prices) : null;
  const info = MATERIAL_INFO[selected];

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3 text-[15px] text-muted">
        Material: <b className="font-semibold text-ink">{materialLabel(selected)}</b>
      </legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {materials.map((m) => {
          const mi = MATERIAL_INFO[m];
          const price = priceOf(m);
          const on = m === selected;
          return (
            <button
              key={m}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(m)}
              className={clsx(
                "group flex flex-col gap-3 rounded-card border p-2.5 text-left transition-[border-color,box-shadow,background-color] duration-200",
                on ? "border-gold bg-gold-soft/60 shadow-[0_0_0_3px_var(--az-gold-soft)]" : "border-line bg-white hover:border-ink",
              )}
            >
              <span className="relative block aspect-[5/2] overflow-hidden rounded-[14px]" style={{ background: tint ? `color-mix(in srgb, ${tint} 62%, #fff)` : "#e4e1da" }}>
                <img
                  src={mi.texture}
                  alt=""
                  loading="lazy"
                  className="size-full object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[11.5px] font-medium text-ink backdrop-blur">{mi.badge}</span>
                {on && (
                  <span className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-gold text-white">
                    <Check size={15} aria-hidden />
                  </span>
                )}
              </span>
              <span className="flex items-start justify-between gap-2 px-1.5 pb-1">
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold leading-tight">{materialLabel(m)}</span>
                  <span className="mt-1 block text-[12.5px] text-muted">{mi.tagline}</span>
                </span>
                <span className={clsx("flex-none text-[13px]", price === base ? "font-semibold text-gold" : "text-muted")}>
                  {price == null || base == null ? "" : price === base ? "Included" : <>+<Price cad={price - base} withCode={false} /></>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
      {info && (
        <div className="mt-1 grid gap-4 rounded-card border border-line2 bg-bg2 p-5 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <b className="text-[16px] font-semibold">Why {materialLabel(selected).toLowerCase()}?</b>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{info.why}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Bar label="Durability" value={info.durability} />
            <Bar label="Softness" value={info.softness} />
            <Bar label="Easy care" value={info.care} />
          </div>
        </div>
      )}
    </fieldset>
  );
}
