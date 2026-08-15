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

/** Tambah bulan ke tanggal sekarang (untuk durasi langganan) */
export function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Trial gratis 2 hari untuk akun baru */
export function trialExpires(now: Date = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + 2);
  return d.toISOString();
}

export function isPlanExpired(plan: Plan, expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false; // tanpa batas waktu (akun lama / admin)
  return new Date(expiresAt).getTime() < Date.now();
}

export async function getUserPlan(userId: string): Promise<Plan> {
  const user = await db
    .select({ plan: users.plan, planExpires: users.planExpires })
    .from(users)
    .where(eq(users.id, userId))
    .get();
  const plan = normalizePlan(user?.plan);
  if (isPlanExpired(plan, user?.planExpires)) return "gratis";
  return plan;
}

export async function getPlanExpiry(userId: string): Promise<string | null> {
  const user = await db
    .select({ planExpires: users.planExpires })
    .from(users)
    .where(eq(users.id, userId))
    .get();
  return user?.planExpires ?? null;
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
