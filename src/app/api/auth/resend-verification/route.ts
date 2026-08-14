import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiResponse, apiServerError } from "@/lib/utils";
import { rateLimited } from "@/lib/rateLimit";
import { emailConfigured, sendVerificationEmail, generateVerifyToken, verifyTokenExpiry } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const rl = rateLimited(req);
    if (rl.limited) {
      return apiError("Terlalu banyak permintaan. Silakan coba lagi beberapa menit lagi.", 429);
    }
    if (!emailConfigured()) {
      return apiError("Layanan email belum dikonfigurasi, coba lagi nanti");
    }

    const { email } = await req.json();
    const userEmail = (email || "").trim().toLowerCase();
    const generic = "Jika email terdaftar, link aktivasi baru telah dikirim.";

    if (!userEmail) return apiResponse(true, {}, generic);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .get();

    if (!user || user.emailVerified === 1) {
      return apiResponse(true, {}, generic);
    }

    const verifyToken = generateVerifyToken();
    const verifyExpires = verifyTokenExpiry();

    await db
      .update(users)
      .set({ verifyToken, verifyTokenExpires: verifyExpires })
      .where(eq(users.id, user.id));

    const sent = await sendVerificationEmail(userEmail, user.namaLengkap, verifyToken);
    if (!sent) {
      return apiError("Gagal mengirim email aktivasi. Silakan coba lagi.", 500);
    }

    return apiResponse(true, {}, "Link aktivasi baru telah dikirim ke email Anda.");
  } catch (e: unknown) {
    console.error("[RESEND ERROR]", e);
    return apiServerError();
  }
}