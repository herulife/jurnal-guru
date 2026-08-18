import { test as setup, expect } from "@playwright/test";

setup("login admin & simpan session", async ({ request }) => {
  const res = await request.post("/api/auth/login", {
    data: { username: "admin", password: "admin123" },
  });
  expect(res.status()).toBe(200);
  await request.storageState({ path: "playwright/.auth/user.json" });
});