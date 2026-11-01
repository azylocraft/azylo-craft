"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, CircleAlert, Lock, ShieldCheck, Truck } from "lucide-react";
import { CA_POSTAL, PROVINCES } from "@/components/account/AccountPortal";
import { Field } from "@/components/product/ProductView";
import { Media } from "@/components/shop/Media";
import { Price, T, useHydrated } from "@/components/shop/ShopContext";
import { Btn, BtnLink, H } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth";
import { useCartDetails } from "@/lib/cart-details";
import { payWithRazorpay } from "@/lib/razorpay";
import { useShop } from "@/lib/shop-store";
import { supabaseBrowser } from "@/lib/supabase/client";

type Addr = { first_name: string; last_name: string; line1: string; line2: string; city: string; province: string; postal_code: string; country: string; phone: string };
type Quote = {
  subtotal: number; discount: number; discountCode: string | null; discountMessage: string | null; shipping: number;
  shippingMethod: { code: string; label_en?: string; days_min?: number; days_max?: number }; methods: Quote["shippingMethod"][];
  tax: number; taxBreakdown: { label: string; rate: number; amount: number }[]; taxesIncluded: boolean; total: number; error?: string;
};

const EMPTY: Addr = { first_name: "", last_name: "", line1: "", line2: "", city: "", province: "", postal_code: "", country: "CA", phone: "" };
const COUNTRIES = [["CA", "Canada"], ["US", "United States"], ["GB", "United Kingdom"], ["FR", "France"], ["AU", "Australia"], ["DE", "Germany"]];

function addrErrors(a: Addr) {
  const e: Record<string, string> = {};
  if (!a.first_name.trim()) e.first_name = "Enter a first name.";
  if (!a.last_name.trim()) e.last_name = "Enter a last name.";
  if (!a.line1.trim()) e.line1 = "Enter an address.";
  if (!a.city.trim()) e.city = "Enter a city.";
  if (!a.postal_code.trim()) e.postal_code = "Enter a postal code.";
  else if (a.country === "CA" && !CA_POSTAL.test(a.postal_code.trim())) e.postal_code = "Use the format A1A 1A1.";
  if (a.country === "CA" && !a.province) e.province = "Select a province.";
  return e;
}

function AddressFields({ a, set, errors, show, prefix }: { a: Addr; set: (a: Addr) => void; errors: Record<string, string>; show: boolean; prefix: string }) {
  const err = (k: string) => (show ? errors[k] : undefined);
  const on = (k: keyof Addr) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => set({ ...a, [k]: e.target.value });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Country / region">
          <select className="field" value={a.country} onChange={(e) => set({ ...a, country: e.target.value, province: "" })} autoComplete={`${prefix} country`}>
            {COUNTRIES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
          </select>
        </Field>
      </div>
      <Field label="First name" error={err("first_name")}><input className="field" value={a.first_name} onChange={on("first_name")} autoComplete={`${prefix} given-name`} /></Field>
      <Field label="Last name" error={err("last_name")}><input className="field" value={a.last_name} onChange={on("last_name")} autoComplete={`${prefix} family-name`} /></Field>
      <div className="sm:col-span-2"><Field label="Address" error={err("line1")}><input className="field" value={a.line1} onChange={on("line1")} autoComplete={`${prefix} address-line1`} /></Field></div>
      <div className="sm:col-span-2"><Field label="Apartment, suite, etc. (optional)"><input className="field" value={a.line2} onChange={on("line2")} autoComplete={`${prefix} address-line2`} /></Field></div>
      <Field label="City" error={err("city")}><input className="field" value={a.city} onChange={on("city")} autoComplete={`${prefix} address-level2`} /></Field>
      {a.country === "CA" ? (
        <Field label="Province" error={err("province")}>
          <select className="field" value={a.province} onChange={on("province")} autoComplete={`${prefix} address-level1`}>
            <option value="">Select…</option>
            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
      ) : (
        <Field label="State / region"><input className="field" value={a.province} onChange={on("province")} autoComplete={`${prefix} address-level1`} /></Field>
      )}
      <Field label="Postal code" error={err("postal_code")}><input className="field uppercase" value={a.postal_code} onChange={on("postal_code")} autoComplete={`${prefix} postal-code`} /></Field>
      <Field label="Phone (for delivery)"><input className="field" type="tel" value={a.phone} onChange={on("phone")} autoComplete={`${prefix} tel`} /></Field>
    </div>
  );
}

