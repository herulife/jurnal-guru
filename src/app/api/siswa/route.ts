import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { dataSiswa, dataKelas } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";
import { canUseKelas } from "@/lib/ownership";
import { getUserPlan, PLAN_LIMITS, countSiswa } from "@/lib/plans";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const kelasId = url.searchParams.get("kelasId");
    const scope = scopeUserId(session.role, session.id);

    const kelasList = scope
      ? await db.select().from(dataKelas).where(eq(dataKelas.userId, scope)).all()
      : await db.select().from(dataKelas).all();
    const kelasMap: Record<string, string> = {};
    for (const k of kelasList) kelasMap[k.id] = k.namaKelas || "-";

    const conditions = [];
    if (scope) conditions.push(eq(dataSiswa.userId, scope));
    if (kelasId) conditions.push(eq(dataSiswa.kelasId, kelasId));
    const rows = conditions.length > 0
      ? await db.select().from(dataSiswa).where(and(...conditions)).all()
      : await db.select().from(dataSiswa).all();

    const data = rows.map((s) => ({
      ...s,
      namaKelas: s.kelasId ? kelasMap[s.kelasId] || "-" : "-",
      kelasUuid: s.kelasId || "",
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

    // ── Student limit enforcement ──
    if (session.role !== "Admin") {
      const plan = await getUserPlan(session.id);
      const maxSiswa = PLAN_LIMITS[plan].maxSiswa;
      if (maxSiswa !== null) {
        const current = await countSiswa(session.id);
        if (current >= maxSiswa) {
          return apiError(
            `Paket ${PLAN_LIMITS[plan].label} mendukung hingga ${maxSiswa} siswa. ` +
            `Data yang sudah ada tetap aman. Upgrade ke Pro untuk menambahkan siswa tanpa batas.`,
            403
          );
        }
      }
    }

    const id = uuidv4();
    await db.insert(dataSiswa).values({
      id,
      userId: session.id,
      nis: body.nis,
      nisn: body.nisn || null,
      namaSiswa: body.namaSiswa,
      jenisKelamin: body.jenisKelamin || "L",
      kelasId: body.kelasId || null,
      alamat: body.alamat || null,
      telepon: body.telepon || null,
      email: body.email || null,
      namaOrtu: body.namaOrtu || null,
    });
    await addLog(session.id, "CREATE_SISWA", `Tambah siswa ${body.namaSiswa}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
