// Applies AZYLO's branded auth email templates to the Supabase project.
// Links use token_hash + /auth/confirm so they sign the user in on any device.
// Usage: node supabase/email/apply-templates.mjs
import fs from "node:fs";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const token = fs.readFileSync(".secret", "utf8").match(/sbp_[A-Za-z0-9]+/)[0];

const layout = (heading, body, button, link, footnote) => `<!doctype html>
<html><body style="margin:0;padding:0;background:#F7F4EE;font-family:Arial,Helvetica,sans-serif;color:#151412">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F4EE;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;padding:36px">
<tr><td style="font-size:20px;font-weight:bold;letter-spacing:6px">AZYLO</td></tr>
<tr><td style="padding-top:24px;font-size:24px;font-weight:bold">${heading}</td></tr>
<tr><td style="padding-top:12px;font-size:15px;line-height:1.6;color:#6E685F">${body}</td></tr>
<tr><td style="padding-top:24px"><a href="${link}" style="display:inline-block;background:#151412;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:999px">${button}</a></td></tr>
<tr><td style="padding-top:20px;font-size:12px;line-height:1.6;color:#A19A8F">If the button doesn't work, copy this link into your browser:<br><a href="${link}" style="color:#A57A36;word-break:break-all">${link}</a></td></tr>
<tr><td style="padding-top:20px;font-size:12px;line-height:1.6;color:#A19A8F">${footnote}</td></tr>
</table>
<p style="font-size:11px;color:#A19A8F;margin-top:16px">AZYLO · Made-to-order sofas, delivered free across India</p>
</td></tr></table></body></html>`;

const confirmLink = "{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=signup";
const recoveryLink = "{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery";

const body = {
  mailer_subjects_confirmation: "Confirm your AZYLO account",
  mailer_templates_confirmation_content: layout(
    "Welcome to AZYLO",
    "Hi {{ .Data.first_name }}, thanks for creating an account. Confirm your email address to start saving pieces and tracking your orders.",
    "Confirm my email",
    confirmLink,
    "You received this because someone signed up at AZYLO with {{ .Email }}. If it wasn't you, you can ignore this email.",
  ),
  mailer_subjects_recovery: "Reset your AZYLO password",
  mailer_templates_recovery_content: layout(
    "Reset your password",
    "We received a request to reset the password for {{ .Email }}. Click below to choose a new one. The link expires in 1 hour.",
    "Choose a new password",
    recoveryLink,
    "If you didn't ask to reset your password, you can ignore this email — your password stays the same.",
  ),
};

const res = await fetch(`https://api.supabase.com/v1/projects/${env.SUPABASE_PROJECT_REF}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
console.log("email templates:", res.status, res.ok ? "applied" : await res.text());
