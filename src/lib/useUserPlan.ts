"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/useApi";

export type Plan = "gratis" | "pro" | "premium";

const PLAN_RANK: Record<Plan, number> = { gratis: 0, pro: 1, premium: 2 };

export function normalizePlan(p: string | null | undefined): Plan {
  if (p === "pro") return "pro";
  if (p === "premium" || p === "sekolah") return "premium";
  return "gratis";
}

export function useUserPlan() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ user?: { plan?: string; role?: string } }>("/api/auth/check")
      .then((r) => {
        if (r.ok && r.data?.user) {
          setPlan(normalizePlan(r.data.user.plan));
          setRole(r.data.user.role ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { plan, role, loading };
}

export const canExport = (p: Plan | null) =>
  p !== null && PLAN_RANK[p] >= PLAN_RANK.pro;

export const canUsePro = (p: Plan | null) =>
  p !== null && PLAN_RANK[p] >= PLAN_RANK.pro;

export const canUsePremium = (p: Plan | null) =>
  p !== null && PLAN_RANK[p] >= PLAN_RANK.premium;