import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { absensi, dataSiswa, dataKelas } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError, normDate } from "@/lib/utils";
import { canUseKelas, canUseSiswa } from "@/lib/ownership";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const filterTanggal = url.searchParams.get("tanggal");
    const filterKelasId = url.searchParams.get("kelasId");
    const scope = scopeUserId(session.role, session.id);

    const siswaList = scope
      ? await db.select().from(dataSiswa).where(eq(dataSiswa.userId, scope)).all()
      : await db.select().from(dataSiswa).all();
    const kelasList = scope
      ? await db.select().from(dataKelas).where(eq(dataKelas.userId, scope)).all()
      : await db.select().from(dataKelas).all();
    const siswaMap: Record<string, string> = {};
    for (const s of siswaList) siswaMap[s.id] = s.namaSiswa;
    const kelasMap: Record<string, string> = {};
    for (const k of kelasList) kelasMap[k.id] = k.namaKelas || "-";

    const conditions = [];
    if (scope) conditions.push(eq(absensi.userId, scope));
    if (filterTanggal) conditions.push(eq(absensi.tanggal, normDate(filterTanggal)));
    if (filterKelasId) conditions.push(eq(absensi.kelasId, filterKelasId));

    const query = conditions.length > 0
      ? db.select().from(absensi).where(and(...conditions))
      : db.select().from(absensi);
    const rows = await query.all();

    const data = rows.map((a) => ({
      ...a,
      namaSiswa: a.siswaId ? siswaMap[a.siswaId] || "-" : "-",
      namaKelas: a.kelasId ? kelasMap[a.kelasId] || "-" : "-",
    }));
    return apiOk(data);
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
    const recs = body.records;
    if (!Array.isArray(recs) || !recs.length) {
      return apiError("Tidak ada data");
    }
    const scope = scopeUserId(session.role, session.id);
    const existing = scope
      ? await db.select().from(absensi).where(eq(absensi.userId, scope)).all()
      : await db.select().from(absensi).all();
    let saved = 0;
    for (const r of recs) {
      if (!(await canUseSiswa(r.siswaId, scope)) || !(await canUseKelas(r.kelasId, scope))) {
        return apiError("Siswa atau kelas tidak valid untuk akun Anda", 403);
      }
      const found = existing.find(
        (e) =>
          e.tanggal &&
          r.tanggal &&
          normDate(e.tanggal) === normDate(r.tanggal) &&
          e.siswaId === r.siswaId
      );
      if (found) {
        await db
          .update(absensi)
          .set({
            status: r.status,
            keterangan: r.keterangan || null,
          })
          .where(eq(absensi.id, found.id));
      } else {
        await db.insert(absensi).values({
          id: uuidv4(),
          tanggal: r.tanggal,
          siswaId: r.siswaId,
          kelasId: r.kelasId,
          mataPelajaran: r.mataPelajaran,
          status: r.status || "Hadir",
          keterangan: r.keterangan || null,
          userId: session.id,
        });
      }
      saved++;
    }
    await addLog(session.id, "SAVE_ABSENSI", `Simpan ${saved} absensi`);
    return apiOk({ saved, msg: `${saved} absensi disimpan` });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
