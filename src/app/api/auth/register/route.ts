import { hashPassword, addLog } from "@/lib/auth";
import { apiError, apiResponse, apiServerError } from "@/lib/utils";
import { rateLimited } from "@/lib/rateLimit";
import { trackEvent } from "@/lib/tracking";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { seedDummyData } from "@/lib/seed";
import { emailConfigured, sendVerificationEmail, generateVerifyToken, verifyTokenExpiry } from "@/lib/email";

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

    if (password.length < 8) {
      return apiError("Password minimal 8 karakter");
    }

    if (!emailConfigured()) {
      return apiError("Layanan email belum dikonfigurasi, coba lagi nanti");
    }

    // Check if email already exists
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
    const verifyToken = generateVerifyToken();
    const verifyExpires = verifyTokenExpiry();

    await db.insert(users).values({
      id: userId,
      username: userEmail,
      email: userEmail,
      passwordHash: hashedPassword,
      namaLengkap,
      role: "free",
      emailVerified: 0,
      verifyToken,
      verifyTokenExpires: verifyExpires,
    });

    // Isi data dummy agar akun baru langsung punya data contoh
    try {
      await seedDummyData(userId);
    } catch (seedErr) {
      console.error("[SEED ERROR]", seedErr);
    }

    // Kirim email aktivasi; jika gagal, batalkan registrasi
    const sent = await sendVerificationEmail(userEmail, namaLengkap, verifyToken);
    if (!sent) {
      try {
        await db.delete(users).where(eq(users.id, userId));
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