"use client";

import { Check, CircleAlert, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Btn } from "@/components/ui/primitives";
import { useT } from "@/lib/i18n";
import { supabaseBrowser } from "@/lib/supabase/client";

/** Floating chat pill: a short message form (not live chat) → contact function (design screen 78). */
export function ChatPill() {
  const t = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <ChatPanel onClose={() => setOpen(false)} />}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 items-center gap-2.5 rounded-full bg-ink px-5 text-[13.5px] font-bold text-white shadow-soft hover:bg-ink2 md:bottom-7 md:right-7"
      >
        {open ? <X size={18} aria-hidden /> : <MessageCircle size={18} aria-hidden />}
        {open ? t("chat.close") : t("chat.open")}
      </button>
    </>
  );
}

function ChatPanel({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [f, setF] = useState({ name: "", email: "", message: "", website: "" });
  const [err, setErr] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email) || f.message.trim().length < 10) {
      setErr(t("chat.invalid"));
      return;
    }
    setErr(null);
    setState("busy");
    const { error } = await supabaseBrowser().functions.invoke("contact", { body: { ...f, source: "chat" } });
    setState(error ? "error" : "sent");
  };
  return (
    <div role="dialog" aria-label={t("chat.title")} className="fixed bottom-[88px] right-4 z-40 w-[calc(100vw-32px)] max-w-[360px] rounded-panel border border-line2 bg-white p-5 shadow-float md:bottom-[96px] md:right-7">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-[17px] font-extrabold">{t("chat.title")}</div>
          <div className="text-xs text-muted">{t("chat.sub")}</div>
        </div>
        <button type="button" aria-label={t("common.close")} onClick={onClose} className="flex size-8 flex-none items-center justify-center rounded-full border border-line">
          <X size={14} aria-hidden />
        </button>
      </div>
      {state === "sent" ? (
        <p role="status" className="flex items-start gap-2 rounded-field bg-green-soft p-3 text-sm text-green">
          <Check size={16} className="mt-0.5 flex-none" aria-hidden />
          {t("chat.sent")}
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="flex flex-col gap-2.5">
          <input className="field !min-h-11" placeholder={t("form.name")} aria-label={t("form.name")} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" />
          <input className="field !min-h-11" type="email" placeholder={t("form.emailLabel")} aria-label={t("form.emailLabel")} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
          <textarea className="field h-24 resize-none" placeholder={t("form.message")} aria-label={t("form.message")} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={2000} />
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} />
          {(err || state === "error") && (
            <p role="alert" className="flex items-center gap-1.5 text-xs text-red">
              <CircleAlert size={13} aria-hidden />
              {err ?? t("form.sendError")}
            </p>
          )}
          <Btn type="submit" full disabled={state === "busy"}>
            {state === "busy" ? t("form.sending") : state === "error" ? t("common.retry") : t("form.send")}
          </Btn>
        </form>
      )}
    </div>
  );
}
