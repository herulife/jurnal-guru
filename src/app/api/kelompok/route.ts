import { requireAuth, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { kelompokBelajar } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

function parseKelasId(raw: string | null) {
  return raw || null;
}

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const kelasId = parseKelasId(url.searchParams.get("kelasId"));

    let rows;
    if (kelasId) {
      rows = await db
        .select()
        .from(kelompokBelajar)
        .where(eq(kelompokBelajar.kelasId, kelasId))
        .all();
    } else {
      rows = await db.select().from(kelompokBelajar).all();
    }
    return apiOk(rows);
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const { kelasId, records } = body;

    if (!kelasId) return apiError("Kelas wajib dipilih");
    if (!Array.isArray(records)) return apiError("Data tidak lengkap");

    // reset data kelas ini lalu simpan baru
    await db.delete(kelompokBelajar).where(eq(kelompokBelajar.kelasId, kelasId));

    const rows = records.map((r) => ({
      id: uuidv4(),
      kelasId,
      kelompok: String(r.kelompok || ""),
      no: String(r.no || ""),
      siswaId: r.siswaId || null,
      nis: String(r.nis || ""),
      namaSiswa: String(r.namaSiswa || ""),
      jenisKelamin: String(r.jenisKelamin || ""),
      kelasAsal: String(r.kelasAsal || ""),
      nilai: String(r.nilai || ""),
    }));
    if (rows.length) await db.insert(kelompokBelajar).values(rows);
    await addLog(session.id, "SAVE_KELOMPOK", `Simpan kelompok kelas ${kelasId}`);

    return apiOk({ msg: `Kelompok berhasil disimpan (${records.length} siswa)` });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const kelasId = parseKelasId(url.searchParams.get("kelasId"));

    if (kelasId) {
      await db.delete(kelompokBelajar).where(eq(kelompokBelajar.kelasId, kelasId));
    } else {
      await db.delete(kelompokBelajar);
    }
    await addLog(session.id, "RESET_KELOMPOK", "Reset kelompok belajar");
    return apiOk({ msg: "Kelompok berhasil di-reset" });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}