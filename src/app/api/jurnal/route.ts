import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { jurnalMengajar, dataKelas } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError, normDate } from "@/lib/utils";
import { canUseKelas } from "@/lib/ownership";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const filterKelasId = url.searchParams.get("kelasId");
    const filterTanggal = url.searchParams.get("tanggal");
    const scope = scopeUserId(session.role, session.id);

    const kelasList = scope
      ? await db.select().from(dataKelas).where(eq(dataKelas.userId, scope)).all()
      : await db.select().from(dataKelas).all();
    const kelasMap: Record<string, string> = {};
    for (const k of kelasList) kelasMap[k.id] = k.namaKelas || "-";

    let conditions = [];
    if (scope) conditions.push(eq(jurnalMengajar.userId, scope));
    if (filterKelasId) conditions.push(eq(jurnalMengajar.kelasId, filterKelasId));
    if (filterTanggal) conditions.push(eq(jurnalMengajar.tanggal, normDate(filterTanggal)));

    const query = conditions.length > 0
      ? db.select().from(jurnalMengajar).where(and(...conditions))
      : db.select().from(jurnalMengajar);
    const rows = await query.all();

    const data = rows.map((j) => ({
      ...j,
      namaKelas: j.kelasId ? kelasMap[j.kelasId] || "-" : "-",
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
    const scope = scopeUserId(session.role, session.id);
    if (!(await canUseKelas(body.kelasId, scope))) {
      return apiError("Kelas tidak valid untuk akun Anda", 403);
    }
    const id = uuidv4();
    await db.insert(jurnalMengajar).values({
      id,
      userId: session.id,
      tanggal: body.tanggal || new Date().toISOString(),
      kelasId: body.kelasId || null,
      mataPelajaran: body.mataPelajaran,
      jamKe: body.jamKe || null,
      materi: body.materi || null,
      deskripsi: body.deskripsi || null,
      kendala: body.kendala || null,
      solusi: body.solusi || null,
      kehadiranSiswa: body.kehadiranSiswa || null,
      catatan: body.catatan || null,
    });
    await addLog(session.id, "CREATE_JURNAL", `Tambah jurnal ${body.mataPelajaran}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
