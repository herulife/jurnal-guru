---
name: saas-marketing
description: Use when working on SaaS growth for Jurnal Guru — free/basic vs Pro plans, signup & checkout funnel conversion, pricing tiers, upgrade prompts, billing pages, and onboarding. Pair with ui-ux-design and marketing-plan-seo.
---

# SaaS Growth & Funnel — Jurnal Guru

Goal: convert teachers to start free, then upgrade to Pro, with minimal friction.

## Existing structure (reuse before adding)
- **Plans / gating:** `src/lib/useUserPlan.ts` (`useUserPlan`, `canExport`, etc.), `UpgradeBanner` in layout, plans likely Basic (free) vs Pro.
- **Checkout:** `src/app/checkout/page.tsx` and `src/app/(app)/checkout/` + `subscription` + `billing`; bank details from settings `bank_*`.
- Payment via transfer bank (see settings `Rekening Pembayaran`).

## Principles
1. **Minimize friction (signup flow CRO):** only truly-required fields at registration; next step should let the user get value immediately (their first dashboard action).
2. **Proven paywall/upgrade pattern:** low-friction upsell and aligned with value; "Export PDF" and similar advanced actions are Pro — gate with a clear option to upgrade, not a dead end. Walk user to `/checkout?plan=pro`.
3. **Clear pricing:** simple, honest price card; state what's in each plan; remove doubt with money-back/guarantee and FAQ.
4. **Activation & retention:** guide teacher through first real task (add class → add students), because empty-funnel dies. Use empty states on pages to call next action.
5. **Analytics:** track registration, activation, checkout, upgrade. Measure drop-off at each step.

## Workflow
1. Read `useUserPlan.ts`, checkout, subscription, billing pages to learn the current model before proposing.
2. Propose minimal, coherent copy/UX edits (ide via ui-ux-design tokens).
3. Always keep the spirit: free tier must still feel useful but premium feature locked to Pro.