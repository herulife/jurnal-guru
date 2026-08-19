import { test, expect, request as pwRequest, type APIRequestContext } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const TS = Date.now().toString(36);
const EMAIL = `sec-${TS}@test.local`;
const PASS = "test12345";
const USER_STATE = "playwright/.auth/sec-user.json";
const ADMIN_STATE = "playwright/.auth/checkout-admin.json";
const PRO_USER = "playwright/.auth/sec-pro.json";

function dbUpdate(userId: string, fields: string) {
  execFileSync("node", [
    "-e",
    `const { createClient } = require("@libsql/client");
const c = createClient({ url: "file:./data.db" });
c.execute({ sql: "UPDATE users SET ${fields} WHERE id = ?", args: [${JSON.stringify(userId)}] }).then(() => { console.log("ok"); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });`,
  ], { cwd: process.cwd(), stdio: "ignore" });
}

async function login(base: APIRequestContext, username: string, password: string, path: string) {
  const r = await base.post("/api/auth/login", { data: { username, password } });
  expect(r.status()).toBe(200);
  await base.storageState({ path });
}

test.describe.serial("role & plan security", () => {
  let userId = "";

  test.beforeAll(async ({ request }) => {
    const r = await request.post("/api/auth/register", {
      data: { username: EMAIL, email: EMAIL, password: PASS, namaLengkap: "User Security Test" },
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

  test("user gratis: API fitur Pro & Premium ditolak (403)", async ({ request }) => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    for (const path of ["/api/nilai", "/api/kelompok", "/api/lckh", "/api/lkb"]) {
      const res = await u.get(path);
      expect(res.status(), `${path} harus 403 untuk user gratis`).toBe(403);
    }
    const post = await u.post("/api/nilai", { data: { name: "x", nilai: 80 } });
    expect(post.status()).toBe(403);
    const batch = await u.post("/api/nilai/batch", { data: { rows: [] } });
    expect(batch.status()).toBe(403);
  });

  test("user gratis: tidak bisa verifikasi payment sendiri", async ({ request }) => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    const buat = await u.post("/api/payments", { data: { planId: "pro_6m", whatsapp: "081200000001" } });
    expect(buat.status()).toBe(200);
    const payId = (await buat.json()).data?.paymentId;
    expect(payId).toBeTruthy();
    const patch = await u.patch(`/api/payments/${payId}`, { data: { status: "verifikasi" } });
    expect(patch.status()).toBeGreaterThanOrEqual(400);
  });

  test("user tidak bisa melihat payment user lain", async ({ request }) => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    const a = await pwRequest.newContext({ storageState: ADMIN_STATE });
    const list = await a.get("/api/payments?admin=1");
    const rows = (await list.json()).data?.payments || [];
    const other = rows.find((r: { whatsapp: string }) => r.whatsapp && r.whatsapp !== "6281234567890");
    if (!other) return;
    const res = await u.get(`/api/payments/${other.id}`);
    expect(res.status()).toBeGreaterThanOrEqual(401);
  });

  test("upload: extension tidak aman ditolak + batas 5MB", async ({ request }) => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    const buat = await u.post("/api/payments", { data: { planId: "pro_6m", whatsapp: "081200000002" } });
    const payId = (await buat.json()).data?.paymentId;

    const exe = await u.post(`/api/payments/${payId}/proof`, {
      multipart: { file: { name: "virus.exe", mimeType: "application/octet-stream", buffer: Buffer.from("MZ...") } },
    });
    expect(exe.status()).toBeGreaterThanOrEqual(400);

    const big = await u.post(`/api/payments/${payId}/proof`, {
      multipart: { file: { name: "big.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(6 * 1024 * 1024) } },
    });
    expect(big.status()).toBeGreaterThanOrEqual(400);

    const ok = await u.post(`/api/payments/${payId}/proof`, {
      multipart: { file: { name: "bukti.png", mimeType: "image/png", buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==", "base64") } },
    });
    expect(ok.status()).toBe(200);
  });

  test("user pro: API nilai OK, API premium tetap 403", async ({ request }) => {
    dbUpdate(userId, "plan = 'pro', plan_expires = '2030-01-01T00:00:00.000Z'");
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    const nilai = await u.get("/api/nilai");
    expect(nilai.status()).toBe(200);
    const lckh = await u.get("/api/lckh");
    expect(lckh.status()).toBe(403);
  });

  test("user premium: semua API fitur terbuka", async ({ request }) => {
    dbUpdate(userId, "plan = 'premium', plan_expires = '2030-01-01T00:00:00.000Z'");
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    for (const path of ["/api/nilai", "/api/kelompok", "/api/lckh", "/api/lkb"]) {
      const res = await u.get(path);
      expect(res.status(), `${path} harus terbuka utk premium`).toBe(200);
    }
  });
});
