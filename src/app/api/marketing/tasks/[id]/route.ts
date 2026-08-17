import { requireAuth, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { marketingTasks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

function taskWhere(id: string, scope: string | null) {
  return scope
    ? and(eq(marketingTasks.id, id), eq(marketingTasks.userId, scope))
    : eq(marketingTasks.id, id);
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
      .from(marketingTasks)
      .where(taskWhere(id, scope))
      .get();
    if (!existing) return apiError("Task tidak ditemukan", 404);

    if (body.title !== undefined && !String(body.title).trim()) {
      return apiError("Judul task wajib diisi");
    }

    const fields = [
      "title",
      "description",
      "status",
      "priority",
      "dueDate",
      "startDate",
      "goalId",
      "planId",
      "campaignId",
      "leadId",
      "assignedTo",
      "recurring",
      "notes",
    ] as const;
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    for (const f of fields) {
      if (body[f] !== undefined) updateData[f] = body[f];
    }

    await db
      .update(marketingTasks)
      .set(updateData)
      .where(taskWhere(id, scope));
    await addLog(session.id, "UPDATE_TASK", `Update task marketing: ${existing.title}`);
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
      .from(marketingTasks)
      .where(taskWhere(id, scope))
      .get();
    if (!existing) return apiError("Task tidak ditemukan", 404);

    await db
      .delete(marketingTasks)
      .where(taskWhere(id, scope));
    await addLog(session.id, "DELETE_TASK", `Hapus task marketing: ${existing.title}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}