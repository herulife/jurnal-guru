---
name: billing-checkout
description: Use when working on plans/pricing/checkout/payment for the SaaS — plan gating, checkout flow, subscription/billing pages, payment (bank transfer), and confirmation. Pair with saas-marketing and analytics-metrics.
---

# Billing & Checkout — Jurnal Guru

## Current model (reuse first)
- **Plans:** free (Basic) vs Pro. Gating via `src/lib/useUserPlan.ts` (`useUserPlan`, `canExport`, etc.) — e.g. Export PDF is Pro-only.
- **UI:** `src/app/(app)/subscription/page.tsx` (plans), `src/app/(app)/billing/page.tsx` (admin? recurring), `src/app/checkout/page.tsx` + `src/app/checkout/konfirmasi/` (confirmation).
- **Payment:** manual **bank transfer** — bank details from settings (`bank_name`, `bank_account_number`, `bank_account_name`, `bank_note`), editable in Settings (admin). API in `src/app/api/payments/`.

## Principles
1. Clear, honest pricing card; state included vs Pro features.
2. Smooth checkout: show account details + total, then confirmation page with next steps.
3. Don't gate unfairly: free tier still useful; Pro unlocks premium (export/rekap/large).
4. Consistency between plan names (`pro`, etc.) across `useUserPlan`, checkout, subscription, billing, and upgrade CTAs — never hardcode mismatches.
5. Track events for analytics (signup → upgrade).

## Workflow
1. Read `useUserPlan.ts`, checkout, subscription, billing, payments API first.
2. Keep copy Bahasa Indonesia; reuse ui-ux-design tokens.
3. Build passes + smoke test payment flow (checkout → confirmation) with a session cookie.
4. Update analytics-metrics skill notes if funnel changes materially.