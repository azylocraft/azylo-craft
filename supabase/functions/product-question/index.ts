// "Ask a question" on the product page → product_questions, then notifies the store inbox.
import { admin, cors, escapeHtml, isEmail, json, rateLimit, sendEmail, storeInbox, str, userId } from "../_shared/util.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  if (str(body.website, 200)) return json({ ok: true }); // honeypot

  const name = str(body.name, 120);
  const email = str(body.email, 254);
  const question = str(body.question, 2000);
  const productId = str(body.productId, 64);
  const errors: Record<string, string> = {};
  if (!name) errors.name = "required";
  if (!isEmail(email)) errors.email = "invalid";
  if (question.length < 5) errors.question = "too_short";
  if (!/^[0-9a-f-]{36}$/i.test(productId)) errors.productId = "invalid";
  if (Object.keys(errors).length) return json({ error: "validation", fields: errors }, 422);

  if (!(await rateLimit(req, "question", 5))) return json({ error: "rate_limited" }, 429);

  const db = admin();
  const { data: product } = await db.from("products").select("id, name_en, slug").eq("id", productId).maybeSingle();
  if (!product) return json({ error: "validation", fields: { productId: "unknown" } }, 422);

  const { error } = await db.from("product_questions").insert({ product_id: product.id, user_id: await userId(req), name, email, question });
  if (error) {
    console.error(error.message);
    return json({ error: "save_failed" }, 500);
  }
  const mail = await sendEmail(
    (await storeInbox()) ?? "",
    `Product question: ${product.name_en ?? product.slug}`,
    `<p><b>${escapeHtml(name)}</b> &lt;${escapeHtml(email)}&gt; asked about <b>${escapeHtml(product.name_en ?? product.slug)}</b>:</p>
     <p style="white-space:pre-wrap">${escapeHtml(question)}</p>`,
    email,
  );
  return json({ ok: true, emailed: mail.sent });
});
