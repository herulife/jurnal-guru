import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AuthError, isAdminRole } from "@/lib/auth";
import { PLAN_RANK, PLAN_LABEL, normalizePlan } from "@/lib/plan-helpers";
import type { Plan } from "@/lib/plan-helpers";

export type { Plan } from "@/lib/plan-helpers";
export { PLAN_LIMITS, normalizePlan, hasExportAccess, hasProFeatures, hasPremiumFeatures } from "@/lib/plan-helpers";

export async function getUserPlan(userId: string): Promise<Plan> {
  const user = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, userId))
    .get();
  return normalizePlan(user?.plan);
}

export async function canAccess(userId: string, min: Plan): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return PLAN_RANK[plan] >= PLAN_RANK[min];
}

export async function requirePlan(role: string, userId: string, min: Plan): Promise<void> {
  if (isAdminRole(role)) return;
  const plan = await getUserPlan(userId);
  if (PLAN_RANK[plan] < PLAN_RANK[min]) {
    throw new AuthError(`Fitur ini tersedia untuk paket ${PLAN_LABEL[min]} ke atas`, 403);
  }
}
