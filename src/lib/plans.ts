import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export type Plan = "gratis" | "pro" | "sekolah";

export const PLAN_LIMITS: Record<Plan, { maxKelas: number | null; label: string }> = {
  gratis: { maxKelas: 1, label: "Gratis" },
  pro: { maxKelas: null, label: "Pro" },
  sekolah: { maxKelas: null, label: "Sekolah" },
};

export async function getUserPlan(userId: string): Promise<Plan> {
  const user = await db.select({ plan: users.plan }).from(users).where(eq(users.id, userId)).get();
  return (user?.plan as Plan) || "gratis";
}

export function hasExportAccess(plan: Plan): boolean {
  return plan === "pro" || plan === "sekolah";
}

export function hasAdminDashboard(plan: Plan): boolean {
  return plan === "sekolah";
}