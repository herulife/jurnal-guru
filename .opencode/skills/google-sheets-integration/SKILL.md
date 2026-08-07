---
name: google-sheets-integration
description: Use when working on the Google Sheets sync feature — reading/writing spreadsheets, service account auth, becoming each table's own sheet, sharing, or debugging sync. Core logic in src/lib/sheets.ts and src/app/api/sheets/route.ts.
---

# Google Sheets Integration (sync to personal spreadsheet)

## How it works (current implementation)
- **Frontend UI:** `src/components/GoogleSheetsSection.tsx` — tutorial + URL input + Save + "Sinkronkan ke Sheets".
- **API:** `src/app/api/sheets/route.ts` — `GET` returns URL + service-account email + scopes; `POST` saves URL or runs `action:sync` (`syncAll`).
- **Core lib:** `src/lib/sheets.ts` — `writeToSpreadsheet`, `getServiceAccountEmail`, `ensureSheet`, `listSheets`, `extractSpreadsheetId`, JWT auth cache.
- Auth: service account (JWT, scope `https://www.googleapis.com/auth/spreadsheets`) via `GOOGLE_SERVICE_ACCOUNT_JSON` secret. Uses Node `node:crypto` (createPrivateKey/sign).

## Key rules
- **Each table is its own sheet** named by table (`Kelas`, `Siswa`, `Jadwal`, `Absensi`, `Nilai`, `Jurnal`, `Surat`, `Kelompok`, `LCKH`, `LKB`); `writeToSpreadsheet` creates via `ensureSheet` (Sheet API `batchUpdate.addSheet`) when missing, writes to `'<title>'!A1:...`, clearing first.
- Do NOT write all tables into the first sheet (previous bug — leftover residue). Keep per-sheet.
- Sheet names with spaces/special chars are quoted `'Sheet name'`.
- Service account must have **Editor access on the target spreadsheet**; end users share their own spreadsheet with the email shown in the UI (`getServiceAccountEmail`).
- Row values: coerce `null/undefined` to empty string; numbers stay numbers; dates sent as strings.

## Debugging
- Verify with the service account directly via Playwright/curl against the Sheets API (get access token, then `spreadsheet.get`/`values.get`) when UI sync errors.
- Common failure: spreadsheet not shared to service account → `Spreadsheet tidak dapat diakses (403/404)`.

## Workflow
1. Read `sheets.ts` + `sheets/route.ts` + the section component first.
2. Make changes; keep the per-sheet model.
3. `npx next build`, then smoke test via `/api/sheets`.