"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Tag, Trash2, X } from "lucide-react";
import { AdminTitle } from "@/components/admin/AdminShell";
import { Badge, Btn } from "@/components/ui/primitives";
import { mediaUrl } from "@/lib/media";
import { supabaseBrowser } from "@/lib/supabase/client";

type Variant = { id: string; model_en: string | null; price_inr: number | null; stock: number | null };
type Row = {
  id: string; slug: string; name_en: string | null; is_published: boolean; is_best_seller: boolean; is_new: boolean; is_featured: boolean; is_demo: boolean;
  product_variants: Variant[];
  product_images: { storage_path: string; sort_order: number; image_type: string }[];
  product_collections: { collection_id: string }[];
};
type IndexRow = { name: string; index: number };
type Collection = { id: string; slug: string; title_en: string | null };

const round10 = (n: number) => Math.round(n / 10) * 10;
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * New variant prices for one product when its base price is set to `base`.
 * Products whose options are the store materials follow the material price index (base = the
 * 100% material); other products scale all their prices so the cheapest becomes `base`.
 */
function repriced(r: Row, base: number, index: IndexRow[]): { id: string; price: number }[] {
  const pct = (m: string | null) => index.find((x) => x.name === (m ?? "").trim())?.index;
  const vs = r.product_variants;
  if (vs.length && vs.every((v) => pct(v.model_en))) {
    const basePct = Math.min(...index.map((m) => m.index));
    return vs.map((v) => ({ id: v.id, price: pct(v.model_en) === basePct ? base : round10((base * pct(v.model_en)!) / basePct) }));
  }
  const priced = vs.filter((v) => v.price_inr != null);
  const min = priced.length ? Math.min(...priced.map((v) => Number(v.price_inr))) : null;
  return vs.map((v) => ({ id: v.id, price: min && v.price_inr != null ? (Number(v.price_inr) === min ? base : round10((Number(v.price_inr) / min) * base)) : base }));
}

