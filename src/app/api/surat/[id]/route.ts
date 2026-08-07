import { requireAuth, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { dataSurat } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiResponse, apiServerError } from "@/lib/utils";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const { judul, jenis, tujuan, template } = await req.json();
    if (!judul || !jenis || !template) {
      return apiError("Judul, jenis, dan template wajib diisi");
    }
    await db.update(dataSurat).set({ judul, jenis, tujuan, template }).where(eq(dataSurat.id, id));
    await addLog(session.id, "UPDATE_SURAT", `Update surat ${id}`);
    return apiResponse(true, null, "Surat berhasil diupdate");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    await db.delete(dataSurat).where(eq(dataSurat.id, id));
    await addLog(session.id, "DELETE_SURAT", `Hapus surat ${id}`);
    return apiResponse(true, null, "Surat berhasil dihapus");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
