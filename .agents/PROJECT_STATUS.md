# PROJECT STATUS — Jurnal Guru (MarketingOS)

Terakhir diperbarui: 2026-08-19 (P1 Final Review)

## Ringkasan
Dashboard guru + MarketingOS. Live di VPS (Next.js + Cloudflare Tunnel + SQLite `data.db`), admin `admin`/`admin123`.

## Roadmap & Status

| Fase | Nama | Status | Progress |
|---|---|---|---|
| P0 | Audit & Architecture | COMPLETED | 100% |
| P1 | Core Marketing | IN_PROGRESS (review final) | 80% |
| P2 | CRM (Leads/Contacts/Pipeline/Follow-up/Customers) | NOT_STARTED | 0% |
| P3 | Campaign (Campaigns/Content Planner/Channels) | NOT_STARTED | 0% |
| P4 | Sales & Analytics | NOT_STARTED | 0% |
| P5 | AI | NOT_STARTED | 0% |

## P1 Deliverables
- [x] Goals (CRUD + status + progress) — `/goals`
- [x] Plans (CRUD + relasi goalId) — `/plans`
- [x] Tasks (CRUD + status/priority/dueDate + relasi goalId/planId) — `/tasks`
- [x] Marketing Journal (CRUD harian) — `/marketing-journal`
- [x] Marketing Dashboard (6 KPI + chart 30 hari + progres goal + today/overdue) — `/marketing-dashboard`
- [x] Marketing Calendar (grid bulanan task/journal/plan) — `/marketing-calendar`
- [x] Panduan Marketing (dokumen markdown strategi) — `/marketing-plan` (bukan data entity; label sidebar: "Panduan Marketing")
- [x] Sidebar Marketing (7 menu)
- [x] API `/api/marketing/{goals,plans,tasks,journal,calendar,dashboard}` + `[id]` routes

## P1 Perbaikan selama review
- [x] Fix bug SQLite: calendar filter `startDate || dueDate` (concat NULL) → `COALESCE(start_date, due_date)` + filter `lte` end
- [x] Fix dashboard: chart journal hanya 7 hari → limit 90 hari (data nyata 30 hari utuh)
- [x] Label sidebar: "Marketing Plan" → "Panduan Marketing" (klarifikasi vs `/plans`)

## P1 QA & Regression
- Playwright: suite `_p1qa` (Goals/Plans/Tasks/Journal CRUD + cleanup via API, Dashboard KPI/chart, Calendar nav, 7 link marketing) + `_p1reg` (8 halaman inti: dashboard, siswa, kelas, jadwal, absensi, jurnal, nilai, documentation) — status lihat run terakhir.
- Playwright config: storageState setup (`tests/auth.setup.ts`, login 1x via API) + workers=1 untuk menghindari rate limit login (10/10 menit/IP).

## Blockers
- (none saat ini)

## P2 CRM Readiness
- Dependency P1 → P2: `marketing_tasks` sudah punya `leadId` & `campaignId` (nullable, belum ada tabel leads/campaigns). `marketing_plans` punya `channels`.
- Yang perlu ada sebelum/bersamaan P2: tabel `leads`, `contacts`, `pipeline_stages`, `followups` (+ FK ke users), API CRUD, halaman CRM, dashboard CRM.
- Tidak ada perubahan wajib di P1 sebelum CRM; relasi task.leadId siap dipakai.

## NEXT ACTION
- Selesaikan P1 Final Review (QA/regression live) → tandai P1 DONE di audit-center → desain P2 CRM (schema + API + halaman) sesuai ORCHESTRATOR.md.