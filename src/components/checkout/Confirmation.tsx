"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Check, Clock } from "lucide-react";
import { Media } from "@/components/shop/Media";
import { Price } from "@/components/shop/ShopContext";
import { BtnLink, Eyebrow, H, P } from "@/components/ui/primitives";
import { mediaUrl } from "@/lib/media";
import { supabaseBrowser } from "@/lib/supabase/client";

type Order = {
  order_number: number; status: string; email: string; total_cad: number; subtotal_cad: number; discount_cad: number; shipping_cad: number; tax_cad: number;
  shipping_address: Record<string, string>;
  order_items: { product_name: string; variant_label: string; quantity: number; unit_price_cad: number; image_path: string | null }[];
};

/** Order confirmation (design screen 44). Polls until the payment is recorded. */
export function Confirmation() {
  const sp = useSearchParams();
  const orderId = sp.get("order") ?? "";
  const ref = sp.get("ref") ?? "";
  const [order, setOrder] = useState<Order | null>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    let stop = false;
    const tick = async (n: number) => {
      const { data } = await supabaseBrowser().functions.invoke<Order>("checkout", { body: { action: "status", orderId, razorpayOrderId: ref } });
      if (stop) return;
      if (data) setOrder(data);
      setTries(n);
      if ((!data || data.status === "pending") && n < 20) setTimeout(() => tick(n + 1), 3000);
    };
    tick(0);
    return () => {
      stop = true;
    };
  }, [orderId, ref]);

  if (!order)
    return <div className="mx-auto mt-10 max-w-[720px] px-4"><div className="az-skeleton h-[300px] rounded-block" /></div>;

  const pending = order.status === "pending";
  const a = order.shipping_address;
  return (
    <div className="mx-auto max-w-[760px] px-4 py-10 md:py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className={`flex size-16 items-center justify-center rounded-full ${pending ? "bg-gold-soft text-gold" : "bg-green-soft text-green"}`}>
          {pending ? <Clock size={28} aria-hidden /> : <Check size={30} aria-hidden />}
        </span>
        <Eyebrow center>Order #{order.order_number}</Eyebrow>
        <H as="h1" className="text-[34px] md:text-[48px]">{pending ? "Confirming your payment…" : "Thank you for your order."}</H>
        <P className="max-w-[520px]">
          {pending
            ? tries >= 20
              ? "We haven't received confirmation from the payment provider yet. If you were charged, your order is safe — we'll email you as soon as it's confirmed."
              : "This usually takes a few seconds. Please keep this page open."
            : <>A confirmation is on its way to <b className="text-ink">{order.email}</b>. Your piece is now being made to order.</>}
        </P>
      </div>
      <div className="mt-10 rounded-block border border-line2 bg-white p-6 shadow-card">
        <ul className="divide-y divide-line2">
          {order.order_items.map((i, k) => (
            <li key={k} className="flex items-center gap-4 py-3">
              <Media src={mediaUrl(i.image_path)} alt="" className="size-16 flex-none rounded-xl" />
              <span className="flex-1 text-sm"><b>{i.product_name}</b><br /><span className="text-muted">{i.variant_label} · ×{i.quantity}</span></span>
              <b className="text-sm"><Price cad={i.unit_price_cad * i.quantity} /></b>
            </li>
          ))}
        </ul>
        <dl className="mt-4 flex flex-col gap-1.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd><Price cad={order.subtotal_cad} /></dd></div>
          {order.discount_cad > 0 && <div className="flex justify-between"><dt className="text-muted">Discount</dt><dd>−<Price cad={order.discount_cad} /></dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shipping_cad > 0 ? <Price cad={order.shipping_cad} /> : "Free"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Taxes</dt><dd>{order.tax_cad > 0 ? <Price cad={order.tax_cad} /> : "Included"}</dd></div>
          <div className="flex justify-between text-lg font-extrabold"><dt>Total</dt><dd><Price cad={order.total_cad} /></dd></div>
        </dl>
        <p className="mt-4 text-sm text-muted">Delivering to {a.first_name} {a.last_name}, {a.line1}, {a.city} {a.province} {a.postal_code}</p>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <BtnLink href="/account">View your orders</BtnLink>
        <BtnLink href="/collections/all" kind="outline">Continue shopping</BtnLink>
      </div>
    </div>
  );
}
