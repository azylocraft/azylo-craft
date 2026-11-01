// Captures design-comparison screenshots: node e2e/screens.mjs <outDir> [baseUrl]
import { chromium } from "@playwright/test";

const out = process.argv[2] ?? "test-results/screens";
const base = process.argv[3] ?? "http://localhost:3000";
const browser = await chromium.launch();

for (const [name, width, height] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(base + "/");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${out}/home-${name}.png`, fullPage: true });
  if (name === "desktop") {
    await page.getByRole("button", { name: "Categories" }).click();
    await page.screenshot({ path: `${out}/cat-${name}.png` });
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Discover" }).click();
    await page.screenshot({ path: `${out}/disc-${name}.png` });
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: /EN/ }).click();
    await page.screenshot({ path: `${out}/lang-${name}.png` });
  } else {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.screenshot({ path: `${out}/menu-${name}.png` });
  }
  await page.close();
}
await browser.close();
