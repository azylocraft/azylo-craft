"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Check, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "@/components/account/AccountDrawer";
import { Field } from "@/components/product/ProductView";
import { Modal, Overlay } from "@/components/shop/Overlay";
import { Price, useHydrated } from "@/components/shop/ShopContext";
import { Badge, Btn, BtnLink, Card, Eyebrow, H, P } from "@/components/ui/primitives";
import { firstName, refreshProfile, useAuth } from "@/lib/auth";
import { supabaseBrowser } from "@/lib/supabase/client";

type Address = { id: string; first_name: string; last_name: string; line1: string; line2: string | null; city: string; province: string | null; postal_code: string; country: string; phone: string | null; is_default: boolean };
type OrderRow = {
  id: string; order_number: number; status: string; total_inr: number; subtotal_inr: number; tax_inr: number; shipping_inr: number; discount_inr: number;
  created_at: string; tracking_number: string | null; tracking_url: string | null; shipping_address: Record<string, string>;
  order_items: { product_name: string; variant_label: string | null; quantity: number; unit_price_inr: number }[];
  order_status_events: { status: string; created_at: string }[];
};

export const STATUS_STEPS = ["paid", "confirmed", "in_production", "shipped", "delivered"] as const;
export const STATUS_LABEL: Record<string, string> = { pending: "Awaiting payment", paid: "Placed", confirmed: "Confirmed", in_production: "In production", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled", refunded: "Refunded" };

export function AccountPortal() {
  const sp = useSearchParams();
  const router = useRouter();
  const hydrated = useHydrated();
  const { user, profile, ready } = useAuth();
  const tab = sp.get("tab") === "profile" ? "profile" : "orders";
  const orderId = sp.get("order");

  if (!hydrated || !ready) return <div className="az-skeleton mx-4 mt-8 h-[400px] rounded-block md:mx-12" />;
  if (!user) {
    router.replace("/auth/login?next=/account");
    return null;
  }
  const initial = (firstName(profile, user) || "?").charAt(0).toUpperCase();

  return (
    <div className="px-4 pt-8 md:px-12">
      <div className="flex items-center justify-between">
        <div>
          <Eyebrow>AZYLO · Your account</Eyebrow>
          <H as="h1" className="mt-3 text-[34px] md:text-[44px]">Hi, {firstName(profile, user)}</H>
        </div>
        <span className="flex size-12 items-center justify-center rounded-full bg-ink text-lg font-extrabold text-white" aria-hidden>
          {initial}
        </span>
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 lg:flex-col" aria-label="Account sections">
          {(["orders", "profile"] as const).map((k) => (
            <Link key={k} href={k === "orders" ? "/account" : "/account?tab=profile"} aria-current={tab === k ? "page" : undefined} className={clsx("flex h-11 items-center rounded-full px-5 text-sm font-bold capitalize", tab === k ? "bg-ink text-white" : "text-muted hover:bg-white")}>
              {k}
            </Link>
          ))}
          {profile?.role === "admin" && (
            <Link href="/admin" className="flex h-11 items-center rounded-full px-5 text-sm font-bold text-gold hover:bg-white">
              Admin panel
            </Link>
          )}
        </nav>
        <div>{tab === "profile" ? <Profile /> : orderId ? <OrderDetail id={orderId} /> : <Orders />}</div>
      </div>
    </div>
  );
}

function Orders() {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  useEffect(() => {
    supabaseBrowser()
      .from("orders")
      .select("id, order_number, status, total_inr, created_at, order_items ( quantity )")
      .neq("status", "pending")
      .order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data as unknown as OrderRow[]) ?? []));
  }, []);
  if (!orders) return <div className="az-skeleton h-[220px] rounded-block" />;
  if (orders.length === 0)
    return (
      <Card className="flex flex-col items-start gap-4 md:p-10">
        <H className="text-[28px]">Welcome, {firstName(profile, user)}</H>
        <P>Ready to shop? Your orders will appear here once you place one.</P>
        <BtnLink href="/collections/all">Shop now</BtnLink>
      </Card>
    );
  return (
    <div className="flex flex-col gap-3">
      {orders.map((o) => (
        <Link key={o.id} href={`/account?order=${o.id}`} className="grid grid-cols-2 gap-3 rounded-card border border-line2 bg-white p-5 hover:border-ink md:grid-cols-5 md:items-center">
          <b>#{o.order_number}</b>
          <span className="text-sm text-muted">{new Date(o.created_at).toLocaleDateString("en-CA", { dateStyle: "medium" })}</span>
          <span><Badge tone={o.status === "delivered" ? "green" : o.status === "cancelled" ? "red" : "gold"}>{STATUS_LABEL[o.status]}</Badge></span>
          <span className="text-sm text-muted">{o.order_items.reduce((n, i) => n + i.quantity, 0)} item(s)</span>
          <b className="md:text-right"><Price cad={Number(o.total_inr)} /></b>
        </Link>
      ))}
    </div>
  );
}

