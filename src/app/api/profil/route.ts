import { requireAuth, requireAdmin, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { profilSekolah } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET() {
  try {
    const session = await requireAuth();
    const rows = await db.select().from(profilSekolah).all();
    return apiOk(rows[0] || {});
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const fields = [
      "namaSekolah",
      "alamat",
      "npsn",
      "kota",
      "provinsi",
      "telepon",
      "kepalaSekolah",
      "nipKepsek",
      "namaGuru",
      "nipGuru",
      "logoUrl",
    ] as const;
    const existing = await db.select().from(profilSekolah).all();
    if (existing.length > 0) {
      await db
        .update(profilSekolah)
        .set(body)
        .where(eq(profilSekolah.id, existing[0].id));
    } else {
      const { v4: uuidv4 } = await import("uuid");
      await db.insert(profilSekolah).values({ id: uuidv4(), ...body });
    }
    await addLog(session.id, "UPDATE_PROFIL", "Update profil sekolah");
    return apiOk(null, "Profil berhasil diperbarui");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
