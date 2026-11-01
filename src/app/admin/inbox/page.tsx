"use client";

import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { AdminTitle } from "@/components/admin/AdminShell";
import { Badge } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Tab = "messages" | "questions" | "subscribers";

/** Inbox: contact & chat messages, product questions, newsletter subscribers (design screen 89). */
export default function AdminInbox() {
  const sb = supabaseBrowser();
  const [tab, setTab] = useState<Tab>("messages");
  const [rows, setRows] = useState<any[] | null>(null);
  const load = useCallback(() => {
    const q =
      tab === "messages"
        ? sb.from("contact_messages").select("*").order("created_at", { ascending: false })
        : tab === "questions"
          ? sb.from("product_questions").select("*, products ( name_en, slug )").order("created_at", { ascending: false })
          : sb.from("newsletter_subscribers").select("*").order("created_at", { ascending: false });
    q.limit(300).then(({ data }) => setRows(data ?? []));
  }, [sb, tab]);
  useEffect(load, [load]);

  const mark = async (id: string, status: string) => {
    await sb.from(tab === "messages" ? "contact_messages" : "product_questions").update({ status }).eq("id", id);
    load();
  };

  return (
    <>
      <AdminTitle title="Inbox" />
      <div className="mb-5 flex gap-1.5">
        {(["messages", "questions", "subscribers"] as const).map((t) => (
          <button key={t} type="button" onClick={() => { setRows(null); setTab(t); }} className={clsx("h-10 rounded-full border px-5 text-sm font-bold capitalize", tab === t ? "border-ink bg-ink text-white" : "border-line bg-white")}>
            {t === "questions" ? "Product questions" : t}
          </button>
        ))}
      </div>
      {rows === null ? (
        <div className="az-skeleton h-[300px] rounded-block" />
      ) : rows.length === 0 ? (
        <p className="rounded-block border border-line2 bg-white p-8 text-center text-muted">Nothing here yet.</p>
      ) : tab === "subscribers" ? (
        <div className="overflow-x-auto rounded-block border border-line2 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-[.1em] text-muted"><tr><th className="p-4">Email</th><th className="p-4">Source</th><th className="p-4">Status</th><th className="p-4">Since</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line2"><td className="p-4">{r.email}</td><td className="p-4">{r.source}</td><td className="p-4">{r.subscribed ? <Badge tone="green">Subscribed</Badge> : <Badge tone="grey">Unsubscribed</Badge>}</td><td className="p-4">{new Date(r.created_at).toLocaleDateString("en-IN")}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((r) => (
            <li key={r.id} className={clsx("rounded-block border bg-white p-5", r.status === "new" ? "border-gold-line" : "border-line2")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <b>{r.name}</b> <a href={`mailto:${r.email}`} className="text-sm text-gold underline">{r.email}</a>
                  {r.phone && <span className="text-sm text-muted"> · {r.phone}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {r.status === "new" && <Badge>New</Badge>}
                  {r.source === "chat" && <Badge tone="grey">Chat</Badge>}
                  <span className="text-xs text-muted">{new Date(r.created_at).toLocaleString("en-IN")}</span>
                </div>
              </div>
              {tab === "questions" && r.products && <p className="mt-1 text-xs text-muted">About: {r.products.name_en}</p>}
              {r.topic && <p className="mt-1 text-xs text-muted">Topic: {r.topic}{r.order_number ? ` · Order ${r.order_number}` : ""}</p>}
              <p className="mt-3 whitespace-pre-wrap text-sm">{r.message ?? r.question}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold">
                <a href={`mailto:${r.email}?subject=${encodeURIComponent("Re: your message to AZYLO")}`} onClick={() => mark(r.id, "replied")} className="underline">Reply by email</a>
                {r.status !== "read" && <button type="button" className="underline" onClick={() => mark(r.id, "read")}>Mark read</button>}
                <button type="button" className="underline" onClick={() => mark(r.id, "archived")}>Archive</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