/** Products list (design screen 85) with category filter, multi-select, bulk pricing and delete. */
export default function AdminProducts() {
  const router = useRouter();
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [index, setIndex] = useState<IndexRow[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [action, setAction] = useState<null | "base">(null);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const [{ data }, { data: cols }, { data: s }] = await Promise.all([
      sb
        .from("products")
        .select("id, slug, name_en, is_published, is_best_seller, is_new, is_featured, is_demo, product_variants ( id, model_en, price_inr, stock ), product_images ( storage_path, sort_order, image_type ), product_collections ( collection_id )")
        .order("sort_order"),
      sb.from("collections").select("id, slug, title_en").order("sort_order"),
      sb.from("store_settings").select("material_price_index").eq("id", 1).maybeSingle(),
    ]);
    setRows((data as Row[]) ?? []);
    setCollections(((cols as Collection[]) ?? []).filter((c) => c.slug !== "all"));
    setIndex((s?.material_price_index as IndexRow[]) ?? []);
  }, [sb]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const shown = useMemo(
    () =>
      (rows ?? []).filter(
        (r) => `${r.name_en} ${r.slug}`.toLowerCase().includes(q.toLowerCase()) && (cat === "all" || r.product_collections.some((c) => c.collection_id === cat)),
      ),
    [rows, q, cat],
  );
  const selected = (rows ?? []).filter((r) => picked.has(r.id));
  const allShownPicked = shown.length > 0 && shown.every((r) => picked.has(r.id));
  const toggle = (id: string) => setPicked((p) => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setPicked((p) => { const n = new Set(p); for (const r of shown) if (allShownPicked) n.delete(r.id); else n.add(r.id); return n; });

  // Preview of the bulk change.
  const n = Number(amount.replace(/[^\d.-]/g, ""));
  const preview = selected.map((r) => {
    const next =
      action === "base" && n > 0
        ? repriced(r, n, index)
        : [];
    const prices = next.map((x) => x.price);
    return { r, next, from: prices.length ? Math.min(...prices) : null, to: prices.length ? Math.max(...prices) : null };
  });

  const apply = async () => {
    if (!preview.some((p) => p.next.length)) return;
    setBusy(true);
    setMsg(null);
    let count = 0;
    for (const p of preview)
      for (const v of p.next) {
        const { error } = await sb.from("product_variants").update({ price_inr: v.price }).eq("id", v.id);
        if (error) {
          setBusy(false);
          return setMsg(error.message);
        }
        count++;
      }
    setBusy(false);
    setMsg(`Saved ✓ — ${count} prices updated on ${preview.length} product${preview.length > 1 ? "s" : ""}.`);
    setAction(null);
    setAmount("");
    await load();
  };

  const remove = async (ids: string[]) => {
    const names = (rows ?? []).filter((r) => ids.includes(r.id)).map((r) => r.name_en ?? r.slug);
    if (!confirm(`Delete ${ids.length === 1 ? `“${names[0]}”` : `${ids.length} products`}? Their variants, photos and reviews are removed. Past orders keep their details. This can't be undone.`)) return;
    setBusy(true);
    const { error } = await sb.from("products").delete().in("id", ids);
    setBusy(false);
    if (error) return setMsg(error.message);
    setPicked((p) => { const n2 = new Set(p); ids.forEach((id) => n2.delete(id)); return n2; });
    setMsg(`Deleted ${ids.length} product${ids.length > 1 ? "s" : ""}.`);
    await load();
  };

  const create = async () => {
    setCreating(true);
    const slug = `new-product-${crypto.randomUUID().slice(0, 8)}`;
    const { data, error } = await sb.from("products").insert({ slug, name_en: "New product", is_published: false, lead_time_min_days: 45, lead_time_max_days: 55 }).select("id").single();
    setCreating(false);
    if (error) return alert(error.message);
    router.push(`/admin/products/${data.id}`);
  };

  const baseMaterial = index.length ? index.reduce((a, m) => (m.index < a.index ? m : a)).name : "base material";

  return (
    <>
      <AdminTitle title="Products" sub={rows ? `${rows.length} products` : "Loading…"} actions={<Btn iconL={Plus} onClick={create} disabled={creating}>New product</Btn>} />

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex h-11 w-full max-w-[360px] items-center gap-3 rounded-full border border-line bg-white px-5">
          <Search size={16} className="text-muted" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="min-w-0 flex-1 bg-transparent text-sm outline-none" aria-label="Search products" />
        </label>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Category">
          {[{ id: "all", title_en: "All" } as Collection, ...collections].map((c) => {
            const count = c.id === "all" ? (rows?.length ?? 0) : (rows ?? []).filter((r) => r.product_collections.some((x) => x.collection_id === c.id)).length;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={cat === c.id}
                onClick={() => setCat(c.id)}
                className={clsx("h-9 rounded-full border px-3.5 text-xs font-bold", cat === c.id ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink")}
              >
                {c.title_en ?? c.slug} · {count}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk bar */}
      {picked.size > 0 && (
        <div className="sticky top-2 z-20 mb-4 rounded-block border border-ink bg-white p-4 shadow-soft">
          <div className="flex flex-wrap items-center gap-2">
            <b className="mr-2 text-sm">{picked.size} selected</b>
            <Btn size="sm" kind={action === "base" ? "dark" : "light"} iconL={Tag} onClick={() => { setAction("base"); setAmount(""); }}>Set base price</Btn>
            <Btn size="sm" kind="light" iconL={Trash2} className="!text-red" onClick={() => remove([...picked])} disabled={busy}>Delete</Btn>
            <button type="button" className="ml-auto flex items-center gap-1 text-xs font-bold underline" onClick={() => { setPicked(new Set()); setAction(null); }}>
              <X size={13} aria-hidden /> Clear selection
            </button>
          </div>
          {action && (
            <div className="mt-3 border-t border-line2 pt-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span>New base price ({baseMaterial}):</span>
                <span>₹</span>
                <input className="field !min-h-9 !w-36 text-right" inputMode="numeric" placeholder="e.g. 45000" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} aria-label="New base price" autoFocus />
                <Btn size="sm" onClick={apply} disabled={busy || !preview.some((p) => p.next.length)}>{busy ? "Saving…" : "Apply"}</Btn>
              </div>
              <p className="mt-1.5 text-[11px] text-muted">
                Every other material is priced from your material price index (e.g. Linen 115%, Full Leather 250%). Products without your materials keep their own price steps, scaled from the new base.
              </p>
              {preview.some((p) => p.next.length) && (
                <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                  {preview.map((p) => (
                    <li key={p.r.id} className="flex justify-between gap-3 rounded-lg bg-bg2 px-3 py-1.5">
                      <span className="truncate">{p.r.name_en ?? p.r.slug}</span>
                      <b className="flex-none">{p.from != null ? (p.from === p.to ? inr(p.from) : `${inr(p.from)} – ${inr(p.to!)}`) : "—"}</b>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
      {msg && <p role="status" className={clsx("mb-4 rounded-field p-3 text-sm font-bold", msg.startsWith("Saved") || msg.startsWith("Deleted") ? "bg-green-soft text-green" : "bg-red-soft text-red")}>{msg}</p>}

      <div className="overflow-x-auto rounded-block border border-line2 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-[.1em] text-muted">
            <tr>
              <th className="w-10 p-4">
                <input type="checkbox" checked={allShownPicked} onChange={toggleAll} className="size-4 accent-[var(--az-ink)]" aria-label="Select all shown products" />
              </th>
              <th className="p-4">Product</th><th className="p-4">Price from</th><th className="p-4">Variants</th><th className="p-4">Stock</th><th className="p-4">Photos</th><th className="p-4">Flags</th><th className="w-12 p-4" />
            </tr>
          </thead>
          <tbody>
            {rows === null &&
              Array.from({ length: 6 }, (_, i) => (
                <tr key={i}><td colSpan={8} className="p-4"><div className="az-skeleton h-10 rounded-lg" /></td></tr>
              ))}
            {rows && shown.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-muted">No products in this view.</td></tr>
            )}
            {shown.map((r) => {
              const prices = r.product_variants.filter((v) => v.price_inr != null).map((v) => Number(v.price_inr));
              const stock = r.product_variants.some((v) => v.stock == null) ? "Made to order" : String(r.product_variants.reduce((s, v) => s + (v.stock ?? 0), 0));
              const img = [...r.product_images].sort((a, b) => a.sort_order - b.sort_order)[0];
              const on = picked.has(r.id);
              return (
                <tr key={r.id} className={clsx("border-b border-line2 last:border-0", on ? "bg-gold-soft/50" : "hover:bg-bg2")}>
                  <td className="p-4">
                    <input type="checkbox" checked={on} onChange={() => toggle(r.id)} className="size-4 accent-[var(--az-ink)]" aria-label={`Select ${r.name_en ?? r.slug}`} />
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/products/${r.id}`} className="flex items-center gap-3">
                      {img ? <img src={mediaUrl(img.storage_path)!} alt="" className="size-12 rounded-lg object-cover" /> : <span className="size-12 rounded-lg bg-cream" />}
                      <span>
                        <b className="line-clamp-1">{r.name_en ?? "MISSING: name"}</b>
                        <span className="text-xs text-muted">/{r.slug}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="p-4">{prices.length ? inr(Math.min(...prices)) : <span className="text-red">MISSING</span>}</td>
                  <td className="p-4">{r.product_variants.length}</td>
                  <td className="p-4">{stock}</td>
                  <td className="p-4">{r.product_images.length}</td>
                  <td className="p-4">
                    <span className="flex flex-wrap gap-1">
                      {!r.is_published && <Badge tone="grey">Draft</Badge>}
                      {r.is_featured && <Badge tone="dark">Featured</Badge>}
                      {r.is_best_seller && <Badge>Best seller</Badge>}
                      {r.is_new && <Badge tone="blue">New</Badge>}
                      {r.is_demo && <Badge tone="red">Demo</Badge>}
                    </span>
                  </td>
                  <td className="p-4">
                    <button type="button" aria-label={`Delete ${r.name_en ?? r.slug}`} onClick={() => remove([r.id])} disabled={busy} className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-red-soft hover:text-red">
                      <Trash2 size={15} aria-hidden />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
