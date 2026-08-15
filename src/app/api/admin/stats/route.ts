import { requireAdmin, AuthError } from "@/lib/auth";
import { db } from "@/db";
import { users, payments, subscriptions, activityLog } from "@/db/schema";
import { apiError, apiOk, apiServerError } from "@/lib/utils";

export async function GET() {
  try {
    await requireAdmin();

    const allUsers = await db
      .select({ plan: users.plan, role: users.role, createdAt: users.createdAt })
      .from(users)
      .all();

    const allPayments = await db
      .select({ status: payments.status, amount: payments.amount, createdAt: payments.createdAt })
      .from(payments)
      .all();

    const allSubs = await db
      .select({ status: subscriptions.status, planId: subscriptions.planId })
      .from(subscriptions)
      .all();

    const logs = await db
      .select()
      .from(activityLog)
      .orderBy(activityLog.timestamp)
      .all();

    const totalUsers = allUsers.length;
    const count = (fn: (u: { plan: string; role: string }) => boolean) =>
      allUsers.filter(fn).length;

    const pro = count((u) => u.plan === "pro");
    const premium = count((u) => u.plan === "premium" || u.plan === "sekolah");
    const gratis = count((u) => u.plan === "gratis" || u.plan === "");
    const admins = count((u) => u.role.toLowerCase() === "admin");

    const pendingPayments = allPayments.filter((p) => p.status === "pending");
    const totalRevenue = allPayments
      .filter((p) => p.status === "paid")
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const activeSubs = allSubs.filter((s) => s.status === "active").length;
    const today = new Date().toISOString().slice(0, 10);
    const newUsersToday = allUsers.filter((u) => u.createdAt && u.createdAt.startsWith(today)).length;

    const recentLogs = [...logs].sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || "")).slice(0, 12).map((l) => ({
      id: l.id,
      timestamp: l.timestamp,
      action: l.action,
      description: l.description,
      userId: l.userId,
    }));

    return apiOk({
      totalUsers,
      pro,
      premium,
      gratis,
      admins,
      pendingCount: pendingPayments.length,
      totalRevenue: Math.round(totalRevenue),
      activeSubs,
      newUsersToday,
      recentLogs,
    });
  } catch (e: unknown) {
    if (e instanceof AuthError) return apiError(e.message, e.status);
    console.error("[API ERROR]", e);
    return apiServerError();
  }
}