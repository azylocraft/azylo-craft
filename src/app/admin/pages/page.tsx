"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import { AdminTitle, Panel } from "@/components/admin/AdminShell";
import { MarkdownField } from "@/components/admin/MarkdownField";
import { Btn, BtnLink } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Policy pages (shipping, returns, privacy, terms): title and Markdown body. */
export default function AdminPages() {
  const sb = supabaseBrowser();
  const [pages, setPages] = useState<any[] | null>(null);
  const load = useCallback(() => {
    sb.from("pages").select("*").not("body_en", "is", null).order("slug").then(({ data }) => setPages(data ?? []));
  }, [sb]);
  useEffect(load, [load]);
  if (!pages) return <div className="az-skeleton h-[400px] rounded-block" />;
  return (
    <>
      <AdminTitle title="Pages" sub="Shipping, returns, privacy and terms. Saving updates the “Last updated” date on the page." />
      <div className="flex flex-col gap-6">
        {pages.map((p) => (
          <PageEditor key={p.id} p={p} onSaved={load} />
        ))}
      </div>
    </>
  );
}

function PageEditor({ p, onSaved }: { p: any; onSaved: () => void }) {
  const sb = supabaseBrowser();
  const [title, setTitle] = useState(p.title_en ?? "");
  const [body, setBody] = useState(p.body_en ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <Panel
      title={`/pages/${p.slug}`}
      actions={
        <BtnLink href={`/pages/${p.slug}`} target="_blank" size="sm" kind="light" iconL={ExternalLink}>
          View
        </BtnLink>
      }
    >
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-ink2">Title</span>
          <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <MarkdownField label="Page text" value={body} onChange={setBody} rows={14} />
        <div className="flex items-center gap-3">
          <Btn
            size="sm"
            iconL={Save}
            onClick={async () => {
              const { error } = await sb.from("pages").update({ title_en: title, body_en: body, last_updated: new Date().toISOString() }).eq("id", p.id);
              setMsg(error ? error.message : "Saved ✓");
              if (!error) onSaved();
            }}
          >
            Save
          </Btn>
          {msg && <span className="text-xs font-bold text-green">{msg}</span>}
        </div>
      </div>
    </Panel>
  );
}
