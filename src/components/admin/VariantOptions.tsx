"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { Panel } from "@/components/admin/AdminShell";
import { Btn } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

type IndexRow = { name: string; index: number };
export type OptionVariant = {
  id?: string;
  model_en: string;
  color_en: string;
  color_hex: string;
  material: string;
  price_inr: string;
  compare_at_inr: string;
  stock: string;
  sku: string;
  is_active: boolean;
  _delete?: boolean;
};
type Colour = { name: string; hex: string };

/** Colours offered in the "Add colour" dropdown. */
const PRESET_COLOURS: Colour[] = [
  { name: "Grey", hex: "#A3A3A1" },
  { name: "Olive Green", hex: "#5E6B3A" },
  { name: "Beige", hex: "#D8CBB0" },
  { name: "Wheat", hex: "#D6B266" },
  { name: "White", hex: "#ECEAE4" },
  { name: "Orange", hex: "#C4652F" },
  { name: "Cream", hex: "#EFE6D2" },
  { name: "Charcoal", hex: "#3E3D3B" },
  { name: "Black", hex: "#1C1B1A" },
  { name: "Brown", hex: "#6B4A33" },
  { name: "Navy", hex: "#2F3B55" },
  { name: "Terracotta", hex: "#B5583A" },
];

const round10 = (n: number) => Math.round(n / 10) * 10;
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const code = (t: string) => t.replace(/\(.*?\)/g, "").trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase();

/**
 * Variants & pricing, the simple way: choose the materials and colours this product comes in and
 * type ONE price — every other material's price follows the store-wide material price index.
 * Every material × colour combination is created, updated or removed automatically on "Save product".
 */
