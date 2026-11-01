"use client";

import { useCallback, useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { AdminTitle, Panel } from "@/components/admin/AdminShell";
import { Btn } from "@/components/ui/primitives";
import { mediaUrl } from "@/lib/media";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uploadMedia } from "@/lib/upload";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Collection hero title, description and image. */
export default function AdminCollections() {
  const sb = supabaseBrowser();
  const [cols, setCols] = useState<any[] | null>(null);
  const load = useCallback(() => {
    sb.from("collections").select("*").order("sort_order").then(({ data }) => setCols(data ?? []));
  }, [sb]);
  useEffect(load, [load]);
  if (!cols) return <div className="az-skeleton h-[400px] rounded-block" />;
  return (
    <>
      <AdminTitle title="Collections" sub="Hero title, description and image shown at the top of each collection page." />
      <div className="grid gap-5 lg:grid-cols-2">
        {cols.map((c) => <CollectionCard key={c.id} c={c} onSaved={load} />)}
      </div>
    </>
  );
}

function CollectionCard({ c, onSaved }: { c: any; onSaved: () => void }) {
  const sb = supabaseBrowser();
  const [title, setTitle] = useState(c.title_en ?? "");
  const [desc, setDesc] = useState(c.description_en ?? "");
  const [img, setImg] = useState<string | null>(c.hero_image_path);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <Panel title={`/collections/${c.slug}`}>
      <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
        <label className="relative block cursor-pointer overflow-hidden rounded-tile bg-cream">
          {img ? <img src={mediaUrl(img)!} alt="" className="aspect-square w-full object-cover" /> : <span className="flex aspect-square items-center justify-center text-xs text-muted">No image</span>}
          <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold"><ImagePlus size={12} aria-hidden /> Change</span>
          <input type="file" accept="image/*" hidden onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            try { setImg(await uploadMedia(f, `collections/${c.slug}`)); setMsg("Image uploaded — click Save."); } catch (err) { setMsg((err as Error).message); }
          }} />
        </label>
        <div className="flex flex-col gap-3">
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" />
          <textarea className="field h-28 resize-none" value={desc} onChange={(e) => setDesc(e.target.value)} aria-label="Description" />
          <Btn size="sm" className="self-start" onClick={async () => {
            const { error } = await sb.from("collections").update({ title_en: title || null, description_en: desc || null, hero_image_path: img }).eq("id", c.id);
            setMsg(error ? error.message : "Saved ✓");
            onSaved();
          }}>Save</Btn>
          {msg && <p className="text-xs font-bold text-green">{msg}</p>}
        </div>
      </div>
    </Panel>
  );
}
