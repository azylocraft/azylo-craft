// Manual end-to-end check: temporary admin test user → login → account → admin pages → cleanup.
// Usage: node e2e/auth-admin.check.mjs <screenshotDir>
import fs from "node:fs";
import { chromium } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const out = process.argv[2];
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const email = `e2e-${Date.now()}@example.com`;
const password = `Test-${Math.random().toString(36).slice(2)}A1`;

const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { first_name: "Tester" } });
if (error) throw error;
const uid = created.user.id;
await admin.from("profiles").update({ role: "admin" }).eq("id", uid);

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
const results = [];
const check = async (name, fn) => {
  try {
    await fn();
    results.push(`ok   ${name}`);
  } catch (e) {
    results.push(`FAIL ${name}: ${e.message.split("\n")[0]}`);
  }
};
try {
  await check("protected /account redirects to login", async () => {
    await p.goto("http://localhost:3000/account");
    await p.waitForURL(/\/auth\/login\?next=/);
  });
  await check("wrong password shows error", async () => {
    await p.fill('input[type="email"]', email);
    await p.fill('input[autocomplete="current-password"]', "wrong-password");
    await p.click('button[type="submit"]');
    await p.getByText("don't match").waitFor();
  });
  await check("login returns to /account with name", async () => {
    await p.fill('input[autocomplete="current-password"]', password);
    await p.click('button[type="submit"]');
    await p.waitForURL(/\/account$/);
    await p.getByRole("heading", { name: "Hi, Tester" }).waitFor();
    await p.screenshot({ path: `${out}/account.png` });
  });
  await check("header shows Hi, Tester and account drawer opens", async () => {
    await p.getByRole("button", { name: "Hi, Tester" }).click();
    await p.getByRole("dialog", { name: "Account" }).getByRole("link", { name: "Admin panel" }).waitFor();
    await p.keyboard.press("Escape");
  });
  await check("add address", async () => {
    await p.goto("http://localhost:3000/account?tab=profile");
    await p.getByRole("button", { name: "Add" }).click();
    const d = p.getByRole("dialog", { name: "Address" });
    await d.getByLabel("First name").fill("Test");
    await d.getByLabel("Last name").fill("User");
    await d.getByLabel("Address", { exact: true }).fill("1 Test Street");
    await d.getByLabel("City").fill("Montreal");
    await d.getByLabel("Postal code").fill("H2J 2K8");
    await d.getByRole("button", { name: "Save address" }).click();
    await p.getByText("1 Test Street").waitFor();
    await p.screenshot({ path: `${out}/profile.png`, fullPage: true });
  });
  await check("admin products list", async () => {
    await p.goto("http://localhost:3000/admin");
    await p.getByRole("heading", { name: "Products" }).waitFor();
    await p.getByText("Electric Recliner Sofa Bed").first().waitFor();
    await p.screenshot({ path: `${out}/admin-products.png` });
  });
  await check("admin product editor with media + variants", async () => {
    await p.getByText("Electric Recliner Sofa Bed").first().click();
    await p.getByRole("heading", { name: "Photos & videos" }).waitFor();
    await p.getByRole("heading", { name: "Variants & inventory" }).waitFor();
    await p.waitForTimeout(1500);
    await p.screenshot({ path: `${out}/admin-editor.png`, fullPage: true });
  });
  for (const path of ["orders", "inbox", "collections", "settings"])
    await check(`admin ${path}`, async () => {
      await p.goto(`http://localhost:3000/admin/${path}`);
      await p.locator("h1").first().waitFor();
    });
} finally {
  await b.close();
  await admin.from("addresses").delete().eq("user_id", uid);
  await admin.auth.admin.deleteUser(uid);
}
console.log(results.join("\n"));
console.log(errors.length ? "page errors:\n" + errors.join("\n") : "no page errors");
