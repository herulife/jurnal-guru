import { requireAuth, AuthError } from "@/lib/auth";
import { db } from "@/db";
import { absensi, dataSiswa, dataKelas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const kelasId = url.searchParams.get("kelasId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");

    const kelasList = await db.select().from(dataKelas).all();
    const kelasMap: Record<string, string> = {};
    for (const k of kelasList) kelasMap[k.id] = k.namaKelas || "-";

    let filteredSiswa;
    if (kelasId) {
      filteredSiswa = await db.select().from(dataSiswa).where(eq(dataSiswa.kelasId, kelasId)).all();
    } else {
      filteredSiswa = await db.select().from(dataSiswa).all();
    }

    let absenList = await db.select().from(absensi).all();

    if (startDate || endDate) {
      const sd = startDate ? new Date(startDate + "T00:00:00") : null;
      const ed = endDate ? new Date(endDate + "T23:59:59") : null;
      absenList = absenList.filter((a) => {
        if (!a.tanggal) return false;
        const d = new Date(a.tanggal);
        if (sd && d < sd) return false;
        if (ed && d > ed) return false;
        return true;
      });
    }

    const rekap = filteredSiswa.map((siswa) => {
      let hadir = 0,
        sakit = 0,
        izin = 0,
        alpha = 0;
      for (const a of absenList) {
        if (a.siswaId === siswa.id) {
          if (a.status === "Hadir") hadir++;
          else if (a.status === "Sakit") sakit++;
          else if (a.status === "Izin") izin++;
          else alpha++;
        }
      }
      const total = hadir + sakit + izin + alpha;
      return {
        id: siswa.id,
        nis: siswa.nis,
        namaSiswa: siswa.namaSiswa,
        namaKelas: siswa.kelasId ? kelasMap[siswa.kelasId] || "-" : "-",
        totalHari: total,
        hadir,
        sakit,
        izin,
        alpha,
        persentase: total > 0 ? Math.round((hadir / total) * 100) : 0,
      };
    });

    return apiOk(rekap);
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
