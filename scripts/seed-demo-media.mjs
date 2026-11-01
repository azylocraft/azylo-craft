// Uploads the demo photos (extracted from the product PDF) to Storage and links them
// to demo products, collections, articles and materials. Safe to re-run.
// Usage: node scripts/seed-demo-media.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const BUCKET = "product-media";
const SRC = "assets/demo";

// Crop away the PDF's thumbnail strip (bottom) and title bar (top), then save as WebP.
const CROP = { p000: [0, 0] }; // [top%, bottom%] overrides
async function prepare(name) {
  const file = path.join(SRC, `${name}.jpg`);
  const meta = await sharp(file).metadata();
  const [top, bottom] = CROP[name] ?? [0.03, 0.19];
  const t = Math.round(meta.height * top);
  const h = Math.round(meta.height * (1 - top - bottom));
  return sharp(file).extract({ left: 0, top: t, width: meta.width, height: h }).webp({ quality: 84 }).toBuffer();
}

const uploaded = new Map();
async function upload(name) {
  if (uploaded.has(name)) return uploaded.get(name);
  const key = `demo/${name}.webp`;
  const { error } = await db.storage.from(BUCKET).upload(key, await prepare(name), { contentType: "image/webp", upsert: true });
  if (error) throw new Error(`${name}: ${error.message}`);
  uploaded.set(name, key);
  return key;
}

const LIFESTYLE = ["p000", "p012", "p008", "p016", "p004", "p006", "p005", "p014"];
const LIVE = ["p004", "p005", "p006", "p014", "p016"];

// Full set for the hero product (matches the PDF).
const HERO = "electric-recliner-sofa-bed";
const HERO_IMAGES = [
  ["p000", "studio", "Electric recliner sofa bed in a bright living room"],
  ["p012", "studio", "Sofa bed with adjustable backrest"],
  ["p008", "studio", "Sofa bed shown seated, reclined and flat"],
  ["p013", "detail", "Premium materials and mechanism overview"],
  ["p015", "detail", "Support frame, motor, base and solid wood frame"],
  ["p007", "detail", "Dimensions: 110 cm wide, 100 cm high, 210 cm extended"],
  ["p009", "detail", "Pet-friendly cat-scratch-resistant fabric"],
  ["p010", "detail", "Solid wood frame"],
  ["p011", "detail", "High-resilience plush cotton filling"],
  ["p001", "swatch", "Cat-claw fabric colour options"],
  ["p002", "swatch", "Fabric colour options"],
  ["p003", "swatch", "Imported leather colour options"],
  ["p004", "real_space", "Real photo — champagne orange fabric"],
  ["p005", "real_space", "Real photo — dark green fabric"],
  ["p006", "real_space", "Real photo — dark green, side view"],
  ["p014", "real_space", "Real photo — motor control detail"],
  ["p016", "real_space", "Real photo — cream leather"],
  ["p000", "real_space", "In a living room"],
  ["p012", "real_space", "Beside a window"],
  ["p008", "real_space", "Reclined in a lounge"],
  ["p016", "real_space", "In an apartment"],
  ["p004", "real_space", "Natural light"],
];

async function setImages(productId, rows) {
  await db.from("product_images").delete().eq("product_id", productId).like("storage_path", "demo/%");
  const inserts = [];
  for (const [i, [name, type, alt]] of rows.entries()) inserts.push({ product_id: productId, storage_path: await upload(name), image_type: type, alt_en: alt, sort_order: i });
  const { error } = await db.from("product_images").insert(inserts);
  if (error) throw new Error(error.message);
}

const { data: products, error } = await db.from("products").select("id, slug, name_en, sort_order").eq("is_demo", true).order("sort_order");
if (error) throw new Error(error.message);

for (const [i, p] of products.entries()) {
  if (p.slug === HERO) {
    await setImages(p.id, HERO_IMAGES);
  } else {
    const a = LIFESTYLE[i % LIFESTYLE.length];
    const b = LIFESTYLE[(i + 3) % LIFESTYLE.length];
    const live = LIVE[i % LIVE.length];
    await setImages(p.id, [
      [a, "studio", `${p.name_en} — demo photo`],
      [b, "studio", `${p.name_en} — demo photo`],
      [live, "real_space", "Real photo (demo)"],
      [LIFESTYLE[(i + 1) % LIFESTYLE.length], "real_space", "Real space (demo)"],
      [LIFESTYLE[(i + 2) % LIFESTYLE.length], "real_space", "Real space (demo)"],
      [LIFESTYLE[(i + 5) % LIFESTYLE.length], "real_space", "Real space (demo)"],
    ]);
  }
  console.log("images →", p.slug);
}

// Collections, articles and materials (only fill empty slots, so your own images are never replaced).
const { data: cols } = await db.from("collections").select("id, slug, hero_image_path").order("sort_order");
for (const [i, c] of (cols ?? []).entries())
  if (!c.hero_image_path || c.hero_image_path.startsWith("demo/"))
    await db.from("collections").update({ hero_image_path: await upload(LIFESTYLE[i % LIFESTYLE.length]) }).eq("id", c.id);

const { data: arts } = await db.from("articles").select("id, cover_image_path, author_avatar_path").order("published_at", { ascending: false });
for (const [i, a] of (arts ?? []).entries())
  if (!a.cover_image_path || a.cover_image_path.startsWith("demo/"))
    await db.from("articles").update({ cover_image_path: await upload(LIFESTYLE[(i + 2) % LIFESTYLE.length]) }).eq("id", a.id);

const MAT = { boucle: ["p000", "p011"], chenille: ["p012", "p001"], velvet: ["p005", "p002"], woven: ["p008", "p009"], "tight-weave": ["p004", "p001"], "vegan-leather": ["p016", "p003"] };
const { data: mats } = await db.from("materials").select("id, slug, sofa_image_path");
for (const m of mats ?? [])
  if (MAT[m.slug] && (!m.sofa_image_path || m.sofa_image_path.startsWith("demo/")))
    await db.from("materials").update({ sofa_image_path: await upload(MAT[m.slug][0]), swatch_image_path: await upload(MAT[m.slug][1]) }).eq("id", m.id);

console.log(`done: ${uploaded.size} files in ${BUCKET}/demo`);
