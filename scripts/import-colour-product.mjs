// Import a colour-based product from "furnitures in my shop/<Category>/<Product>/<n>-<colour>/".
// Creates/updates the product, uploads every photo (tagged with colour + category from the filename),
// creates the material × colour variants, links the collection and turns on per-colour cards.
//
// Usage:
//   node scripts/import-colour-product.mjs "<product folder>" --slug <url-slug> --name "<Product Name>" \
//        --collection <collection-slug> [--price <PF price>] [--mrp <genuine PF MRP>]
//
// Filenames: NN-<category>-<what>.jpg where category is studio | swatch | live | detail
// (e.g. 01-studio-front.jpg, 04-swatch-colour.jpg, 05-live-in-home-bed.jpg, 08-detail-armrest.jpg).
// Colour folders: "<n>-<colour>" (e.g. 1-white, 3-olive-green); n sets the colour order.
// Re-runnable: photos are replaced, existing variants are kept (prices only set when --price is given).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]));
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const BUCKET = "product-media";

const [dir, ...rest] = process.argv.slice(2);
const arg = (k) => { const i = rest.indexOf(`--${k}`); return i >= 0 ? rest[i + 1] : undefined; };
const slug = arg("slug"), name = arg("name"), collection = arg("collection");
const price = arg("price") ? Number(arg("price")) : null;
const mrp = arg("mrp") ? Number(arg("mrp")) : null;
if (!dir || !slug || !name || !collection) {
  console.error('Usage: node scripts/import-colour-product.mjs "<folder>" --slug <slug> --name "<Name>" --collection <collection-slug> [--price N] [--mrp N]');
  process.exit(1);
}

const COLOUR_HEX = {
  white: "#ECEAE4", grey: "#A3A3A1", "olive green": "#5E6B3A", orange: "#C4652F", wheat: "#D6B266", beige: "#D8CBB0",
  cream: "#EFE6D2", charcoal: "#3E3D3B", black: "#1C1B1A", brown: "#6B4A33", navy: "#2F3B55", terracotta: "#B5583A",
};
const TYPE = { studio: "studio", swatch: "swatch", live: "real_space", detail: "detail" };
const titleCase = (s) => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const round10 = (n) => Math.round(n / 10) * 10;

/** Room photos have a white band with the logo on top: crop to where the photo starts. */
async function cropBand(file) {
  const { data, info } = await sharp(file).greyscale().raw().toBuffer({ resolveWithObject: true });
  const sd = (y) => { let s = 0, s2 = 0; for (let x = 0; x < info.width; x++) { const v = data[y * info.width + x]; s += v; s2 += v * v; } const m = s / info.width; return Math.sqrt(s2 / info.width - m * m); };
  for (let y = 330; y < Math.min(700, info.height - 30); y++) { let ok = true; for (let k = 0; k < 25 && ok; k += 5) ok = sd(y + k) > 10; if (ok) return y + 2; }
  return 0;
}

// 1. Product
let { data: product } = await db.from("products").select("id").eq("slug", slug).maybeSingle();
if (!product) {
  const { data, error } = await db.from("products").insert({ slug, name_en: name, is_published: false, lead_time_min_days: 45, lead_time_max_days: 55 }).select("id").single();
  if (error) throw error;
  product = data;
  console.log("created product", slug, "(unpublished — publish it in Admin when ready)");
}
const PID = product.id;
await db.from("products").update({ name_en: name, list_by_colour: true }).eq("id", PID);

// 2. Collection link
const { data: col } = await db.from("collections").select("id").eq("slug", collection).maybeSingle();
if (!col) throw new Error(`collection "${collection}" not found`);
await db.from("product_collections").upsert({ product_id: PID, collection_id: col.id }, { onConflict: "product_id,collection_id", ignoreDuplicates: true });

