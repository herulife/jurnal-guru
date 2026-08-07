import { db } from "@/db";
import { dataKelas, dataSiswa } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function getKelasWithCount() {
  const rows = await db
    .select({
      id: dataKelas.id,
      namaKelas: dataKelas.namaKelas,
      tingkat: dataKelas.tingkat,
      jurusan: dataKelas.jurusan,
      tahunAjaran: dataKelas.tahunAjaran,
      waliKelas: dataKelas.waliKelas,
      jumlahSiswa: sql<number>`coalesce(count(${dataSiswa.id}), 0)`,
    })
    .from(dataKelas)
    .leftJoin(dataSiswa, eq(dataSiswa.kelasId, dataKelas.id))
    .groupBy(dataKelas.id)
    .all();

  return rows;
}

export function getKelasMap(kelas: { id: string; namaKelas: string | null }[]) {
  const map: Record<string, string> = {};
  for (const k of kelas) {
    map[k.id] = k.namaKelas || "-";
  }
  return map;
}
