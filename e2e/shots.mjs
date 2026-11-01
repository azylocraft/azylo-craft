// Full-page screenshots of key routes: node e2e/shots.mjs <outDir> [width]
import { chromium } from "@playwright/test";
const out = process.argv[2];
const width = Number(process.argv[3] ?? 1440);
const routes = ["/", "/collections/power-reclining-sofas", "/products/electric-recliner-sofa-bed", "/pages/blogs", "/pages/sofa-materials-guide", "/pages/faq", "/pages/contact", "/blogs/moving-a-sofa-in-montreal", "/products/nope"];
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
page.on("console", (m) => m.type() === "error" && errors.push(`${page.url()}: ${m.text().slice(0, 200)}`));
for (const r of routes) {
  await page.goto("http://localhost:3000" + r);
  await page.waitForLoadState("load");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${out}/${width}${r.replace(/[/?=]/g, "_") || "_home"}.png`, fullPage: true });
}
console.log(errors.length ? errors.join("\n") : "no console errors");
await b.close();