// 3. Photos
const folders = fs.readdirSync(dir).filter((d) => /^\d+-/.test(d)).sort((a, b) => parseInt(a) - parseInt(b));
if (!folders.length) throw new Error("no <n>-<colour> folders found");
const colours = [];
const rows = [];
for (const [ci, folder] of folders.entries()) {
  const key = folder.replace(/^\d+-/, "");
  const colour = titleCase(key);
  colours.push(colour);
  const files = fs.readdirSync(path.join(dir, folder)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  for (const [fi, f] of files.entries()) {
    const base = path.basename(f, path.extname(f));
    const cat = base.split("-")[1];
    const type = TYPE[cat];
    if (!type) throw new Error(`${folder}/${f}: name must be NN-studio|swatch|live|detail-…`);
    const file = path.join(dir, folder, f);
    let img = sharp(file).rotate();
    if (type === "real_space") {
      const top = await cropBand(file);
      if (top) { const m = await sharp(file).metadata(); img = sharp(file).extract({ left: 0, top, width: m.width, height: m.height - top }); }
    }
    const buf = await img.webp({ quality: 86 }).toBuffer();
    // Content hash in the name: files are cached for a year, so a replaced photo needs a new URL.
    const hash = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 8);
    const storage = `products/${slug}/colours/${key}/${base}-${hash}.webp`;
    const { error } = await db.storage.from(BUCKET).upload(storage, buf, { contentType: "image/webp", upsert: true, cacheControl: "31536000" });
    if (error) throw new Error(`${folder}/${f}: ${error.message}`);
    const what = base.split("-").slice(2).join(" ");
    rows.push({ product_id: PID, storage_path: storage, image_type: type, color_en: colour, alt_en: `${colour} ${name.toLowerCase()} — ${what}`, sort_order: ci * 100 + fi });
  }
  console.log(`${colour}: ${files.length} photos`);
}
const { data: old } = await db.from("product_images").select("id, storage_path").eq("product_id", PID);
const keep = new Set(rows.map((r) => r.storage_path));
await db.from("product_images").delete().eq("product_id", PID);
const { error: ie } = await db.from("product_images").insert(rows);
if (ie) throw ie;
// Old files no longer used — kept if a collection banner still points at one.
const { data: banners } = await db.from("collections").select("hero_image_path");
const inUse = new Set((banners ?? []).map((b) => b.hero_image_path));
const stale = (old ?? []).map((r) => r.storage_path).filter((p) => !keep.has(p) && !inUse.has(p));
if (stale.length) await db.storage.from(BUCKET).remove(stale);

// 4. Variants: every material × colour (missing ones only); prices from the material price index
const { data: s } = await db.from("store_settings").select("material_price_index").eq("id", 1).single();
const index = s.material_price_index;
const basePct = Math.min(...index.map((m) => m.index));
const { data: existing } = await db.from("product_variants").select("id, model_en, color_en").eq("product_id", PID);
const code = (t) => t.replace(/\(.*?\)/g, "").trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase();
let prefix = slug.split("-").map((w) => w[0]).join("").toUpperCase().slice(0, 5);
// Initials can clash with another product (convertible-leather-sofa vs convertible-lounge-sofa…): lengthen until unique.
for (let n = 2; ; n++) {
  const { data: clash } = await db.from("product_variants").select("id").like("sku", `${prefix}-%`).neq("product_id", PID).limit(1);
  if (!clash?.length) break;
  prefix = slug.split("-").map((w) => w.slice(0, n)).join("").toUpperCase().slice(0, 8);
}
const add = [];
const updates = [];
index.forEach((m, mi) => colours.forEach((c, ci) => {
  const p = price ? (m.index === basePct ? price : round10((price * m.index) / basePct)) : null;
  const cmp = mrp ? (m.index === basePct ? mrp : round10((mrp * m.index) / basePct)) : null;
  const row = { product_id: PID, model_en: m.name, color_en: c, color_hex: COLOUR_HEX[c.toLowerCase()] ?? "#C9B48F", material: /leather/i.test(m.name) ? "leather" : "fabric", sku: `${prefix}-${code(m.name)}-${c.toUpperCase().replace(/[^A-Z0-9]/g, "")}`, is_active: true, sort_order: mi * 10 + ci };
  const ex = existing?.find((v) => v.model_en === m.name && v.color_en === c);
  if (!ex) add.push({ ...row, price_inr: p, compare_at_inr: cmp });
  else if (price) updates.push(db.from("product_variants").update({ price_inr: p, compare_at_inr: cmp, sort_order: row.sort_order }).eq("id", ex.id));
}));
await Promise.all(updates);
if (add.length) { const { error } = await db.from("product_variants").insert(add); if (error) throw error; }
console.log(`\n${rows.length} photos · ${colours.length} colours · ${add.length} new variants · collection ${collection}`);
console.log(`Next: Admin → Products → ${name}: write the overview, set the price/MRP in Variants & pricing, add comparisons, then publish.`);
