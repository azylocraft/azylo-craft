import { expect, test } from "@playwright/test";

test.describe("header", () => {
  test("logo, hero and footer render", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("More comfort.");
    await expect(page.locator("footer")).toContainText("A smarter home");
  });

  test("categories panel opens, chevron toggles, closes on Esc and outside click", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop header only");
    await page.goto("/");
    const btn = page.getByRole("button", { name: "Categories" });
    await btn.click();
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("#az-cat-panel");
    for (const label of ["Home", "Power Reclining Sofas", "Smart Tables", "2026 Electric Sofa Catalog", "Blogs", "Contact", "AZYLO App"]) {
      await expect(panel.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await btn.click();
    await page.mouse.click(1300, 800);
    await expect(panel).toBeHidden();
  });

  test("discover menu lists all items", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop header only");
    await page.goto("/");
    await page.getByRole("button", { name: "Discover" }).click();
    const panel = page.locator("#az-disc-panel");
    for (const label of ["2026 Electric Sofa Catalog", "Guides", "Sofa Materials Guide", "About us", "Contact", "App"]) {
      await expect(panel.getByText(label, { exact: true })).toBeVisible();
    }
  });

  test("language and currency switch applies and persists", async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop header only");
    await page.goto("/");
    await page.getByRole("button", { name: /EN/ }).click();
    await page.getByRole("radio", { name: "Français" }).click();
    await page.getByRole("radio", { name: /EUR/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Plus de confort.");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Plus de confort.");
    await expect(page.getByRole("button", { name: /FR/ })).toContainText("EUR");
  });

  test("mobile hamburger drawer opens with nav items", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer.getByRole("link", { name: "Power Reclining Sofas" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
  });
});
