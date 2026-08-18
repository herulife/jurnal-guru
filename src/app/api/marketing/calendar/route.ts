import { requireAdmin, scopeUserId, AuthError } from "@/lib/auth";
import { db } from "@/db";
import { marketingTasks, marketingJournal, marketingPlans } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET(req: Request) {
  try {
    const session = await requireAdmin();
    const scope = scopeUserId(session.role, session.id);
    const url = new URL(req.url);
    const start = url.searchParams.get("start");
    const end = url.searchParams.get("end");
    const view = url.searchParams.get("view") || "month";

    const conditions: ReturnType<typeof eq>[] = [];
    if (scope) conditions.push(eq(marketingTasks.userId, scope));
    const taskWhere =
      start && end
        ? and(
            ...conditions,
            gte(
              sql`COALESCE(${marketingTasks.startDate}, ${marketingTasks.dueDate})`,
              start
            ),
            lte(
              sql`COALESCE(${marketingTasks.startDate}, ${marketingTasks.dueDate})`,
              end
            )
          )
        : conditions.length
          ? and(...conditions)
          : undefined;

    const allTasks = await db
      .select()
      .from(marketingTasks)
      .where(taskWhere)
      .all();

    const jCond: ReturnType<typeof eq>[] = [];
    if (scope) jCond.push(eq(marketingJournal.userId, scope));
    const journalWhere =
      start && end
        ? and(...jCond, gte(marketingJournal.date, start), lte(marketingJournal.date, end))
        : jCond.length
          ? and(...jCond)
          : undefined;

    const journals = await db.select().from(marketingJournal).where(journalWhere).all();
    const plans = await db
      .select()
      .from(marketingPlans)
      .where(scope ? eq(marketingPlans.userId, scope) : undefined)
      .all();

    type CalendarItem = {
      id: string;
      type: string;
      title: string;
      date: string | null;
      status?: string | null;
      priority?: string | null;
    };

    const items: CalendarItem[] = [];

    for (const t of allTasks) {
      const date = t.dueDate || t.startDate;
      if (!date) continue;
      items.push({
        id: t.id,
        type: "task",
        title: t.title,
        date,
        status: t.status,
        priority: t.priority,
      });
    }

    for (const j of journals) {
      items.push({
        id: j.id,
        type: "journal",
        title: j.target ? `Target: ${j.target}` : "Marketing Journal",
        date: j.date,
        status: null,
      });
    }

    for (const p of plans) {
      items.push({
        id: p.id,
        type: "plan",
        title: p.name,
        date: p.period ? p.period.split(" - ")[0] : null,
        status: p.status,
      });
    }

    // Filter items within range (month view convenience)
    let data = items;
    if (start && end) {
      data = items.filter(
        (it) =>
          it.date &&
          it.date >= start &&
          it.date <= end
      );
    }

    return apiOk({
      view,
      items: data,
      summary: {
        tasks: data.filter((i) => i.type === "task").length,
        journals: data.filter((i) => i.type === "journal").length,
        plans: data.filter((i) => i.type === "plan").length,
      },
    });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}