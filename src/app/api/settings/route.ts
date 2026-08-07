import { requireAuth, requireAdmin, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

const KEY_WHITELIST = ['app_name', 'tahun_ajaran', 'semester', 'kkm_default', 'bank_name', 'bank_account_number', 'bank_account_name', 'bank_note'];

export async function GET() {
  try {
    const session = await requireAuth();
    const rows = await db.select().from(settings).all();
    const data: Record<string, string> = {};
    for (const r of rows) data[r.key] = r.value || "";
    return apiOk(data);
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const existing = await db.select().from(settings).all();
    const existingKeys = new Set(existing.map((r) => r.key));
    for (const [k, v] of Object.entries(body)) {
      if (!KEY_WHITELIST.includes(k)) continue;
      if (existingKeys.has(k)) {
        await db.update(settings).set({ value: String(v) }).where(eq(settings.key, k));
      } else {
        await db.insert(settings).values({ key: k, value: String(v) });
      }
    }
    await addLog(session.id, "UPDATE_SETTINGS", "Update pengaturan");
    return apiOk(null, "Pengaturan disimpan");
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