/** Checkout (design screens 39–43, mobile 95). Totals always come from the server quote. */
export function CheckoutView() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { user } = useAuth();
  const cart = useShop((s) => s.cart);
  const note = useShop((s) => s.note);
  const savedCode = useShop((s) => s.discountCode);
  const setSavedCode = useShop((s) => s.setDiscountCode);
  const { lines } = useCartDetails();

  const [email, setEmail] = useState("");
  const [news, setNews] = useState(false);
  const [ship, setShip] = useState<Addr>(EMPTY);
  const [sameBilling, setSameBilling] = useState(true);
  const [bill, setBill] = useState<Addr>(EMPTY);
  const [shippingCode, setShippingCode] = useState("standard");
  const [code, setCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [state, setState] = useState<"idle" | "creating" | "paying" | "verifying">("idle");
  const [payError, setPayError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const sb = supabaseBrowser();

  // Prefill from the signed-in account (email + default address).
  const prefilled = useRef(false);
  useEffect(() => {
    if (!user || prefilled.current) return;
    prefilled.current = true;
    if (user.email) queueMicrotask(() => setEmail((e) => e || user.email!));
    sb.from("addresses").select("*").eq("is_default", true).maybeSingle().then(({ data }) => {
      if (data) setShip({ ...EMPTY, ...Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ""])) } as Addr);
    });
  }, [user, sb]);
  useEffect(() => {
    if (savedCode) queueMicrotask(() => { setCode(savedCode); setAppliedCode(savedCode); });
  }, [savedCode]);

  const shipErrors = addrErrors(ship);
  const addressValid = Object.keys(shipErrors).length === 0;
  const items = useMemo(() => cart.map((l) => ({ variantId: l.variantId, quantity: l.quantity, customColor: !!l.customColor })), [cart]);

  // Server quote, refreshed (debounced) whenever cart, destination, shipping or code changes.
  useEffect(() => {
    if (!items.length) return;
    const id = setTimeout(async () => {
      setQuoting(true);
      const { data } = await sb.functions.invoke<Quote>("checkout", {
        body: { action: "quote", items, address: { country: ship.country, province: ship.province }, discountCode: appliedCode, shippingCode },
      });
      setQuoting(false);
      if (data) setQuote(data);
    }, 300);
    return () => clearTimeout(id);
  }, [items, ship.country, ship.province, appliedCode, shippingCode, sb]);

  if (!hydrated) return <div className="az-skeleton mx-4 mt-8 h-[500px] rounded-block md:mx-12" />;
  if (cart.length === 0)
    return (
      <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
        <H as="h1" className="text-[32px]">Your cart is empty</H>
        <BtnLink href="/collections/all">Continue shopping</BtnLink>
      </div>
    );

  const pay = async () => {
    setShowErrors(true);
    setPayError(null);
    const billErrors = sameBilling ? {} : addrErrors(bill);
    if (!/^\S+@\S+\.\S+$/.test(email) || !addressValid || Object.keys(billErrors).length) {
      document.querySelector("[data-first-error], .text-red")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (state !== "idle") return; // never double-submit
    setState("creating");
    try {
      const clean = (a: Addr) => ({ ...a, postal_code: a.postal_code.trim().toUpperCase(), line2: a.line2 || null, phone: a.phone || null, province: a.province || null });
      const { data, error } = await sb.functions.invoke("checkout", {
        body: { action: "create", items, email, address: clean(ship), billingAddress: sameBilling ? null : clean(bill), discountCode: appliedCode, shippingCode, note, marketingOptIn: news },
      });
      if (error || !data?.razorpayOrderId) {
        let msg = "We couldn't start the payment. Please try again.";
        try {
          const ctx = (error as { context?: Response })?.context;
          const j = ctx ? await ctx.json() : data;
          if (j?.error && j.error !== "validation") msg = j.error;
        } catch {}
        throw new Error(msg);
      }
      setState("paying");
      const paid = await payWithRazorpay({
        keyId: data.keyId, razorpayOrderId: data.razorpayOrderId, amount: data.amount, currency: data.currency, orderNumber: data.orderNumber,
        prefill: { name: `${ship.first_name} ${ship.last_name}`, email, contact: ship.phone },
      });
      setState("verifying");
      const v = await sb.functions.invoke("checkout", { body: { action: "verify", ...paid } });
      useShop.getState().clearCart();
      setSavedCode(null);
      // Even if verify had a hiccup, the confirmation page polls until the webhook marks it paid.
      router.replace(`/checkout/confirmation?order=${data.orderId}&ref=${data.razorpayOrderId}${v.error ? "&pending=1" : ""}`);
    } catch (e) {
      const m = (e as Error).message;
      setPayError(m === "dismissed" ? "Payment was cancelled. You can try again." : m);
      setState("idle");
    }
  };

  const busy = state !== "idle";
  const summary = (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {lines.map((l) => (
          <li key={l.variantId} className="flex items-center gap-3">
            <span className="relative flex-none">
              <Media src={l.detail?.image} alt="" tone={l.detail?.tone} className="size-16 rounded-xl border border-line" />
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-ink text-[11px] font-bold text-white">{l.quantity}</span>
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <b className="line-clamp-1">{l.detail ? <T text={l.detail.name} field="product name" fallback /> : "…"}</b>
              <span className="text-xs text-muted">{l.detail ? <><T text={l.detail.color} field="colour" fallback /> / <T text={l.detail.model} field="model" fallback /></> : null}{l.customColor ? " · Custom color" : ""}</span>
            </span>
            <span className="text-sm font-bold">{l.detail ? <Price cad={l.detail.priceCad == null ? null : l.detail.priceCad * l.quantity} withCode={false} /> : null}</span>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 border-y border-line py-4">
        <input className="field min-w-0 flex-1 uppercase" placeholder="Discount code" aria-label="Discount code" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setAppliedCode(code.trim() || null)} />
        <Btn kind="light" onClick={() => setAppliedCode(code.trim() || null)} className="!h-[52px]">Apply</Btn>
      </div>
      {quote?.discountMessage && appliedCode && <p role="alert" className="-mt-2 flex items-center gap-1.5 text-xs text-red"><CircleAlert size={13} aria-hidden />{quote.discountMessage}</p>}
      {quote?.error ? (
        <p role="alert" className="text-sm text-red">{quote.error}</p>
      ) : !quote ? (
        <div className="az-skeleton h-28 rounded-tile" />
      ) : (
        <dl className={clsx("flex flex-col gap-2 text-sm", quoting && "opacity-60")}>
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd><Price cad={quote.subtotal} /></dd></div>
          {quote.discount > 0 && <div className="flex justify-between text-green"><dt>Discount ({quote.discountCode})</dt><dd>−<Price cad={quote.discount} /></dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{addressValid ? (quote.shipping === 0 ? "Free" : <Price cad={quote.shipping} />) : <span className="text-muted">Enter address</span>}</dd></div>
          {quote.taxesIncluded ? (
            <div className="flex justify-between"><dt className="text-muted">Taxes & duties</dt><dd className="text-muted">Included</dd></div>
          ) : quote.taxBreakdown.length ? (
            quote.taxBreakdown.map((t) => <div key={t.label} className="flex justify-between"><dt className="text-muted">{t.label} ({t.rate}%)</dt><dd><Price cad={t.amount} /></dd></div>)
          ) : (
            <div className="flex justify-between"><dt className="text-muted">Taxes</dt><dd className="text-muted">Select province</dd></div>
          )}
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3 text-lg font-extrabold">
            <dt>Total</dt>
            <dd><span className="mr-1.5 text-xs font-bold text-muted">CAD</span><Price cad={quote.total} withCode={false} /></dd>
          </div>
          <p className="text-[11.5px] text-faint">Orders are charged in CAD.</p>
        </dl>
      )}
    </div>
  );

  return (
    <div className="lg:grid lg:min-h-[calc(100vh-76px)] lg:grid-cols-[1.15fr_1fr]">
      {/* Mobile summary toggle */}
      <button type="button" aria-expanded={summaryOpen} onClick={() => setSummaryOpen(!summaryOpen)} className="flex w-full items-center justify-between bg-cream px-4 py-3.5 text-sm lg:hidden">
        <span className="flex items-center gap-2 font-bold text-gold">{summaryOpen ? "Hide" : "Show"} order summary <ChevronDown size={14} aria-hidden className={clsx("transition-transform", summaryOpen && "rotate-180")} /></span>
        <b>{quote ? <Price cad={quote.total} /> : "…"}</b>
      </button>
      {summaryOpen && <div className="border-b border-line bg-bg2 p-4 lg:hidden">{summary}</div>}

      <div className="flex flex-col gap-8 px-4 py-8 md:px-12 lg:py-12">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Contact</h2>
            {!user && <Link href="/auth/login?next=/checkout" className="text-sm font-bold underline">Sign in</Link>}
          </div>
          <Field label="Email" error={showErrors && !/^\S+@\S+\.\S+$/.test(email) ? "Enter a valid email address." : undefined}>
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </Field>
          <label className="mt-3 flex items-center gap-2.5 text-sm">
            <input type="checkbox" checked={news} onChange={(e) => setNews(e.target.checked)} className="size-4 accent-[var(--az-ink)]" />
            Email me with news and offers
          </label>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-extrabold">Delivery</h2>
          <AddressFields a={ship} set={setShip} errors={shipErrors} show={showErrors} prefix="shipping" />
        </section>

        {addressValid && quote?.methods && (
          <section>
            <h2 className="mb-3 text-xl font-extrabold">Shipping method</h2>
            <div className="flex flex-col gap-2">
              {quote.methods.map((m) => (
                <label key={m.code} className={clsx("flex cursor-pointer items-center gap-3 rounded-field border p-4 text-sm", shippingCode === m.code || quote.methods.length === 1 ? "border-ink bg-gold-soft" : "border-line bg-white")}>
                  <input type="radio" name="shipping" checked={shippingCode === m.code || quote.methods.length === 1} onChange={() => setShippingCode(m.code)} className="accent-[var(--az-ink)]" />
                  <Truck size={18} className="text-gold" aria-hidden />
                  <span className="flex-1"><b>{m.label_en ?? m.code}</b>{m.days_min ? <span className="block text-xs text-muted">{m.days_min}–{m.days_max} days · made to order</span> : null}</span>
                  <b>{quote.shippingMethod.code === m.code && quote.shipping === 0 ? "Free" : "Free"}</b>
                </label>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-extrabold">Payment</h2>
          <p className="mb-3 text-sm text-muted">All transactions are secure and encrypted.</p>
          <div className="overflow-hidden rounded-field border border-ink bg-white">
            <div className="flex items-center justify-between border-b border-line bg-gold-soft px-4 py-3.5 text-sm font-bold">
              <span>Razorpay Secure (cards, UPI, wallets)</span>
              <span className="flex gap-1">{["VISA", "MC", "AMEX"].map((x) => <span key={x} className="rounded bg-white px-1.5 py-0.5 text-[9.5px] font-extrabold">{x}</span>)}</span>
            </div>
            <p className="flex items-start gap-3 p-4 text-sm text-muted">
              <ShieldCheck size={18} className="mt-0.5 flex-none text-gold" aria-hidden />
              After you click &quot;Pay now&quot;, Razorpay&apos;s secure window opens to complete your purchase. Your card details never touch our servers.
            </p>
          </div>
          <label className="mt-4 flex items-center gap-2.5 text-sm">
            <input type="checkbox" checked={sameBilling} onChange={(e) => setSameBilling(e.target.checked)} className="size-4 accent-[var(--az-ink)]" />
            Use shipping address as billing address
          </label>
          {!sameBilling && (
            <div className="mt-4">
              <AddressFields a={bill} set={setBill} errors={addrErrors(bill)} show={showErrors} prefix="billing" />
            </div>
          )}
        </section>

        {payError && (
          <p role="alert" className="flex items-start gap-2 rounded-field border border-red/30 bg-red-soft p-4 text-sm text-red">
            <CircleAlert size={16} className="mt-0.5 flex-none" aria-hidden />
            {payError}
          </p>
        )}
        <Btn size="lg" full onClick={pay} disabled={busy || !quote || !!quote.error} iconL={Lock}>
          {state === "creating" ? "Preparing payment…" : state === "paying" ? "Complete payment in the Razorpay window…" : state === "verifying" ? "Confirming payment…" : `Pay now${quote ? "" : ""}`}
        </Btn>
        <p className="-mt-4 text-center text-xs text-muted">
          By paying you agree to our <Link href="/pages/terms-of-service" className="underline">Terms</Link> and <Link href="/pages/refund-policy" className="underline">Refund policy</Link>.
        </p>
      </div>

      <aside className="hidden border-l border-line bg-bg2 px-12 py-12 lg:block">
        <div className="sticky top-8">{summary}</div>
      </aside>
    </div>
  );
}
