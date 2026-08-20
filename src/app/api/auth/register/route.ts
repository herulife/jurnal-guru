import { hashPassword, addLog } from "@/lib/auth";
import { apiError, apiResponse, apiServerError } from "@/lib/utils";
import { rateLimited } from "@/lib/rateLimit";
import { trackEvent } from "@/lib/tracking";
import { db } from "@/db";
import { users, profilSekolah, dataKelas, dataSiswa, jadwalMengajar, absensi, nilai, jurnalMengajar, kelompokBelajar, lckh, lkb, kalenderCatatan, activityLog, events } from "@/db/schema";
import { eq, or, count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { seedDummyData } from "@/lib/seed";
import { emailConfigured, sendVerificationEmail, generateVerifyToken, verifyTokenExpiry, hashToken } from "@/lib/email";
import { validatePasswordForCreation } from "@/lib/password-policy";

// Urutan leaf-first: tabel yang mereferensikan data_siswa/data_kelas (absensi,
// nilai, kelompok_belajar, jadwal_mengajar, jurnal_mengajar) dihapus lebih dulu,
// lalu data_siswa, lalu data_kelas, baru sisanya yang tidak punya FK keluar.
const CHILD_TABLES = [
  absensi, nilai, kelompokBelajar, jadwalMengajar, jurnalMengajar,
  dataSiswa, dataKelas,
  profilSekolah, lckh, lkb, kalenderCatatan, activityLog, events,
] as const;

function collectErrorMessages(e: unknown): string[] {
  const msgs: string[] = [];
  let cur: unknown = e;
  const seen = new Set<object>();
  while (cur instanceof Error && !seen.has(cur)) {
    seen.add(cur);
    msgs.push(cur.message);
    cur = (cur as { cause?: unknown }).cause;
  }
  return msgs;
}

function isUniqueViolation(e: unknown): boolean {
  return collectErrorMessages(e).some((m) => m.includes("UNIQUE constraint failed"));
}

function isBusyError(e: unknown): boolean {
  return collectErrorMessages(e).some((m) =>
    m.includes("SQLITE_BUSY") || m.includes("database is locked") || m.includes("database table is locked")
  );
}

async function cleanupRegistration(userId: string): Promise<void> {
  // Hapus seluruh record milik userId yang baru saja dibuat oleh attempt ini.
  // userId adalah UUID v4 unik yang di-generate request ini (bukan dari client),
  // jadi DELETE WHERE user_id = userId aman & tidak menyentuh data user lain.
  // Urutan CHILD_TABLES leaf-first agar aman walau foreign keys aktif (SQLite).
  // Loop-until-empty sebagai jaring pengaman: jika ada tabel yang masih
  // direferensikan, pass berikutnya menghapusnya setelah referensi hilang.
  const MAX_PASSES = 10;
  for (let pass = 0; pass < MAX_PASSES; pass++) {
    let anyDeleted = false;
    for (const table of CHILD_TABLES) {
      try {
        const r = await db
          .delete(table as never)
          .where(eq(table.userId as never, userId))
          .run();
        if (r.rowsAffected > 0) anyDeleted = true;
      } catch (e) {
        // FK aktif & masih direferensikan -> lewati, diproses pada pass berikutnya.
        console.error("[REGISTER CLEANUP PASS]", pass, e instanceof Error ? e.message : e);
      }
    }
    if (anyDeleted) continue;
    // Tidak ada yang terhapus di pass ini: pastikan benar-benar bersih sebelum berhenti.
    let remaining = 0;
    for (const table of CHILD_TABLES) {
      const r = (await db
        .select({ n: count() })
        .from(table as never)
        .where(eq(table.userId as never, userId))
        .get()) as { n: number } | undefined;
      remaining += Number(r?.n ?? 0);
    }
    if (remaining === 0) break;
  }
  await db.delete(users).where(eq(users.id, userId));
}

type NewUser = typeof users.$inferInsert;

async function createUserAndSeed(userId: string, values: NewUser): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.insert(users).values(values);
    await seedDummyData(userId, tx as unknown as typeof db);
  });
}

export async function POST(req: Request) {
  try {
    const rl = rateLimited(req);
    if (rl.limited) {
      return apiError(
        "Terlalu banyak percobaan registrasi. Silakan coba lagi beberapa menit lagi.",
        429
      );
    }
    const { username, password, namaLengkap, email } = await req.json();
    const userEmail = (email || username || "").trim().toLowerCase();

    if (!userEmail || !password || !namaLengkap) {
      return apiError("Email, password, dan nama lengkap wajib diisi");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      return apiError("Format email tidak valid");
    }

    const passwordError = validatePasswordForCreation(password);
    if (passwordError) {
      return apiError(passwordError);
    }

    if (!emailConfigured()) {
      return apiError("Layanan email belum dikonfigurasi, coba lagi nanti");
    }

    // Pre-check untuk UX (bukan source of truth; unique constraint yang menang di race)
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, userEmail), eq(users.username, userEmail)))
      .get();

    if (existing) {
      return apiError("Email sudah terdaftar");
    }

    // Create new user (belum verified)
    const userId = uuidv4();
    const hashedPassword = await hashPassword(password);
    const rawToken = generateVerifyToken();
    const verifyHash = hashToken(rawToken);
    const verifyExpires = verifyTokenExpiry();

    // Insert user + seed data dummy dalam SATU transaction (atomic).
    // Retry terbatas hanya untuk SQLITE_BUSY (race penulisan file SQLite).
    const maxAttempts = 6;
    let attempt = 0;
    for (;;) {
      try {
        await createUserAndSeed(userId, {
          id: userId,
          username: userEmail,
          email: userEmail,
          passwordHash: hashedPassword,
          namaLengkap,
          role: "free",
          emailVerified: 0,
          verifyTokenHash: verifyHash,
          verifyTokenExpires: verifyExpires,
        });
        break;
      } catch (e: unknown) {
        if (isUniqueViolation(e)) {
          return apiError("Email sudah terdaftar");
        }
        if (isBusyError(e) && attempt < maxAttempts - 1) {
          attempt += 1;
          await new Promise((r) => setTimeout(r, 100 * attempt));
          continue;
        }
        throw e;
      }
    }

    // Kirim email aktivasi; jika gagal, batalkan registrasi sepenuhnya (compensating cleanup)
    const sent = await sendVerificationEmail(userEmail, namaLengkap, rawToken);
    if (!sent) {
      try {
        await cleanupRegistration(userId);
      } catch (e) {
        console.error("[ROLLBACK ERROR]", e);
      }
      return apiError("Gagal mengirim email aktivasi. Silakan coba lagi.", 500);
    }

    await addLog(userId, "REGISTER", `${userEmail} mendaftar (menunggu verifikasi)`);
    await trackEvent("register_completed", { userId, meta: { email: userEmail } });

    return apiResponse(true, { email: userEmail }, "Registrasi berhasil. Silakan cek email untuk aktivasi.");
  } catch (e: unknown) {
    console.error("[REGISTER ERROR]", e);
    return apiServerError();
  }
}