---
name: database-drizzle
description: Use when working with the database — reading/writing schema (src/db), writing Drizzle queries, creating/editing migrations (drizzle/), or troubleshooting D1/backup data issues. Pair with frontend-backend-dev.
---

# Database (Drizzle + D1) — Jurnal Guru

## Stack
- **ORM:** `drizzle-orm` (schema in `src/db/schema.ts`, DB instance in `src/db/`).
- **Storage:** Cloudflare **D1** (binding `DB`). Config `drizzle.config.ts`.
- **Migrations:** in `drizzle/*.sql` + closed `meta/` (`0000_burly_inhumans.sql`, `0001_...`, `0002_kelompok_lckh_lkb.sql`).

## Conventions
- Import tables from `@/db/schema` (e.g. `users`, `dataSiswa`, `absensi`, `nilai`, `jurnalMengajar`, `kelas`, `lckh`, `lkb`, ...).
- Use drizzle operators: `eq`, `.get()`, `.all()`, `.insert()`, `.update()`. Avoid raw SQL unless necessary.
- Async DB calls in API routes; server-side only (never client).

## Migrations
- Schema changes → new migration in `drizzle/` (+ update `meta`). Do **NOT** hand-edit existing applied migrations.
- Follow the pattern of `000x_*.sql`; keep names stable; verify with `npx drizzle-kit` style tooling matching `drizzle.config.ts`.
- Applying affects production D1 — run carefully, back up first when uncertain.

## Rules
- No comments in code unless requested.
- Map foreign keys to existing tables correctly (e.g. `siswa.kelas_id` → `kelas`); reuse joins/id-maps in `syncAll`-style code.
- For Google Sheets sync, queries return plain rows then map → tables (see `src/app/api/sheets/route.ts`).