function OrderDetail({ id }: { id: string }) {
  const [o, setO] = useState<OrderRow | null | undefined>(undefined);
  useEffect(() => {
    supabaseBrowser()
      .from("orders")
      .select("*, order_items (*), order_status_events ( status, created_at )")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => setO(data as OrderRow | null));
  }, [id]);
  if (o === undefined) return <div className="az-skeleton h-[300px] rounded-block" />;
  if (!o) return <P>Order not found.</P>;
  const reached = new Set(o.order_status_events.map((e) => e.status));
  const a = o.shipping_address;
  return (
    <div className="flex flex-col gap-5">
      <Link href="/account" className="flex items-center gap-2 text-sm font-bold">
        <ArrowLeft size={15} aria-hidden /> All orders
      </Link>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <H className="text-[26px]">Order #{o.order_number}</H>
          <Badge>{STATUS_LABEL[o.status]}</Badge>
        </div>
        <ol className="mt-6 grid gap-3 sm:grid-cols-5">
          {STATUS_STEPS.map((s) => {
            const on = reached.has(s) || STATUS_STEPS.indexOf(s) <= STATUS_STEPS.indexOf(o.status as (typeof STATUS_STEPS)[number]);
            return (
              <li key={s} className="flex items-center gap-2 sm:flex-col sm:items-start">
                <span className={clsx("flex size-8 items-center justify-center rounded-full", on ? "bg-ink text-white" : "border border-line text-faint")}>
                  {on ? <Check size={14} aria-hidden /> : null}
                </span>
                <span className={clsx("text-sm font-bold", !on && "text-faint")}>{STATUS_LABEL[s]}</span>
              </li>
            );
          })}
        </ol>
        {o.tracking_number && (
          <p className="mt-5 text-sm">
            Tracking: <b>{o.tracking_number}</b>{" "}
            {o.tracking_url && (
              <a href={o.tracking_url} target="_blank" rel="noreferrer" className="font-bold text-gold underline">
                Track package
              </a>
            )}
          </p>
        )}
      </Card>
      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <Card>
          <H className="mb-3 text-lg">Items</H>
          {o.order_items.map((it, i) => (
            <div key={i} className="flex justify-between gap-3 border-b border-line2 py-3 text-sm last:border-0">
              <span>
                <b>{it.product_name}</b>
                <br />
                <span className="text-muted">{it.variant_label} · ×{it.quantity}</span>
              </span>
              <Price cad={Number(it.unit_price_inr) * it.quantity} />
            </div>
          ))}
          <dl className="mt-3 flex flex-col gap-1 text-sm">
            {[["Subtotal", o.subtotal_inr], ["Discount", -o.discount_inr], ["Shipping", o.shipping_inr], ["Taxes", o.tax_inr]].map(([k, v]) => (
              <div key={k as string} className="flex justify-between"><dt className="text-muted">{k}</dt><dd><Price cad={Number(v)} /></dd></div>
            ))}
            <div className="flex justify-between border-t border-line pt-2 font-extrabold"><dt>Total</dt><dd><Price cad={Number(o.total_inr)} /></dd></div>
          </dl>
        </Card>
        <Card>
          <H className="mb-3 text-lg">Delivery address</H>
          <P className="text-sm">
            {a.first_name} {a.last_name}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city} {a.province} {a.postal_code}<br />{a.country}
          </P>
        </Card>
      </div>
    </div>
  );
}

