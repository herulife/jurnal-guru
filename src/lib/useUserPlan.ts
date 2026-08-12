"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/useApi";
import { normalizePlan } from "@/lib/plan-helpers";
import type { Plan } from "@/lib/plan-helpers";

export type { Plan } from "@/lib/plan-helpers";
export { canExport, canUsePro, canUsePremium, normalizePlan } from "@/lib/plan-helpers";

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
