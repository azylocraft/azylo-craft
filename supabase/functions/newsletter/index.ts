// Footer newsletter → newsletter_subscribers. Existing addresses still get a success response.
import { admin, cors, isEmail, json, rateLimit, str, userId } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (str(body.company, 200)) return json({ ok: true }); // honeypot

  const email = str(body.email, 254).toLowerCase();
  if (!isEmail(email)) return json({ error: "validation", fields: { email: "invalid" } }, 422);
  if (!(await rateLimit(req, "newsletter", 5))) return json({ error: "rate_limited" }, 429);

  const { error } = await admin()
    .from("newsletter_subscribers")
    .upsert({ email, subscribed: body.unsubscribe !== true, source: str(body.source, 40) || "footer", user_id: await userId(req) }, { onConflict: "email" });
  if (error) {
    console.error(error.message);
    return json({ error: "save_failed" }, 500);
  }
  return json({ ok: true });
});
