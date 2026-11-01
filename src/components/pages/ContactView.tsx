"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, CircleAlert, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { Field } from "@/components/product/ProductView";
import { useShopCtx, T } from "@/components/shop/ShopContext";
import { Btn, BtnLink, Eyebrow, H, Missing, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { routes } from "@/lib/routes";
import { supabaseBrowser } from "@/lib/supabase/client";

const TOPICS = ["product", "order", "delivery", "returns", "custom", "other"] as const;
type Form = { name: string; email: string; phone: string; orderNumber: string; topic: string; message: string; website: string };

/** Contact page (design screens 69–71). */
export function ContactView() {
  const t = useT();
  const { settings } = useShopCtx();
  const [f, setF] = useState<Form>({ name: "", email: "", phone: "", orderNumber: "", topic: "product", message: "", website: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!f.name.trim()) errs.name = t("form.required");
    if (!/^\S+@\S+\.\S+$/.test(f.email)) errs.email = t("form.email");
    if (f.message.trim().length < 10) errs.message = t("form.messageShort");
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setState("busy");
    const { error } = await supabaseBrowser().functions.invoke("contact", { body: { ...f, source: "contact" } });
    setState(error ? "error" : "sent");
  };

  const rows: [typeof Mail, string, string | null, string | undefined][] = [
    [Mail, t("contact.email"), settings.email, settings.email ? `mailto:${settings.email}` : undefined],
    [Phone, t("contact.phone"), settings.phone, settings.phone ? `tel:${settings.phone}` : undefined],
    [MapPin, t("contact.address"), settings.address, settings.address ? settings.mapUrl ?? `https://maps.google.com/?q=${encodeURIComponent(settings.address)}` : undefined],
  ];

  return (
    <div className="px-4 pt-10 md:px-12 md:pt-14">
      <div className="flex flex-col items-center gap-3 text-center">
        <Eyebrow center>{t("contact.eyebrow")}</Eyebrow>
        <H as="h1" className="text-[38px] md:text-[60px]">
          {t("contact.title")} <Serif gold>{t("contact.titleAccent")}</Serif>
        </H>
        <P className="max-w-[560px]">{t("contact.sub")}</P>
      </div>
      <div className="mt-10 grid overflow-hidden rounded-block border border-line2 bg-white shadow-card md:rounded-hero lg:grid-cols-[1fr_1.3fr]">
        <div className="relative flex flex-col gap-5 overflow-hidden bg-dark p-7 text-white md:p-12">
          {[300, 440, 580].map((s) => (
            <span key={s} aria-hidden className="absolute rounded-full border border-white/5" style={{ width: s, height: s, right: -s / 2.6, bottom: -s / 2.6 }} />
          ))}
          <Eyebrow>{t("contact.panelEyebrow")}</Eyebrow>
          <H className="text-[30px] text-white md:text-[38px]">{t("contact.panelTitle")}</H>
          <P className="text-on-dark-muted">{t("contact.panelSub")}</P>
          <div className="mt-2 flex flex-col gap-4">
            {rows.filter(([, , value]) => value).map(([Icon, label, value, href]) => (
              <div key={label} className="flex items-center gap-4">
                <span className="flex size-11 flex-none items-center justify-center rounded-full bg-gold text-white">
                  <Icon size={18} aria-hidden />
                </span>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[.14em] text-on-dark-faint">{label}</div>
                  {value ? (
                    <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="break-words font-bold hover:text-gold-line">
                      {value}
                    </a>
                  ) : (
                    <Missing field={label.toLowerCase()} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-auto flex items-start gap-3 border-t border-dark-line pt-5 text-sm text-on-dark">
            <Clock size={16} className="mt-0.5 text-gold" aria-hidden />
            <div>
              <div className="font-bold">{t("contact.hours")}</div>
              <T text={settings.openingHours} field="opening hours" />
            </div>
          </div>
        </div>

        <div className="p-6 md:p-12">
          {state === "sent" ? (
            <div role="status" className="flex h-full flex-col items-start justify-center gap-4 py-10">
              <span className="flex size-[60px] items-center justify-center rounded-full bg-green-soft text-green">
                <Check size={26} aria-hidden />
              </span>
              <H className="text-[30px]">{t("contact.sentTitle")}</H>
              <P>{t("contact.sentBody", { email: f.email })}</P>
              <div className="flex flex-wrap gap-2.5">
                <BtnLink href="/collections/all">{t("cart.continue")}</BtnLink>
                <Btn kind="outline" onClick={() => { setF({ ...f, message: "" }); setState("idle"); }}>
                  {t("contact.another")}
                </Btn>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <H className="text-[26px]">{t("contact.formTitle")}</H>
                <span className="flex items-center gap-2 rounded-full bg-green-soft px-3 py-1.5 text-xs font-bold text-green">
                  <span className="size-1.5 rounded-full bg-green" aria-hidden />
                  {t("contact.replyPill")}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={`${t("form.fullName")} *`} error={errors.name}>
                  <input className="field" value={f.name} onChange={set("name")} autoComplete="name" />
                </Field>
                <Field label={`${t("form.emailLabel")} *`} error={errors.email}>
                  <input className="field" type="email" value={f.email} onChange={set("email")} autoComplete="email" />
                </Field>
                <Field label={t("form.phoneOptional")}>
                  <input className="field" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" />
                </Field>
                <Field label={t("form.orderOptional")}>
                  <input className="field" value={f.orderNumber} onChange={set("orderNumber")} />
                </Field>
              </div>
              <Field label={t("contact.topic")}>
                <select className="field" value={f.topic} onChange={set("topic")}>
                  {TOPICS.map((x) => (
                    <option key={x} value={x}>
                      {t(`contact.topics.${x}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`${t("form.message")} *`} error={errors.message}>
                <textarea className="field h-36 resize-none" value={f.message} onChange={set("message")} maxLength={4000} />
              </Field>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={set("website")} />
              <p className="text-xs text-muted">{t("contact.consent")}</p>
              {state === "error" && (
                <p role="alert" className="flex items-center gap-2 text-sm text-red">
                  <CircleAlert size={15} aria-hidden />
                  {t("form.sendError")}
                </p>
              )}
              <Btn type="submit" size="lg" icon={Send} disabled={state === "busy"} className="self-start">
                {state === "busy" ? t("form.sending") : state === "error" ? t("common.retry") : t("contact.send")}
              </Btn>
              <p className="text-sm text-muted">
                {t("contact.quick")}{" "}
                <Link href={routes.faq} className="font-bold text-ink underline">
                  {t("contact.visitFaq")}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
