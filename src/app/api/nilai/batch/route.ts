import { requireAuth, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { nilai } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const records = body.records;
    if (!Array.isArray(records) || !records.length) {
      return apiError("Tidak ada data");
    }
    for (const r of records) {
      await db.insert(nilai).values({
        id: uuidv4(),
        tanggal: r.tanggal || new Date().toISOString(),
        siswaId: r.siswaId,
        kelasId: r.kelasId,
        mataPelajaran: r.mataPelajaran,
        kategori: r.kategori,
        bab: r.bab || null,
        tujuanPembelajaran: r.tujuanPembelajaran || null,
        bentukPenugasan: r.bentukPenugasan || null,
        nilai: Number(r.nilai) || 0,
        kkm: Number(r.kkm) || 75,
        remedial: r.remedial || null,
      });
    }
    await addLog(
      session.id,
      "SAVE_NILAI_BATCH",
      `Simpan ${records.length} nilai batch`
    );
    return apiOk({ msg: `${records.length} nilai berhasil disimpan` });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
