export type PaymentPlanDef = { name: string; price: number; months: number; tagline: string };

export const PLANS: Record<string, PaymentPlanDef> = {
  pro_6m: { name: "Pro", price: 29000, months: 6, tagline: "6 bulan" },
  premium_6m: { name: "Premium", price: 49000, months: 6, tagline: "6 bulan, akses semua" },
  pro_1m: { name: "Pro", price: 29000, months: 1, tagline: "1 bulan" },
  pro_3m: { name: "Pro", price: 79000, months: 3, tagline: "3 bulan" },
  pro_12m: { name: "Pro", price: 149000, months: 12, tagline: "1 tahun" },
  pro_24m: { name: "Pro", price: 249000, months: 24, tagline: "2 tahun" },
  premium: { name: "Premium", price: 49000, months: 6, tagline: "6 bulan" },
};

export const ACTIVE_PLAN_IDS = ["pro_6m", "premium_6m"];
