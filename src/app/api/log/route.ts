import { requireAdmin, AuthError } from "@/lib/auth";
import { db } from "@/db";
import { activityLog } from "@/db/schema";
import { desc } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET() {
  try {
    const session = await requireAdmin();
    const rows = await db
      .select()
      .from(activityLog)
      .orderBy(desc(activityLog.timestamp))
      .limit(100)
      .all();
    return apiOk(rows);
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}
