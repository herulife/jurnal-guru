import { test, expect, request as pwRequest } from "@playwright/test";
import { existsSync } from "node:fs";

const VIEWPORTS = [
  { name: "iPhone 12", width: 390, height: 844 },
  { name: "iPhone SE", width: 375, height: 812 },
  { name: "Pixel 7", width: 412, height: 915 },
];

const ADMIN_STATE = "playwright/.auth/checkout-admin.json";

async function noOverflow(page: import("@playwright/test").Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1800);
  const m = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
  }));
  expect(m.scrollW, `${url} @${page.viewportSize()?.width}px: horizontal overflow ${m.scrollW} > ${m.clientW}`).toBeLessThanOrEqual(m.clientW + 1);
}

test.describe("mobile viewport", () => {
  for (const v of VIEWPORTS) {
    test(`landing/register/login/checkout tanpa overflow @${v.width}px`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, storageState: { cookies: [], origins: [] } });
      const page = await ctx.newPage();
      for (const url of ["/", "/register", "/login", "/checkout"]) {
        await noOverflow(page, url);
      }
      await ctx.close();
    });
  }

  test("checkout + subscription terlogin tanpa overflow (3 viewport)", async ({ browser }) => {
    if (!existsSync(ADMIN_STATE)) return;
    for (const v of VIEWPORTS) {
      const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, storageState: ADMIN_STATE });
      const page = await ctx.newPage();
      await noOverflow(page, "/checkout?plan=pro");
      await noOverflow(page, "/subscription");
      await noOverflow(page, "/checkout?plan=premium");
      await ctx.close();
    }
  });
});
