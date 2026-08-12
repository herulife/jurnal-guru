import { requireAuth, createSession, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";
import { getUserPlan } from "@/lib/plans";

const MAX_FOTO_LENGTH = 800_000;

export async function GET() {
  try {
    const session = await requireAuth();
    const u = await db.select().from(users).where(eq(users.id, session.id)).get();
    if (!u) return apiError("User tidak ditemukan", 404);
    const plan = await getUserPlan(session.id);
    return apiOk({
      id: u.id,
      username: u.username,
      email: u.email,
      nama: u.namaLengkap,
      role: u.role,
      plan,
      foto: u.foto || null,
    });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAuth();
    const targetId = session.id;
    const body = await req.json();

    const existing = await db.select().from(users).where(eq(users.id, targetId)).get();
    if (!existing) return apiError("User tidak ditemukan", 404);

    const updates: Record<string, unknown> = {};
    if (typeof body.nama === "string" && body.nama.trim()) {
      updates.namaLengkap = body.nama.trim();
    }
    if ("foto" in body) {
      if (body.foto === null || body.foto === "") {
        updates.foto = null;
      } else if (typeof body.foto === "string") {
        if (body.foto.length > MAX_FOTO_LENGTH) {
          return apiError("Ukuran foto terlalu besar. Pilih foto lebih kecil.");
        }
        updates.foto = body.foto;
      }
    }

    if (Object.keys(updates).length === 0) {
      return apiError("Tidak ada data yang diubah");
    }

    await db.update(users).set(updates).where(eq(users.id, targetId));
    await addLog(session.id, "UPDATE_PROFILE", `Update profil${targetId !== session.id ? ` ${existing.username}` : ""}`);
    if (targetId === session.id && body.nama) {
      await createSession({
        id: session.id,
        username: existing.username,
        role: existing.role,
        nama: body.nama.trim(),
      });
    }
    return apiOk(null, "Profil diperbarui");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}