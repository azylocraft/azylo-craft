"use client";

import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Plus, Star } from "lucide-react";
import { AdminTitle } from "@/components/admin/AdminShell";
import { EMPTY, photoUrl, removeReviewPhotos, ReviewEditor, type Draft } from "@/components/admin/ReviewEditor";
import { Badge, Btn } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Admin → Reviews. Approve, hide, edit (spelling/formatting — not the customer's meaning or rating)
 * and delete reviews, and add genuine reviews you collected elsewhere (e.g. sent on WhatsApp) with photos.
 */
export default function AdminReviews() {
  const sb = supabaseBrowser();
  const [products, setProducts] = useState<{ id: string; name_en: string | null; slug: string }[]>([]);
  const [productFilter, setProductFilter] = useState("all");
  const [status, setStatus] = useState("pending");
  const [rows, setRows] = useState<any[] | null>(null);
  const [edit, setEdit] = useState<Draft | null>(null);

  useEffect(() => {
    sb.from("products").select("id, name_en, slug").order("sort_order").then(({ data }) => setProducts(data ?? []));
  }, [sb]);

  const load = useCallback(() => {
    let q = sb.from("reviews").select("*, products ( name_en, slug )").order("created_at", { ascending: false }).limit(500);
    if (status !== "all") q = q.eq("status", status);
    if (productFilter !== "all") q = q.eq("product_id", productFilter);
    q.then(({ data }) => setRows(data ?? []));
  }, [sb, status, productFilter]);
  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  const setStatusOf = async (id: string, s: string) => {
    await sb.from("reviews").update({ status: s, is_published: s === "published" }).eq("id", id);
    load();
  };

  return (
    <>
      <AdminTitle
        title="Reviews"
        sub="Publish genuine customer reviews. Don't invent reviews or change a customer's rating or meaning — fake reviews are illegal in India."
        actions={<Btn iconL={Plus} onClick={() => setEdit(EMPTY(productFilter !== "all" ? productFilter : products[0]?.id))}>Add review</Btn>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {["pending", "published", "hidden", "all"].map((s) => (
          <button key={s} type="button" onClick={() => setStatus(s)} className={clsx("h-9 rounded-full border px-4 text-xs font-bold capitalize", status === s ? "border-ink bg-ink text-white" : "border-line bg-white")}>
            {s === "pending" ? "Waiting for approval" : s}
          </button>
        ))}
        <select className="field !min-h-9 !w-auto !py-0 text-xs" value={productFilter} onChange={(e) => setProductFilter(e.target.value)} aria-label="Product">
          <option value="all">All products</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name_en ?? p.slug}</option>)}
        </select>
      </div>
      {rows === null ? (
        <div className="az-skeleton h-[300px] rounded-block" />
      ) : rows.length === 0 ? (
        <p className="rounded-block border border-line2 bg-white p-8 text-center text-muted">No reviews here.</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 rounded-block border border-line2 bg-white p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} className={n <= r.rating ? "fill-gold text-gold" : "text-line"} aria-hidden />)}</span>
                <Badge tone={r.status === "published" ? "green" : r.status === "hidden" ? "grey" : "gold"}>{r.status}</Badge>
                {r.verified && <span className="flex items-center gap-1 text-[11px] font-bold text-green"><BadgeCheck size={13} aria-hidden /> Verified</span>}
                <span className="ml-auto text-xs text-muted">{r.products?.name_en}</span>
              </div>
              {r.title && <b>{r.title}</b>}
              <p className="text-sm">{r.body}</p>
              {r.reason && <p className="text-xs text-muted"><b>Why I bought it:</b> {r.reason}</p>}
              {r.photos?.length > 0 && (
                <div className="flex gap-2">{r.photos.map((p: string) => <img key={p} src={photoUrl(p)} alt="" className="size-14 rounded-lg object-cover" />)}</div>
              )}
              <span className="text-xs text-faint">{r.author_name ?? "Customer"}{r.location ? ` · ${r.location}` : ""} · {new Date(r.created_at).toLocaleDateString("en-IN")}</span>
              <div className="mt-1 flex flex-wrap gap-3 text-xs font-bold">
                {r.status !== "published" && <button type="button" className="text-green underline" onClick={() => setStatusOf(r.id, "published")}>Publish</button>}
                {r.status !== "hidden" && <button type="button" className="underline" onClick={() => setStatusOf(r.id, "hidden")}>Hide</button>}
                <button type="button" className="underline" onClick={() => setEdit({ id: r.id, product_id: r.product_id, rating: r.rating, title: r.title ?? "", body: r.body ?? "", reason: r.reason ?? "", author_name: r.author_name ?? "", location: r.location ?? "", photos: r.photos ?? [], verified: !!r.verified, status: r.status })}>Edit</button>
                <button type="button" className="text-red underline" onClick={async () => { if (confirm("Delete this review?")) { const { error } = await sb.from("reviews").delete().eq("id", r.id); if (!error) await removeReviewPhotos(r.photos ?? []); load(); } }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {edit && <ReviewEditor draft={edit} products={products} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
    </>
  );
}
