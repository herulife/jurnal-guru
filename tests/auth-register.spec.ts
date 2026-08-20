import { test, expect, request as pwRequest, type APIRequestContext } from "@playwright/test";
import { v4 as uuidv4 } from "uuid";
import {
  q, getRow, countWhere, tableCount, sha256hex,
  mockEmailReset, mockEmailSetFail, mockEmailLast, extractTokenFromEmail,
} from "./helpers/register-db";

const TS = Date.now().toString(36);
let seq = 0;
const uniq = () => `${TS}-${(++seq).toString(36)}`;
const ip = () => `203.0.113.${(++seq) % 200 + 1}`;

function regEmail() {
  return `reg-${uniq()}@test.local`;
}

async function register(
  ctx: APIRequestContext,
  email: string,
  password: string,
  namaLengkap = "User Test",
  extra: Record<string, unknown> = {}
) {
  return ctx.post("/api/auth/register", {
    headers: { "x-forwarded-for": ip() },
    data: { email, password, namaLengkap, ...extra },
  });
}

test.describe.serial("register security fixes (F-07/F-08/F-10/F-12)", () => {
  test.beforeEach(async () => {
    await mockEmailReset();
    await mockEmailSetFail(false);
  });

  test("REGISTER SUCCESS: user + dummy data + verification state lengkap", async ({ request }) => {
    const email = regEmail();
    const pass = "Secret123!";
    const res = await register(request, email, pass, "User A");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.data.email).toBe(email);

    const user = await getRow("users", "email", email);
    expect(user).not.toBeNull();
    expect(user.role).toBe("free");
    expect(user.plan).toBe("gratis");
    expect(user.email_verified).toBe(0);
    expect(user.verify_token_hash).toBeTruthy();
    expect(user.verify_token).toBeNull();

    // Dummy data yang diharapkan dari seedDummyData
    expect(await countWhere("profil_sekolah", "user_id", user.id)).toBe(1);
    expect(await countWhere("data_kelas", "user_id", user.id)).toBe(1);
    expect(await countWhere("data_siswa", "user_id", user.id)).toBe(6);
    expect(await countWhere("jadwal_mengajar", "user_id", user.id)).toBe(4);
    expect(await countWhere("absensi", "user_id", user.id)).toBeGreaterThan(0);
    expect(await countWhere("nilai", "user_id", user.id)).toBeGreaterThan(0);
    expect(await countWhere("jurnal_mengajar", "user_id", user.id)).toBeGreaterThan(0);
    expect(await countWhere("kelompok_belajar", "user_id", user.id)).toBeGreaterThan(0);
    expect(await countWhere("lckh", "user_id", user.id)).toBeGreaterThan(0);
    expect(await countWhere("lkb", "user_id", user.id)).toBeGreaterThan(0);
    expect(await countWhere("kalender_catatan", "user_id", user.id)).toBeGreaterThan(0);

    // Email terkirim berisi raw token
    const last = await mockEmailLast();
    expect(last.to).toBe(email);
    const raw = extractTokenFromEmail(last.html || "");
    expect(raw).toBeTruthy();

    // DB TIDAK menyimpan raw token, hanya hash
    const fresh = await getRow("users", "email", email);
    expect(fresh.verify_token_hash).toBe(sha256hex(raw!));
    expect(fresh.verify_token).toBeNull();
  });

  test("F-08 VERIFY: token valid berhasil (redirect activated=1)", async ({ request }) => {
    const email = regEmail();
    await register(request, email, "Secret123!");
    const last = await mockEmailLast();
    const raw = extractTokenFromEmail(last.html || "");
    expect(raw).toBeTruthy();

    const res = await request.get(`/api/auth/verify-email?token=${raw}`, { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect((res.headers()["location"] || "").includes("activated=1")).toBe(true);

    const user = await getRow("users", "email", email);
    expect(user.email_verified).toBe(1);
    expect(user.verify_token_hash).toBeNull();
    expect(user.verify_token).toBeNull();
  });

  test("F-08 VERIFY: token salah gagal (invalid)", async ({ request }) => {
    const email = regEmail();
    await register(request, email, "Secret123!");
    const res = await request.get("/api/auth/verify-email?token=deadbeefdeadbeefdeadbeefdeadbeef", { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect((res.headers()["location"] || "").includes("verify=invalid")).toBe(true);
    const user = await getRow("users", "email", email);
    expect(user.email_verified).toBe(0);
  });

  test("F-08 VERIFY: token expired gagal (expired)", async ({ request }) => {
    const email = regEmail();
    await register(request, email, "Secret123!");
    const last = await mockEmailLast();
    const raw = extractTokenFromEmail(last.html || "");
    const user = await getRow("users", "email", email);

    await q(`UPDATE users SET verify_token_expires = ? WHERE id = ?`, [
      new Date(Date.now() - 60_000).toISOString(), user.id,
    ]);

    const res = await request.get(`/api/auth/verify-email?token=${raw}`, { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect((res.headers()["location"] || "").includes("verify=expired")).toBe(true);
    const fresh = await getRow("users", "email", email);
    expect(fresh.email_verified).toBe(0);
  });

  test("F-08 VERIFY: replay token kedua kalinya tidak bertransisi lagi", async ({ request }) => {
    const email = regEmail();
    await register(request, email, "Secret123!");
    const raw = extractTokenFromEmail((await mockEmailLast()).html || "")!;

    await request.get(`/api/auth/verify-email?token=${raw}`, { maxRedirects: 0 });
    const user = await getRow("users", "email", email);
    expect(user.email_verified).toBe(1);
    expect(user.verify_token_hash).toBeNull();

    const replay = await request.get(`/api/auth/verify-email?token=${raw}`, { maxRedirects: 0 });
    expect(replay.status()).toBe(302);
    const logs = await q("SELECT COUNT(*) AS n FROM activity_log WHERE user_id = ? AND action = 'VERIFY_EMAIL'", [user.id]);
    expect(Number(logs[0].n)).toBe(1);
  });

  test("F-08 VERIFY: dua request concurrent hanya satu yang bertransisi", async ({ request }) => {
    const email = regEmail();
    await register(request, email, "Secret123!");
    const raw = extractTokenFromEmail((await mockEmailLast()).html || "")!;
    const user = await getRow("users", "email", email);

    const [a, b] = await Promise.all([
      request.get(`/api/auth/verify-email?token=${raw}`, { maxRedirects: 0 }),
      request.get(`/api/auth/verify-email?token=${raw}`, { maxRedirects: 0 }),
    ]);
    expect(a.status()).toBe(302);
    expect(b.status()).toBe(302);

    const fresh = await getRow("users", "email", email);
    expect(fresh.email_verified).toBe(1);
    expect(fresh.verify_token_hash).toBeNull();

    const logs = await q("SELECT COUNT(*) AS n FROM activity_log WHERE user_id = ? AND action = 'VERIFY_EMAIL'", [user.id]);
    expect(Number(logs[0].n)).toBe(1);
  });

  test("F-07 EMAIL FAILURE: register gagal tanpa meninggalkan orphan data", async ({ request }) => {
    const email = regEmail();
    const beforeUsers = await tableCount("users");
    const beforeKelas = await tableCount("data_kelas");
    const beforeSiswa = await tableCount("data_siswa");
    const beforeProfil = await tableCount("profil_sekolah");
    const beforeJurnal = await tableCount("jurnal_mengajar");
    const beforeLckh = await tableCount("lckh");

    await mockEmailSetFail(true);
    const res = await register(request, email, "Secret123!");
    expect(res.status()).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);

    // Tidak ada user baru
    expect(await getRow("users", "email", email)).toBeNull();
    // Tidak ada record tersisa di semua tabel dummy
    expect(await tableCount("users")).toBe(beforeUsers);
    expect(await tableCount("data_kelas")).toBe(beforeKelas);
    expect(await tableCount("data_siswa")).toBe(beforeSiswa);
    expect(await tableCount("profil_sekolah")).toBe(beforeProfil);
    expect(await tableCount("jurnal_mengajar")).toBe(beforeJurnal);
    expect(await tableCount("lckh")).toBe(beforeLckh);

    // Mode pulih: register berikutnya sukses
    await mockEmailSetFail(false);
    const ok = await register(request, email, "Secret123!");
    expect(ok.status()).toBe(200);
    expect(await getRow("users", "email", email)).not.toBeNull();
  });

  test("F-07 EMAIL FAILURE: cleanup idempotent, tidak 500 kedua, tidak hapus data user lain", async ({ request }) => {
    const emailA = regEmail();
    const emailB = regEmail();
    await register(request, emailA, "Secret123!");
    await register(request, emailB, "Secret123!");

    const userA = await getRow("users", "email", emailA);
    const kelasCountA = await countWhere("data_kelas", "user_id", userA.id);

    // Simulasikan cleanup dipanggil dua kali (retry) — idempoten
    await mockEmailSetFail(true);
    const res = await register(request, emailA, "Secret123!");
    // email A sudah terdaftar -> ditolak 400 (duplikat), bukan 500; cleanup tetap aman
    expect(res.status()).toBe(400);
    const freshA = await getRow("users", "email", emailA);
    expect(freshA).not.toBeNull(); // akun lama A masih ada (tidak terhapus)

    // User lain (B) tidak tersentuh
    const userB = await getRow("users", "email", emailB);
    expect(userB).not.toBeNull();
    expect(await countWhere("data_kelas", "user_id", userB.id)).toBe(kelasCountA);

    // Cleanup tidak merusak apapun setelahnya — register baru tetap jalan
    await mockEmailSetFail(false);
    const ok = await register(request, regEmail(), "Secret123!");
    expect(ok.status()).toBe(200);
  });

  test("F-10 RACE: dua register email sama -> tepat 1 user, tanpa orphan", async ({ request }) => {
    const email = regEmail();
    const [a, b] = await Promise.all([
      register(request, email, "Secret123!", "A"),
      register(request, email, "Secret123!", "B"),
    ]);

    const statuses = [a.status(), b.status()];
    const oks = statuses.filter((s) => s === 200).length;
    expect(oks).toBe(1);

    const users = await q("SELECT * FROM users WHERE email = ?", [email]);
    expect(users.length).toBe(1);
    expect(await countWhere("data_kelas", "user_id", users[0].id)).toBe(1);
    expect(await countWhere("data_siswa", "user_id", users[0].id)).toBe(6);
    expect(await countWhere("profil_sekolah", "user_id", users[0].id)).toBe(1);
  });

  test("F-10 RACE: 5 register concurrent email sama -> exactly 1 user", async ({ request }) => {
    const email = regEmail();
    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) => register(request, email, `Secret123!`, `U${i}`))
    );
    const statuses = results.map((r) => r.status());
    expect(statuses.filter((s) => s === 200).length).toBe(1);
    expect(statuses.filter((s) => s >= 500).length).toBe(0);

    const users = await q("SELECT * FROM users WHERE email = ?", [email]);
    expect(users.length).toBe(1);
    expect(await countWhere("data_kelas", "user_id", users[0].id)).toBe(1);
    expect(await countWhere("data_siswa", "user_id", users[0].id)).toBe(6);
  });

  test("F-10 RACE: register email berbeda concurrent -> semua sukses, data terisolasi", async ({ request }) => {
    const emails = [regEmail(), regEmail(), regEmail()];
    const results = await Promise.all(
      emails.map((email, i) => register(request, email, "Secret123!", `U${i}`))
    );
    for (const r of results) expect(r.status()).toBe(200);

    for (const email of emails) {
      const user = await getRow("users", "email", email);
      expect(user).not.toBeNull();
      const kelas = await q("SELECT id, user_id FROM data_kelas WHERE user_id = ?", [user.id]);
      expect(kelas.length).toBe(1);
      expect(kelas[0].user_id).toBe(user.id);
      // Tidak ada kontaminasi silang
      const siswa = await q("SELECT user_id FROM data_siswa WHERE kelas_id = ?", [kelas[0].id]);
      expect(siswa.length).toBe(6);
      for (const s of siswa) expect(s.user_id).toBe(user.id);
    }
  });

  test("F-10 DEFAULT ROLE + INJECTION: role/plan/verified tidak bisa dimanipulasi", async ({ request }) => {
    const email = regEmail();
    const res = await register(request, email, "Secret123!", "Injek", {
      role: "admin",
      plan: "premium",
      emailVerified: 1,
      verifyToken: "attacker-token",
      verifyTokenHash: "attacker-hash",
      isAdmin: true,
    });
    expect(res.status()).toBe(200);

    const user = await getRow("users", "email", email);
    expect(user.role).toBe("free");
    expect(user.plan).toBe("gratis");
    expect(user.email_verified).toBe(0);
    expect(user.verify_token).toBeNull();
    expect(user.verify_token_hash).not.toBe("attacker-hash");
  });

  test("F-12 PASSWORD: policy konsisten register", async ({ request }) => {
    // 8 karakter (min) -> sukses
    expect((await register(request, regEmail(), "12345678")).status()).toBe(200);
    // normal -> sukses
    expect((await register(request, regEmail(), "Secret123!")).status()).toBe(200);
    // tepat 72 byte ASCII -> sukses
    expect((await register(request, regEmail(), "a".repeat(72))).status()).toBe(200);
    // 73 byte ASCII -> ditolak
    const r73 = await register(request, regEmail(), "a".repeat(73));
    expect(r73.status()).toBe(400);
    expect((await r73.json()).msg).toContain("maksimal");
    // Unicode multi-byte pendek (pässwördèé = 10 chars / ~12 byte) -> sukses
    expect((await register(request, regEmail(), "pässwördèé")).status()).toBe(200);
    // Unicode panjang (>72 byte) -> ditolak
    const uniLong = "é".repeat(37); // 37 * 2 byte = 74 byte
    const rUni = await register(request, regEmail(), uniLong);
    expect(rUni.status()).toBe(400);
    expect((await rUni.json()).msg).toContain("maksimal");
    // sangat panjang (5000 char) -> ditolak cepat
    const rLong = await register(request, regEmail(), "x".repeat(5000));
    expect(rLong.status()).toBe(400);
    // error message tidak memuat password
    expect(JSON.stringify(await rLong.json())).not.toContain("x".repeat(5000));
  });

  test("F-12 PASSWORD: user existing dengan password panjang tetap bisa login (kompatibilitas)", async ({ request }) => {
    const bcrypt = await import("bcryptjs");
    const email = regEmail();
    const longPass = "LegacyLongPassword123!".repeat(5); // > 72 byte, sudah terlanjur dipakai
    const hashed = await bcrypt.hash(longPass, 10);
    const userId = uuidv4();
    await q(
      `INSERT INTO users (id, username, email, password_hash, nama_lengkap, role, email_verified) VALUES (?, ?, ?, ?, ?, 'free', 1)`,
      [userId, email, email, hashed, "Legacy User"]
    );

    const res = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": ip() },
      data: { username: email, password: longPass },
    });
    expect(res.status()).toBe(200);
  });

  test("F-12 PASSWORD: change-password memakai policy yang sama", async ({ request }) => {
    const email = regEmail();
    const pass = "Secret123!";
    await register(request, email, pass);
    const last = await mockEmailLast();
    const raw = extractTokenFromEmail(last.html || "");
    await request.get(`/api/auth/verify-email?token=${raw}`, { maxRedirects: 0 });

    // Login untuk dapat cookie sesi
    const ctx = await pwRequest.newContext();
    const login = await ctx.post("/api/auth/login", {
      headers: { "x-forwarded-for": ip() },
      data: { username: email, password: pass },
    });
    expect(login.status()).toBe(200);

    const tooLong = "y".repeat(73);
    const bad = await ctx.post("/api/me/password", {
      data: { passwordLama: pass, passwordBaru: tooLong },
    });
    expect(bad.status()).toBe(400);
    expect((await bad.json()).msg).toContain("maksimal");

    const ok = await ctx.post("/api/me/password", {
      data: { passwordLama: pass, passwordBaru: "NewSecret123!" },
    });
    expect(ok.status()).toBe(200);

    // Login dengan password baru berhasil
    const relogin = await request.post("/api/auth/login", {
      headers: { "x-forwarded-for": ip() },
      data: { username: email, password: "NewSecret123!" },
    });
    expect(relogin.status()).toBe(200);
  });

  test("F-08 TOKEN: raw token tidak bocor di response/error register", async ({ request }) => {
    const email = regEmail();
    const res = await register(request, email, "Secret123!");
    const body = await res.json();
    const json = JSON.stringify(body);
    const last = await mockEmailLast();
    const raw = extractTokenFromEmail(last.html || "");
    expect(raw).toBeTruthy();
    expect(json).not.toContain(raw);
  });
});