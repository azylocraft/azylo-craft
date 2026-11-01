"use client";

import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import { AdminTitle, Panel } from "@/components/admin/AdminShell";
import { STATUS_LABEL } from "@/components/account/AccountPortal";
import { Badge, Btn } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */
const STATUSES = ["paid", "confirmed", "in_production", "shipped", "delivered", "cancelled", "refunded", "pending"];

/** Orders list + detail with status/tracking updates (design screens 87–88). */
export default function AdminOrders() {
  const sb = supabaseBrowser();
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState<any[] | null>(null);
  const [open, setOpen] = useState<any | null>(null);
  const load = useCallback(() => {
    let q = sb.from("orders").select("*, order_items (*)").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") q = q.eq("status", filter);
    q.then(({ data }) => setOrders(data ?? []));
  }, [sb, filter]);
  useEffect(load, [load]);

  return (
    <>
      <AdminTitle title="Orders" sub="Update status and tracking — customers see changes on their order page." />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {["all", ...STATUSES].map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={clsx("h-9 rounded-full border px-4 text-xs font-bold", filter === s ? "border-ink bg-ink text-white" : "border-line bg-white")}>
            {s === "all" ? "All" : STATUS_LABEL[s]}
          </button>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <div className="overflow-x-auto rounded-block border border-line2 bg-white">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line text-left text-xs uppercase tracking-[.1em] text-muted">
              <tr><th className="p-4">Order</th><th className="p-4">Date</th><th className="p-4">Customer</th><th className="p-4">Status</th><th className="p-4 text-right">Total</th></tr>
            </thead>
            <tbody>
              {orders?.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted">No orders yet.</td></tr>}
              {orders?.map((o) => (
                <tr key={o.id} onClick={() => setOpen(o)} className={clsx("cursor-pointer border-b border-line2 hover:bg-bg2", open?.id === o.id && "bg-gold-soft")}>
                  <td className="p-4 font-bold">#{o.order_number}</td>
                  <td className="p-4">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-4">{o.email}</td>
                  <td className="p-4"><Badge tone={o.status === "delivered" ? "green" : o.status === "cancelled" ? "red" : "gold"}>{STATUS_LABEL[o.status]}</Badge></td>
                  <td className="p-4 text-right">₹{Number(o.total_inr).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {open ? <OrderEditor key={open.id} order={open} onSaved={() => { load(); }} /> : <Panel><p className="text-sm text-muted">Select an order to see its details.</p></Panel>}
      </div>
    </>
  );
}

function OrderEditor({ order, onSaved }: { order: any; onSaved: () => void }) {
  const sb = supabaseBrowser();
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [url, setUrl] = useState(order.tracking_url ?? "");
  const [msg, setMsg] = useState<string | null>(null);
  const a = order.shipping_address ?? {};
  return (
    <Panel title={`Order #${order.order_number}`}>
      <p className="text-sm text-muted">{order.email} · {new Date(order.created_at).toLocaleString("en-IN")}</p>
      <ul className="mt-4 divide-y divide-line2 text-sm">
        {order.order_items.map((it: any) => (
          <li key={it.id} className="flex justify-between gap-3 py-2">
            <span><b>{it.product_name}</b><br /><span className="text-muted">{it.variant_label} × {it.quantity}{it.custom_color ? " · custom colour" : ""}</span></span>
            <span>₹{(Number(it.unit_price_inr) * it.quantity).toLocaleString("en-IN")}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-right font-extrabold">Total ₹{Number(order.total_inr).toLocaleString("en-IN")}</p>
      <p className="mt-3 text-sm"><b>Ship to:</b> {a.first_name} {a.last_name}, {a.line1}, {a.city} {a.province} {a.postal_code}, {a.country}</p>
      {order.note && <p className="mt-2 text-sm"><b>Note:</b> {order.note}</p>}
      <div className="mt-5 grid gap-3">
        <label className="flex flex-col gap-1.5 text-xs font-bold">Status
          <select className="field" value={status} onChange={(e) => setStatus(e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold">Tracking number<input className="field" value={tracking} onChange={(e) => setTracking(e.target.value)} /></label>
        <label className="flex flex-col gap-1.5 text-xs font-bold">Tracking link<input className="field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" /></label>
        <Btn onClick={async () => {
          const { error } = await sb.from("orders").update({ status, tracking_number: tracking || null, tracking_url: url || null }).eq("id", order.id);
          setMsg(error ? error.message : "Saved ✓");
          if (!error) onSaved();
        }}>Save changes</Btn>
        {msg && <p role="status" className="text-sm font-bold text-green">{msg}</p>}
      </div>
    </Panel>
  );
}
