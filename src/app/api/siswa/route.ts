import { requireAuth, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { dataSiswa, dataKelas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await requireAuth();
    const url = new URL(req.url);
    const kelasId = url.searchParams.get("kelasId");

    const kelasList = await db.select().from(dataKelas).all();
    const kelasMap: Record<string, string> = {};
    for (const k of kelasList) kelasMap[k.id] = k.namaKelas || "-";

    const query = kelasId
      ? db.select().from(dataSiswa).where(eq(dataSiswa.kelasId, kelasId))
      : db.select().from(dataSiswa);
    const rows = await query.all();

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
    const id = uuidv4();
    await db.insert(dataSiswa).values({
      id,
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
