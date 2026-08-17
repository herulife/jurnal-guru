import { requireAdmin, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { marketingGoals } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await requireAdmin();
    const scope = scopeUserId(session.role, session.id);
    const url = new URL(req.url);
    const filterStatus = url.searchParams.get("status");

    const conditions: ReturnType<typeof eq>[] = [];
    if (scope) conditions.push(eq(marketingGoals.userId, scope));
    if (filterStatus) conditions.push(eq(marketingGoals.status, filterStatus));

    const rows = await db
      .select()
      .from(marketingGoals)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(marketingGoals.createdAt))
      .all();

    return apiOk(rows);
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    if (!body.name || !String(body.name).trim()) {
      return apiError("Nama goal wajib diisi");
    }
    const id = uuidv4();
    await db.insert(marketingGoals).values({
      id,
      userId: session.id,
      name: String(body.name).trim(),
      description: body.description || null,
      metric: body.metric || null,
      targetValue: Number(body.targetValue) || 0,
      currentValue: Number(body.currentValue) || 0,
      period: body.period || null,
      startDate: body.startDate || null,
      endDate: body.endDate || null,
      status: body.status || "ON_TRACK",
    });
    await addLog(session.id, "CREATE_GOAL", `Tambah goal marketing: ${body.name}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}