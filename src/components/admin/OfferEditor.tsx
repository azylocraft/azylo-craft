"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Panel } from "@/components/admin/AdminShell";
import { Btn } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

type Bonus = { title: string; value_inr: string };

/** Admin: per-product bonuses (value stack) and guarantee shown in the "Your offer" box. */
export function OfferEditor({ productId }: { productId: string }) {
  const sb = supabaseBrowser();
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [days, setDays] = useState("");
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await sb.from("products").select("bonuses, guarantee_days, guarantee_text").eq("id", productId).maybeSingle();
    setBonuses(((data?.bonuses as { title: string; value_inr?: number | null }[]) ?? []).map((b) => ({ title: b.title, value_inr: b.value_inr ? String(b.value_inr) : "" })));
    setDays(data?.guarantee_days ? String(data.guarantee_days) : "");
    setText((data?.guarantee_text as string) ?? "");
  }, [sb, productId]);
  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const save = async () => {
    const clean = bonuses.filter((b) => b.title.trim()).map((b) => ({ title: b.title.trim(), value_inr: b.value_inr ? Number(b.value_inr) : null }));
    const { error } = await sb
      .from("products")
      .update({ bonuses: clean, guarantee_days: days ? Number(days) : null, guarantee_text: text.trim() || null })
      .eq("id", productId);
    setMsg(error ? error.message : "Saved ✓");
    if (!error) load();
  };

  return (
    <Panel
      title="Offer & guarantee"
      className="mt-5"
      actions={<Btn size="sm" kind="light" iconL={Plus} onClick={() => setBonuses([...bonuses, { title: "", value_inr: "" }])}>Add bonus</Btn>}
    >
      <p className="mb-3 text-xs text-muted">
        Bonuses appear in the &quot;Your offer&quot; box on the product page, with an optional ₹ value (shown struck through as &quot;Included&quot;). Only list things
        you really include, at values you can justify. Store-wide bonuses for every product are set in Settings.
      </p>
      <div className="flex flex-col gap-2">
        {bonuses.map((b, i) => (
          <div key={i} className="flex gap-2">
            <input className="field !min-h-10 flex-1" placeholder="e.g. Free matching cushion" value={b.title} onChange={(e) => setBonuses(bonuses.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} aria-label="Bonus" />
            <input className="field !min-h-10 w-32" inputMode="numeric" placeholder="Value ₹ (optional)" value={b.value_inr} onChange={(e) => setBonuses(bonuses.map((x, j) => (j === i ? { ...x, value_inr: e.target.value.replace(/\D/g, "") } : x)))} aria-label="Value" />
            <button type="button" aria-label="Remove bonus" onClick={() => setBonuses(bonuses.filter((_, j) => j !== i))} className="p-2 text-red"><Trash2 size={15} aria-hidden /></button>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[160px_1fr]">
        <label className="flex flex-col gap-1.5 text-xs font-bold">
          Guarantee (days)
          <input className="field" inputMode="numeric" placeholder="e.g. 30" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ""))} />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-bold">
          Guarantee terms (one sentence, must match your refund policy)
          <input className="field" placeholder="e.g. Not comfortable? Tell us within 30 days of delivery and we'll make it right." value={text} onChange={(e) => setText(e.target.value)} />
        </label>
      </div>
      <div className="mt-4 flex items-center justify-end gap-3">
        {msg && <span role="status" className={`text-sm font-bold ${msg.startsWith("Saved") ? "text-green" : "text-red"}`}>{msg}</span>}
        <Btn iconL={Save} onClick={save}>Save offer</Btn>
      </div>
    </Panel>
  );
}

type Settings = {
  campaign_title: string; campaign_code: string; campaign_ends_at: string;
  bundle_min_items: string; bundle_percent: string; low_stock_threshold: string; emi_months: string;
  email_popup_enabled: boolean; email_popup_code: string; bonuses_default: Bonus[];
};

