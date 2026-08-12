import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { jadwalMengajar, dataKelas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";
import { canUseKelas } from "@/lib/ownership";

export async function GET() {
  try {
    const session = await requireAuth();
    const scope = scopeUserId(session.role, session.id);
    const kelasList = scope
      ? await db.select().from(dataKelas).where(eq(dataKelas.userId, scope)).all()
      : await db.select().from(dataKelas).all();
    const kelasMap: Record<string, string> = {};
    for (const k of kelasList) kelasMap[k.id] = k.namaKelas || "-";

    const rows = scope
      ? await db.select().from(jadwalMengajar).where(eq(jadwalMengajar.userId, scope)).all()
      : await db.select().from(jadwalMengajar).all();
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
    await db.insert(jadwalMengajar).values({
      id,
      userId: session.id,
      kelasId: body.kelasId || null,
      mataPelajaran: body.mataPelajaran,
      hari: body.hari,
      jamMulai: body.jamMulai || null,
      jamSelesai: body.jamSelesai || null,
      semester: body.semester || null,
      ruangan: body.ruangan || null,
    });
    await addLog(session.id, "CREATE_JADWAL", `Tambah jadwal ${body.mataPelajaran}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
