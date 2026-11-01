"use client";

import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { Panel } from "@/components/admin/AdminShell";
import { Btn } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

type IndexRow = { name: string; index: number };
type V = { id?: string; model_en: string; price_inr: string };

const round10 = (n: number) => Math.round(n / 10) * 10;
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Material pricing: type the price for any one material and the others are filled from the
 * store-wide material price index (e.g. Performance Fabric 100%, Linen 115% … Full Leather 250%).
 * Prices apply to every colour of that material. Variants are matched by their "model" = material name.
 */
export function MaterialPricing<T extends V>({ productId, variants, setVariants }: { productId: string; variants: T[]; setVariants: (fn: (v: T[]) => T[]) => void }) {
  const sb = supabaseBrowser();
  const [index, setIndex] = useState<IndexRow[] | null>(null);
  const [savedIndex, setSavedIndex] = useState<string>("");
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  // Materials this product actually has, in index (price) order.
  const present = useMemo(() => {
    const names = new Set(variants.map((v) => v.model_en.trim()));
    return (index ?? []).filter((m) => names.has(m.name));
  }, [index, variants]);

  // Start from the current variant prices.
  useEffect(() => {
    const start: Record<string, string> = {};
    for (const m of present) start[m.name] = variants.find((v) => v.model_en.trim() === m.name && v.price_inr !== "")?.price_inr ?? "";
    queueMicrotask(() => setPrices(start));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present.map((m) => m.name).join("|")]);

  if (!index) return null;

  const type = (name: string, value: string) => {
    const own = index.find((m) => m.name === name)!;
    const n = Number(value.replace(/[^\d.]/g, ""));
    if (!value.trim() || !n || !own.index) return setPrices((p) => ({ ...p, [name]: value }));
    const base = (n / own.index) * 100;
    setPrices(Object.fromEntries(present.map((m) => [m.name, m.name === name ? String(n) : String(round10((base * m.index) / 100))])));
  };

  const savePrices = async () => {
    setBusy(true);
    setMsg(null);
    for (const m of present) {
      const v = prices[m.name];
      const price = v === "" || v == null ? null : Number(v);
      const { error } = await sb.from("product_variants").update({ price_inr: price }).eq("product_id", productId).eq("model_en", m.name);
      if (error) {
        setBusy(false);
        return setMsg(error.message);
      }
    }
    setVariants((vs) => vs.map((v) => (prices[v.model_en.trim()] !== undefined ? { ...v, price_inr: prices[v.model_en.trim()] } : v)));
    setBusy(false);
    setMsg("Saved ✓ — prices applied to every colour.");
  };

  const indexChanged = JSON.stringify(index) !== savedIndex;
  const saveIndex = async () => {
    const { error } = await sb.from("store_settings").update({ material_price_index: index }).eq("id", 1);
    if (error) return setMsg(error.message);
    setSavedIndex(JSON.stringify(index));
    setMsg("Price index saved — used for every product.");
  };

  return (
    <Panel title="Material pricing" className="mt-5">
      <p className="mb-4 text-xs text-muted">
        Type the price for <b>any one</b> material — the others fill in from your price index (rounded to ₹10). Prices apply to every colour of that material.
        The index is shared by all products.
      </p>
      {present.length === 0 ? (
        <p className="rounded-tile border border-dashed border-line p-5 text-sm text-muted">
          This product has no variants named after your materials ({index.map((m) => m.name).join(", ")}). Add variants with these names as the model to use material pricing.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-[.08em] text-muted">
                <th className="py-2 pr-3 font-bold">Material</th>
                <th className="py-2 pr-3 font-bold">Price index</th>
                <th className="py-2 pr-3 font-bold">Price (₹)</th>
                <th className="py-2 font-bold">Colours</th>
              </tr>
            </thead>
            <tbody>
              {present.map((m) => (
                <tr key={m.name} className="border-t border-line2">
                  <td className="py-2 pr-3 font-semibold">{m.name}</td>
                  <td className="py-2 pr-3">
                    <span className="inline-flex items-center gap-1">
                      <input
                        className="field !min-h-9 !w-20 py-1 text-right"
                        inputMode="numeric"
                        aria-label={`${m.name} price index`}
                        value={m.index}
                        onChange={(e) => setIndex(index.map((x) => (x.name === m.name ? { ...x, index: Number(e.target.value.replace(/[^\d.]/g, "")) || 0 } : x)))}
                      />
                      %
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      className="field !min-h-9 !w-32 py-1 text-right"
                      inputMode="numeric"
                      aria-label={`${m.name} price`}
                      placeholder="—"
                      value={prices[m.name] ?? ""}
                      onChange={(e) => type(m.name, e.target.value)}
                    />
                  </td>
                  <td className="py-2 text-xs text-muted">{variants.filter((v) => v.model_en.trim() === m.name).length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        {present.length > 0 && (
          <Btn size="sm" iconL={Save} onClick={savePrices} disabled={busy}>
            {busy ? "Saving…" : "Save prices to all colours"}
          </Btn>
        )}
        {indexChanged && (
          <Btn size="sm" kind="light" onClick={saveIndex}>
            Save price index
          </Btn>
        )}
        {present.length > 0 && prices[present[0].name] && (
          <span className="text-xs text-muted">
            Range: {inr(Math.min(...present.map((m) => Number(prices[m.name]) || Infinity)))} – {inr(Math.max(...present.map((m) => Number(prices[m.name]) || 0)))}
          </span>
        )}
        {msg && <span className="text-xs font-bold text-green">{msg}</span>}
      </div>
    </Panel>
  );
}
