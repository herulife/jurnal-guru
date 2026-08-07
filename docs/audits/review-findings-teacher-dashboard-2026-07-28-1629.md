# Code Audit: Teacher Dashboard Full Codebase
Date: 2026-07-28 16:29
Reviewer: AI Agent

## Summary
- **Files reviewed:** 37 routes (18 API + 14 pages + 5 shared/lib)
- **Issues found:** 28 (5 critical, 9 major, 8 minor, 6 nit)
- **Build:** PASS (37 routes, 0 TS errors)

---

## Critical Issues

- [ ] **[SEC]** Hardcoded JWT secret fallback — if `JWT_SECRET` env var is missing, app uses known string `"teacher-dashboard-secret-key-change-in-production"` — `src/lib/auth.ts:7-9`
- [ ] **[SEC]** Middleware whitelists ALL `/api/` routes with no auth check — any new API route added without `getSession()` is fully exposed — `src/middleware.ts:11-13`
- [ ] **[SEC]** No role-based authorization on any API route — backup/restore, settings, upload, log all accessible to any authenticated user regardless of role — All API route files
- [ ] **[SEC]** `surat/*` API endpoints have no auth at all — no `getSession()` call — `src/app/api/surat/route.ts`, `src/app/api/surat/[id]/route.ts`
- [ ] **[DATA]** Backup import has no transaction wrapping — `DELETE` + `INSERT` across 8 tables without rollback — mid-failure corrupts data — `src/app/api/backup/route.ts:38-55`

---

## Major Issues

- [ ] **[OBS]** 14 API route files use bare `catch { return apiError("...") }` — error details silently discarded, impossible to debug — e.g., `src/app/api/kelas/route.ts:45`, `src/app/api/jadwal/route.ts:40`, `src/app/api/nilai/[id]/route.ts:34`
- [ ] **[OBS]** No logging on most write operations — `addLog` called only on login/logout/batch-nilai, missing on siswa/kelas/absensi/jurnal/jadwal/settings creates — e.g., `src/app/api/siswa/route.ts`, `src/app/api/kelas/route.ts`
- [ ] **[OBS]** No `error.tsx` or `loading.tsx` boundaries at route level — errors display raw Next.js error page — Root layouts only
- [ ] **[ERR]** All catch blocks return HTTP 400 for unexpected runtime errors — should be 500 — e.g., `src/app/api/siswa/route.ts:52`, `src/app/api/absensi/route.ts:83`
- [ ] **[ERR]** Backup import uses string interpolation for column names in SQL — `Object.keys(r).map(k => \`"\${k}"\`)` — possible injection via malicious row keys — `src/app/api/backup/route.ts:45-48`
- [ ] **[ERR]** Missing input validation on 8 POST handlers — required fields (nis, namaSiswa, siswaId, mataPelajaran, etc.) not validated before DB insert — e.g., `src/app/api/siswa/route.ts:38-49`, `src/app/api/nilai/route.ts:38-53`
- [ ] **[ARCH]** No repository/service layer — business logic (aggregates, upsert logic) lives inline in route handlers — `src/app/api/dashboard/route.ts:10-13` loads ALL rows into memory
- [ ] **[ARCH]** No pagination in any API list route — all GET handlers return every row with no `LIMIT/OFFSET` — will break with real data volumes — All `GET` route handlers
- [ ] **[PAT]** Massive structural duplication across API routes — "fetch all + build map + enrich" pattern repeated in 5+ files — `src/app/api/siswa/route.ts:14-16`, `absensi/route.ts:15-20`, `nilai/route.ts:15-20`, `jurnal/route.ts:15-17`, `dashboard/route.ts:31-32`

---

## Minor Issues

- [ ] **[PAT]** Empty catch blocks use inconsistent styles — some `catch (e: unknown)`, others bare `catch { }` — compare `src/app/api/siswa/route.ts:51` vs `src/app/api/kelas/route.ts:45`
- [ ] **[PAT]** `addLog` usage is arbitrary — login/logout/batch-nilai log, others don't — `src/app/api/nilai/batch/route.ts:32-36` vs `src/app/api/siswa/route.ts`
- [ ] **[PAT]** Client-side filtering instead of SQL WHERE — 5 routes fetch ALL rows then filter in JS — `src/app/api/siswa/route.ts:20-22`, `absensi/route.ts:24-29`, `nilai/route.ts:22-25`, `rekap-absensi/route.ts:20-26`, `jurnal/route.ts:20-24`
- [ ] **[PAT]** Date filtering inconsistent — some routes use `normDate()`, others exact string match — `absensi/route.ts:25-27` vs `nilai/route.ts`
- [ ] **[PAT]** Only 2 shared components (`Sidebar`, `Pagination`) for 14+ page routes — heavy duplication of table/search/filter patterns per page — `src/components/`
- [ ] **[PAT]** `useApi.ts` helper exists but some pages use raw `fetch()` — e.g., `src/app/login/page.tsx:18`, `src/app/(app)/dashboard/page.tsx:24`
- [ ] **[PAT]** Duplicate page directory: `src/app/dashboard/` exists outside route group alongside `src/app/(app)/dashboard/` — potential routing confusion
- [ ] **[SEC]** JWT token not blacklisted on logout — remains valid for up to 8h — `src/lib/auth.ts:46-49`, `src/app/api/auth/logout/route.ts`

---

## Nit

- [ ] Cookie `secure: false` in non-production — if served over HTTPS in staging, token sent in cleartext — `src/lib/auth.ts:27`
- [ ] No `not-found.tsx` custom 404 page — shows default Next.js 404 — Root layout only
- [ ] JWT `jwtVerify` has no `algorithms` whitelist — possible algorithm confusion attack — `src/lib/auth.ts:39`
- [ ] Eager DB initialization at import time (`db/index.ts:20`) — not lazy per request — `src/db/index.ts:20`
- [ ] No request size limits on upload — could OOM server — `src/app/api/upload/route.ts`
- [ ] Logout `catch` returns 200 success even if `destroySession()` fails — `src/app/api/auth/logout/route.ts:12-13`

---

## Verification Results
- **Build:** PASS (37 routes, 0 TS errors)
- **Tests:** N/A (no test suite configured)
- **Coverage:** N/A

---

## Recommendations

### Immediate (Critical)
1. Replace hardcoded JWT secret with env-only, remove fallback in `auth.ts:7-9`
2. Add `getSession()` to `surat/*` endpoints
3. Add role check (`session.role === "admin"`) on backup, settings, upload, log
4. Wrap backup import in a database transaction

### Short-term (Major)
5. Convert all bare `catch { }` to `catch (e: unknown)` with logging
6. Add input validation on all POST handlers before DB writes
7. Add pagination (`LIMIT/OFFSET`) to all GET list routes
8. Change catch-block status codes from 400 to 500
9. Add `addLog` consistently on all write operations

### Medium-term (Minor)
10. Extract shared "query + enrich" helpers into `src/lib/db-helpers.ts`
11. Move SQL WHERE filters from client-side to server-side
12. Add `error.tsx` and `loading.tsx` boundaries
13. Clean up duplicate `src/app/dashboard/` directory
