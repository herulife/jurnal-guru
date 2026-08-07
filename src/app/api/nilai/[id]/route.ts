import { requireAuth, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { nilai } from "@/db/schema";
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
      "mataPelajaran",
      "kategori",
      "nilai",
      "kkm",
      "bab",
      "remedial",
    ] as const;
    const updateData: Record<string, unknown> = {};
    for (const f of fields) {
      if (body[f] !== undefined) {
        updateData[f] = ["nilai", "kkm"].includes(f)
          ? Number(body[f])
          : body[f];
      }
    }
    await db.update(nilai).set(updateData).where(eq(nilai.id, id));
    await addLog(session.id, "UPDATE_NILAI", `Update nilai ${id}`);
    return apiOk(null, "Nilai diperbarui");
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
    await db.delete(nilai).where(eq(nilai.id, id));
    await addLog(session.id, "DELETE_NILAI", `Hapus nilai ${id}`);
    return apiOk(null, "Nilai dihapus");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
