---
name: analytics-metrics
description: Use when defining or implementing analytics and success metrics for the SaaS — signup, activation, upgrade, retention, and which events/KPIs to track. Pair with saas-marketing, marketing-plan-seo.
---

# Analytics & Metrics — Jurnal Guru

## North-star funnels
1. **Signup → registration** (user creates account).
2. **Activation:** user did their first meaningful action (add kelas, import siswa, input absen/nilai).
3. **Upgrade:** free → Pro (checkout/payment).
4. **Retention:** active teachers per month; repeat usage of core modules.

## Key funnel log in code
- Auth: `src/lib/auth.ts` + `/api/auth/*`. Log meaningful auth events (register/login) if logging infra exists.
- Payments: `/api/payments` + `src/app/checkout`, `(app)/subscription`, `(app)/billing`. Track conversion events + plan chosen.
- Activity: there's an Activity Log (`/log`, admin) + `addLog` in `src/lib/auth` — consider using it/centralized for key business events.

## Metrics to report (monthly, via marketing-plan-seo)
- Signups, activated%, time-to-activate, upgrade conversion %, MRR-ish (per plan), churn/retention.
- Behavior: most-used modules (Absensi, Nilai, Jurnal, Sheets sync).

## Implementation notes
- Add only lightweight tracking; don't block UX. If a real analytics provider is added (e.g. privacy-friendly), configure a data layer; otherwise rely on DB-backed event logging (Activity Log).
- Respect privacy: aggregate, no personal data where avoidable.

## Workflow
1. Learn existing billing + log code first (`useUserPlan`, `addLog`, payments).
2. Propose the few KPIs to report each month + where each metric comes from.
3. Implement minimal instrumentation that reuses existing logging/DB rather than new infra.