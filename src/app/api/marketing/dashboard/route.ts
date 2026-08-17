import { requireAdmin, scopeUserId, AuthError } from "@/lib/auth";
import { db } from "@/db";
import { marketingGoals, marketingTasks, marketingJournal } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET() {
  try {
    const session = await requireAdmin();
    const scope = scopeUserId(session.role, session.id);
    const today = new Date().toISOString().slice(0, 10);

    const goals = await db
      .select()
      .from(marketingGoals)
      .where(scope ? eq(marketingGoals.userId, scope) : undefined)
      .all();

    const tasks = await db
      .select()
      .from(marketingTasks)
      .where(scope ? eq(marketingTasks.userId, scope) : undefined)
      .orderBy(desc(marketingTasks.createdAt))
      .all();

    const journals = await db
      .select()
      .from(marketingJournal)
      .where(scope ? eq(marketingJournal.userId, scope) : undefined)
      .orderBy(desc(marketingJournal.date))
      .limit(7)
      .all();

    const todayTasks = tasks.filter(
      (t) => t.status !== "DONE" && t.status !== "CANCELLED" && t.dueDate === today
    );
    const overdueTasks = tasks.filter(
      (t) => t.status !== "DONE" && t.status !== "CANCELLED" && t.dueDate && t.dueDate < today
    );
    const doneTasks = tasks.filter((t) => t.status === "DONE");

    const goalsWithProgress = goals.map((g) => {
      const target = Number(g.targetValue) || 0;
      const current = Number(g.currentValue) || 0;
      const progress = target > 0 ? Math.round((current / target) * 100) : 0;
      return { ...g, progress };
    });

    // Chart data: last 30 days journal activity + done tasks count
    const last30 = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().slice(0, 10);
    });
    const journalByDate: Record<string, number> = {};
    for (const j of journals) journalByDate[j.date] = (journalByDate[j.date] || 0) + 1;
    const taskDoneByDate: Record<string, number> = {};
    for (const t of tasks) {
      if (t.status === "DONE" && t.dueDate) taskDoneByDate[t.dueDate] = (taskDoneByDate[t.dueDate] || 0) + 1;
    }
    const chart = last30.map((date) => ({
      date,
      journal: journalByDate[date] || 0,
      taskDone: taskDoneByDate[date] || 0,
    }));

    return apiOk({
      summary: {
        totalGoals: goals.length,
        activeGoals: goals.filter((g) => g.status !== "COMPLETED").length,
        completedGoals: goals.filter((g) => g.status === "COMPLETED").length,
        totalTasks: tasks.length,
        todayTasks: todayTasks.length,
        overdueTasks: overdueTasks.length,
        doneTasks: doneTasks.length,
        totalJournal: journals.length,
      },
      todayTasks,
      overdueTasks,
      goals: goalsWithProgress,
      recentJournal: journals,
      chart,
    });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}