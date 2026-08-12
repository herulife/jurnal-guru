import { requireAuth, isAdminRole, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { dataKelas, dataSiswa } from "@/db/schema";
import { sql, eq, count, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";
import { getUserPlan, PLAN_LIMITS } from "@/lib/plans";

export async function GET() {
  try {
    const session = await requireAuth();
    const scope = scopeUserId(session.role, session.id);
    const conditions = [];
    if (scope) conditions.push(eq(dataKelas.userId, scope));
    const qb = db
      .select({
        id: dataKelas.id,
        namaKelas: dataKelas.namaKelas,
        tingkat: dataKelas.tingkat,
        jurusan: dataKelas.jurusan,
        tahunAjaran: dataKelas.tahunAjaran,
        waliKelas: dataKelas.waliKelas,
        jumlahSiswa: sql<number>`CAST(COUNT(${dataSiswa.id}) AS INTEGER)`,
      })
      .from(dataKelas)
      .leftJoin(dataSiswa, eq(dataSiswa.kelasId, dataKelas.id))
      .where(and(...conditions))
      .groupBy(dataKelas.id);
    const rows = await qb.all();
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

    if (!isAdminRole(session.role)) {
      const plan = await getUserPlan(session.id);
      const maxKelas = PLAN_LIMITS[plan].maxKelas;
      if (maxKelas !== null) {
        const existing = await db.select({ c: count() }).from(dataKelas).where(eq(dataKelas.userId, session.id)).all();
        const total = existing[0]?.c ?? 0;
        if (total >= maxKelas) {
          return apiError(`Paket ${PLAN_LIMITS[plan].label} hanya untuk ${maxKelas} kelas. Upgrade ke Pro untuk unlimited kelas.`, 403);
        }
      }
    }

const id = uuidv4();
    await db.insert(dataKelas).values({
      id,
      userId: session.id,
      namaKelas: body.namaKelas,
      tingkat: Number(body.tingkat),
      jurusan: body.jurusan || null,
      tahunAjaran: body.tahunAjaran || null,
      waliKelas: body.waliKelas || null,
    });
    await addLog(session.id, "CREATE_KELAS", `Tambah kelas ${body.namaKelas}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
