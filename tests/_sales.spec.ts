import { test, expect, type Page } from "@playwright/test";

async function loginUI(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/dashboard", { timeout: 15000 });
}

test.describe("Sales Readiness — publik", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("Landing: value prop, CTA, harga jelas", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Absensi, Nilai", { timeout: 10000 });
    await expect(page.locator('a:has-text("Coba Gratis Sekarang")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Beli Sekarang")')).toBeVisible();
    await page.locator('a:has-text("Beli Sekarang")').first().scrollIntoViewIfNeeded();
    await expect(page.locator('section[id="harga"]')).toBeVisible();
    await expect(page.locator("text=Rp 0")).toBeVisible();
    await expect(page.locator("text=Rp 29.000")).toBeVisible();
    await expect(page.locator("text=Rp 49.000")).toBeVisible();
  });

  test("Landing mobile: CTA & harga terlihat", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.locator('a:has-text("Coba Gratis Sekarang")').first()).toBeVisible({ timeout: 10000 });
    await page.goto("/#harga");
    await expect(page.locator("text=Rp 29.000")).toBeVisible({ timeout: 10000 });
  });

  test("Register: form tampil & jalur jelas", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('a:has-text("Masuk")')).toBeVisible();
  });

  test("Login mobile: form tampil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");
    await expect(page.locator('input[name="email"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test("Login admin → dashboard (jalur LANDING→LOGIN→DASHBOARD)", async ({ page }) => {
    await page.goto("/");
    await page.locator('a:has-text("Masuk")').first().click();
    await page.waitForURL("**/login", { timeout: 10000 });
    await loginUI(page);
    await expect(page.locator("h1")).toContainText("Dashboard", { timeout: 10000 });
  });
});

test.describe("Sales Readiness — sesi", () => {
  test("Checkout: paket default pro, harga konsisten", async ({ page }) => {
    await loginUI(page);
    await page.goto("/checkout");
    await expect(page.locator("h1, h2").first()).toContainText("Checkout", { timeout: 10000 });
    await expect(page.locator("text=29.000").first()).toBeVisible();
    await page.goto("/checkout?plan=premium");
    await expect(page.locator("text=49.000").first()).toBeVisible();
  });

  test("Dashboard admin: tidak rusak (regression cepat)", async ({ page }) => {
    await loginUI(page);
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard", { timeout: 10000 });
    await expect(page.locator("text=Siswa Terdaftar")).toBeVisible();
  });
});