import { requireAdmin, scopeUserId, AuthError, addLog } from "@/lib/auth";
import { db } from "@/db";
import { marketingTasks } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await requireAdmin();
    const scope = scopeUserId(session.role, session.id);
    const url = new URL(req.url);
    const filterStatus = url.searchParams.get("status");
    const filterPriority = url.searchParams.get("priority");
    const filterGoalId = url.searchParams.get("goalId");
    const filterDue = url.searchParams.get("due"); // today | overdue

    const conditions: ReturnType<typeof eq>[] = [];
    if (scope) conditions.push(eq(marketingTasks.userId, scope));
    if (filterStatus) conditions.push(eq(marketingTasks.status, filterStatus));
    if (filterPriority) conditions.push(eq(marketingTasks.priority, filterPriority));
    if (filterGoalId) conditions.push(eq(marketingTasks.goalId, filterGoalId));

    const rows = await db
      .select()
      .from(marketingTasks)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(marketingTasks.createdAt))
      .all();

    let data = rows;
    if (filterDue === "today") {
      const today = new Date().toISOString().slice(0, 10);
      data = rows.filter(
        (t) => t.status !== "DONE" && t.status !== "CANCELLED" && t.dueDate === today
      );
    } else if (filterDue === "overdue") {
      const today = new Date().toISOString().slice(0, 10);
      data = rows.filter(
        (t) =>
          t.status !== "DONE" &&
          t.status !== "CANCELLED" &&
          t.dueDate &&
          t.dueDate < today
      );
    }

    return apiOk(data);
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
    if (!body.title || !String(body.title).trim()) {
      return apiError("Judul task wajib diisi");
    }
    const id = uuidv4();
    await db.insert(marketingTasks).values({
      id,
      userId: session.id,
      title: String(body.title).trim(),
      description: body.description || null,
      status: body.status || "TODO",
      priority: body.priority || "MEDIUM",
      dueDate: body.dueDate || null,
      startDate: body.startDate || null,
      goalId: body.goalId || null,
      planId: body.planId || null,
      campaignId: body.campaignId || null,
      leadId: body.leadId || null,
      assignedTo: body.assignedTo || null,
      recurring: body.recurring || null,
      notes: body.notes || null,
    });
    await addLog(session.id, "CREATE_TASK", `Tambah task marketing: ${body.title}`);
    return apiOk({ id });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}