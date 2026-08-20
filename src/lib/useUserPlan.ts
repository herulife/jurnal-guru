"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/useApi";
import { normalizePlan, canExport, canUsePro, canUsePremium, type Plan } from "@/lib/plan-helpers";

export { normalizePlan, canExport, canUsePro, canUsePremium };
export type { Plan };

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
