import { db } from "@/db";
import { users, dataKelas, dataSiswa } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { AuthError } from "@/lib/auth";

export type Plan = "gratis" | "pro" | "premium";

export const PLAN_RANK: Record<Plan, number> = { gratis: 0, pro: 1, premium: 2 };
export const PLAN_LABEL: Record<Plan, string> = { gratis: "Gratis", pro: "Pro", premium: "Premium" };

// ── Centralized Limits ──
// Gratis: 1 kelas, 30 siswa, basic features
// Pro: unlimited kelas & siswa, advanced grades, export
// Premium: everything in Pro + LCKH/LKB + employee reports
export const PLAN_LIMITS: Record<Plan, {
  maxKelas: number | null;
  maxSiswa: number | null;
  label: string;
}> = {
  gratis: { maxKelas: 1, maxSiswa: 30, label: "Gratis" },
  pro: { maxKelas: null, maxSiswa: null, label: "Pro" },
  premium: { maxKelas: null, maxSiswa: null, label: "Premium" },
};

// ── Feature Flags ──
export type FeatureFlag =
  | "basic_attendance" | "basic_journal" | "basic_grades"
  | "dashboard" | "google_sheets"
  | "advanced_grades" | "kkm" | "rekap_nilai"
  | "kelompok_belajar" | "export"
  | "lckh" | "lkb" | "employee_reports" | "priority_support";

const FEATURE_MAP: Record<Plan, FeatureFlag[]> = {
  gratis: [
    "basic_attendance", "basic_journal", "basic_grades",
    "dashboard", "google_sheets",
  ],
  pro: [
    "basic_attendance", "basic_journal", "basic_grades",
    "dashboard", "google_sheets",
    "advanced_grades", "kkm", "rekap_nilai",
    "kelompok_belajar", "export",
  ],
  premium: [
    "basic_attendance", "basic_journal", "basic_grades",
    "dashboard", "google_sheets",
    "advanced_grades", "kkm", "rekap_nilai",
    "kelompok_belajar", "export",
    "lckh", "lkb", "employee_reports", "priority_support",
  ],
};

export function hasFeature(plan: Plan, feature: FeatureFlag): boolean {
  return FEATURE_MAP[plan].includes(feature);
}

// ── Plan Normalization ──
export function normalizePlan(p: string | null | undefined): Plan {
  if (p === "pro") return "pro";
  if (p === "premium" || p === "sekolah") return "premium";
  return "gratis";
}

export function addMonths(base: Date, months: number): Date {
  const d = new Date(base);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function trialExpires(now: Date = new Date()): string {
  const d = new Date(now);
  d.setDate(d.getDate() + 2);
  return d.toISOString();
}

export function isPlanExpired(plan: Plan, expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  if (plan === "gratis") return false;
  return new Date(expiresAt).getTime() < Date.now();
}

// ── Server-side Plan Retrieval ──
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

// ── Usage Counting ──
export async function countKelas(userId: string): Promise<number> {
  const result = await db.select({ c: count() }).from(dataKelas)
    .where(eq(dataKelas.userId, userId)).get();
  return result?.c ?? 0;
}

export async function countSiswa(userId: string): Promise<number> {
  const result = await db.select({ c: count() }).from(dataSiswa)
    .where(eq(dataSiswa.userId, userId)).get();
  return result?.c ?? 0;
}

// ── Limit Enforcement ──
export async function checkClassLimit(userId: string): Promise<{ allowed: boolean; current: number; max: number | null }> {
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];
  if (limits.maxKelas === null) return { allowed: true, current: 0, max: null };
  const current = await countKelas(userId);
  return { allowed: current < limits.maxKelas, current, max: limits.maxKelas };
}

export async function checkStudentLimit(userId: string): Promise<{ allowed: boolean; current: number; max: number | null }> {
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];
  if (limits.maxSiswa === null) return { allowed: true, current: 0, max: null };
  const current = await countSiswa(userId);
  return { allowed: current < limits.maxSiswa, current, max: limits.maxSiswa };
}

// ── Plan Access Checks ──
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

export async function requirePlan(role: string, userId: string, min: Plan): Promise<void> {
  if (role === "Admin") return;
  const plan = await getUserPlan(userId);
  if (PLAN_RANK[plan] < PLAN_RANK[min]) {
    throw new AuthError(`Fitur ini tersedia untuk paket ${PLAN_LABEL[min]} ke atas`, 403);
  }
}

// ── Admin Role Helpers (re-exported from plan-helpers for compatibility) ──
export { isAdminRole, ROLE_OPTIONS, ROLE_LABEL, ROLE_BADGE, roleToPlan, resolveUserRole, deriveRoleLabel } from "@/lib/plan-helpers";
