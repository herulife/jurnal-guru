import { requireAuth, AuthError } from "@/lib/auth";
import { db } from "@/db";
import { dataSiswa, dataKelas, absensi, nilai, settings } from "@/db/schema";
import { apiError, apiOk, apiServerError, todayISO } from "@/lib/utils";

export async function GET() {
  try {
    const session = await requireAuth();
    const siswaCount = await db.select().from(dataSiswa).all();
    const kelasCount = await db.select().from(dataKelas).all();
    const absenAll = await db.select().from(absensi).all();
    const nilaiAll = await db.select().from(nilai).all();
    const setRows = await db.select().from(settings).all();
    const setMap: Record<string, string> = {};
    for (const r of setRows) setMap[r.key] = r.value || "";

    const today = todayISO();
    let absenHariIni = 0;
    for (const a of absenAll) {
      if (a.tanggal && a.tanggal.startsWith(today)) absenHariIni++;
    }

    let rataNilai = 0;
    if (nilaiAll.length > 0) {
      let tot = 0;
      for (const n of nilaiAll) tot += Number(n.nilai) || 0;
      rataNilai = Math.round((tot / nilaiAll.length) * 10) / 10;
    }

    const kelasMap: Record<string, string> = {};
    for (const k of kelasCount) kelasMap[k.id] = k.namaKelas || "";

    const distPerKelas: Record<string, number> = {};
    for (const k of kelasCount) distPerKelas[k.namaKelas || "-"] = 0;
    for (const s of siswaCount) {
      const namaKls = s.kelasId ? kelasMap[s.kelasId] : "-";
      distPerKelas[namaKls] = (distPerKelas[namaKls] || 0) + 1;
    }

    return apiOk({
      totalSiswa: siswaCount.length,
      totalKelas: kelasCount.length,
      absenHariIni,
      rataNilai,
      distPerKelas,
      totalAbsensi: absenAll.length,
      totalNilai: nilaiAll.length,
      tahunAjaran: setMap.tahun_ajaran || "-",
      semester: setMap.semester ? `Semester ${setMap.semester}` : "-",
    });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
