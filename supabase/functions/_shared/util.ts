// Shared helpers for AZYLO edge functions (Deno).
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

/** Service-role client: bypasses RLS, so every input must be validated first. */
export function admin(): SupabaseClient {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
}

/** The signed-in user's id from the Authorization header, if any. */
export async function userId(req: Request): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth) return null;
  const { data } = await admin().auth.getUser(auth.replace(/^Bearer\s+/i, ""));
  return data.user?.id ?? null;
}

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Fixed-window rate limit per client IP (hashed). Returns false when over the limit. */
export async function rateLimit(req: Request, name: string, max: number, windowSeconds = 3600) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("cf-connecting-ip") ?? "unknown";
  const bucket = `${name}:${(await sha256(ip)).slice(0, 32)}`;
  const { data, error } = await admin().rpc("hit_rate_limit", { p_bucket: bucket, p_window_seconds: windowSeconds, p_max: max });
  if (error) {
    console.error("rate limit check failed", error.message);
    return true; // fail open: never block a customer because the limiter is down
  }
  return data === true;
}

export const isEmail = (v: unknown): v is string => typeof v === "string" && v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Sends through Resend when RESEND_API_KEY is set; otherwise logs and skips (never fails the caller). */
export async function sendEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (!to) {
    console.log(`email skipped (no recipient): ${subject}`);
    return { sent: false };
  }
  // Gmail SMTP (port 465 — Supabase blocks 25/587) until a verified domain is set up in Resend.
  const gmailUser = Deno.env.get("GMAIL_USER");
  const gmailPass = Deno.env.get("GMAIL_APP_PASSWORD");
  if (gmailUser && gmailPass) {
    try {
      const nodemailer = (await import("npm:nodemailer@6.9.16")).default;
      const transport = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: gmailUser, pass: gmailPass } });
      await transport.sendMail({ from: `AZYLO <${gmailUser}>`, to, subject, html, replyTo });
      return { sent: true };
    } catch (e) {
      console.error("gmail send failed", e);
      return { sent: false };
    }
  }
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("EMAIL_FROM") ?? "AZYLO <onboarding@resend.dev>";
  if (!key) {
    console.log(`email skipped (no email provider configured): ${subject}`);
    return { sent: false };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html, reply_to: replyTo }),
    });
    if (!res.ok) console.error("resend error", res.status, await res.text());
    return { sent: res.ok };
  } catch (e) {
    console.error("resend failed", e);
    return { sent: false };
  }
}

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Where store notifications go: STORE_INBOX_EMAIL, else the store email in store_settings. */
export async function storeInbox(): Promise<string | null> {
  const env = Deno.env.get("STORE_INBOX_EMAIL");
  if (env) return env;
  const { data } = await admin().from("store_settings").select("store_email").eq("id", 1).maybeSingle();
  return data?.store_email ?? null;
}
