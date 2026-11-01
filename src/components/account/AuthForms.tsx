"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CircleAlert, Eye, EyeOff, MailCheck } from "lucide-react";
import { Field } from "@/components/product/ProductView";
import { Btn, Eyebrow, H, Logo, P } from "@/components/ui/primitives";
import { supabaseBrowser } from "@/lib/supabase/client";

export type AuthMode = "login" | "sign-up" | "forgot-password" | "reset-password";

/** Auth shell (design screens 45–50): centred card on the cream background. */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center px-4 py-10 md:py-16">
      <div className="w-full max-w-[480px] rounded-modal border border-line2 bg-white p-7 shadow-card md:p-10">
        <div className="mb-6">
          <Logo />
        </div>
        {children}
      </div>
    </div>
  );
}

function Password({ value, onChange, autoComplete }: { value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative block">
      <input className="field pr-12" type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} />
      <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted">
        {show ? <EyeOff size={17} aria-hidden /> : <Eye size={17} aria-hidden />}
      </button>
    </span>
  );
}

function ErrorLine({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return (
    <p role="alert" className="flex items-center gap-2 rounded-field border border-red/30 bg-red-soft p-3 text-sm text-red">
      <CircleAlert size={16} className="flex-none" aria-hidden />
      {msg}
    </p>
  );
}

// 0.0.0.0 is only a listen address; browsers can't open it, so email links use localhost instead.
const origin = () => (typeof window !== "undefined" ? window.location.origin.replace("//0.0.0.0", "//localhost") : "");

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/account";
  const sb = supabaseBrowser();
  const [f, setF] = useState({ first: "", last: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(() =>
    sp.get("error") === "link" || (typeof window !== "undefined" && window.location.hash.includes("otp_expired"))
      ? "That email link has expired or was already used. If you already confirmed, just log in below — or request a new link."
      : null,
  );
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (mode === "sign-up" && !f.first.trim()) e.first = "Enter your first name.";
    if (mode !== "reset-password" && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
    if ((mode === "sign-up" || mode === "reset-password") && f.password.length < 8) e.password = "Use at least 8 characters.";
    if (mode === "login" && !f.password) e.password = "Enter your password.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setMsg(null);
    if (!validate()) return;
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email: f.email, password: f.password });
        if (error) return setMsg(error.message === "Invalid login credentials" ? "That email and password don't match. Try again or reset your password." : error.message);
        router.replace(next);
        router.refresh();
      } else if (mode === "sign-up") {
        const { data, error } = await sb.auth.signUp({
          email: f.email,
          password: f.password,
          options: { data: { first_name: f.first.trim(), last_name: f.last.trim() }, emailRedirectTo: `${origin()}/auth/callback?next=/account` },
        });
        if (error) return setMsg(error.message);
        if (data.session) {
          router.replace(next);
          router.refresh();
        } else setDone(true);
      } else if (mode === "forgot-password") {
        const { error } = await sb.auth.resetPasswordForEmail(f.email, { redirectTo: `${origin()}/auth/callback?next=/auth/reset-password` });
        if (error) return setMsg(error.message);
        setDone(true);
      } else {
        const { error } = await sb.auth.updateUser({ password: f.password });
        if (error) return setMsg(error.message.includes("session") ? "This reset link has expired. Request a new one." : error.message);
        router.replace("/account");
      }
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <Shell>
        <div className="flex flex-col items-start gap-4">
          <span className="flex size-[52px] items-center justify-center rounded-full bg-gold-soft text-gold">
            <MailCheck size={22} aria-hidden />
          </span>
          <H as="h1" className="text-[30px]">Check your inbox</H>
          <P>
            {mode === "sign-up" ? "We sent a confirmation link to " : "We sent a password reset link to "}
            <b className="text-ink">{f.email}</b>. The link opens this site and signs you in.
          </P>
          <Link href="/auth/login" className="font-bold underline">
            Back to log in
          </Link>
        </div>
      </Shell>
    );

  const titles: Record<AuthMode, [string, string]> = {
    login: ["Welcome back", "Log in"],
    "sign-up": ["Create your account", "Sign up"],
    "forgot-password": ["Forgot password", "Reset your password"],
    "reset-password": ["Almost done", "Choose a new password"],
  };

  return (
    <Shell>
      <Eyebrow>{titles[mode][0]}</Eyebrow>
      <H as="h1" className="mb-2 mt-3 text-[32px]">{titles[mode][1]}</H>
      {mode === "forgot-password" && <P className="mb-2">Enter your email and we&apos;ll send you a link to set a new password.</P>}
      <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-4">
        {mode === "sign-up" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" error={errors.first}>
              <input className="field" value={f.first} onChange={(e) => setF({ ...f, first: e.target.value })} autoComplete="given-name" />
            </Field>
            <Field label="Last name">
              <input className="field" value={f.last} onChange={(e) => setF({ ...f, last: e.target.value })} autoComplete="family-name" />
            </Field>
          </div>
        )}
        {mode !== "reset-password" && (
          <Field label="Email" error={errors.email}>
            <input className="field" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" />
          </Field>
        )}
        {mode !== "forgot-password" && (
          <Field label={mode === "reset-password" ? "New password" : "Password"} error={errors.password}>
            <Password value={f.password} onChange={(v) => setF({ ...f, password: v })} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          </Field>
        )}
        {mode === "login" && (
          <Link href="/auth/forgot-password" className="-mt-1 self-end text-sm font-semibold underline">
            Forgot your password?
          </Link>
        )}
        <ErrorLine msg={msg} />
        <Btn type="submit" full size="lg" disabled={busy}>
          {busy ? "Please wait…" : { login: "Log in", "sign-up": "Create account", "forgot-password": "Send reset link", "reset-password": "Save new password" }[mode]}
        </Btn>
      </form>
      <div className="mt-6 border-t border-line2 pt-5 text-sm text-muted">
        {mode === "login" ? (
          <>
            New to AZYLO?{" "}
            <Link href={`/auth/sign-up${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-bold text-ink underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-bold text-ink underline">
              Log in
            </Link>
          </>
        )}
      </div>
    </Shell>
  );
}
