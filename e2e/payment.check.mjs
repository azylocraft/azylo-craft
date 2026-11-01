// End-to-end Razorpay test payment: cart → checkout → Razorpay (test card) → confirmation.
// Usage: node e2e/payment.check.mjs <screenshotDir>
import { chromium } from "@playwright/test";

const out = process.argv[2];
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
const shot = (n) => p.screenshot({ path: `${out}/pay-${n}.png` });
const step = (s) => console.log("•", s);
try {
  await p.goto("http://localhost:3000/products/electric-recliner-sofa-bed", { timeout: 120000 });
  await p.getByRole("button", { name: "Add to cart" }).first().click();
  await p.waitForTimeout(800);
  await p.goto("http://localhost:3000/checkout", { timeout: 120000 });
  await p.locator("input[type=email]").fill("azylocraft+test@gmail.com");
  await p.locator('input[autocomplete="shipping given-name"]').fill("Test");
  await p.locator('input[autocomplete="shipping family-name"]').fill("Buyer");
  await p.locator('input[autocomplete="shipping address-line1"]').fill("12 MG Road");
  await p.locator('input[autocomplete="shipping address-level2"]').fill("Bengaluru");
  await p.locator('select[autocomplete="shipping address-level1"]').selectOption("Karnataka");
  await p.locator('input[autocomplete="shipping postal-code"]').fill("560001");
  await p.locator('input[autocomplete="shipping tel"]').fill("9845012763");
  await p.waitForTimeout(2500);
  step("checkout filled");
  await p.getByRole("button", { name: /Pay now/ }).click();

  const frame = p.frameLocator("iframe.razorpay-checkout-frame");
  await frame.locator("body").waitFor({ timeout: 30000 });
  await p.waitForTimeout(4000);
  await shot("1-modal");
  step("razorpay window open");

  // Razorpay may ask for contact details first.
  const mobile0 = frame.getByPlaceholder(/Mobile number/i);
  await frame.getByText(/^Cards?$/i).first().waitFor({ timeout: 45000 });
  if (await mobile0.isVisible({ timeout: 5000 }).catch(() => false)) {
    await mobile0.fill("9845012763");
    await frame.getByRole("button", { name: /^Continue/i }).last().click();
    step("filled contact details");
    await p.waitForTimeout(2500);
  }
  const card = frame.getByText(/^Cards?$/i).first();
  await card.click().catch(() => {});
  await frame.locator('input[name="card.number"], input[autocomplete="cc-number"]').first().fill("4111 1111 1111 1111", { timeout: 30000 });
  await frame.locator('input[name="card.expiry"], input[autocomplete="cc-exp"]').first().fill("12/30");
  await frame.locator('input[name="card.cvv"], input[autocomplete="cc-csc"]').first().fill("123");
  const name = frame.locator('input[name="card.name"]');
  if (await name.isVisible().catch(() => false)) await name.fill("Test Buyer");
  await shot("2-card");
  await p.waitForTimeout(1000);
  await frame.getByRole("button", { name: "Continue", exact: true }).click();
  step("card submitted");
  const later = frame.getByRole("button", { name: /Maybe later/i });
  if (await later.isVisible({ timeout: 8000 }).catch(() => false)) {
    await later.click();
    step("skipped save-card prompt");
  }
  await p.waitForTimeout(3000);
  await shot("3-after-continue");
  // If Razorpay still asks for contact details, fill them and continue.
  const mobile = frame.getByPlaceholder(/Mobile number/i);
  if (await mobile.isVisible({ timeout: 4000 }).catch(() => false)) {
    await mobile.fill("9845012763");
    await frame.getByRole("button", { name: /^Continue/i }).last().click();
    step("filled contact details");
  }

  // Test-mode bank page opens in a popup or in the frame: click Success.
  const popup = await p.waitForEvent("popup", { timeout: 30000 }).catch(() => null);
  if (popup) {
    await popup.waitForLoadState();
    await popup.screenshot({ path: `${out}/pay-3-bank.png` });
    await popup.getByRole("button", { name: /success/i }).click({ timeout: 15000 });
    step("clicked Success on test bank page");
  } else {
    const ok = frame.getByRole("button", { name: /success/i });
    if (await ok.isVisible({ timeout: 10000 }).catch(() => false)) await ok.click();
    step("no popup — tried in-frame success");
  }
  await p.waitForURL(/checkout\/confirmation/, { timeout: 60000 });
  await p.getByText(/Thank you for your order|Confirming your payment/).waitFor({ timeout: 60000 });
  await p.waitForTimeout(4000);
  await shot("4-confirmation");
  console.log("RESULT:", (await p.locator("h1").innerText()).trim(), "|", (await p.getByText(/Order #/).first().innerText()).trim());
} catch (e) {
  await shot("error").catch(() => {});
  console.log("FAILED at:", e.message.split("\n")[0]);
} finally {
  await b.close();
}
