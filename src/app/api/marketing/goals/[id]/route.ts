import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { marketingGoals, marketingPlans, marketingTasks } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

function goalWhere(id: string, scope: string | null) {
  return scope
    ? and(eq(marketingGoals.id, id), eq(marketingGoals.userId, scope))
    : eq(marketingGoals.id, id);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const scope = scopeUserId(session.role, session.id);
    const { id } = await params;
    const body = await req.json();

    const existing = await db
      .select()
      .from(marketingGoals)
      .where(goalWhere(id, scope))
      .get();
    if (!existing) return apiError("Goal tidak ditemukan", 404);

    if (body.name !== undefined && !String(body.name).trim()) {
      return apiError("Nama goal wajib diisi");
    }

    await db
      .update(marketingGoals)
      .set({
        name: body.name !== undefined ? String(body.name).trim() : existing.name,
        description: body.description !== undefined ? body.description : existing.description,
        metric: body.metric !== undefined ? body.metric : existing.metric,
        targetValue: body.targetValue !== undefined ? Number(body.targetValue) : existing.targetValue,
        currentValue: body.currentValue !== undefined ? Number(body.currentValue) : existing.currentValue,
        period: body.period !== undefined ? body.period : existing.period,
        startDate: body.startDate !== undefined ? body.startDate : existing.startDate,
        endDate: body.endDate !== undefined ? body.endDate : existing.endDate,
        status: body.status !== undefined ? body.status : existing.status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(marketingGoals.id, id));
    await addLog(session.id, "UPDATE_GOAL", `Update goal marketing: ${existing.name}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const scope = scopeUserId(session.role, session.id);
    const { id } = await params;

    const existing = await db
      .select()
      .from(marketingGoals)
      .where(goalWhere(id, scope))
      .get();
    if (!existing) return apiError("Goal tidak ditemukan", 404);

    const relatedPlans = await db
      .select({ id: marketingPlans.id })
      .from(marketingPlans)
      .where(and(eq(marketingPlans.goalId, id), scope ? eq(marketingPlans.userId, scope) : undefined))
      .all();
    const planIds = relatedPlans.map((p) => p.id);

    if (planIds.length > 0) {
      await db.delete(marketingTasks).where(and(inArray(marketingTasks.planId, planIds), scope ? eq(marketingTasks.userId, scope) : undefined));
    }
    await db.delete(marketingTasks).where(and(eq(marketingTasks.goalId, id), scope ? eq(marketingTasks.userId, scope) : undefined));
    await db.delete(marketingPlans).where(and(eq(marketingPlans.goalId, id), scope ? eq(marketingPlans.userId, scope) : undefined));
    await db.delete(marketingGoals).where(goalWhere(id, scope));
    await addLog(session.id, "DELETE_GOAL", `Hapus goal marketing: ${existing.name}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}