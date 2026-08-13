import { requireAuth, isAdminRole, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { settings, userSettings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

const ADMIN_KEYS = ['app_name', 'invite_code', 'bank_name', 'bank_account_number', 'bank_account_name', 'bank_note'];
const USER_KEYS = ['tahun_ajaran', 'semester', 'kkm_default', 'dark_mode'];

export async function GET() {
  try {
    const session = await requireAuth();
    const isAdmin = isAdminRole(session.role);
    const rows = await db.select().from(settings).all();
    const admin: Record<string, string> = {};
    if (isAdmin) {
      for (const r of rows) {
        if (ADMIN_KEYS.includes(r.key)) admin[r.key] = r.value || "";
      }
    }
    const own = await db.select().from(userSettings).where(eq(userSettings.userId, session.id)).all();
    const user: Record<string, string> = {};
    for (const r of own) user[r.key] = r.value || "";
    return apiOk({ admin, user });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAuth();
    const isAdmin = isAdminRole(session.role);
    const body = await req.json();

    if (body.user && typeof body.user === "object") {
      for (const [k, v] of Object.entries(body.user)) {
        if (!USER_KEYS.includes(k)) continue;
        const val = String(v);
        const existing = await db
          .select()
          .from(userSettings)
          .where(and(eq(userSettings.userId, session.id), eq(userSettings.key, k)))
          .get();
        if (existing) {
          await db.update(userSettings).set({ value: val }).where(and(eq(userSettings.userId, session.id), eq(userSettings.key, k)));
        } else {
          await db.insert(userSettings).values({ userId: session.id, key: k, value: val });
        }
      }
    }

    if (body.admin && typeof body.admin === "object") {
      if (!isAdmin) return apiError("Hanya admin yang dapat mengubah pengaturan aplikasi", 403);
      const existing = await db.select().from(settings).all();
      const existingKeys = new Set(existing.map((r) => r.key));
      for (const [k, v] of Object.entries(body.admin)) {
        if (!ADMIN_KEYS.includes(k)) continue;
        if (existingKeys.has(k)) {
          await db.update(settings).set({ value: String(v) }).where(eq(settings.key, k));
        } else {
          await db.insert(settings).values({ key: k, value: String(v) });
        }
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
