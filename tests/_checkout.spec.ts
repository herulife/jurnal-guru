import { test, expect, request as pwRequest, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const TS = Date.now().toString(36);
const EMAIL = `co-${TS}@test.local`;
const PASS = "test12345";
const USER_STATE = "playwright/.auth/checkout-user.json";
const ADMIN_STATE = "playwright/.auth/checkout-admin.json";

let orderId = "";

function verifyEmailDirect(email: string) {
  execFileSync("node", [
    "-e",
    `const { createClient } = require("@libsql/client");
const c = createClient({ url: "file:./data.db" });
c.execute({ sql: "UPDATE users SET email_verified = 1 WHERE email = ?", args: [${JSON.stringify(email)}] }).then(() => { console.log("ok"); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });`,
  ], { cwd: process.cwd(), stdio: "ignore" });
}

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

async function loginApi(base: APIRequestContext, username: string, password: string, path: string) {
  const r = await base.post("/api/auth/login", { data: { username, password } });
  expect(r.status()).toBe(200);
  await base.storageState({ path });
  return path;
}

async function userCtx(browser: import("@playwright/test").Browser): Promise<{ ctx: BrowserContext; page: Page }> {
  const ctx = await browser.newContext({ storageState: USER_STATE });
  return { ctx, page: await ctx.newPage() };
}

test.describe.serial("checkout order ux", () => {
  test.beforeAll(async ({ request }) => {
    const r = await request.post("/api/auth/register", {
      data: { username: EMAIL, email: EMAIL, password: PASS, namaLengkap: "User Checkout Test" },
    });
    expect(r.status()).toBe(200);
    verifyEmailDirect(EMAIL);
    await loginApi(request, EMAIL, PASS, USER_STATE);
    if (!existsSync(ADMIN_STATE)) {
      await loginApi(request, "admin", "admin123", ADMIN_STATE);
    }
  });

  test("guest checkout: diminta login untuk melanjutkan", async ({ browser }) => {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    await p.goto("/checkout");
    await expect(p.getByText(/login atau daftar akun terlebih dahulu/i)).toBeVisible({ timeout: 15000 });
    await expect(p.getByRole("link", { name: /Masuk/i })).toBeVisible();
    await ctx.close();
  });

  test("order flow: pilih pro → bayar → upload bukti → pending", async ({ browser }) => {
    const { ctx, page } = await userCtx(browser);
    await page.goto("/checkout?plan=pro");
    await expect(page.getByText("Rp 49.000", { exact: false }).first()).toBeVisible();

    await page.getByRole("button", { name: /Lanjut ke Pembayaran/i }).first().click();
    await page.locator("#wa").fill("081234567890");
    await page.getByRole("button", { name: /Buat Pesanan/i }).click();
    await expect(page.getByText(/Silakan Transfer ke Rekening/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /Saya Sudah Transfer/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Upload Bukti Transfer/i)).toBeVisible({ timeout: 30000 });

    await page.locator('input[type="file"]').setInputFiles({ name: "bukti.png", mimeType: "image/png", buffer: PNG });
    await page.getByRole("button", { name: /Kirim Konfirmasi/i }).click();

    await expect(page.getByText("Menunggu Verifikasi").first()).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/Pesanan Dibuat/i)).toBeVisible();
    await expect(page.getByText(/Paket Aktif/i).first()).toBeVisible();
    orderId = (await page.locator("p:has-text('JG-')").first().textContent({ timeout: 5000 })) ?? "";
    expect(orderId).toMatch(/^JG-[0-9A-F]{8}$/);
    await ctx.close();
  });

  test("riwayat pesanan muncul di halaman langganan", async ({ browser }) => {
    const { ctx, page } = await userCtx(browser);
    await page.goto("/subscription");
    await expect(page.getByText("Riwayat Pesanan")).toBeVisible();
    await expect(page.locator("td", { hasText: orderId })).toBeVisible();
    await expect(page.getByText("Menunggu Pembayaran")).toBeVisible();
    await ctx.close();
  });

  test("admin verifikasi → status sukses dengan masa aktif", async ({ browser, request }) => {
    const adm = await pwRequest.newContext({ storageState: ADMIN_STATE });
    const list = await adm.get("/api/payments?admin=1");
    const rows = (await list.json()).data?.payments || [];
    const mine = [...rows].reverse().find((r: { whatsapp: string }) => r.whatsapp === "6281234567890");
    expect(mine).toBeTruthy();
    const payId = mine.id;

    const approve = await adm.patch(`/api/payments/${payId}`, { data: { status: "verifikasi" } });
    expect(approve.status()).toBe(200);

    const { ctx, page } = await userCtx(browser);
    await page.goto(`/checkout?payment=${payId}`);
    await expect(page.getByText("Pembayaran Berhasil!")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Masa Aktif/i)).toBeVisible();
    await expect(page.getByText(/Aktif/i).last()).toBeVisible();
    await ctx.close();
  });

  test("admin tolak → status ditolak + tombol coba lagi", async ({ browser, request }) => {
    const { ctx, page } = await userCtx(browser);
    await page.goto("/checkout?plan=premium");
    await page.getByRole("button", { name: /Lanjut ke Pembayaran/i }).first().click();
    await page.locator("#wa").fill("081298765432");
    await page.getByRole("button", { name: /Buat Pesanan/i }).click();
    await expect(page.getByText(/Silakan Transfer ke Rekening/i)).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: /Saya Sudah Transfer/i }).click();
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/Upload Bukti Transfer/i)).toBeVisible({ timeout: 30000 });
    await page.locator('input[type="file"]').setInputFiles({ name: "bukti2.png", mimeType: "image/png", buffer: PNG });
    await page.getByRole("button", { name: /Kirim Konfirmasi/i }).click();
    await expect(page.getByText("Menunggu Verifikasi").first()).toBeVisible({ timeout: 20000 });

    const adm = await pwRequest.newContext({ storageState: ADMIN_STATE });
    const list = await adm.get("/api/payments?admin=1");
    const rows = (await list.json()).data?.payments || [];
    const mine = [...rows].reverse().find((r: { whatsapp: string }) => r.whatsapp === "6281298765432");
    expect(mine).toBeTruthy();
    const payId = mine.id;

    const reject = await adm.patch(`/api/payments/${payId}`, { data: { status: "tolak" } });
    expect(reject.status()).toBe(200);

    await page.goto(`/checkout?payment=${payId}`);
    await expect(page.getByText("Pembayaran Tidak Berhasil")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Coba Pembayaran Lagi/i)).toBeVisible();
    await ctx.close();
  });
});