/** Admin → Settings: launch campaign, bundle rule, store-wide bonuses, email popup, thresholds. */
export function GrowthSettings() {
  const sb = supabaseBrowser();
  const [s, setS] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    sb.from("store_settings").select("*").eq("id", 1).single().then(({ data: d }) => {
      if (!d) return;
      setS({
        campaign_title: d.campaign_title ?? "", campaign_code: d.campaign_code ?? "",
        campaign_ends_at: d.campaign_ends_at ? new Date(d.campaign_ends_at).toISOString().slice(0, 16) : "",
        bundle_min_items: String(d.bundle_min_items ?? 2), bundle_percent: String(d.bundle_percent ?? 0),
        low_stock_threshold: String(d.low_stock_threshold ?? 5), emi_months: String(d.emi_months ?? 12),
        email_popup_enabled: !!d.email_popup_enabled, email_popup_code: d.email_popup_code ?? "",
        bonuses_default: ((d.bonuses_default as { title: string; value_inr?: number | null }[]) ?? []).map((b) => ({ title: b.title, value_inr: b.value_inr ? String(b.value_inr) : "" })),
      });
    });
  }, [sb]);
  if (!s) return null;

  const save = async () => {
    setMsg(null);
    const codes = [s.campaign_code, s.email_popup_code].filter(Boolean);
    if (codes.length) {
      const { data } = await sb.from("discounts").select("code").in("code", codes);
      const known = new Set((data ?? []).map((r: { code: string }) => r.code.toLowerCase()));
      const missing = codes.filter((c) => !known.has(c.toLowerCase()));
      if (missing.length) return setMsg(`Create discount code(s) first: ${missing.join(", ")}`);
    }
    const { error } = await sb
      .from("store_settings")
      .update({
        campaign_title: s.campaign_title.trim() || null,
        campaign_code: s.campaign_code.trim() || null,
        campaign_ends_at: s.campaign_ends_at ? new Date(s.campaign_ends_at).toISOString() : null,
        bundle_min_items: Math.max(2, Number(s.bundle_min_items) || 2),
        bundle_percent: Math.min(50, Number(s.bundle_percent) || 0),
        low_stock_threshold: Number(s.low_stock_threshold) || 0,
        emi_months: Math.min(36, Math.max(3, Number(s.emi_months) || 12)),
        email_popup_enabled: s.email_popup_enabled,
        email_popup_code: s.email_popup_code.trim() || null,
        bonuses_default: s.bonuses_default.filter((b) => b.title.trim()).map((b) => ({ title: b.title.trim(), value_inr: b.value_inr ? Number(b.value_inr) : null })),
      })
      .eq("id", 1);
    setMsg(error ? error.message : "Saved ✓ — live on the store within a minute.");
  };

  const field = (k: keyof Settings, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="flex flex-col gap-1.5 text-xs font-bold">
      {label}
      <input className="field" value={String(s[k] ?? "")} onChange={(e) => setS({ ...s, [k]: e.target.value })} {...props} />
    </label>
  );

  return (
    <Panel title="Offers & conversion" className="xl:col-span-2">
      <p className="mb-4 text-xs text-muted">
        Everything here must be true: the campaign ends when you say it ends (the countdown never restarts), the bundle discount is really applied at checkout,
        and &quot;Only N left&quot; appears only when a variant&apos;s real stock is at or below the threshold.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {field("campaign_title", "Campaign banner text", { placeholder: "e.g. Launch offer: 10% off everything" })}
        {field("campaign_code", "Campaign discount code", { placeholder: "e.g. WELCOME10" })}
        {field("campaign_ends_at", "Campaign ends (date & time)", { type: "datetime-local" })}
        {field("bundle_percent", "Bundle discount %", { inputMode: "decimal", placeholder: "0 = off" })}
        {field("bundle_min_items", "Bundle minimum pieces", { inputMode: "numeric" })}
        {field("emi_months", "EMI months shown", { inputMode: "numeric" })}
        {field("low_stock_threshold", "Show 'Only N left' at or below", { inputMode: "numeric" })}
        {field("email_popup_code", "Welcome popup code", { placeholder: "e.g. WELCOME10" })}
        <label className="flex items-center gap-3 self-end pb-3 text-sm font-bold">
          <input type="checkbox" checked={s.email_popup_enabled} onChange={(e) => setS({ ...s, email_popup_enabled: e.target.checked })} className="size-5 accent-[var(--az-ink)]" />
          Show welcome email popup
        </label>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold">Bonuses included with every product</span>
          <Btn size="sm" kind="light" iconL={Plus} onClick={() => setS({ ...s, bonuses_default: [...s.bonuses_default, { title: "", value_inr: "" }] })}>Add</Btn>
        </div>
        {s.bonuses_default.map((b, i) => (
          <div key={i} className="mb-2 flex gap-2">
            <input className="field !min-h-10 flex-1" value={b.title} placeholder="e.g. Free fabric samples before you order" onChange={(e) => setS({ ...s, bonuses_default: s.bonuses_default.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} aria-label="Bonus" />
            <input className="field !min-h-10 w-32" inputMode="numeric" placeholder="Value ₹" value={b.value_inr} onChange={(e) => setS({ ...s, bonuses_default: s.bonuses_default.map((x, j) => (j === i ? { ...x, value_inr: e.target.value.replace(/\D/g, "") } : x)) })} aria-label="Value" />
            <button type="button" aria-label="Remove" onClick={() => setS({ ...s, bonuses_default: s.bonuses_default.filter((_, j) => j !== i) })} className="p-2 text-red"><Trash2 size={15} aria-hidden /></button>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-end gap-3">
        {msg && <span role="status" className={`text-sm font-bold ${msg.startsWith("Saved") ? "text-green" : "text-red"}`}>{msg}</span>}
        <Btn iconL={Save} onClick={save}>Save offers</Btn>
      </div>
    </Panel>
  );
}
