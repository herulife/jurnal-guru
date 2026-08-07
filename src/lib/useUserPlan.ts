"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/useApi";

export type Plan = "gratis" | "pro" | "sekolah";

export function useUserPlan() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ user?: { plan?: Plan } }>("/api/auth/check")
      .then((r) => {
        if (r.ok && r.data?.user?.plan) {
          setPlan(r.data.user.plan);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { plan, loading };
}

export const canExport = (p: Plan | null) => p === "pro" || p === "sekolah";