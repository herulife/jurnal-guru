---
name: frontend-backend-dev
description: Use when writing, fixing, or reviewing code in this Next.js + OpenNext + Cloudflare project — React/TS frontend, API route handlers, Drizzle/Turso DB, auth, deployment. Covers file structure, conventions, and the deploy workflow.
---

# Frontend & Backend Engineering — Jurnal Guru

Stack: **Next.js (App Router, TypeScript) + OpenNext → Cloudflare Workers + D1 (Turso via drizzle-orm) + wrangler**. Follow existing conventions.

## Architecture & File Structure
- App Router routes under `src/app/`, protected pages inside `src/app/(app)/`.
- API route handlers: `src/app/api/<name>/route.ts` exporting `GET/POST/PUT/DELETE`.
- Reusable UI in `src/components/` (e.g. `Sidebar.tsx`, `ExportButton.tsx`, `Pagination.tsx`, `GoogleSheetsSection.tsx`).
- Business logic: `src/lib/` (e.g. `sheets.ts`, `auth.ts`, `useApi.ts`, `utils.ts`, `useUserPlan.ts`).
- DB schema: `src/db/schema.ts`; migrations in `drizzle/`.

## Conventions
- TypeScript strict; **no comments** unless requested.
- Pages mostly `"use client"` with React hooks; data flows via `apiGet/apiPost/apiPut/apiDelete` from `@/lib/useApi`.
- Auth: session cookie (`JWT_SECRET`), `requireAuth()` throws `AuthError` handled in API; client guards like `AdminGuard`.
- API responses use `apiOk`/`apiError`/`apiServerError` from `@/lib/utils` → shape `{ ok, data?, msg? }`.

## Cloudflare/Deploy specifics
- Secrets set via `wrangler secret put <NAME> --name guru`; read in code via `process.env.<NAME>`.
- `wrangler.jsonc` routes `guru.benuatech.web.id/*`, D1 binding `DB`.
- Deploy: `npm run deploy` (builds then `wrangler deploy`). Verify with `npx next build` first — a TS type error fails the deploy.

## Must do
1. Match surrounding style; reuse existing components/lib.
2. Security: never log secrets; validate/trim user input; server-side checks for admin actions.
3. After changes, run `npx next build`; fix type errors (Cloudflare build fails on them).
4. Keep D1 queries via drizzle (`eq`, `.get()/.all()`), no raw SQL unless necessary.