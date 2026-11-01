// Uploads the free-gift photos and sets the gift list + bonuses in store_settings. Safe to re-run.
// Usage: node scripts/seed-gifts.mjs
import fs from "node:fs";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// Demo values — replace with genuine values in Admin → Settings.
const GIFTS = [
  { key: "tea-table", title: "Solid-wood tea table", value_inr: 6999, file: "tea-table.png", focus: "south" },
  { key: "bean-bag", title: "Linen bean bag", value_inr: 3999, file: "bean-bag.png", focus: "centre" },
  { key: "ottoman", title: "Bouclé ottoman", value_inr: 4999, file: "ottoman.png", focus: "south" },
  { key: "cushion-set", title: "Set of 3 cushions", value_inr: 1999, file: "cushion-set.png", focus: "centre" },
];

const out = [];
for (const g of GIFTS) {
  const buf = await sharp(`assets/demo/gifts/${g.file}`).resize(800, 800, { fit: "cover", position: g.focus }).webp({ quality: 84 }).toBuffer();
  const path = `gifts/${g.key}.webp`;
  const { error } = await db.storage.from("product-media").upload(path, buf, { contentType: "image/webp", upsert: true });
  if (error) throw new Error(`${g.key}: ${error.message}`);
  out.push({ key: g.key, title: g.title, value_inr: g.value_inr, image_path: path });
}

const bonuses = [
  { title: "Free doorstep delivery — no extra charges, no hassle", value_inr: 2999 },
  { title: "5-year warranty, then repairs for a small convenience fee", value_inr: 4999 },
  { title: "Free e-book: 10 steps to choosing and caring for your sofa", value_inr: 499, href: "/pages/sofa-care-guide" },
];
const { error } = await db.from("store_settings").update({ free_gifts: out, bonuses_default: bonuses }).eq("id", 1);
if (error) throw new Error(error.message);
await db.from("products").update({ free_gift_enabled: false }).in("slug", ["payment-test-item", "smart-lift-coffee-table-wireless-charging"]);
console.log("gifts:", out.map((g) => g.key).join(", "));