export function VariantOptions({
  productSlug,
  variants,
  setVariants,
  onSave,
  saving,
}: {
  productSlug: string;
  variants: OptionVariant[];
  setVariants: (v: OptionVariant[]) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const sb = supabaseBrowser();
  const [index, setIndex] = useState<IndexRow[] | null>(null);
  const [savedIndex, setSavedIndex] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  // What is being typed in the price box (kept as typed; other materials are rounded to ₹10).
  const [typed, setTyped] = useState<string | null>(null);

  useEffect(() => {
    sb.from("store_settings")
      .select("material_price_index")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        const rows = (data?.material_price_index ?? []) as IndexRow[];
        setIndex(rows);
        setSavedIndex(JSON.stringify(rows));
      });
  }, [sb]);

  const live = variants.filter((v) => !v._delete);
  const indexOf = (name: string) => index?.find((m) => m.name === name)?.index ?? 0;

  // Current options, read from the variants.
  const materials = useMemo(() => (index ?? []).map((m) => m.name).filter((n) => live.some((v) => v.model_en.trim() === n)), [index, live]);
  const colours = useMemo(() => {
    const seen = new Map<string, Colour>();
    for (const v of live) if (v.color_en.trim() && !seen.has(v.color_en.trim())) seen.set(v.color_en.trim(), { name: v.color_en.trim(), hex: v.color_hex || "#cccccc" });
    return [...seen.values()];
  }, [live]);
  const priced = live.find((v) => materials.includes(v.model_en.trim()) && v.price_inr !== "" && indexOf(v.model_en.trim()));
  const base = priced ? (Number(priced.price_inr) / indexOf(priced.model_en.trim())) * 100 : null; // price of a 100% material
  const [basis, setBasis] = useState<string>("");
  const basisMaterial = materials.includes(basis) ? basis : (priced?.model_en.trim() ?? materials[0] ?? "");
  const priceOf = (name: string) => {
    if (base == null) return null;
    const own = live.find((v) => v.model_en.trim() === name && v.price_inr !== "");
    return own ? Number(own.price_inr) : round10((base * indexOf(name)) / 100);
  };

  if (!index) return null;
  const custom = live.filter((v) => !index.some((m) => m.name === v.model_en.trim()));
  if (custom.length) {
    return (
      <Panel title="Variants & pricing" className="mt-5">
        <p className="text-sm text-muted">
          This product uses its own option names ({[...new Set(custom.map((v) => v.model_en || "unnamed"))].join(", ")}), so its variants are edited one by one in{" "}
          <b>Advanced</b> below. Products whose options are your materials ({index.map((m) => m.name).join(", ")}) get the simple colour/material dropdowns and one-price pricing.
        </p>
      </Panel>
    );
  }

  /** Rebuild the variant list for the chosen materials × colours at the given base price. */
  const rebuild = (mats: string[], cols: Colour[], newBase: number | null, typedExact: number | null = null, idx: IndexRow[] = index) => {
    const pct = (name: string) => idx.find((m) => m.name === name)?.index ?? 0;
    const ordered = idx.map((m) => m.name).filter((n) => mats.includes(n));
    const next: OptionVariant[] = [];
    const used = new Set<OptionVariant>();
    for (const m of ordered)
      for (const c of cols) {
        const old = live.find((v) => v.model_en.trim() === m && v.color_en.trim() === c.name);
        // The material whose price was typed keeps it exactly; the others are rounded to ₹10.
        const exact = m === basisMaterial && typedExact != null ? typedExact : null;
        const price = newBase == null ? "" : String(exact ?? round10((newBase * pct(m)) / 100));
        if (old) used.add(old);
        next.push(
          old
            ? { ...old, color_hex: c.hex, price_inr: price, is_active: true }
            : {
                model_en: m,
                color_en: c.name,
                color_hex: c.hex,
                material: /leather/i.test(m) ? "leather" : "fabric",
                price_inr: price,
                compare_at_inr: "",
                stock: "",
                sku: `${productSlug.split("-").map((w) => w[0] ?? "").join("").toUpperCase() || "AZ"}-${code(m)}-${c.name.toUpperCase().replace(/[^A-Z0-9]/g, "")}`,
                is_active: true,
              },
        );
      }
    // Combinations no longer offered are removed on save.
    const removed = variants.filter((v) => v.id && (v._delete || !used.has(v))).map((v) => ({ ...v, _delete: true }));
    setVariants([...next, ...removed]);
    setMsg("Changed — click “Save product” to apply.");
  };

  const toggleMaterial = (name: string) => rebuild(materials.includes(name) ? materials.filter((m) => m !== name) : [...materials, name], colours, base);
  const addColour = (c: Colour) => !colours.some((x) => x.name.toLowerCase() === c.name.toLowerCase()) && rebuild(materials, [...colours, c], base);
  const removeColour = (name: string) => rebuild(materials, colours.filter((c) => c.name !== name), base);
  const typePrice = (value: string) => {
    const digits = value.replace(/\D/g, "");
    setTyped(digits);
    const n = Number(digits);
    const idx = indexOf(basisMaterial);
    rebuild(materials, colours, n && idx ? (n / idx) * 100 : null, n || null);
  };

  /** Edit a material's percentage: the typed (basis) material keeps its price, the others follow the new index. */
  const changeIndex = (name: string, value: string) => {
    const next = index.map((x) => (x.name === name ? { ...x, index: Number(value.replace(/\D/g, "")) || 0 } : x));
    setIndex(next);
    const basisPrice = priceOf(basisMaterial);
    const basisPct = next.find((m) => m.name === basisMaterial)?.index ?? 0;
    if (basisPrice != null && basisPct) rebuild(materials, colours, (basisPrice / basisPct) * 100, basisPrice, next);
    else setMsg("Changed — click “Save product” to apply.");
  };

  const indexChanged = JSON.stringify(index) !== savedIndex;
  /** Save product; a changed price index is saved first (it is shared by every product). */
  const saveAll = async () => {
    if (indexChanged) {
      const { error } = await sb.from("store_settings").update({ material_price_index: index }).eq("id", 1);
      if (error) return setMsg(error.message);
      setSavedIndex(JSON.stringify(index));
    }
    setMsg(null);
    onSave();
  };

  return (
    <Panel title="Variants & pricing" className="mt-5">
      {/* 1. One price */}
      <div className="rounded-tile border border-line2 bg-bg2 p-4">
        <div className="text-xs font-bold text-ink2">Price — type it for one material, the others follow your price index</div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select className="field !min-h-10 !w-auto" value={basisMaterial} onChange={(e) => {
              setBasis(e.target.value);
              setTyped(null);
            }} aria-label="Material the price is for" disabled={!materials.length}>
            {materials.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <span className="text-sm">₹</span>
          <input
            className="field !min-h-10 !w-36 text-right"
            inputMode="numeric"
            placeholder="e.g. 5000"
            aria-label="Price"
            disabled={!materials.length || !colours.length}
            value={typed ?? priceOf(basisMaterial) ?? ""}
            onChange={(e) => typePrice(e.target.value)}
            onBlur={() => setTyped(null)}
          />
          {!materials.length || !colours.length ? <span className="text-xs text-muted">Choose at least one material and one colour first.</span> : null}
        </div>
      </div>

      {/* 2. Materials */}
      <div className="mt-5">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-xs font-bold text-ink2">Materials</span>
          <span className="text-[11px] text-muted">% = price compared with the 100% material. Changing a % updates prices here and for every product (saved with “Save product”).</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {index.map((m) => {
            const on = materials.includes(m.name);
            const p = priceOf(m.name);
            return (
              <div key={m.name} className={`flex items-center gap-2 rounded-tile border p-2.5 pl-3 text-sm ${on ? "border-ink bg-white" : "border-line bg-bg2 text-muted"}`}>
                <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                  <input type="checkbox" checked={on} onChange={() => toggleMaterial(m.name)} className="size-4 flex-none accent-[var(--az-ink)]" />
                  <span className="truncate" title={m.name}>
                    {m.name}
                  </span>
                </label>
                <span className="inline-flex flex-none items-center gap-1 text-xs">
                  <input
                    className="field !min-h-8 !w-16 py-0.5 text-right"
                    inputMode="numeric"
                    aria-label={`${m.name} price index`}
                    value={m.index || ""}
                    onChange={(e) => changeIndex(m.name, e.target.value)}
                  />
                  %
                </span>
                <span className="w-[72px] flex-none text-right text-xs font-bold">{on && p != null ? inr(p) : "—"}</span>
              </div>
            );
          })}
        </div>
        {indexChanged && <p className="mt-2 text-[11px] font-bold text-gold">Price index changed — it will be saved for all products when you click “Save product”.</p>}
      </div>

      {/* 3. Colours */}
      <div className="mt-5">
        <span className="text-xs font-bold text-ink2">Colours</span>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {colours.map((c) => (
            <span key={c.name} className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white pl-2 pr-1 text-sm">
              <span className="size-5 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} />
              {c.name}
              <button type="button" aria-label={`Remove ${c.name}`} onClick={() => removeColour(c.name)} className="flex size-7 items-center justify-center rounded-full text-muted hover:bg-bg2 hover:text-red">
                <X size={14} aria-hidden />
              </button>
            </span>
          ))}
          <AddColour existing={colours} onAdd={addColour} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line2 pt-4">
        <Btn iconL={Save} onClick={saveAll} disabled={saving}>
          {saving ? "Saving…" : "Save product"}
        </Btn>
        <span className="text-xs text-muted">
          {materials.length} material{materials.length === 1 ? "" : "s"} × {colours.length} colour{colours.length === 1 ? "" : "s"} = {materials.length * colours.length} options
          {base != null && materials.length > 0 && ` · ${inr(priceOf(materials[0])!)} – ${inr(priceOf(materials[materials.length - 1])!)}`}
        </span>
        {msg && <span className="text-xs font-bold text-gold">{msg}</span>}
      </div>
    </Panel>
  );
}

