import { requireAuth, AuthError } from "@/lib/auth";
import { db } from "@/db";
import { nilai, dataSiswa, dataKelas, profilSekolah } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const siswaId = url.searchParams.get("siswaId");

    if (!siswaId) return apiError("Pilih siswa dulu");

    const siswa = await db.select().from(dataSiswa).where(eq(dataSiswa.id, siswaId)).get();
    if (!siswa) return apiError("Siswa tidak ditemukan");
    const kelas = siswa.kelasId
      ? await db.select().from(dataKelas).where(eq(dataKelas.id, siswa.kelasId)).get()
      : null;
    const profil = (await db.select().from(profilSekolah).limit(1).all())[0] || null;

    const rows = await db.select().from(nilai).where(eq(nilai.siswaId, siswaId)).all();

    // kelompokkan per mapel, hitung rata-rata & status
    const mapelMap: Record<string, { total: number; count: number; ket: string[] }> = {};
    for (const n of rows) {
      const mp = n.mataPelajaran || "-";
      if (!mapelMap[mp]) mapelMap[mp] = { total: 0, count: 0, ket: [] };
      const v = Number(n.nilai) || 0;
      const kkm = Number(n.kkm) || 75;
      mapelMap[mp].total += v;
      mapelMap[mp].count++;
      mapelMap[mp].ket.push(v >= kkm ? "Tuntas" : "Belum Tuntas");
    }

    const subjectRows = Object.keys(mapelMap).map((mp) => {
      const m = mapelMap[mp];
      const rata = m.count ? Math.round((m.total / m.count) * 10) / 10 : 0;
      const tuntas = m.ket.filter((k) => k === "Tuntas").length;
      return { mapel: mp, rata, keterangan: m.count ? (tuntas / m.count) * 100 >= 60 ? "Tuntas" : "Belum Tuntas" : "-" };
    });
    subjectRows.sort((a, b) => a.mapel.localeCompare(b.mapel));

    const allVals: number[] = [];
    for (const n of rows) allVals.push(Number(n.nilai) || 0);
    const rataKeseluruhan = allVals.length ? Math.round((allVals.reduce((a, b) => a + b, 0) / allVals.length) * 10) / 10 : 0;

    return apiOk({
      siswa: { nis: siswa.nis, nisn: siswa.nisn, nama: siswa.namaSiswa, kelas: kelas?.namaKelas || "-" },
      profil: profil
        ? { namaSekolah: profil.namaSekolah, alamat: profil.alamat, npsn: profil.npsn, kepalaSekolah: profil.kepalaSekolah, kota: profil.kota }
        : null,
      subjectRows,
      rataKeseluruhan: rataKeseluruhan,
      totalMapel: subjectRows.length,
    });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}