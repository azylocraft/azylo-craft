"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { AdminTitle, Panel } from "@/components/admin/AdminShell";
import { MediaManager, type Img, type Vid } from "@/components/admin/MediaManager";
import { ComparisonEditor } from "@/components/admin/ComparisonEditor";
import { MarkdownField } from "@/components/admin/MarkdownField";
import { VariantOptions } from "@/components/admin/VariantOptions";
import { ProductReviews } from "@/components/admin/ProductReviews";
import { OfferEditor } from "@/components/admin/OfferEditor";
import { Btn, BtnLink } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Variant = { id?: string; model_en: string; color_en: string; color_hex: string; material: string; price_inr: string; compare_at_inr: string; stock: string; sku: string; is_active: boolean; _delete?: boolean };
const FUNCTIONS = ["electric", "massage", "storage", "convertible", "modular"];

const toV = (v: any): Variant => ({
  id: v.id, model_en: v.model_en ?? "", color_en: v.color_en ?? "", color_hex: v.color_hex ?? "", material: v.material ?? "",
  price_inr: v.price_inr == null ? "" : String(v.price_inr), compare_at_inr: v.compare_at_inr == null ? "" : String(v.compare_at_inr), stock: v.stock == null ? "" : String(v.stock), sku: v.sku ?? "", is_active: v.is_active,
});

