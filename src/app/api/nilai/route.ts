import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { requirePlan } from "@/lib/plans";
import { db } from "@/db";
import { nilai, dataSiswa, dataKelas } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";
import { canUseKelas, canUseSiswa } from "@/lib/ownership";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    await requirePlan(session.role, session.id, "pro");
    const url = new URL(req.url);
    const filterKelasId = url.searchParams.get("kelasId");
    const filterKategori = url.searchParams.get("kategori");
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

    let conditions = [];
    if (scope) conditions.push(eq(nilai.userId, scope));
    if (filterKelasId) conditions.push(eq(nilai.kelasId, filterKelasId));
    if (filterKategori) conditions.push(eq(nilai.kategori, filterKategori));

    const query = conditions.length > 0
      ? db.select().from(nilai).where(and(...conditions))
      : db.select().from(nilai);
    const rows = await query.all();

    const data = rows.map((n) => ({
      ...n,
      namaSiswa: n.siswaId ? siswaMap[n.siswaId] || "-" : "-",
      namaKelas: n.kelasId ? kelasMap[n.kelasId] || "-" : "-",
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
    await requirePlan(session.role, session.id, "pro");
    const body = await req.json();
    const scope = scopeUserId(session.role, session.id);
    if (!(await canUseSiswa(body.siswaId, scope)) || !(await canUseKelas(body.kelasId, scope))) {
      return apiError("Siswa atau kelas tidak valid untuk akun Anda", 403);
    }
    const id = uuidv4();
    await db.insert(nilai).values({
      id,
      userId: session.id,
      tanggal: body.tanggal || new Date().toISOString(),
      siswaId: body.siswaId,
      kelasId: body.kelasId,
      mataPelajaran: body.mataPelajaran,
      kategori: body.kategori,
      bab: body.bab || null,
      tujuanPembelajaran: body.tujuanPembelajaran || null,
      bentukPenugasan: body.bentukPenugasan || null,
      nilai: Number(body.nilai) || 0,
      kkm: Number(body.kkm) || 75,
      remedial: body.remedial || null,
    });
    await addLog(session.id, "CREATE_NILAI", `Tambah nilai ${body.mataPelajaran}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
