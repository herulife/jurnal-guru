import { requireAuth, AuthError, hashPassword, addLog } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { passwordLama, passwordBaru } = body;

    if (!passwordLama || !passwordBaru) {
      return apiError("Password lama dan password baru wajib diisi");
    }
    if (passwordBaru.length < 8) {
      return apiError("Password baru minimal 8 karakter");
    }

    const user = await db.select().from(users).where(eq(users.id, session.id)).get();
    if (!user) return apiError("User tidak ditemukan", 404);

    const bcrypt = await import("bcryptjs");
    const valid = await bcrypt.compare(passwordLama, user.passwordHash);
    if (!valid) {
      return apiError("Password lama salah", 400);
    }

    if (passwordBaru === passwordLama) {
      return apiError("Password baru harus berbeda dari password lama");
    }

    const hashed = await hashPassword(passwordBaru);
    await db.update(users).set({ passwordHash: hashed }).where(eq(users.id, session.id));
    await addLog(session.id, "CHANGE_PASSWORD", "Ganti password akun");
    return apiOk(null, "Password berhasil diubah");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}