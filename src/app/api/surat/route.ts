import { requireAuth, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { dataSurat } from "@/db/schema";
import { desc } from "drizzle-orm";
import { apiError, apiResponse, apiServerError } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const session = await requireAuth();
    const list = await db.select().from(dataSurat).orderBy(desc(dataSurat.createdAt));
    return apiResponse(true, list);
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAuth();
    const { judul, jenis, tujuan, template } = await req.json();
    if (!judul || !jenis || !template) {
      return apiError("Judul, jenis, dan template wajib diisi");
    }
    const id = uuidv4();
    await db.insert(dataSurat).values({ id, judul, jenis, tujuan, template });
    await addLog(session.id, "CREATE_SURAT", `Tambah surat ${judul}`);
    return apiResponse(true, { id }, "Surat berhasil ditambahkan");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
