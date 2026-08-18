import { test, expect } from "@playwright/test";

test.describe("P1 QA", () => {
  test("Goals: list, create, delete (cleanup)", async ({ page }) => {
    const name = `QA Goal ${Date.now()}`;
    await page.goto("/goals");
    await expect(page.locator("h1")).toContainText("Goals", { timeout: 10000 });
    await page.click('button:has-text("Tambah Goal")');
    await page.locator('form input[type="text"]').first().fill(name);
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });

    const res = await page.request.get("/api/marketing/goals");
    const goals = (await res.json()).data.filter((g: { name: string }) => g.name === name);
    for (const g of goals) await page.request.delete(`/api/marketing/goals/${g.id}`);
  });

  test("Plans: list & create", async ({ page }) => {
    const name = `QA Plan ${Date.now()}`;
    await page.goto("/plans");
    await expect(page.locator("h1")).toContainText("Plans", { timeout: 10000 });
    await page.click('button:has-text("Tambah Plan")');
    await page.locator('form input[type="text"]').first().fill(name);
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator(`text=${name}`)).toBeVisible({ timeout: 10000 });

    const res = await page.request.get("/api/marketing/plans");
    const plans = (await res.json()).data.filter((p: { name: string }) => p.name === name);
    for (const p of plans) await page.request.delete(`/api/marketing/plans/${p.id}`);
  });

  test("Tasks: list & create", async ({ page }) => {
    const title = `QA Task ${Date.now()}`;
    await page.goto("/tasks");
    await expect(page.locator("h1")).toContainText("Tasks", { timeout: 10000 });
    await page.click('button:has-text("Tambah Task")');
    await page.locator('form input[type="text"]').first().fill(title);
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator(`text=${title}`)).toBeVisible({ timeout: 10000 });

    const res = await page.request.get("/api/marketing/tasks");
    const tasks = (await res.json()).data.filter((t: { title: string }) => t.title === title);
    for (const t of tasks) await page.request.delete(`/api/marketing/tasks/${t.id}`);
  });

  test("Journal: list & create", async ({ page }) => {
    await page.goto("/marketing-journal");
    await expect(page.locator("h1")).toContainText("Journal", { timeout: 10000 });
    const today = new Date().toISOString().slice(0, 10);
    await page.click('button:has-text("Tambah Entry")');
    await page.locator('form input[type="date"]').first().fill(today);
    await page.locator('form input[type="text"]').first().fill(`QA target ${Date.now()}`);
    await page.locator('form button[type="submit"]').click();
    await expect(page.locator(`text=${today}`).first()).toBeVisible({ timeout: 10000 });

    const res = await page.request.get("/api/marketing/journal");
    const items = (await res.json()).data.filter((j: { target: string }) => (j.target || "").startsWith("QA target"));
    for (const j of items) await page.request.delete(`/api/marketing/journal/${j.id}`);
  });

  test("Dashboard: KPI, chart, goals progress", async ({ page }) => {
    await page.goto("/marketing-dashboard");
    await expect(page.locator("h1")).toContainText("Marketing Dashboard", { timeout: 10000 });
    await expect(page.locator(".card canvas").first()).toBeVisible();
    await expect(page.locator("div.font-semibold", { hasText: "Aktivitas 30 hari" })).toBeVisible();
    await expect(page.locator("div.font-semibold", { hasText: "Progres Goal" })).toBeVisible();
  });

  test("Calendar: month nav, item render", async ({ page }) => {
    await page.goto("/marketing-calendar");
    await expect(page.locator("h1")).toContainText("Marketing Calendar", { timeout: 10000 });
    await expect(page.locator(".grid.grid-cols-7").nth(1)).toBeVisible();
    const prev = page.locator('button:has-text("chevron-left"), button.btn-outline').first();
    await prev.click();
    await expect(page.locator("text=Juli 2026")).toBeVisible({ timeout: 10000 });
  });

  test("Navigation: semua link marketing bekerja", async ({ page }) => {
    for (const path of ["/marketing-dashboard", "/goals", "/plans", "/tasks", "/marketing-calendar", "/marketing-journal", "/marketing-plan"]) {
      const res = await page.goto(path);
      expect(res!.status()).toBe(200);
    }
  });
});