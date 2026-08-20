import { requireAdmin, AuthError, hashPassword, addLog } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";
import { resolveUserRole } from "@/lib/plan-helpers";
import { validatePasswordForCreation } from "@/lib/password-policy";

export async function GET() {
  try {
    await requireAdmin();
    const rows = await db
      .select({
        id: users.id,
        username: users.username,
        namaLengkap: users.namaLengkap,
        role: users.role,
        plan: users.plan,
        createdAt: users.createdAt,
      })
      .from(users)
      .all();
    return apiOk(rows);
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const { username, password, namaLengkap, role } = body;

    if (!username || !password || !namaLengkap) {
      return apiError("Username, password, dan nama lengkap wajib diisi");
    }

    if (username.length < 4) {
      return apiError("Username minimal 4 karakter");
    }

    const passwordError = validatePasswordForCreation(password);
    if (passwordError) {
      return apiError(passwordError);
    }

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    if (existing) {
      return apiError("Username sudah digunakan");
    }

    const userId = uuidv4();
    const hashedPassword = await hashPassword(password);

    const resolved = resolveUserRole(role || "free");

    await db.insert(users).values({
      id: userId,
      username,
      passwordHash: hashedPassword,
      namaLengkap,
      role: resolved.role,
      plan: resolved.plan ?? "gratis",
    });

    await addLog(session.id, "CREATE_USER", `Tambah user ${username}`);
    return apiOk({ id: userId }, "User berhasil ditambahkan");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
