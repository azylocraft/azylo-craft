"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, Camera, Plus, Save, Star, Trash2, X } from "lucide-react";
import { AdminTitle, Panel } from "@/components/admin/AdminShell";
import { Badge, Btn } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

const photoUrl = (p: string) =>
  p.startsWith("http://") || p.startsWith("https://") ? p : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/review-media/${p}`;

type Draft = {
  id?: string; product_id: string; rating: number; title: string; body: string; reason: string;
  author_name: string; location: string; photos: string[]; verified: boolean; status: string;
};

const EMPTY = (product_id = ""): Draft => ({ product_id, rating: 5, title: "", body: "", reason: "", author_name: "", location: "", photos: [], verified: false, status: "published" });

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
                <button type="button" className="text-red underline" onClick={async () => { if (confirm("Delete this review?")) { await sb.from("reviews").delete().eq("id", r.id); load(); } }}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {edit && <ReviewEditor draft={edit} products={products} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
    </>
  );
}

function ReviewEditor({ draft, products, onClose, onSaved }: { draft: Draft; products: { id: string; name_en: string | null; slug: string }[]; onClose: () => void; onSaved: () => void }) {
  const sb = supabaseBrowser();
  const [d, setD] = useState<Draft>(draft);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList) => {
    setBusy(true);
    const added: string[] = [];
    for (const f of [...files].slice(0, 6 - d.photos.length)) {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `admin/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await sb.storage.from("review-media").upload(path, f, { contentType: f.type });
      if (error) setMsg(error.message);
      else added.push(path);
    }
    setD((x) => ({ ...x, photos: [...x.photos, ...added] }));
    setBusy(false);
  };

  const save = async () => {
    if (!d.product_id || d.body.trim().length < 5) return setMsg("Choose a product and enter the review text.");
    const row = {
      product_id: d.product_id, rating: d.rating, title: d.title.trim() || null, body: d.body.trim(), reason: d.reason.trim() || null,
      author_name: d.author_name.trim() || null, location: d.location.trim() || null, photos: d.photos, verified: d.verified,
      status: d.status, is_published: d.status === "published",
    };
    const res = d.id ? await sb.from("reviews").update(row).eq("id", d.id) : await sb.from("reviews").insert(row);
    if (res.error) return setMsg(res.error.message);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Panel title={d.id ? "Edit review" : "Add a review"} className="max-h-[92vh] w-full max-w-[620px] overflow-y-auto" actions={<button type="button" aria-label="Close" onClick={onClose}><X size={18} aria-hidden /></button>}>
        <div className="grid gap-3">
          <label className="flex flex-col gap-1.5 text-xs font-bold">Product
            <select className="field" value={d.product_id} onChange={(e) => setD({ ...d, product_id: e.target.value })}>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name_en ?? p.slug}</option>)}
            </select>
          </label>
          <div className="text-xs font-bold">Rating
            <div className="mt-1 flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`${n} stars`} onClick={() => setD({ ...d, rating: n })}><Star size={26} className={n <= d.rating ? "fill-gold text-gold" : "text-line"} aria-hidden /></button>)}</div>
          </div>
          <label className="flex flex-col gap-1.5 text-xs font-bold">Headline<input className="field" value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} /></label>
          <label className="flex flex-col gap-1.5 text-xs font-bold">Review text<textarea className="field h-28 resize-y" value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} /></label>
          <label className="flex flex-col gap-1.5 text-xs font-bold">Why they bought it<input className="field" value={d.reason} onChange={(e) => setD({ ...d, reason: e.target.value })} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-bold">Customer name shown<input className="field" value={d.author_name} onChange={(e) => setD({ ...d, author_name: e.target.value })} placeholder="e.g. Priya S." /></label>
            <label className="flex flex-col gap-1.5 text-xs font-bold">City<input className="field" value={d.location} onChange={(e) => setD({ ...d, location: e.target.value })} /></label>
          </div>
          <div className="text-xs font-bold">Photos
            <div className="mt-1.5 flex flex-wrap gap-2">
              {d.photos.map((p) => (
                <span key={p} className="relative size-16 overflow-hidden rounded-lg">
                  <img src={photoUrl(p)} alt="" className="size-full object-cover" />
                  <button type="button" aria-label="Remove photo" onClick={() => setD({ ...d, photos: d.photos.filter((x) => x !== p) })} className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-white text-ink"><Trash2 size={11} aria-hidden /></button>
                </span>
              ))}
              {d.photos.length < 6 && <button type="button" disabled={busy} onClick={() => input.current?.click()} className="flex size-16 items-center justify-center rounded-lg border-2 border-dashed border-line text-muted"><Camera size={20} aria-hidden /></button>}
            </div>
            <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.verified} onChange={(e) => setD({ ...d, verified: e.target.checked })} className="size-4 accent-[var(--az-ink)]" /> Verified purchase (only tick if this customer really bought from you)</label>
          <label className="flex flex-col gap-1.5 text-xs font-bold">Status
            <select className="field" value={d.status} onChange={(e) => setD({ ...d, status: e.target.value })}>
              <option value="published">Published</option><option value="pending">Waiting for approval</option><option value="hidden">Hidden</option>
            </select>
          </label>
          {msg && <p className="text-sm text-red">{msg}</p>}
          <div className="flex justify-end"><Btn iconL={Save} onClick={save} disabled={busy}>Save review</Btn></div>
        </div>
      </Panel>
    </div>
  );
}
