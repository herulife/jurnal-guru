export type Plan = "gratis" | "pro" | "premium";

export const PLAN_RANK: Record<Plan, number> = { gratis: 0, pro: 1, premium: 2 };

export const PLAN_LABEL: Record<Plan, string> = { gratis: "Gratis", pro: "Pro", premium: "Premium" };

export const PLAN_LIMITS: Record<Plan, { maxKelas: number | null; label: string }> = {
  gratis: { maxKelas: 1, label: "Gratis" },
  pro: { maxKelas: null, label: "Pro" },
  premium: { maxKelas: null, label: "Premium" },
};

export function normalizePlan(p: string | null | undefined): Plan {
  if (p === "pro") return "pro";
  if (p === "premium" || p === "sekolah") return "premium";
  return "gratis";
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

export const canExport = (p: Plan | null): boolean =>
  p !== null && PLAN_RANK[p] >= PLAN_RANK.pro;

export const canUsePro = (p: Plan | null): boolean =>
  p !== null && PLAN_RANK[p] >= PLAN_RANK.pro;

export const canUsePremium = (p: Plan | null): boolean =>
  p !== null && PLAN_RANK[p] >= PLAN_RANK.premium;

export const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "premium", label: "Premium" },
] as const;

export type RoleLabel = (typeof ROLE_OPTIONS)[number]["value"];

export const ROLE_LABEL: Record<RoleLabel, string> = {
  admin: "Admin",
  free: "Free",
  pro: "Pro",
  premium: "Premium",
};

export const ROLE_BADGE: Record<RoleLabel, string> = {
  admin: "bg-purple-100 text-purple-700",
  free: "bg-gray-100 text-gray-700",
  pro: "bg-amber-100 text-amber-700",
  premium: "bg-emerald-100 text-emerald-700",
};

export function isAdminRole(role: string | null | undefined): boolean {
  return (role ?? "").toLowerCase() === "admin";
}

export function roleToPlan(role: string): Plan {
  if (role === "pro") return "pro";
  if (role === "premium") return "premium";
  return "gratis";
}

export function resolveUserRole(role: string): { role: string; plan?: string } {
  if (role === "admin") return { role: "admin" };
  return { role, plan: roleToPlan(role) };
}

export function deriveRoleLabel(role: string | null | undefined, plan: string | null | undefined): RoleLabel {
  if (isAdminRole(role)) return "admin";
  const p = normalizePlan(plan);
  if (p === "pro") return "pro";
  if (p === "premium") return "premium";
  return "free";
}
