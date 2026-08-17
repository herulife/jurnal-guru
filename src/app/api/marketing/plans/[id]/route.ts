import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { marketingPlans, marketingTasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

function planWhere(id: string, scope: string | null) {
  return scope
    ? and(eq(marketingPlans.id, id), eq(marketingPlans.userId, scope))
    : eq(marketingPlans.id, id);
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
      .from(marketingPlans)
      .where(planWhere(id, scope))
      .get();
    if (!existing) return apiError("Plan tidak ditemukan", 404);

    if (body.name !== undefined && !String(body.name).trim()) {
      return apiError("Nama marketing plan wajib diisi");
    }

    const fields = [
      "name",
      "objective",
      "target",
      "period",
      "strategy",
      "channels",
      "kpi",
      "status",
      "goalId",
    ] as const;
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }

    await db
      .update(marketingPlans)
      .set(updateData)
      .where(planWhere(id, scope));
    await addLog(session.id, "UPDATE_PLAN", `Update marketing plan: ${existing.name}`);
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
      .from(marketingPlans)
      .where(planWhere(id, scope))
      .get();
    if (!existing) return apiError("Plan tidak ditemukan", 404);

    await db.delete(marketingTasks).where(and(eq(marketingTasks.planId, id), scope ? eq(marketingTasks.userId, scope) : undefined));
    await db
      .delete(marketingPlans)
      .where(planWhere(id, scope));
    await addLog(session.id, "DELETE_PLAN", `Hapus marketing plan: ${existing.name}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}