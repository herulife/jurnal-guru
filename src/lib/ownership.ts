import { db } from "@/db";
import { dataSiswa, dataKelas } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function canUseKelas(kelasId: string | null | undefined, scope: string | null): Promise<boolean> {
  if (!kelasId) return true;
  if (!scope) return true;
  const row = await db.select({ userId: dataKelas.userId }).from(dataKelas).where(eq(dataKelas.id, kelasId)).get();
  return row !== undefined && row.userId === scope;
}

export async function canUseSiswa(siswaId: string | null | undefined, scope: string | null): Promise<boolean> {
  if (!siswaId) return true;
  if (!scope) return true;
  const row = await db.select({ userId: dataSiswa.userId }).from(dataSiswa).where(eq(dataSiswa.id, siswaId)).get();
  return row !== undefined && row.userId === scope;
}
