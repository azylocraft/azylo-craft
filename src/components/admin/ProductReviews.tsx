"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Plus, Star } from "lucide-react";
import { Panel } from "@/components/admin/AdminShell";
import { EMPTY, photoUrl, removeReviewPhotos, ReviewEditor, type Draft } from "@/components/admin/ReviewEditor";
import { Badge, Btn } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Product editor panel: this product's reviews — add, edit, upload/remove photos, publish/hide, delete. */
export function ProductReviews({ productId, productName }: { productId: string; productName: string }) {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<any[] | null>(null);
  const [edit, setEdit] = useState<Draft | null>(null);

  const load = useCallback(() => {
    sb.from("reviews").select("*").eq("product_id", productId).order("created_at", { ascending: false }).then(({ data }) => setRows(data ?? []));
  }, [sb, productId]);
  useEffect(() => {
    queueMicrotask(load);
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    await sb.from("reviews").update({ status, is_published: status === "published" }).eq("id", id);
    load();
  };
  const published = rows?.filter((r) => r.status === "published").length ?? 0;

  return (
    <Panel
      title={`Reviews${rows ? ` · ${rows.length}` : ""}`}
      className="mt-5"
      actions={<Btn size="sm" kind="light" iconL={Plus} onClick={() => setEdit(EMPTY(productId))}>Add review</Btn>}
    >
      <p className="mb-3 text-xs text-muted">
        Add genuine reviews customers sent you (e.g. on WhatsApp) with their photos. With 3 or more published reviews, the top 5 scroll on the product page.
        {rows && ` Published now: ${published}.`} All products: <Link href="/admin/reviews" className="font-bold underline">Admin → Reviews</Link>.
      </p>
      {rows === null ? (
        <div className="az-skeleton h-24 rounded-tile" />
      ) : rows.length === 0 ? (
        <p className="rounded-tile border border-dashed border-line p-6 text-center text-sm text-muted">No reviews for this product yet.</p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-2 rounded-tile border border-line2 bg-bg2 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={13} className={n <= r.rating ? "fill-gold text-gold" : "text-line"} aria-hidden />
                  ))}
                </span>
                <Badge tone={r.status === "published" ? "green" : r.status === "hidden" ? "grey" : "gold"}>{r.status}</Badge>
                {r.verified && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-green">
                    <BadgeCheck size={13} aria-hidden /> Verified
                  </span>
                )}
              </div>
              {r.title && <b className="text-sm">{r.title}</b>}
              <p className="line-clamp-3 text-sm">{r.body}</p>
              {r.photos?.length > 0 && (
                <div className="flex gap-1.5">
                  {r.photos.map((p: string) => (
                    <img key={p} src={photoUrl(p)} alt="" className="size-12 rounded-lg object-cover" />
                  ))}
                </div>
              )}
              <span className="text-xs text-faint">
                {r.author_name ?? "Customer"}
                {r.location ? ` · ${r.location}` : ""}
              </span>
              <div className="flex flex-wrap gap-3 text-xs font-bold">
                <button
                  type="button"
                  className="underline"
                  onClick={() =>
                    setEdit({
                      id: r.id,
                      product_id: r.product_id,
                      rating: r.rating,
                      title: r.title ?? "",
                      body: r.body ?? "",
                      reason: r.reason ?? "",
                      author_name: r.author_name ?? "",
                      location: r.location ?? "",
                      photos: r.photos ?? [],
                      verified: !!r.verified,
                      status: r.status,
                    })
                  }
                >
                  Edit / photos
                </button>
                {r.status !== "published" && (
                  <button type="button" className="text-green underline" onClick={() => setStatus(r.id, "published")}>
                    Publish
                  </button>
                )}
                {r.status !== "hidden" && (
                  <button type="button" className="underline" onClick={() => setStatus(r.id, "hidden")}>
                    Hide
                  </button>
                )}
                <button
                  type="button"
                  className="text-red underline"
                  onClick={async () => {
                    if (!confirm("Delete this review?")) return;
                    const { error } = await sb.from("reviews").delete().eq("id", r.id);
                    if (!error) await removeReviewPhotos(r.photos ?? []);
                    load();
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {edit && (
        <ReviewEditor
          draft={edit}
          products={[{ id: productId, name_en: productName, slug: "" }]}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            load();
          }}
        />
      )}
    </Panel>
  );
}
