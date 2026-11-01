// Contact form + chat pill messages → contact_messages, then notifies the store inbox.
import { admin, cors, escapeHtml, isEmail, json, rateLimit, sendEmail, storeInbox, str, userId } from "../_shared/util.ts";

const TOPICS = ["product", "order", "delivery", "returns", "custom", "other"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  // Honeypot: bots fill hidden fields. Pretend success.
  if (str(body.website, 200) || str(body.company, 200)) return json({ ok: true });

  const name = str(body.name, 120);
  const email = str(body.email, 254);
  const message = str(body.message, 4000);
  const source = body.source === "chat" ? "chat" : "contact";
  const errors: Record<string, string> = {};
  if (!name) errors.name = "required";
  if (!isEmail(email)) errors.email = "invalid";
  if (message.length < 10) errors.message = "too_short";
  if (Object.keys(errors).length) return json({ error: "validation", fields: errors }, 422);

  if (!(await rateLimit(req, `contact:${source}`, 5))) return json({ error: "rate_limited" }, 429);

  const row = {
    user_id: await userId(req),
    source,
    name,
    email,
    phone: str(body.phone, 40) || null,
    order_number: str(body.orderNumber, 40) || null,
    topic: TOPICS.includes(String(body.topic)) ? String(body.topic) : null,
    message,
  };
  const { error } = await admin().from("contact_messages").insert(row);
  if (error) {
    console.error(error.message);
    return json({ error: "save_failed" }, 500);
  }

  const inbox = await storeInbox();
  const mail = await sendEmail(
    inbox ?? "",
    `New ${source} message from ${name}`,
    `<p><b>${escapeHtml(name)}</b> &lt;${escapeHtml(email)}&gt;${row.phone ? ` · ${escapeHtml(row.phone)}` : ""}</p>
     <p>Topic: ${escapeHtml(row.topic ?? "—")} · Order: ${escapeHtml(row.order_number ?? "—")}</p>
     <p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    email,
  );
  return json({ ok: true, emailed: mail.sent });
});
