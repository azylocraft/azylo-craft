"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Panel } from "@/components/admin/AdminShell";
import { Btn } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

type Row = {
  id?: string;
  seller_name: string;
  url: string;
  price_inr: string;
  includes_delivery: boolean;
  includes_gst: boolean;
  notes: string;
  checked_on: string;
  _delete?: boolean;
};

const today = () => new Date().toISOString().slice(0, 10);

/** Admin: other sellers' prices for this product + "Why AZYLO" points (shown in "Compare before you buy"). */
export function ComparisonEditor({ productId }: { productId: string }) {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<Row[]>([]);
  const [points, setPoints] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [{ data: c }, { data: p }] = await Promise.all([
      sb.from("product_comparisons").select("*").eq("product_id", productId).order("sort_order"),
      sb.from("products").select("comparison_points_en").eq("id", productId).maybeSingle(),
    ]);
    setRows(
      (c ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        seller_name: (r.seller_name as string) ?? "",
        url: (r.url as string) ?? "",
        price_inr: String(r.price_inr ?? ""),
        includes_delivery: !!r.includes_delivery,
        includes_gst: !!r.includes_gst,
        notes: (r.notes as string) ?? "",
        checked_on: (r.checked_on as string) ?? today(),
      })),
    );
    setPoints((p?.comparison_points_en as string) ?? "");
  }, [sb, productId]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const set = (i: number, k: keyof Row, v: unknown) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      for (const [i, r] of rows.entries()) {
        if (r._delete) {
          if (r.id) await sb.from("product_comparisons").delete().eq("id", r.id);
          continue;
        }
        if (!r.seller_name.trim() || r.price_inr === "") throw new Error(`Row ${i + 1}: seller name and price are required.`);
        if (r.url && !/^https?:\/\//i.test(r.url)) throw new Error(`Row ${i + 1}: the link must start with http:// or https://`);
        const data = {
          product_id: productId,
          seller_name: r.seller_name.trim(),
          url: r.url.trim() || null,
          price_inr: Number(r.price_inr),
          includes_delivery: r.includes_delivery,
          includes_gst: r.includes_gst,
          notes: r.notes.trim() || null,
          checked_on: r.checked_on || today(),
          sort_order: i,
        };
        const res = r.id ? await sb.from("product_comparisons").update(data).eq("id", r.id) : await sb.from("product_comparisons").insert(data);
        if (res.error) throw new Error(res.error.message);
      }
      const { error } = await sb.from("products").update({ comparison_points_en: points.trim() || null }).eq("id", productId);
      if (error) throw new Error(error.message);
      await load();
      setMsg("Saved ✓ — the comparison appears on the product page within a minute.");
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel
      title="Price comparison"
      className="mt-5"
      actions={
        <Btn
          size="sm"
          kind="light"
          iconL={Plus}
          onClick={() => setRows([...rows, { seller_name: "", url: "", price_inr: "", includes_delivery: false, includes_gst: true, notes: "", checked_on: today() }])}
        >
          Add seller
        </Btn>
      }
    >
      <p className="mb-3 text-xs text-muted">
        Add other sellers&apos; prices for the same or a similar product, as you see them today. The product page shows AZYLO&apos;s live price first, the savings, and
        &quot;Prices last checked on&quot; the latest date below. Keep these accurate and up to date — comparisons must be truthful. Nothing shows until you add a row.
      </p>
      {rows.filter((r) => !r._delete).length === 0 && <p className="mb-3 rounded-field border border-dashed border-line p-4 text-sm text-muted">No sellers added yet.</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          {rows.some((r) => !r._delete) && (
            <thead className="text-left text-xs uppercase tracking-[.08em] text-muted">
              <tr>
                <th className="p-2">Seller</th>
                <th className="p-2">Link</th>
                <th className="p-2">Price ₹</th>
                <th className="p-2">Free delivery</th>
                <th className="p-2">GST incl.</th>
                <th className="p-2">Notes</th>
                <th className="p-2">Checked on</th>
                <th />
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((r, i) =>
              r._delete ? null : (
                <tr key={r.id ?? `new-${i}`} className="border-t border-line2">
                  <td className="p-1.5"><input className="field !min-h-10" value={r.seller_name} onChange={(e) => set(i, "seller_name", e.target.value)} aria-label="Seller" placeholder="e.g. Brand X" /></td>
                  <td className="p-1.5"><input className="field !min-h-10" value={r.url} onChange={(e) => set(i, "url", e.target.value)} aria-label="Link" placeholder="https://" /></td>
                  <td className="p-1.5"><input className="field !min-h-10 w-28" inputMode="decimal" value={r.price_inr} onChange={(e) => set(i, "price_inr", e.target.value.replace(/[^0-9.]/g, ""))} aria-label="Price" /></td>
                  <td className="p-1.5 text-center"><input type="checkbox" checked={r.includes_delivery} onChange={(e) => set(i, "includes_delivery", e.target.checked)} className="size-4 accent-[var(--az-ink)]" aria-label="Free delivery" /></td>
                  <td className="p-1.5 text-center"><input type="checkbox" checked={r.includes_gst} onChange={(e) => set(i, "includes_gst", e.target.checked)} className="size-4 accent-[var(--az-ink)]" aria-label="GST included" /></td>
                  <td className="p-1.5"><input className="field !min-h-10" value={r.notes} onChange={(e) => set(i, "notes", e.target.value)} aria-label="Notes" placeholder="e.g. engineered wood, no massage" /></td>
                  <td className="p-1.5"><input type="date" className="field !min-h-10 w-40" value={r.checked_on} onChange={(e) => set(i, "checked_on", e.target.value)} aria-label="Checked on" /></td>
                  <td className="p-1.5"><button type="button" aria-label="Remove seller" onClick={() => set(i, "_delete", true)} className="p-2 text-red"><Trash2 size={15} aria-hidden /></button></td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
      <label className="mt-5 flex flex-col gap-1.5">
        <span className="text-xs font-bold text-ink2">Why AZYLO is the better buy (one point per line)</span>
        <textarea
          className="field h-32 resize-y"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          placeholder={"Solid wood frame instead of engineered wood\nFree delivery and GST included in the price\nMade to order in your colour"}
        />
      </label>
      <div className="mt-4 flex items-center justify-end gap-3">
        {msg && <span role="status" className={`text-sm font-bold ${msg.startsWith("Saved") ? "text-green" : "text-red"}`}>{msg}</span>}
        <Btn iconL={Save} onClick={save} disabled={busy}>{busy ? "Saving…" : "Save comparison"}</Btn>
      </div>
    </Panel>
  );
}
