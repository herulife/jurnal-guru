---
name: software-testing
description: Use when writing, running, or planning tests for this project — unit/integration co-located tests, E2E with Playwright MCP, verifying a feature, or fixing failing tests. Pair with frontend-backend-dev.
---

# Software Testing — Jurnal Guru

Stack: Next.js (App Router, TypeScript) + Cloudflare Workers/D1. UI E2E via **Playwright MCP** (configured in `opencode.json`, tool prefix `mcp_playwright_`). No test runner configured yet — agree on one (e.g. vitest) before adding unit tests.

## Test Pyramid
- **Unit (70%):** domain/lib logic in isolation; deps mocked. Co-located: `*.spec.ts` next to the file. Coverage >85% for logic.
- **Integration (20%):** adapters against real infra (e.g. Drizzle/D1, Google Sheets API). Co-located: `*.integration.spec.ts`.
- **E2E (10%):** full user journeys. Place in `e2e/` at repo root. Name `{feature}-{ui|api}.e2e.test.ts`.

## E2E dengan Playwright MCP (yang tersedia & biasa dipakai di project ini)
Workflow verifikasi UI:
1. `mcp_playwright_browser_navigate(url=...)` — ke halaman live (`https://guru.benuatech.web.id/...`) atau local.
2. `mcp_playwright_browser_snapshot()` — ambil accessible state (lebih baik untuk assertion).
3. Interaksi via ref: `mcp_playwright_browser_type(ref=..., text=...)`, `mcp_playwright_browser_click(ref=...)`.
4. `mcp_playwright_browser_wait_for(text=...)` untuk menunggu hasil.
5. `mcp_playwright_browser_take_screenshot(filename=...)` — simpan bukti per langkah besar.

Aturan E2E:
- Uji **happy path** DAN minimal **satu error path** (login salah, URL kosong, dll).
- Screenshot di tiap langkah utama.
- Bersihkan data test (atau gunakan ID unik).
- Login test: `admin` / `admin123` (lihat AGENTS.md).

## TDD — Red-Green-Refactor
1. **Red:** tulis test gagal untuk fitur berikutnya.
2. **Green:** kode minimal agar test lulus.
3. **Refactor:** bersihkan tanpa merusak test.

## Verifikasi cepat sebelum deploy
- Selalu `npx next build` — type error akan menggagalkan deploy Cloudflare.
- Untuk API: test via curl terhadap route (`/api/...`) dengan cookie sesi login.
- Pastikan respons mengikuti kontrak `apiOk`/`apiError` → `{ ok, data?, msg? }`.

## Workflow
1. Tentukan level test (unit vs E2E) sesuai kebutuhan fitur.
2. Unit/integration: co-locate `*.spec.ts`; E2E: `e2e/`.
3. Jalankan E2E interaktif dengan Playwright MCP; screenshots sebagai bukti.
4. Sebutkan cara menjalankan test yang Anda gunakan di respons akhir.