import { requireAuth, requireAdmin, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { profilSekolah } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET() {
  try {
    const session = await requireAuth();
    const rows = await db.select().from(profilSekolah).all();
    const withData = rows.find((r) => r.userId === session.id && r.namaSekolah && r.namaSekolah.trim() !== "");
    return apiOk(withData || {});
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAuth();
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
    const rows = await db.select().from(profilSekolah).all();
    const allowed: Record<string, unknown> = {};
    for (const f of fields) {
      if (body[f] !== undefined) allowed[f] = body[f];
    }
    const target = rows.find((r) => r.userId === session.id);
    if (target) {
      await db.update(profilSekolah).set(allowed).where(eq(profilSekolah.id, target.id));
    } else {
      const { v4: uuidv4 } = await import("uuid");
      await db.insert(profilSekolah).values({ id: uuidv4(), userId: session.id, ...allowed });
    }
    await addLog(session.id, "UPDATE_PROFIL", "Update profil sekolah");
    return apiOk(null, "Profil berhasil diperbarui");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
