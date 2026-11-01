import { expect, test } from "@playwright/test";

// Runs against the demo catalogue (npm run demo:seed).

test("collection lists products and sort changes order", async ({ page }) => {
  await page.goto("/collections/power-reclining-sofas");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Power Reclining Sofas");
  await expect(page.getByText(/\d+ products/)).toBeVisible();
  await page.getByRole("button", { name: "Featured" }).click();
  await page.getByRole("option", { name: "Price, low to high" }).click();
  await expect(page).toHaveURL(/sort=price-asc/);
  const prices = await page.locator("a[href^='/products/'] >> text=/FROM/").allTextContents();
  const nums = prices.map((p) => Number(p.replace(/[^0-9.]/g, "")));
  expect([...nums].sort((a, b) => a - b)).toEqual(nums);
});

test("filters narrow results and chips clear them", async ({ page }) => {
  await page.goto("/collections/all?fn=massage");
  await expect(page.getByText("1 products")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await expect(page).not.toHaveURL(/fn=/);
});

test("purchase flow: variant → add to cart → drawer → cart page", async ({ page }) => {
  await page.goto("/products/electric-recliner-sofa-bed");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Electric Recliner Sofa Bed");
  // A model without a price disables Add to cart and shows MISSING.
  await page.getByRole("button", { name: /^Imported leather · Chaise lounge \/ Electric MISSING/ }).click();
  await expect(page.getByRole("button", { name: "Unavailable" }).first()).toBeDisabled();
  // A priced model enables it and updates the price.
  await page.getByRole("button", { name: /Imported leather · Chaise lounge \/ Electric \/ Massage/ }).click();
  await expect(page.getByText("$3,510.00 CAD").first()).toBeVisible();
  // Custom colour note.
  await page.getByRole("button", { name: "Custom color" }).click();
  await expect(page.getByText(/we'll contact you after ordering/)).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).first().click();
  const drawer = page.getByRole("dialog", { name: "Your cart" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText("1 item(s)")).toBeVisible();
  await drawer.getByRole("link", { name: "View cart" }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByText("Custom color").first()).toBeVisible();
});

test("wishlist heart updates badge and drawer", async ({ page, isMobile }) => {
  test.skip(isMobile, "header wishlist button is desktop-only");
  await page.goto("/collections/small-space-sofas");
  await page.getByRole("button", { name: "Save to wishlist" }).first().click();
  await expect(page.getByRole("button", { name: "Wishlist (1)" })).toBeVisible();
  await page.getByRole("button", { name: "Wishlist (1)" }).click();
  const drawer = page.getByRole("dialog", { name: "Saved pieces" });
  await expect(drawer.getByRole("link", { name: /View piece/ })).toBeVisible();
  await drawer.getByRole("button", { name: "Remove from saved pieces" }).click();
  await expect(drawer.getByText("Nothing saved yet")).toBeVisible();
});

test("search overlay shows live suggestions and Enter opens results", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Search sofas/ }).first().click({ force: isMobile });
  const box = page.getByRole("textbox", { name: "What are you looking for?" });
  await box.fill("recliner");
  await expect(page.getByRole("dialog", { name: "Find the right piece." }).getByRole("link", { name: /Electric Recliner Sofa Bed/ })).toBeVisible();
  await box.press("Enter");
  await expect(page).toHaveURL(/\/search\?q=recliner/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("recliner");
});

test("unknown product shows the 404 screen", async ({ page }) => {
  await page.goto("/products/does-not-exist");
  await expect(page.getByText("This page doesn't exist.")).toBeVisible();
});

test("FAQ hash deep link opens the question", async ({ page }) => {
  await page.goto("/pages/faq#how-long-does-delivery-take");
  await expect(page.getByRole("button", { name: "How long does delivery take?" })).toHaveAttribute("aria-expanded", "true");
});
