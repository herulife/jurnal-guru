---
name: security-qa
description: Use when reviewing or hardening security — authentication/authorization, session handling, secrets, input validation, protecting admin routes, and data privacy. Pair with frontend-backend-dev and software-testing.
---

# Security & QA — Jurnal Guru

## Auth & sessions
- Session cookie signed with `JWT_SECRET`. `requireAuth()` (src/lib/auth) throws `AuthError` → API routes catch it and return `apiError(msg, status)`.
- Role check: admin-only actions/pages must verify `role === "Admin"` on the server (e.g. `AdminGuard` client-side is UI-only; enforce on API too).
- Logout + `/api/auth/check` used by client to know current user.

## Secrets hygiene (critical)
- **Never** log or commit secrets: `JWT_SECRET`, `GOOGLE_SERVICE_ACCOUNT_JSON`.
- `dashboard-guru.json` contains a Cloudflare API token + R2 keys → **do not commit**; it's gitignored.
- `docs/aplikasi/*.json` = service-account credentials → gitignored.
- Set secrets via `wrangler secret put` (stdin), read via `process.env`.

## Input & output hygiene
- Validate/trim all user input in API routes (e.g. `String(body.x || "").trim()`).
- Never reflect unsanitized HTML into the DOM; React escapes by default.
- Rate-limit/guard auth endpoints as appropriate.

## BEFORE ship (QA checklist)
1. `npx next build` passes (type-check fails deploy).
2. Auth: unauthenticated → `Unauthorized`; non-admin → forbidden on admin APIs.
3. Sensitive files not in git: `git ls-files | grep -E 'dashboard-guru|aplikasi/soal|\.db$'` should be empty.
4. Deploy smoke test: critical pages 200, removed routes 404, API contract `{ok,data?,msg?}`.

## Workflow
1. Locate the endpoint/component; trace auth + data flow.
2. Verify server-side authorization (never trust client-only).
3. Review for secret leaks & input trimming; fix then rebuild + smoke test.