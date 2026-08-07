import { requireAuth, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { jurnalMengajar } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    const fields = [
      "tanggal",
      "kelasId",
      "mataPelajaran",
      "jamKe",
      "materi",
      "deskripsi",
      "kendala",
      "solusi",
      "kehadiranSiswa",
      "catatan",
    ] as const;
    const updateData: Record<string, unknown> = {};
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    await db
      .update(jurnalMengajar)
      .set(updateData)
      .where(eq(jurnalMengajar.id, id));
    await addLog(session.id, "UPDATE_JURNAL", `Update jurnal ${id}`);
    return apiOk(null, "Jurnal diperbarui");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await db.delete(jurnalMengajar).where(eq(jurnalMengajar.id, id));
    await addLog(session.id, "DELETE_JURNAL", `Hapus jurnal ${id}`);
    return apiOk(null, "Jurnal dihapus");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
