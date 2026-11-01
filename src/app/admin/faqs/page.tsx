"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { AdminTitle, Panel } from "@/components/admin/AdminShell";
import { MarkdownField } from "@/components/admin/MarkdownField";
import { Btn } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

const GROUPS = [
  ["shipping", "Shipping & payment"],
  ["orders", "Order information & concerns"],
  ["returns", "Returns & refunds"],
  ["products", "Products & customization"],
] as const;

const newSlug = () => `faq-${crypto.randomUUID().slice(0, 8)}`;

/**
 * FAQ editor. Shipping, order and returns questions marked "Show on product pages" fill section
 * 03 "Shipping, payment & returns" on every product; all questions appear on the FAQ page.
 */
export default function AdminFaqs() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<any[] | null>(null);
  const load = useCallback(() => {
    sb.from("faqs").select("*").order("faq_group").order("sort_order").then(({ data }) => setRows(data ?? []));
  }, [sb]);
  useEffect(load, [load]);
  if (!rows) return <div className="az-skeleton h-[400px] rounded-block" />;

  const add = async (group: string) => {
    const order = rows.filter((r) => r.faq_group === group).length;
    const { error } = await sb.from("faqs").insert({
      faq_group: group,
      slug: newSlug(),
      question_en: "New question",
      answer_en: "",
      show_on_product: group !== "products",
      sort_order: order,
      is_demo: false,
    });
    if (error) alert(error.message);
    load();
  };
  const move = async (list: any[], i: number, dir: -1 | 1) => {
    const a = list[i];
    const b = list[i + dir];
    if (!b) return;
    await sb.from("faqs").update({ sort_order: b.sort_order }).eq("id", a.id);
    await sb.from("faqs").update({ sort_order: a.sort_order }).eq("id", b.id);
    load();
  };

  return (
    <>
      <AdminTitle title="FAQs" sub="Questions on the FAQ page and in “03 Shipping, payment & returns” on every product page." />
      <div className="flex flex-col gap-6">
        {GROUPS.map(([g, label]) => {
          const list = rows.filter((r) => r.faq_group === g);
          return (
            <Panel key={g} title={label} actions={<Btn size="sm" kind="light" iconL={Plus} onClick={() => add(g)}>Add question</Btn>}>
              {g === "products" && <p className="mb-3 text-xs text-muted">Shown on the FAQ page only.</p>}
              <div className="flex flex-col gap-4">
                {list.length === 0 && <p className="text-sm text-muted">No questions yet.</p>}
                {list.map((r, i) => (
                  <FaqRow
                    key={r.id}
                    r={r}
                    onSaved={load}
                    onUp={i > 0 ? () => move(list, i, -1) : undefined}
                    onDown={i < list.length - 1 ? () => move(list, i, 1) : undefined}
                  />
                ))}
              </div>
            </Panel>
          );
        })}
      </div>
    </>
  );
}

function FaqRow({ r, onSaved, onUp, onDown }: { r: any; onSaved: () => void; onUp?: () => void; onDown?: () => void }) {
  const sb = supabaseBrowser();
  const [q, setQ] = useState(r.question_en ?? "");
  const [a, setA] = useState(r.answer_en ?? "");
  const [group, setGroup] = useState(r.faq_group);
  const [onProduct, setOnProduct] = useState(!!r.show_on_product);
  const [msg, setMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const dirty = q !== (r.question_en ?? "") || a !== (r.answer_en ?? "") || group !== r.faq_group || onProduct !== !!r.show_on_product;

  const save = async () => {
    const { error } = await sb.from("faqs").update({ question_en: q.trim(), answer_en: a, faq_group: group, show_on_product: onProduct, is_demo: false }).eq("id", r.id);
    setMsg(error ? error.message : "Saved ✓");
    if (!error) onSaved();
  };
  return (
    <div className="rounded-tile border border-line2 bg-bg2 p-4">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => setOpen(!open)} className="flex-1 text-left text-sm font-bold">
          {q || "Untitled question"} {dirty && <span className="ml-1 text-xs font-normal text-gold">• unsaved</span>}
        </button>
        <button type="button" aria-label="Move up" disabled={!onUp} onClick={onUp} className="flex size-8 items-center justify-center rounded-full border border-line bg-white disabled:opacity-30">
          <ArrowUp size={14} aria-hidden />
        </button>
        <button type="button" aria-label="Move down" disabled={!onDown} onClick={onDown} className="flex size-8 items-center justify-center rounded-full border border-line bg-white disabled:opacity-30">
          <ArrowDown size={14} aria-hidden />
        </button>
        <button type="button" onClick={() => setOpen(!open)} className="h-8 rounded-full border border-line bg-white px-3 text-xs font-bold">
          {open ? "Close" : "Edit"}
        </button>
      </div>
      {open && (
        <div className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-ink2">Question</span>
            <input className="field" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <MarkdownField label="Answer" value={a} onChange={setA} rows={8} />
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              Group
              <select className="field !min-h-9 !w-auto py-1" value={group} onChange={(e) => setGroup(e.target.value)}>
                {GROUPS.map(([g, l]) => (
                  <option key={g} value={g}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={onProduct} onChange={(e) => setOnProduct(e.target.checked)} className="size-4 accent-[var(--az-ink)]" />
              Show on product pages
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Btn size="sm" iconL={Save} onClick={save}>
              Save
            </Btn>
            <Btn
              size="sm"
              kind="light"
              iconL={Trash2}
              className="!text-red"
              onClick={async () => {
                if (!confirm(`Delete “${q}”?`)) return;
                await sb.from("faqs").delete().eq("id", r.id);
                onSaved();
              }}
            >
              Delete
            </Btn>
            {msg && <span className="text-xs font-bold text-green">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
