import { requireAuth, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { jadwalMengajar } from "@/db/schema";
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
      "kelasId",
      "mataPelajaran",
      "hari",
      "jamMulai",
      "jamSelesai",
      "semester",
      "ruangan",
    ] as const;
    const updateData: Record<string, unknown> = {};
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }
    await db
      .update(jadwalMengajar)
      .set(updateData)
      .where(eq(jadwalMengajar.id, id));
    await addLog(session.id, "UPDATE_JADWAL", `Update jadwal ${id}`);
    return apiOk(null, "Jadwal diperbarui");
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
    await db.delete(jadwalMengajar).where(eq(jadwalMengajar.id, id));
    await addLog(session.id, "DELETE_JADWAL", `Hapus jadwal ${id}`);
    return apiOk(null, "Jadwal dihapus");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
