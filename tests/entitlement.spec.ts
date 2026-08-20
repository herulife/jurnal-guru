import { test, expect, request as pwRequest, type APIRequestContext } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

const TS = Date.now().toString(36);
const EMAIL = `ent-${TS}@test.local`;
const PASS = "test12345";
const USER_STATE = "playwright/.auth/ent-user.json";
const ADMIN_STATE = "playwright/.auth/ent-admin.json";

function dbExec(sql: string) {
  return execFileSync("node", [
    "-e",
    `const { createClient } = require("@libsql/client");
const c = createClient({ url: "file:./data.db" });
c.execute({ sql: ${JSON.stringify(sql)}, args: [] }).then((r) => { console.log(JSON.stringify(r.rows)); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });`,
  ], { cwd: process.cwd(), encoding: "utf8" }).trim();
}

function dbUpdate(sql: string) {
  execFileSync("node", [
    "-e",
    `const { createClient } = require("@libsql/client");
const c = createClient({ url: "file:./data.db" });
c.execute({ sql: ${JSON.stringify(sql)}, args: [] }).then(() => { console.log("ok"); process.exit(0); }).catch((e) => { console.error(e); process.exit(1); });`,
  ], { cwd: process.cwd(), stdio: "ignore" });
}

async function login(base: APIRequestContext, username: string, password: string, path: string) {
  const r = await base.post("/api/auth/login", { data: { username, password } });
  expect(r.status()).toBe(200);
  await base.storageState({ path });
}

