import { requireAdmin, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { dataSiswa, dataKelas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

const MAX_BATCH = 500;

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const arr = body.data;
    if (!Array.isArray(arr) || !arr.length) {
      return apiError("Tidak ada data");
    }
    if (arr.length > MAX_BATCH) {
      return apiError(`Maksimal ${MAX_BATCH} record per upload`);
    }
    const kelasList = await db.select().from(dataKelas).all();
    const kelasMap: Record<string, string> = {};
    for (const k of kelasList) kelasMap[k.namaKelas || ""] = k.id;

    let added = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 0; i < arr.length; i++) {
      const d = arr[i];
      if (!d.namaSiswa || !d.nis) {
        skipped++;
        errors.push(`Baris ${i + 2}: NIS dan Nama wajib diisi`);
        continue;
      }
      const kelasId = d.namaKelas ? kelasMap[d.namaKelas] : "";
      if (!kelasId && d.namaKelas) {
        skipped++;
        errors.push(`Baris ${i + 2}: Kelas "${d.namaKelas}" tidak ditemukan`);
        continue;
      }
      await db.insert(dataSiswa).values({
        id: uuidv4(),
        userId: session.id,
        nis: String(d.nis),
        nisn: String(d.nisn || ""),
        namaSiswa: String(d.namaSiswa),
        jenisKelamin: String(d.jenisKelamin || "L"),
        kelasId: kelasId || null,
        alamat: String(d.alamat || ""),
        telepon: String(d.telepon || ""),
        email: String(d.email || ""),
        namaOrtu: String(d.namaOrtu || ""),
      });
      added++;
    }
    await addLog(
      session.id,
      "UPLOAD_SISWA",
      `Upload massal: ${added} ditambah, ${skipped} dilewati`
    );
    return apiOk({
      added,
      skipped,
      errors,
      msg: `${added} siswa berhasil ditambahkan, ${skipped} dilewati`,
    });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
