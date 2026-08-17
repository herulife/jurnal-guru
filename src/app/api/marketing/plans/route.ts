import { requireAdmin, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { marketingPlans } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await requireAdmin();
    const scope = scopeUserId(session.role, session.id);
    const url = new URL(req.url);
    const filterGoalId = url.searchParams.get("goalId");
    const filterStatus = url.searchParams.get("status");

    const conditions: ReturnType<typeof eq>[] = [];
    if (scope) conditions.push(eq(marketingPlans.userId, scope));
    if (filterGoalId) conditions.push(eq(marketingPlans.goalId, filterGoalId));
    if (filterStatus) conditions.push(eq(marketingPlans.status, filterStatus));

    const rows = await db
      .select()
      .from(marketingPlans)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(marketingPlans.createdAt))
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
      return apiError("Nama marketing plan wajib diisi");
    }
    const id = uuidv4();
    await db.insert(marketingPlans).values({
      id,
      userId: session.id,
      name: String(body.name).trim(),
      objective: body.objective || null,
      target: body.target || null,
      period: body.period || null,
      strategy: body.strategy || null,
      channels: body.channels || null,
      kpi: body.kpi || null,
      status: body.status || "ACTIVE",
      goalId: body.goalId || null,
    });
    await addLog(session.id, "CREATE_PLAN", `Tambah marketing plan: ${body.name}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}