function Profile() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [editName, setEditName] = useState(false);
  const [addr, setAddr] = useState<Address[] | null>(null);
  const [editing, setEditing] = useState<Partial<Address> | null>(null);
  const [del, setDel] = useState<Address | null>(null);
  const [confirm, setConfirm] = useState<"out" | "all" | null>(null);
  const sb = supabaseBrowser();
  const load = useCallback(() => {
    sb.from("addresses").select("*").order("is_default", { ascending: false }).order("created_at").then(({ data }) => setAddr((data as Address[]) ?? []));
  }, [sb]);
  useEffect(load, [load]);

  const toggleMarketing = async () => {
    if (!user || !profile) return;
    const on = !profile.marketing_opt_in;
    await sb.from("profiles").update({ marketing_opt_in: on }).eq("id", user.id);
    await sb.functions.invoke("newsletter", { body: { email: user.email, source: on ? "account" : "account-off", unsubscribe: !on } });
    await refreshProfile();
  };

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[.14em] text-muted">Name</div>
            <div className="mt-1 text-lg font-extrabold">{[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "—"}</div>
          </div>
          <Btn kind="light" size="sm" iconL={Pencil} onClick={() => setEditName(true)}>Edit</Btn>
        </div>
        <div className="mt-5 border-t border-line2 pt-5">
          <div className="text-xs font-bold uppercase tracking-[.14em] text-muted">Email</div>
          <div className="mt-1 font-bold">{user?.email}</div>
        </div>
      </Card>

      <Card>
        <div id="addresses" className="flex scroll-mt-40 items-center justify-between">
          <H className="text-xl">Addresses</H>
          <Btn kind="light" size="sm" iconL={Plus} onClick={() => setEditing({ country: "IN" })}>Add</Btn>
        </div>
        {addr === null ? (
          <div className="az-skeleton mt-4 h-24 rounded-tile" />
        ) : addr.length === 0 ? (
          <div className="mt-5 flex flex-col items-center gap-2 rounded-tile border border-dashed border-line p-8 text-center text-muted">
            <MapPin size={24} className="text-gold" aria-hidden />
            No addresses added
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {addr.map((a) => (
              <li key={a.id} className="rounded-tile border border-line2 p-4 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <b>{a.first_name} {a.last_name}</b>
                  {a.is_default && <Badge tone="dark">Default</Badge>}
                </div>
                <p className="mt-1 text-muted">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.province} {a.postal_code}, {a.country}</p>
                <div className="mt-3 flex flex-wrap gap-3 font-bold">
                  <button type="button" onClick={() => setEditing(a)} className="underline">Edit</button>
                  <button type="button" onClick={() => setDel(a)} className="text-red underline">Delete</button>
                  {!a.is_default && (
                    <button
                      type="button"
                      className="underline"
                      onClick={async () => {
                        await sb.from("addresses").update({ is_default: false }).eq("user_id", user!.id);
                        await sb.from("addresses").update({ is_default: true }).eq("id", a.id);
                        load();
                      }}
                    >
                      Set as default
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <H className="text-xl">Marketing preferences</H>
        <label className="mt-4 flex cursor-pointer items-center justify-between gap-4">
          <span>
            <b>Email</b>
            <br />
            <span className="text-sm text-muted">New arrivals, guides and offers.</span>
          </span>
          <button type="button" role="switch" aria-checked={!!profile?.marketing_opt_in} onClick={toggleMarketing} className={clsx("relative h-[26px] w-11 flex-none rounded-full transition-colors", profile?.marketing_opt_in ? "bg-ink" : "bg-[#D8D2C7]")}>
            <span className={clsx("absolute top-[3px] size-5 rounded-full bg-white shadow transition-all", profile?.marketing_opt_in ? "left-[21px]" : "left-[3px]")} />
          </button>
        </label>
      </Card>

      <div className="flex flex-wrap items-center gap-4">
        <Btn kind="outline" onClick={() => setConfirm("out")}>Sign out</Btn>
        <button type="button" onClick={() => setConfirm("all")} className="text-sm font-bold underline">Sign out of all devices</button>
      </div>

      {editName && <NameModal onClose={() => setEditName(false)} />}
      {editing && <AddressModal value={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {del && (
        <ConfirmDialog title="Delete this address?" body={`${del.line1}, ${del.city} will be removed from your account.`} cta="Delete" onCancel={() => setDel(null)}
          onConfirm={async () => { await sb.from("addresses").delete().eq("id", del.id); setDel(null); load(); }} />
      )}
      {confirm && (
        <ConfirmDialog
          title={confirm === "all" ? "Sign out of all devices?" : "Sign out?"}
          body={confirm === "all" ? "You'll be signed out everywhere, including this browser." : "You'll need to log in again to see your orders."}
          cta="Sign out"
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            await sb.auth.signOut({ scope: confirm === "all" ? "global" : "local" });
            router.push("/");
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function NameModal({ onClose }: { onClose: () => void }) {
  const { user, profile } = useAuth();
  const [first, setFirst] = useState(profile?.first_name ?? "");
  const [last, setLast] = useState(profile?.last_name ?? "");
  const [err, setErr] = useState<string | null>(null);
  return (
    <Overlay onClose={onClose} label="Edit name">
      <Modal>
        <div className="mb-5 flex items-center justify-between">
          <H className="text-[26px]">Edit name</H>
          <button type="button" aria-label="Close" onClick={onClose} className="flex size-10 items-center justify-center rounded-full border border-line"><X size={16} aria-hidden /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="First name" error={err ?? undefined}><input className="field" value={first} onChange={(e) => setFirst(e.target.value)} /></Field>
          <Field label="Last name"><input className="field" value={last} onChange={(e) => setLast(e.target.value)} /></Field>
        </div>
        <Btn full size="lg" className="mt-5" onClick={async () => {
          if (!first.trim()) return setErr("Enter your first name.");
          await supabaseBrowser().from("profiles").update({ first_name: first.trim(), last_name: last.trim() || null }).eq("id", user!.id);
          await refreshProfile();
          onClose();
        }}>Save</Btn>
      </Modal>
    </Overlay>
  );
}

export const IN_PIN = /^[1-9]\d{5}$/;
export const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"];

function AddressModal({ value, onClose, onSaved }: { value: Partial<Address>; onClose: () => void; onSaved: () => void }) {
  const { user } = useAuth();
  const [a, setA] = useState<Partial<Address>>(value);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setA({ ...a, [k]: e.target.value });
  const save = async () => {
    const e: Record<string, string> = {};
    for (const k of ["first_name", "last_name", "line1", "city", "postal_code"] as const) if (!String(a[k] ?? "").trim()) e[k] = "Required.";
    if (a.postal_code && !IN_PIN.test(a.postal_code.trim())) e.postal_code = "Enter a 6-digit PIN code.";
    if (!a.province) e.province = "Select a state.";
    setErrors(e);
    if (Object.keys(e).length) return;
    const row = { first_name: a.first_name, last_name: a.last_name, line1: a.line1, line2: a.line2 || null, city: a.city, province: a.province || null, postal_code: a.postal_code!.trim(), country: "IN", phone: a.phone || null, user_id: user!.id };
    const sb = supabaseBrowser();
    if (a.id) await sb.from("addresses").update(row).eq("id", a.id);
    else {
      const { count } = await sb.from("addresses").select("id", { count: "exact", head: true });
      await sb.from("addresses").insert({ ...row, is_default: !count });
    }
    onSaved();
  };
  return (
    <Overlay onClose={onClose} label="Address">
      <Modal className="max-w-[600px]">
        <div className="mb-5 flex items-center justify-between">
          <H className="text-[26px]">{a.id ? "Edit address" : "Add address"}</H>
          <button type="button" aria-label="Close" onClick={onClose} className="flex size-10 items-center justify-center rounded-full border border-line"><X size={16} aria-hidden /></button>
        </div>
        <div className="grid max-h-[60vh] gap-3 overflow-y-auto sm:grid-cols-2">
          <Field label="First name" error={errors.first_name}><input className="field" value={a.first_name ?? ""} onChange={set("first_name")} /></Field>
          <Field label="Last name" error={errors.last_name}><input className="field" value={a.last_name ?? ""} onChange={set("last_name")} /></Field>
          <div className="sm:col-span-2"><Field label="Address" error={errors.line1}><input className="field" value={a.line1 ?? ""} onChange={set("line1")} autoComplete="address-line1" /></Field></div>
          <div className="sm:col-span-2"><Field label="Apartment, suite (optional)"><input className="field" value={a.line2 ?? ""} onChange={set("line2")} /></Field></div>
          <Field label="City" error={errors.city}><input className="field" value={a.city ?? ""} onChange={set("city")} /></Field>
          <Field label="State" error={errors.province}><select className="field" value={a.province ?? ""} onChange={set("province")}><option value="">Select…</option>{STATES.map((p) => <option key={p}>{p}</option>)}</select></Field>
          <Field label="PIN code" error={errors.postal_code}><input className="field" value={a.postal_code ?? ""} onChange={set("postal_code")} /></Field>
          <div className="sm:col-span-2"><Field label="Phone (optional)"><input className="field" value={a.phone ?? ""} onChange={set("phone")} /></Field></div>
        </div>
        <Btn full size="lg" className="mt-5" onClick={save}>Save address</Btn>
        {a.id && <p className="mt-3 flex items-center gap-1 text-xs text-muted"><Trash2 size={12} aria-hidden /> Delete from the address list.</p>}
      </Modal>
    </Overlay>
  );
}
