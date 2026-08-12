import { hashPassword, addLog, createSession } from "@/lib/auth";
import { apiError, apiResponse, apiServerError } from "@/lib/utils";
import { rateLimited } from "@/lib/rateLimit";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

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

    // Check if email already exists
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.email, userEmail), eq(users.username, userEmail)))
      .get();

    if (existing) {
      return apiError("Email sudah terdaftar");
    }

    // Create new user
    const userId = uuidv4();
    const hashedPassword = await hashPassword(password);

    await db.insert(users).values({
      id: userId,
      username: userEmail,
      email: userEmail,
      passwordHash: hashedPassword,
      namaLengkap,
      role: "free",
    });

    // Auto login after registration
    const user = {
      id: userId,
      username: userEmail,
      email: userEmail,
      role: "free",
      nama: namaLengkap,
    };

    await createSession(user);
    await addLog(userId, "REGISTER", `${userEmail} mendaftar`);

    return apiResponse(true, { user }, "Registrasi berhasil");
  } catch (e: unknown) {
    console.error("[REGISTER ERROR]", e);
    return apiServerError();
  }
}