function AddColour({ existing, onAdd }: { existing: Colour[]; onAdd: (c: Colour) => void }) {
  const [custom, setCustom] = useState(false);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#C9B48F");
  const left = PRESET_COLOURS.filter((c) => !existing.some((x) => x.name.toLowerCase() === c.name.toLowerCase()));
  if (custom)
    return (
      <span className="inline-flex items-center gap-1.5">
        <input className="field !min-h-9 !w-36 py-1" placeholder="Colour name" value={name} onChange={(e) => setName(e.target.value)} aria-label="New colour name" />
        <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="h-9 w-10 rounded border border-line" aria-label="New colour swatch" />
        <Btn
          size="sm"
          kind="light"
          iconL={Plus}
          onClick={() => {
            if (!name.trim()) return;
            onAdd({ name: name.trim(), hex });
            setName("");
            setCustom(false);
          }}
        >
          Add
        </Btn>
        <button type="button" className="text-xs underline" onClick={() => setCustom(false)}>
          Cancel
        </button>
      </span>
    );
  return (
    <select
      className="field !min-h-9 !w-auto py-1 text-sm"
      value=""
      aria-label="Add colour"
      onChange={(e) => {
        if (e.target.value === "__custom") return setCustom(true);
        const c = PRESET_COLOURS.find((x) => x.name === e.target.value);
        if (c) onAdd(c);
      }}
    >
      <option value="">+ Add colour…</option>
      {left.map((c) => (
        <option key={c.name} value={c.name}>
          {c.name}
        </option>
      ))}
      <option value="__custom">Custom colour…</option>
    </select>
  );
}
