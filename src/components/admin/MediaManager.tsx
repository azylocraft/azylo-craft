"use client";

import clsx from "clsx";
import { useRef, useState } from "react";
import { GripVertical, ImagePlus, Trash2, Upload, Video } from "lucide-react";
import { Panel } from "@/components/admin/AdminShell";
import { Btn } from "@/components/ui/primitives";
import { mediaUrl } from "@/lib/media";
import { supabaseBrowser } from "@/lib/supabase/client";
import { removeMedia, uploadMedia } from "@/lib/upload";

export const IMAGE_TYPES = [
  ["studio", "Studio / gallery"],
  ["real_space", "Live photo (real home)"],
  ["swatch", "Swatch / fabric"],
  ["detail", "Detail / mechanism / spec"],
] as const;

export type Img = { id: string; storage_path: string; image_type: string; alt_en: string | null; sort_order: number; color_en?: string | null };
export type Vid = { id: string; storage_path: string; poster_path: string | null; title_en: string | null; sort_order: number };

type Job = { name: string; pct: number; error?: string };

/** Upload, type, caption, reorder (drag) and delete product photos and videos. */
export function MediaManager({ productId, slug, images, videos, onChange, colors = [] }: { productId: string; slug: string; images: Img[]; videos: Vid[]; onChange: () => void; colors?: string[] }) {
  const sb = supabaseBrowser();
  const [type, setType] = useState<string>("studio");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drag, setDrag] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const imgInput = useRef<HTMLInputElement>(null);
  const vidInput = useRef<HTMLInputElement>(null);
  const [dropping, setDropping] = useState(false);

  const run = async (files: File[], kind: "image" | "video") => {
    const start = (kind === "image" ? images : videos).reduce((m, x) => Math.max(m, x.sort_order), -1) + 1;
    setJobs(files.map((f) => ({ name: f.name, pct: 0 })));
    for (const [i, f] of files.entries()) {
      const isVideo = f.type.startsWith("video/");
      if ((kind === "video") !== isVideo) {
        setJobs((js) => js.map((j, k) => (k === i ? { ...j, error: `Not a ${kind} file` } : j)));
        continue;
      }
      try {
        const path = await uploadMedia(f, `products/${slug}/${kind === "video" ? "videos" : type}`, (pct) => setJobs((js) => js.map((j, k) => (k === i ? { ...j, pct } : j))));
        const { error } =
          kind === "video"
            ? await sb.from("product_videos").insert({ product_id: productId, storage_path: path, title_en: f.name.replace(/\.[^.]+$/, ""), sort_order: start + i })
            : await sb.from("product_images").insert({ product_id: productId, storage_path: path, image_type: type, alt_en: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), sort_order: start + i });
        if (error) throw new Error(error.message);
      } catch (e) {
        setJobs((js) => js.map((j, k) => (k === i ? { ...j, error: (e as Error).message } : j)));
      }
    }
    onChange();
    setTimeout(() => setJobs((js) => js.filter((j) => j.error)), 1500);
  };

  const reorder = async (fromId: string, toId: string) => {
    const list = [...images].sort((a, b) => a.sort_order - b.sort_order);
    const from = list.findIndex((x) => x.id === fromId);
    const to = list.findIndex((x) => x.id === toId);
    if (from < 0 || to < 0 || from === to) return;
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    await Promise.all(list.map((x, i) => (x.sort_order !== i ? sb.from("product_images").update({ sort_order: i }).eq("id", x.id) : null)));
    onChange();
  };

  const shown = [...images].sort((a, b) => a.sort_order - b.sort_order).filter((i) => filter === "all" || i.image_type === filter);

  return (
    <Panel title="Photos & videos">
      <div
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setDropping(true);
          }
        }}
        onDragLeave={() => setDropping(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setDropping(false);
          const files = [...e.dataTransfer.files];
          const vids = files.filter((f) => f.type.startsWith("video/"));
          const imgs = files.filter((f) => f.type.startsWith("image/"));
          if (imgs.length) run(imgs, "image");
          if (vids.length) run(vids, "video");
        }}
        className={clsx("flex flex-col items-center gap-3 rounded-tile border-2 border-dashed p-6 text-center", dropping ? "border-gold bg-gold-soft" : "border-line bg-bg2")}
      >
        <Upload size={22} className="text-gold" aria-hidden />
        <p className="text-sm font-bold">Drag photos or videos here</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <label className="text-xs font-bold text-muted">
            Upload photos as{" "}
            <select value={type} onChange={(e) => setType(e.target.value)} className="ml-1 h-9 rounded-full border border-line bg-white px-3 text-xs font-bold text-ink">
              {IMAGE_TYPES.map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
          <Btn size="sm" iconL={ImagePlus} onClick={() => imgInput.current?.click()}>Choose photos</Btn>
          <Btn size="sm" kind="outline" iconL={Video} onClick={() => vidInput.current?.click()}>Choose videos</Btn>
        </div>
        <p className="text-xs text-faint">JPG, PNG, WebP · MP4, WebM, MOV · max 50 MB each</p>
        <input ref={imgInput} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && run([...e.target.files], "image")} />
        <input ref={vidInput} type="file" accept="video/mp4,video/webm,video/quicktime" multiple hidden onChange={(e) => e.target.files && run([...e.target.files], "video")} />
      </div>

      {jobs.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {jobs.map((j, i) => (
            <li key={i} className="text-xs">
              <div className="flex justify-between"><span className="truncate">{j.name}</span><span className={j.error ? "text-red" : ""}>{j.error ?? `${j.pct}%`}</span></div>
              {!j.error && <div className="mt-1 h-1.5 rounded bg-line"><div className="h-1.5 rounded bg-gold transition-all" style={{ width: `${j.pct}%` }} /></div>}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap gap-1.5">
        {[["all", "All"], ...IMAGE_TYPES].map(([v, l]) => {
          const n = v === "all" ? images.length : images.filter((i) => i.image_type === v).length;
          return (
            <button key={v} type="button" onClick={() => setFilter(v)} className={clsx("h-8 rounded-full border px-3 text-xs font-bold", filter === v ? "border-ink bg-ink text-white" : "border-line bg-white")}>
              {l.split(" ")[0]} · {n}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted">Drag cards to reorder. The first studio photo is the product&apos;s main image.</p>
      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {shown.map((img) => (
          <li
            key={img.id}
            draggable
            onDragStart={() => setDrag(img.id)}
            onDragOver={(e) => drag && e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (drag) reorder(drag, img.id);
              setDrag(null);
            }}
            className={clsx("overflow-hidden rounded-tile border bg-white", drag === img.id ? "border-gold opacity-50" : "border-line2")}
          >
            <div className="relative">
              <img src={mediaUrl(img.storage_path)!} alt={img.alt_en ?? ""} className="aspect-[4/3] w-full object-cover" />
              <span className="absolute left-2 top-2 flex size-7 cursor-grab items-center justify-center rounded-full bg-white/90" title="Drag to reorder"><GripVertical size={14} aria-hidden /></span>
              <button
                type="button"
                aria-label="Delete photo"
                onClick={async () => {
                  if (!confirm("Delete this photo?")) return;
                  await sb.from("product_images").delete().eq("id", img.id);
                  if (!img.storage_path.startsWith("demo/")) await removeMedia(img.storage_path);
                  onChange();
                }}
                className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-red"
              >
                <Trash2 size={13} aria-hidden />
              </button>
            </div>
            <div className="flex flex-col gap-1.5 p-2">
              <select
                aria-label="Image type"
                value={img.image_type}
                onChange={async (e) => {
                  await sb.from("product_images").update({ image_type: e.target.value }).eq("id", img.id);
                  onChange();
                }}
                className="h-8 rounded-lg border border-line px-2 text-xs"
              >
                {IMAGE_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              {colors.length > 0 && (
                <select
                  aria-label="Colour shown in this photo"
                  title="Colour shown in this photo — choosing that colour on the product page shows this photo first"
                  value={img.color_en ?? ""}
                  onChange={async (e) => {
                    await sb.from("product_images").update({ color_en: e.target.value || null }).eq("id", img.id);
                    onChange();
                  }}
                  className="h-8 rounded-lg border border-line px-2 text-xs"
                >
                  <option value="">No colour</option>
                  {colors.map((c) => <option key={c} value={c}>Colour: {c}</option>)}
                </select>
              )}
              <input
                aria-label="Alt text"
                defaultValue={img.alt_en ?? ""}
                placeholder="Alt text (describes the photo)"
                onBlur={(e) => e.target.value !== (img.alt_en ?? "") && sb.from("product_images").update({ alt_en: e.target.value || null }).eq("id", img.id)}
                className="h-8 rounded-lg border border-line px-2 text-xs"
              />
            </div>
          </li>
        ))}
      </ul>

      <h3 className="mt-7 text-sm font-extrabold">Product videos · {videos.length}</h3>
      {videos.length === 0 ? (
        <p className="mt-2 text-xs text-muted">No videos — the &quot;Product video&quot; button is hidden on the product page.</p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {videos.map((v) => (
            <li key={v.id} className="overflow-hidden rounded-tile border border-line2 bg-black">
              <video src={mediaUrl(v.storage_path)!} muted playsInline preload="metadata" className="aspect-[9/16] w-full object-cover" />
              <div className="flex items-center justify-between gap-2 bg-white p-2 text-xs">
                <span className="truncate">{v.title_en}</span>
                <button
                  type="button"
                  aria-label="Delete video"
                  onClick={async () => {
                    if (!confirm("Delete this video?")) return;
                    await sb.from("product_videos").delete().eq("id", v.id);
                    await removeMedia(v.storage_path);
                    onChange();
                  }}
                  className="text-red"
                >
                  <Trash2 size={13} aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