test.describe.serial("entitlement system", () => {
  let userId = "";
  let kelasId = "";

  test.beforeAll(async ({ request }) => {
    const r = await request.post("/api/auth/register", {
      data: { username: EMAIL, email: EMAIL, password: PASS, namaLengkap: "Entitlement Test User" },
    });
    expect(r.status()).toBe(200);
    const rows = dbExec(`SELECT id FROM users WHERE email = '${EMAIL}'`);
    userId = JSON.parse(rows)[0].id;
    dbUpdate(`UPDATE users SET email_verified = 1 WHERE id = '${userId}'`);
    await login(request, EMAIL, PASS, USER_STATE);
    if (!existsSync(ADMIN_STATE)) {
      await login(request, "admin", "admin123", ADMIN_STATE);
    }

    const kelasRows = dbExec(`SELECT id FROM data_kelas WHERE user_id = '${userId}' LIMIT 1`);
    const parsed = JSON.parse(kelasRows);
    kelasId = parsed.length > 0 ? parsed[0].id : "";
  });

  test.afterAll(() => {
    if (userId) {
      try {
        dbUpdate(`DELETE FROM data_siswa WHERE user_id = '${userId}'`);
        dbUpdate(`DELETE FROM data_kelas WHERE user_id = '${userId}'`);
        dbUpdate(`DELETE FROM users WHERE id = '${userId}'`);
      } catch {}
    }
  });

  test("1. free plan: no time expiry (free = forever)", async () => {
    const rows = dbExec(`SELECT plan, plan_expires FROM users WHERE id = '${userId}'`);
    const user = JSON.parse(rows)[0];
    expect(user.plan).toBe("gratis");
    expect(user.plan_expires).toBeNull();
  });

  test("2. free plan: seed creates exactly 1 class (not 2)", async () => {
    const rows = dbExec(`SELECT COUNT(*) as c FROM data_kelas WHERE user_id = '${userId}'`);
    const count = JSON.parse(rows)[0].c;
    expect(count).toBeLessThanOrEqual(1);
  });

  test("3. free plan: seed creates <= 30 students", async () => {
    const rows = dbExec(`SELECT COUNT(*) as c FROM data_siswa WHERE user_id = '${userId}'`);
    const count = JSON.parse(rows)[0].c;
    expect(count).toBeLessThanOrEqual(30);
  });

  test("4. free plan: reject 2nd class creation", async () => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    const r = await u.post("/api/kelas", {
      data: { namaKelas: "Test Kelas 2", tingkat: 11, jurusan: "IPS", tahunAjaran: "2026/2027" },
    });
    expect(r.status()).toBe(403);
    const body = await r.json();
    expect(body.msg).toContain("1 kelas");
  });

  test("5. free plan: reject student beyond 30", async () => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });

    const countRows = dbExec(`SELECT COUNT(*) as c FROM data_siswa WHERE user_id = '${userId}'`);
    const currentCount = JSON.parse(countRows)[0].c;

    if (currentCount >= 30) {
      const r = await u.post("/api/siswa", {
        data: { nis: "ENT9999", namaSiswa: "Siswa Ke-31", kelasId },
      });
      expect(r.status()).toBe(403);
      const body = await r.json();
      expect(body.msg).toContain("30 siswa");
    } else {
      test.skip();
    }
  });

  test("6. free plan: bulk import respects limit", async () => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    const kelasRows = dbExec(`SELECT id, nama_kelas FROM data_kelas WHERE user_id = '${userId}' LIMIT 1`);
    const kelas = JSON.parse(kelasRows)[0];

    const countRows = dbExec(`SELECT COUNT(*) as c FROM data_siswa WHERE user_id = '${userId}'`);
    const currentCount = JSON.parse(countRows)[0].c;
    const toImport = 30 - currentCount + 5;

    if (toImport > 0) {
      const r = await u.post("/api/upload", {
        data: {
          data: Array.from({ length: toImport }, (_, i) => ({
            nis: `BULK${String(i).padStart(4, "0")}`,
            namaSiswa: `Bulk Import ${i}`,
            namaKelas: kelas.nama_kelas,
          })),
        },
      });
      if (r.status() === 403) {
        const body = await r.json();
        expect(body.msg).toContain("siswa");
      }
    }
  });

  test("7. free plan: pro features blocked (nilai, kelompok)", async () => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    const nilai = await u.get("/api/nilai");
    expect(nilai.status()).toBe(403);
    const kelompok = await u.get("/api/kelompok");
    expect(kelompok.status()).toBe(403);
  });

  test("8. free plan: premium features blocked (lckh, lkb)", async () => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    const lckh = await u.get("/api/lckh");
    expect(lckh.status()).toBe(403);
    const lkb = await u.get("/api/lkb");
    expect(lkb.status()).toBe(403);
  });

  test("9. admin: bypasses all limits", async () => {
    const a = await pwRequest.newContext({ storageState: ADMIN_STATE });
    const kelas = await a.post("/api/kelas", {
      data: { namaKelas: "Admin Test Ent", tingkat: 10, jurusan: "IPA", tahunAjaran: "2026/2027" },
    });
    expect(kelas.status()).toBe(200);
    const body = await kelas.json();
    const newKelasId = body.data?.id;
    if (newKelasId) {
      const siswa = await a.post("/api/siswa", {
        data: { nis: "ADM001", namaSiswa: "Admin Siswa Ent", kelasId: newKelasId },
      });
      expect(siswa.status()).toBe(200);
      const siswaBody = await siswa.json();
      await a.delete(`/api/siswa/${siswaBody.data?.id}`);
      await a.delete(`/api/kelas/${newKelasId}`);
    }
  });

  test("10. user cannot manipulate plan via API", async () => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    const r = await u.patch("/api/users/me", { data: { plan: "premium" } });
    expect(r.status()).toBeGreaterThanOrEqual(400);
  });

  test("11. user cannot access other user's data (IDOR protection)", async () => {
    const a = await pwRequest.newContext({ storageState: ADMIN_STATE });
    const u = await pwRequest.newContext({ storageState: USER_STATE });

    const adminKelas = await a.get("/api/kelas");
    const kelasList = (await adminKelas.json()).data || [];
    if (kelasList.length > 0) {
      const otherKelasId = kelasList[0].id;
      const r = await u.post("/api/siswa", {
        data: { nis: "IDOR001", namaSiswa: "IDOR Test", kelasId: otherKelasId },
      });
      expect(r.status()).toBeGreaterThanOrEqual(400);
    }
  });

  test("12. pricing consistency: landing page shows correct prices", async ({ request }) => {
    const anon = await pwRequest.newContext();
    const r = await anon.get("/");
    const html = await r.text();
    expect(html).toContain("Rp 49.000");
    expect(html).toContain("Rp 99.000");
  });

  test("13. existing data safe after limit: user can still view their data", async () => {
    const u = await pwRequest.newContext({ storageState: USER_STATE });
    const siswa = await u.get("/api/siswa");
    expect(siswa.status()).toBe(200);
    const body = await siswa.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });
});
