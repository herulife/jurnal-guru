import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { requirePlan } from "@/lib/plans";
import { db } from "@/db";
import { kelompokBelajar } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";
import { canUseKelas, canUseSiswa } from "@/lib/ownership";

function parseKelasId(raw: string | null) {
  return raw || null;
}

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    await requirePlan(session.role, session.id, "pro");
    const url = new URL(req.url);
    const kelasId = parseKelasId(url.searchParams.get("kelasId"));
    const scope = scopeUserId(session.role, session.id);

    let rows;
    if (scope && kelasId) {
      rows = await db
        .select()
        .from(kelompokBelajar)
        .where(and(eq(kelompokBelajar.userId, scope), eq(kelompokBelajar.kelasId, kelasId)))
        .all();
    } else if (scope) {
      rows = await db.select().from(kelompokBelajar).where(eq(kelompokBelajar.userId, scope)).all();
    } else if (kelasId) {
      rows = await db
        .select()
        .from(kelompokBelajar)
        .where(eq(kelompokBelajar.kelasId, kelasId))
        .all();
    } else {
      rows = await db.select().from(kelompokBelajar).all();
    }
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
    await requirePlan(session.role, session.id, "pro");
    const body = await req.json();
    const { kelasId, records } = body;

    if (!kelasId) return apiError("Kelas wajib dipilih");
    if (!Array.isArray(records)) return apiError("Data tidak lengkap");

    const scope = scopeUserId(session.role, session.id);
    if (!(await canUseKelas(kelasId, scope))) {
      return apiError("Kelas tidak valid untuk akun Anda", 403);
    }
    for (const r of records) {
      if (r.siswaId && !(await canUseSiswa(r.siswaId, scope))) {
        return apiError("Siswa tidak valid untuk akun Anda", 403);
      }
    }

    // reset data kelas ini lalu simpan baru
    if (scope) {
      await db.delete(kelompokBelajar).where(and(eq(kelompokBelajar.kelasId, kelasId), eq(kelompokBelajar.userId, session.id)));
    } else {
      await db.delete(kelompokBelajar).where(eq(kelompokBelajar.kelasId, kelasId));
    }

    const rows = records.map((r) => ({
      id: uuidv4(),
      userId: session.id,
      kelasId,
      kelompok: String(r.kelompok || ""),
      no: String(r.no || ""),
      siswaId: r.siswaId || null,
      nis: String(r.nis || ""),
      namaSiswa: String(r.namaSiswa || ""),
      jenisKelamin: String(r.jenisKelamin || ""),
      kelasAsal: String(r.kelasAsal || ""),
      nilai: String(r.nilai || ""),
    }));
    if (rows.length) await db.insert(kelompokBelajar).values(rows);
    await addLog(session.id, "SAVE_KELOMPOK", `Simpan kelompok kelas ${kelasId}`);

    return apiOk({ msg: `Kelompok berhasil disimpan (${records.length} siswa)` });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await requireAuth();
    await requirePlan(session.role, session.id, "pro");
    const url = new URL(req.url);
    const kelasId = parseKelasId(url.searchParams.get("kelasId"));

    if (kelasId) {
      if (scopeUserId(session.role, session.id)) {
        await db.delete(kelompokBelajar).where(and(eq(kelompokBelajar.kelasId, kelasId), eq(kelompokBelajar.userId, session.id)));
      } else {
        await db.delete(kelompokBelajar).where(eq(kelompokBelajar.kelasId, kelasId));
      }
    } else {
      if (scopeUserId(session.role, session.id)) {
        await db.delete(kelompokBelajar).where(eq(kelompokBelajar.userId, session.id));
      } else {
        await db.delete(kelompokBelajar);
      }
    }
    await addLog(session.id, "RESET_KELOMPOK", "Reset kelompok belajar");
    return apiOk({ msg: "Kelompok berhasil di-reset" });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}