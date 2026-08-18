import { test, expect } from "@playwright/test";

const CORE_PAGES = ["/dashboard", "/siswa", "/kelas", "/jadwal", "/absensi", "/jurnal", "/nilai", "/documentation"];

test.describe("P1 Regression", () => {
  for (const path of CORE_PAGES) {
    test(`${path} tidak rusak`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBe(200);
      await expect(page.locator("main").first()).toBeVisible({ timeout: 10000 });
    });
  }
});