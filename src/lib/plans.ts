import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AuthError } from "@/lib/auth";

export type Plan = "gratis" | "pro" | "premium";

export const PLAN_LIMITS: Record<Plan, { maxKelas: number | null; label: string }> = {
  gratis: { maxKelas: 1, label: "Gratis" },
  pro: { maxKelas: null, label: "Pro" },
  premium: { maxKelas: null, label: "Premium" },
};

const PLAN_RANK: Record<Plan, number> = { gratis: 0, pro: 1, premium: 2 };

export function normalizePlan(p: string | null | undefined): Plan {
  if (p === "pro") return "pro";
  if (p === "premium" || p === "sekolah") return "premium";
  return "gratis";
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const user = await db
    .select({ plan: users.plan })
    .from(users)
    .where(eq(users.id, userId))
    .get();
  return normalizePlan(user?.plan);
}

export function hasExportAccess(plan: Plan): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK.pro;
}

export function hasProFeatures(plan: Plan): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK.pro;
}

export function hasPremiumFeatures(plan: Plan): boolean {
  return PLAN_RANK[plan] >= PLAN_RANK.premium;
}

export async function canAccess(userId: string, min: Plan): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return PLAN_RANK[plan] >= PLAN_RANK[min];
}

const PLAN_LABEL: Record<Plan, string> = { gratis: "Gratis", pro: "Pro", premium: "Premium" };

export async function requirePlan(role: string, userId: string, min: Plan): Promise<void> {
  if (role === "Admin") return;
  const plan = await getUserPlan(userId);
  if (PLAN_RANK[plan] < PLAN_RANK[min]) {
    throw new AuthError(`Fitur ini tersedia untuk paket ${PLAN_LABEL[min]} ke atas`, 403);
  }
}
