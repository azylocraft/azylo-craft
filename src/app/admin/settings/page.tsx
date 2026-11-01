"use client";

import { useEffect, useState } from "react";
import { AdminTitle, Panel } from "@/components/admin/AdminShell";
import { Btn } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Store details, exchange rates and Canadian tax rates. */
export default function AdminSettings() {
  const sb = supabaseBrowser();
  const [s, setS] = useState<any>(null);
  const [rates, setRates] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<any[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([
      sb.from("store_settings").select("*").eq("id", 1).single(),
      sb.from("exchange_rates").select("*").order("currency"),
      sb.from("tax_rates").select("*").order("province"),
    ]).then(([a, b, c]) => {
      setS(a.data);
      setRates(b.data ?? []);
      setTaxes(c.data ?? []);
    });
  }, [sb]);
  if (!s) return <div className="az-skeleton h-[400px] rounded-block" />;

  const field = (k: string, label: string) => (
    <label className="flex flex-col gap-1.5 text-xs font-bold">{label}<input className="field" value={s[k] ?? ""} onChange={(e) => setS({ ...s, [k]: e.target.value })} /></label>
  );

  const save = async () => {
    const { store_email, phone, address, map_url, opening_hours_en, play_store_url } = s;
    const r1 = await sb.from("store_settings").update({ store_email: store_email || null, phone: phone || null, address: address || null, map_url: map_url || null, opening_hours_en: opening_hours_en || null, play_store_url: play_store_url || null }).eq("id", 1);
    const r2 = await Promise.all(rates.map((r) => sb.from("exchange_rates").update({ rate_from_cad: r.rate_from_cad === "" || r.rate_from_cad == null ? null : Number(r.rate_from_cad) }).eq("currency", r.currency)));
    const r3 = await Promise.all(taxes.map((t) => sb.from("tax_rates").update({ gst: Number(t.gst), pst: Number(t.pst), hst: Number(t.hst) }).eq("province", t.province)));
    const err = r1.error ?? r2.find((x) => x.error)?.error ?? r3.find((x) => x.error)?.error;
    setMsg(err ? err.message : "Saved ✓");
  };

  return (
    <>
      <AdminTitle title="Settings" actions={<Btn onClick={save}>Save all</Btn>} />
      {msg && <p role="status" className="mb-4 text-sm font-bold text-green">{msg}</p>}
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Store details">
          <div className="grid gap-3">
            {field("store_email", "Store email")}
            {field("phone", "Phone")}
            {field("address", "Address")}
            {field("map_url", "Map link (optional)")}
            {field("opening_hours_en", "Opening hours")}
            {field("play_store_url", "Google Play URL (removes the Coming soon badge)")}
          </div>
        </Panel>
        <Panel title="Exchange rates (1 CAD = …)">
          {rates.map((r, i) => (
            <label key={r.currency} className="flex items-center justify-between gap-3 border-b border-line2 py-2 text-sm">
              <b>{r.currency}</b>
              <input className="field !min-h-10 w-32" disabled={r.currency === "CAD"} value={r.rate_from_cad ?? ""} onChange={(e) => setRates(rates.map((x, j) => (j === i ? { ...x, rate_from_cad: e.target.value.replace(/[^0-9.]/g, "") } : x)))} />
            </label>
          ))}
        </Panel>
        <Panel title="Canadian sales tax (%)" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="text-left text-xs uppercase text-muted"><tr><th className="p-2">Province</th><th className="p-2">GST</th><th className="p-2">PST/QST</th><th className="p-2">HST</th></tr></thead>
              <tbody>
                {taxes.map((t, i) => (
                  <tr key={t.province} className="border-t border-line2">
                    <td className="p-2">{t.name}</td>
                    {(["gst", "pst", "hst"] as const).map((k) => (
                      <td key={k} className="p-1.5"><input className="field !min-h-9 w-24" value={t[k]} onChange={(e) => setTaxes(taxes.map((x, j) => (j === i ? { ...x, [k]: e.target.value.replace(/[^0-9.]/g, "") } : x)))} aria-label={`${t.name} ${k}`} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </>
  );
}
