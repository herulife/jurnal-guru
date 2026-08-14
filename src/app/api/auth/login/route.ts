import { createSession, verifyCredentials, addLog } from "@/lib/auth";
import { apiError, apiResponse, apiServerError } from "@/lib/utils";
import { rateLimited } from "@/lib/rateLimit";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const rl = rateLimited(req);
    if (rl.limited) {
      return apiError(
        "Terlalu banyak percobaan login. Silakan coba lagi beberapa menit lagi.",
        429
      );
    }
    const { username, password, email } = await req.json();
    const identifier = (email || username || "").trim();
    if (!identifier || !password) {
      return apiError("Email dan password wajib diisi");
    }
    const user = await verifyCredentials(identifier, password);
    if (!user) {
      return apiError("Email atau password salah");
    }

    const full = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .get();

    if (full && full.emailVerified !== 1) {
      return apiError("Email belum dikonfirmasi. Silakan cek email Anda atau kirim ulang link aktivasi.", 403);
    }

    await createSession(user);
    await addLog(user.id, "LOGIN", `${user.username} login`);
    return apiResponse(true, { user }, "Login berhasil");
  } catch (e: unknown) {
    console.error("[LOGIN ERROR]", e);
    return apiServerError();
  }
}