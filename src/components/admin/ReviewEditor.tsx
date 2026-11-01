"use client";

import { useRef, useState } from "react";
import { Camera, Save, Star, Trash2, X } from "lucide-react";
import { Panel } from "@/components/admin/AdminShell";
import { Btn } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

/** Public URL of a review photo stored in the review-media bucket. */
export const photoUrl = (p: string) =>
  p.startsWith("http://") || p.startsWith("https://") ? p : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/review-media/${p}`;

export type Draft = {
  id?: string; product_id: string; rating: number; title: string; body: string; reason: string;
  author_name: string; location: string; photos: string[]; verified: boolean; status: string;
};

export const EMPTY = (product_id = ""): Draft => ({ product_id, rating: 5, title: "", body: "", reason: "", author_name: "", location: "", photos: [], verified: false, status: "published" });

/** Deletes review photos from storage (paths only; external URLs are left alone). */
export async function removeReviewPhotos(paths: string[]) {
  const own = paths.filter((p) => p && !p.startsWith("http://") && !p.startsWith("https://"));
  if (own.length) await supabaseBrowser().storage.from("review-media").remove(own);
}

/** Add / edit a review: product, rating, text, name, city, photos (upload/remove), verified and status. */
export function ReviewEditor({ draft, products, onClose, onSaved }: { draft: Draft; products: { id: string; name_en: string | null; slug: string }[]; onClose: () => void; onSaved: () => void }) {
  const sb = supabaseBrowser();
  const [d, setD] = useState<Draft>(draft);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  // Photos uploaded in this session (deleted again if the editor is closed without saving).
  const fresh = useRef<string[]>([]);

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
    fresh.current.push(...added);
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
    // Photos removed from the review (saved or just uploaded) are deleted from storage.
    const kept = new Set(d.photos);
    await removeReviewPhotos([...draft.photos, ...fresh.current].filter((p) => !kept.has(p)));
    fresh.current = [];
    onSaved();
  };
  const close = async () => {
    await removeReviewPhotos(fresh.current);
    fresh.current = [];
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <Panel title={d.id ? "Edit review" : "Add a review"} className="max-h-[92vh] w-full max-w-[620px] overflow-y-auto" actions={<button type="button" aria-label="Close" onClick={close}><X size={18} aria-hidden /></button>}>
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
