import { requireAuth, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { dataKelas } from "@/db/schema";
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
      "namaKelas",
      "tingkat",
      "jurusan",
      "tahunAjaran",
      "waliKelas",
    ] as const;
    const updateData: Record<string, unknown> = {};
    for (const f of fields) {
      if (body[f] !== undefined) {
        updateData[f === "tingkat" ? "tingkat" : f] =
          f === "tingkat" ? Number(body[f]) : body[f];
      }
    }
    await db.update(dataKelas).set(updateData).where(eq(dataKelas.id, id));
    await addLog(session.id, "UPDATE_KELAS", `Update kelas ${id}`);
    return apiOk(null, "Kelas diperbarui");
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
    await db.delete(dataKelas).where(eq(dataKelas.id, id));
    await addLog(session.id, "DELETE_KELAS", `Hapus kelas ${id}`);
    return apiOk(null, "Kelas dihapus");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
