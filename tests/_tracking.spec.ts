import { test, expect, request as pwRequest } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const TS = Date.now().toString(36);
const EMAIL = `trk-${TS}@test.local`;
const PASS = "test12345";
const USER_STATE = "playwright/.auth/trk-user.json";
const ADMIN_STATE = "playwright/.auth/checkout-admin.json";

function countEvent(event: string, since: string): number {
  const out = execFileSync("node", [
    "-e",
    `const { createClient } = require("@libsql/client");
const c = createClient({ url: "file:./data.db" });
c.execute({ sql: "SELECT COUNT(*) AS n FROM events WHERE event = ? AND timestamp >= ?", args: [${JSON.stringify(event)}, ${JSON.stringify(since)}] }).then((r) => { console.log(r.rows[0].n); process.exit(0); });`,
  ], { cwd: process.cwd(), encoding: "utf8" });
  return Number(out.trim().replace(/\u001b\[[0-9;]*m/g, ""));
}

async function login(base: import("@playwright/test").APIRequestContext, username: string, password: string, path: string) {
  const r = await base.post("/api/auth/login", { data: { username, password } });
  expect(r.status()).toBe(200);
  await base.storageState({ path });
}

test.describe.serial("minimal marketing tracking", () => {
  let since = "";
  let userId = "";
  let base: Record<string, number> = {};

  test.beforeAll(async ({ request }) => {
    since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    for (const e of ["landing_view", "register_started", "register_completed", "checkout_viewed", "payment_created", "payment_proof_submitted", "payment_approved"]) {
      base[e] = countEvent(e, since);
    }
    const r = await request.post("/api/auth/register", {
      data: { username: EMAIL, email: EMAIL, password: PASS, namaLengkap: "User Tracking Test" },
    });
    expect(r.status()).toBe(200);
    userId = execFileSync("node", [
      "-e",
      `const { createClient } = require("@libsql/client");
const c = createClient({ url: "file:./data.db" });
c.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [${JSON.stringify(EMAIL)}] }).then((r) => { console.log(r.rows[0].id); process.exit(0); });`,
    ], { cwd: process.cwd(), encoding: "utf8" }).trim();
    execFileSync("node", [
      "-e",
      `const { createClient } = require("@libsql/client");
const c = createClient({ url: "file:./data.db" });
c.execute({ sql: "UPDATE users SET email_verified = 1 WHERE id = ?", args: [${JSON.stringify(userId)}] }).then(() => { console.log("ok"); process.exit(0); });`,
    ], { cwd: process.cwd(), stdio: "ignore" });
    await login(request, EMAIL, PASS, USER_STATE);
    if (!existsSync(ADMIN_STATE)) {
      await login(request, "admin", "admin123", ADMIN_STATE);
    }
  });

  test("landing_view tercatat 1x walau reload (dedupe re-render)", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.reload();
    await page.waitForTimeout(1500);
    await ctx.close();
    expect(countEvent("landing_view", since) - base.landing_view).toBe(1);
  });

  test("klik daftar dari landing → register_started", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    await page.getByRole("link", { name: "Coba Gratis Sekarang" }).first().click();
    await page.waitForURL("**/register", { timeout: 10000 });
    await page.waitForTimeout(800);
    await ctx.close();
    expect(countEvent("register_started", since) - base.register_started).toBe(1);
  });

  test("checkout_viewed 1x walau buka checkout 2x dalam sesi", async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: USER_STATE });
    const page = await ctx.newPage();
    await page.goto("/checkout?plan=pro", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.goto("/checkout?plan=premium", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await ctx.close();
    expect(countEvent("checkout_viewed", since) - base.checkout_viewed).toBe(1);
  });

  test("payment_created + proof_submitted + approved tercatat", async ({ request }) => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    const buat = await u.post("/api/payments", { data: { planId: "pro_6m", whatsapp: "081200000003" } });
    expect(buat.status()).toBe(200);
    const payId = (await buat.json()).data?.paymentId;
    const ok = await u.post(`/api/payments/${payId}/proof`, {
      multipart: { file: { name: "bukti.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64") } },
    });
    expect(ok.status()).toBe(200);
    const a = await pwRequest.newContext({ storageState: ADMIN_STATE });
    const ver = await a.patch(`/api/payments/${payId}`, { data: { status: "verifikasi" } });
    expect(ver.status()).toBe(200);
    expect(countEvent("payment_created", since) - base.payment_created).toBe(1);
    expect(countEvent("payment_proof_submitted", since) - base.payment_proof_submitted).toBe(1);
    expect(countEvent("payment_approved", since) - base.payment_approved).toBe(1);
    expect(countEvent("register_completed", since) - base.register_completed).toBe(1);
  });
});