/** Product editor (design screen 86). */
export default function ProductEditor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const sb = supabaseBrowser();
  const [p, setP] = useState<any>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<Img[]>([]);
  const [videos, setVideos] = useState<Vid[]>([]);
  const [collections, setCollections] = useState<{ id: string; slug: string; title_en: string }[]>([]);
  const [linked, setLinked] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadMedia = useCallback(async () => {
    const [{ data: i }, { data: v }] = await Promise.all([
      sb.from("product_images").select("*").eq("product_id", id).order("sort_order"),
      sb.from("product_videos").select("*").eq("product_id", id).order("sort_order"),
    ]);
    setImages((i as Img[]) ?? []);
    setVideos((v as Vid[]) ?? []);
  }, [sb, id]);

  useEffect(() => {
    (async () => {
      const [{ data: prod }, { data: vs }, { data: cols }, { data: links }] = await Promise.all([
        sb.from("products").select("*").eq("id", id).maybeSingle(),
        sb.from("product_variants").select("*").eq("product_id", id).order("sort_order"),
        sb.from("collections").select("id, slug, title_en").order("sort_order"),
        sb.from("product_collections").select("collection_id").eq("product_id", id),
      ]);
      setP(prod);
      setVariants((vs ?? []).map(toV));
      setCollections((cols as any[]) ?? []);
      setLinked((links ?? []).map((l: any) => l.collection_id));
      await loadMedia();
    })();
  }, [sb, id, loadMedia]);

  if (p === null) return <div className="az-skeleton h-[500px] rounded-block" />;
  if (!p) return <p>Product not found.</p>;

  const set = (k: string, v: unknown) => setP({ ...p, [k]: v });
  const text = (k: string, label: string, area?: boolean, hint?: string) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-bold text-ink2">{label}</span>
      {area ? (
        <textarea className="field h-36 resize-y font-mono text-[13px]" value={p[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
      ) : (
        <input className="field" value={p[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
      )}
      {hint && <span className="text-[11px] text-faint">{hint}</span>}
    </label>
  );

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) throw new Error("Slug: lowercase letters, numbers and dashes only.");
      const fields = ["slug", "name_en", "name_fr", "eyebrow_en", "short_description_en", "overview_en", "delivery_access_en", "functions", "chips", "lead_time_min_days", "lead_time_max_days", "is_featured", "is_best_seller", "is_new", "is_published", "list_by_colour", "sort_order"];
      const row = Object.fromEntries(fields.map((f) => [f, p[f] === "" ? null : p[f]]));
      const { error } = await sb.from("products").update(row).eq("id", id);
      if (error) throw new Error(error.message);

      for (const [i, v] of variants.entries()) {
        if (v._delete) {
          if (v.id) await sb.from("product_variants").delete().eq("id", v.id);
          continue;
        }
        const r = {
          product_id: id, model_en: v.model_en || null, color_en: v.color_en || null, color_hex: /^#[0-9a-f]{6}$/i.test(v.color_hex) ? v.color_hex : null,
          material: v.material || null, price_inr: v.price_inr === "" ? null : Number(v.price_inr), compare_at_inr: v.compare_at_inr === "" ? null : Number(v.compare_at_inr), stock: v.stock === "" ? null : Math.max(0, Math.floor(Number(v.stock))),
          sku: v.sku || null, is_active: v.is_active, sort_order: i,
        };
        const res = v.id ? await sb.from("product_variants").update(r).eq("id", v.id) : await sb.from("product_variants").insert(r);
        if (res.error) throw new Error(`Variant ${i + 1}: ${res.error.message}`);
      }
      await sb.from("product_collections").delete().eq("product_id", id);
      if (linked.length) await sb.from("product_collections").insert(linked.map((collection_id) => ({ product_id: id, collection_id })));
      const { data: vs } = await sb.from("product_variants").select("*").eq("product_id", id).order("sort_order");
      setVariants((vs ?? []).map(toV));
      setStatus("Saved ✓ — changes appear on the store within a minute.");
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const vset = (i: number, k: keyof Variant, val: unknown) => setVariants(variants.map((v, j) => (j === i ? { ...v, [k]: val } : v)));

  return (
    <>
      <Link href="/admin" className="mb-4 flex items-center gap-2 text-sm font-bold"><ArrowLeft size={15} aria-hidden /> Products</Link>
      <AdminTitle
        title={p.name_en || "Untitled product"}
        sub={`/products/${p.slug}`}
        actions={
          <>
            <BtnLink href={`/products/${p.slug}`} target="_blank" kind="light" iconL={ExternalLink}>View</BtnLink>
            <Btn kind="light" iconL={Trash2} className="!text-red" onClick={async () => {
              if (!confirm("Delete this product and all its variants and photos?")) return;
              await sb.from("products").delete().eq("id", id);
              router.push("/admin");
            }}>Delete</Btn>
            <Btn iconL={Save} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Btn>
          </>
        }
      />
      {status && <p role="status" className={`mb-5 rounded-field p-3 text-sm font-bold ${status.startsWith("Saved") ? "bg-green-soft text-green" : "bg-red-soft text-red"}`}>{status}</p>}

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-5">
          <Panel title="Details">
            <div className="grid gap-4 md:grid-cols-2">
              {text("name_en", "Name")}
              {text("slug", "URL slug", false, "Used in /products/<slug>")}
              {text("eyebrow_en", "Card category tag", false, "e.g. Power comfort")}
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-ink2">Chips (comma separated)</span>
                <input className="field" value={(p.chips ?? []).join(", ")} onChange={(e) => set("chips", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))} />
              </label>
            </div>
            <div className="mt-4 flex flex-col gap-4">
              {text("short_description_en", "Short description")}
              <MarkdownField label="01 Product overview" value={p.overview_en ?? ""} onChange={(v) => set("overview_en", v)} dropTitle="Product overview" rows={16} />
              <MarkdownField label="02 Delivery & access" value={p.delivery_access_en ?? ""} onChange={(v) => set("delivery_access_en", v)} dropTitle="Delivery & access" />
              <p className="text-[11px] text-faint">
                03 Shipping, payment &amp; returns is shared by all products — edit it in <Link href="/admin/faqs" className="font-bold underline">Admin → FAQs</Link>.
              </p>
            </div>
          </Panel>
          <MediaManager productId={id} slug={p.slug} images={images} videos={videos} onChange={loadMedia} colors={[...new Set(variants.map((v) => v.color_en.trim()).filter(Boolean))]} />
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="Visibility">
            {[["is_published", "Published (visible in the store)"], ["is_featured", "Featured (home hero)"], ["is_best_seller", "Best seller"], ["is_new", "New arrival"], ["list_by_colour", "Show each colour as its own card in collections"]].map(([k, l]) => (
              <label key={k} className="flex items-center justify-between gap-3 border-b border-line2 py-2.5 text-sm last:border-0">
                {l}
                <input type="checkbox" checked={!!p[k]} onChange={(e) => set(k, e.target.checked)} className="size-5 accent-[var(--az-ink)]" />
              </label>
            ))}
          </Panel>
          <Panel title="Delivery lead time (days)">
            <div className="grid grid-cols-2 gap-3">
              <input className="field" type="number" min={0} aria-label="Minimum days" value={p.lead_time_min_days ?? ""} onChange={(e) => set("lead_time_min_days", e.target.value === "" ? null : Number(e.target.value))} />
              <input className="field" type="number" min={0} aria-label="Maximum days" value={p.lead_time_max_days ?? ""} onChange={(e) => set("lead_time_max_days", e.target.value === "" ? null : Number(e.target.value))} />
            </div>
          </Panel>
          <Panel title="Functions (filters)">
            <div className="flex flex-wrap gap-2">
              {FUNCTIONS.map((f) => {
                const on = (p.functions ?? []).includes(f);
                return (
                  <button key={f} type="button" aria-pressed={on} onClick={() => set("functions", on ? p.functions.filter((x: string) => x !== f) : [...(p.functions ?? []), f])} className={`h-9 rounded-full border px-4 text-xs font-bold capitalize ${on ? "border-ink bg-ink text-white" : "border-line"}`}>
                    {f}
                  </button>
                );
              })}
            </div>
          </Panel>
          <Panel title="Collections">
            {collections.map((c) => (
              <label key={c.id} className="flex items-center gap-3 py-1.5 text-sm">
                <input type="checkbox" checked={linked.includes(c.id)} onChange={(e) => setLinked(e.target.checked ? [...linked, c.id] : linked.filter((x) => x !== c.id))} className="size-4 accent-[var(--az-ink)]" />
                {c.title_en ?? c.slug}
              </label>
            ))}
          </Panel>
        </div>
      </div>

      <OfferEditor productId={id} />
      <ComparisonEditor productId={id} />
      <ProductReviews productId={id} productName={p.name_en ?? "This product"} />

      <VariantOptions productSlug={p.slug} variants={variants} setVariants={setVariants} onSave={save} saving={saving} />

      <details className="group mt-5 rounded-block border border-line2 bg-white">
        <summary className="cursor-pointer list-none p-5 text-sm font-bold md:px-6">
          Advanced: edit each option one by one (stock, SKU, MRP) · {variants.filter((v) => !v._delete).length} options
          <span className="ml-2 text-xs font-normal text-muted group-open:hidden">— show</span>
        </summary>
      <Panel title="Variants & inventory" className="!rounded-t-none !border-0 !shadow-none" actions={<Btn size="sm" kind="light" iconL={Plus} onClick={() => setVariants([...variants, { model_en: "", color_en: "", color_hex: "#C9B48F", material: "fabric", price_inr: "", compare_at_inr: "", stock: "", sku: "", is_active: true }])}>Add variant</Btn>}>
        <p className="mb-3 text-xs text-muted">Price in INR (empty = MISSING: price, can&apos;t be bought). MRP / was price is optional and shown struck through — it must be a genuine earlier or regular price. Stock empty = made to order; 0 = out of stock.</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-xs uppercase tracking-[.08em] text-muted">
              <tr><th className="p-2">Model</th><th className="p-2">Colour</th><th className="p-2">Hex</th><th className="p-2">Material</th><th className="p-2">Price ₹</th><th className="p-2">MRP / was ₹</th><th className="p-2">Stock</th><th className="p-2">SKU</th><th className="p-2">Active</th><th /></tr>
            </thead>
            <tbody>
              {variants.map((v, i) =>
                v._delete ? null : (
                  <tr key={v.id ?? `new-${i}`} className="border-t border-line2">
                    <td className="p-1.5"><input className="field !min-h-10" value={v.model_en} onChange={(e) => vset(i, "model_en", e.target.value)} aria-label="Model" /></td>
                    <td className="p-1.5"><input className="field !min-h-10" value={v.color_en} onChange={(e) => vset(i, "color_en", e.target.value)} aria-label="Colour" /></td>
                    <td className="p-1.5"><input type="color" value={/^#[0-9a-f]{6}$/i.test(v.color_hex) ? v.color_hex : "#cccccc"} onChange={(e) => vset(i, "color_hex", e.target.value)} className="h-10 w-12 rounded border border-line" aria-label="Colour swatch" /></td>
                    <td className="p-1.5"><input className="field !min-h-10 w-28" value={v.material} onChange={(e) => vset(i, "material", e.target.value)} aria-label="Material" /></td>
                    <td className="p-1.5"><input className="field !min-h-10 w-28" inputMode="decimal" value={v.price_inr} onChange={(e) => vset(i, "price_inr", e.target.value.replace(/[^0-9.]/g, ""))} aria-label="Price" /></td>
                    <td className="p-1.5"><input className="field !min-h-10 w-28" inputMode="decimal" placeholder="optional" value={v.compare_at_inr} onChange={(e) => vset(i, "compare_at_inr", e.target.value.replace(/[^0-9.]/g, ""))} aria-label="MRP" /></td>
                    <td className="p-1.5"><input className="field !min-h-10 w-20" inputMode="numeric" value={v.stock} onChange={(e) => vset(i, "stock", e.target.value.replace(/\D/g, ""))} aria-label="Stock" /></td>
                    <td className="p-1.5"><input className="field !min-h-10 w-28" value={v.sku} onChange={(e) => vset(i, "sku", e.target.value)} aria-label="SKU" /></td>
                    <td className="p-1.5 text-center"><input type="checkbox" checked={v.is_active} onChange={(e) => vset(i, "is_active", e.target.checked)} className="size-4 accent-[var(--az-ink)]" aria-label="Active" /></td>
                    <td className="p-1.5"><button type="button" aria-label="Remove variant" onClick={() => vset(i, "_delete", true)} className="p-2 text-red"><Trash2 size={15} aria-hidden /></button></td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end"><Btn iconL={Save} onClick={save} disabled={saving}>{saving ? "Saving…" : "Save product"}</Btn></div>
      </Panel>
      </details>
    </>
  );
}
