"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, Check, Headset, Mail, MapPin, Phone, Receipt, Smartphone, Truck } from "lucide-react";
import { Eyebrow, H, Logo, Missing, P, Serif } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { footerColumns, routes } from "@/lib/routes";
import { supabaseBrowser } from "@/lib/supabase/client";

/** Thin cream strip shown above the footer (spec §3.7). */
export function AppStrip() {
  const t = useT();
  return (
    <div className="px-4 pt-14 md:px-12">
      <div className="flex flex-col items-start justify-between gap-3 rounded-card border border-line2 bg-white px-7 py-[22px] sm:flex-row sm:items-center">
        <span className="flex items-center gap-3.5">
          <Smartphone size={20} className="text-gold" aria-hidden />
          <span>
            <b className="text-sm">{t("appStrip.title")}</b>
            <br />
            <span className="text-[12.5px] text-muted">{t("appStrip.sub")}</span>
          </span>
        </span>
        <Link href={routes.app} className="flex items-center gap-2 text-[13px] font-bold hover:text-gold">
          {t("appStrip.cta")}
          <ArrowUpRight size={15} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

// Store contact details come from store_settings once Supabase is connected.
type StoreContact = { email?: string; phone?: string; address?: string };

export function Footer({ contact = {}, year }: { contact?: StoreContact; year: number }) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [company, setCompany] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^S+@S+.S+$/.test(email)) return setState("error");
    setState("busy");
    const { error } = await supabaseBrowser().functions.invoke("newsletter", { body: { email, company, source: "footer" } });
    setState(error ? "error" : "done");
  };

  return (
    <footer className="px-4 pb-10 pt-12 md:px-12">
      <div className="rounded-modal bg-dark px-6 pb-9 pt-12 text-white md:px-16 md:pt-16">
        <div className="flex flex-col items-start justify-between gap-10 lg:flex-row lg:gap-12">
          <div className="flex flex-col gap-4">
            <Eyebrow>{t("footer.eyebrow")}</Eyebrow>
            <H className="text-[36px] text-white md:text-[52px]">
              {t("footer.title")} <Serif gold>{t("footer.titleAccent")}</Serif>
            </H>
            <P className="text-on-dark-muted">{t("footer.sub")}</P>
          </div>
          <div className="flex w-full flex-col gap-2.5 lg:w-[520px]">
            {state === "done" ? (
              <div role="status" className="flex h-[60px] items-center gap-3.5 rounded-full border border-gold bg-gold/10 px-[22px]">
                <span className="flex size-8 items-center justify-center rounded-full bg-gold">
                  <Check size={14} aria-hidden />
                </span>
                <div>
                  <div className="text-sm font-bold">{t("footer.subscribed")}</div>
                  <div className="text-xs text-on-dark-muted">{t("footer.subscribedSub", { email })}</div>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="flex h-[60px] items-center rounded-full border border-dark-field bg-dark2 pl-6 pr-1.5">
                <label htmlFor="footer-email" className="sr-only">
                  {t("footer.emailPlaceholder")}
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("footer.emailPlaceholder")}
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-on-dark-faint"
                />
                {/* honeypot */}
                <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={company} onChange={(e) => setCompany(e.target.value)} />
                <button
                  type="submit"
                  className="inline-flex h-[46px] items-center gap-2.5 whitespace-nowrap rounded-full bg-white px-5 text-sm font-bold text-ink hover:bg-bg2 md:px-[26px]"
                >
                  {state === "busy" ? "…" : t("footer.subscribe")}
                  <ArrowRight size={16} aria-hidden />
                </button>
              </form>
            )}
            <span role={state === "error" ? "alert" : undefined} className={state === "error" ? "pl-6 text-xs text-[#F0A79B]" : "pl-6 text-xs text-on-dark-faint"}>
              {state === "error" ? t("footer.error") : t("footer.note")}
            </span>
          </div>
        </div>

        <div className="my-12 h-px bg-dark-line md:my-[52px]" />

        <div className="grid grid-cols-2 gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-1">
            <Logo light size={26} />
            <P className="max-w-[380px] text-sm text-on-dark-muted">{t("footer.brandBlurb")}</P>
            <ContactRow icon={Mail} value={contact.email} field="store email" href={contact.email && `mailto:${contact.email}`} />
            <ContactRow icon={Phone} value={contact.phone} field="store phone" href={contact.phone && `tel:${contact.phone}`} />
            <ContactRow icon={MapPin} value={contact.address} field="store address" />
          </div>
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3.5">
              <span className="text-xs font-extrabold uppercase tracking-[.14em]">{t(col.title)}</span>
              {col.links.map((l) => (
                <Link key={l.key} href={l.href} className="text-[13.5px] text-on-dark-muted hover:text-white">
                  {t(l.key)}
                </Link>
              ))}
              {col.title === "footer.support" && (
                <button type="button" className="text-left text-[13.5px] text-on-dark-muted hover:text-white" data-cookie-reopen>
                  {t("footer.links.cookies")}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 border-y border-dark-line md:grid-cols-3">
          {[
            [Truck, "footer.trustDelivery"],
            [Receipt, "footer.trustTaxes"],
            [Headset, "footer.trustCare"],
          ].map(([Icon, key], k) => {
            const I = Icon as typeof Truck;
            return (
              <span
                key={key as string}
                className={`flex items-center justify-center gap-2.5 py-5 text-[12.5px] text-on-dark ${k ? "border-t border-dark-line md:border-l md:border-t-0" : ""}`}
              >
                <I size={16} className="text-gold" aria-hidden />
                {t(key as string)}
              </span>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 text-xs text-on-dark-faint md:flex-row md:items-center">
          <span>
            © {year} AZYLO ·{" "}
            <Link href={routes.privacy} className="hover:text-white">
              {t("footer.privacy")}
            </Link>{" "}
            ·{" "}
            <Link href={routes.terms} className="hover:text-white">
              {t("footer.terms")}
            </Link>
          </span>
          <span className="flex flex-wrap gap-1.5" aria-label="Accepted payment methods">
            {["VISA", "MC", "AMEX", "RAZORPAY"].map((x) => (
              <span key={x} className="inline-flex h-6 items-center rounded-[5px] bg-white px-2 text-[9.5px] font-extrabold text-ink">
                {x}
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}

function ContactRow({ icon: Icon, value, field, href }: { icon: typeof Mail; value?: string; field: string; href?: string }) {
  return (
    <span className="flex items-center gap-3 text-[13px] text-on-dark">
      <Icon size={16} className="flex-none text-gold" aria-hidden />
      {value ? href ? <a href={href} className="hover:text-white">{value}</a> : value : <Missing field={field} />}
    </span>
  );
}
