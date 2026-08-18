# AGENTS.md — Jurnal Guru

## Project
Dashboard guru (Jurnal Guru) untuk kelola absensi, nilai, jurnal mengajar, kelompok belajar, LCKH/LKB, dan data siswa.

## Quick Reference (VERSA SAAT INI — 18 Agustus 2026)
- **Live URL:** `https://guru.cintabuku.site` — Next.js jalan DI VPS (bukan Vercel): `pm2 jurnal-guru` (`next start`, port 3000), DB file lokal `data.db` di root repo, diakses publik via **Cloudflare Tunnel** `guru-tunnel` (id `65736f07-57d0-4e12-a798-046aa26c6019`, token `~/cloudflared-token`, ingress disimpan di Cloudflare API, DNS `guru.cintabuku.site` -> `<tunnel-id>.cfargotunnel.com`; rollback penuh: `/tmp/opencode/rollback-vps.env`)
- **Login admin:** `admin` / `admin123`
- **Deploy live = di VPS:** `git pull` -> `npx next build` -> `pm2 restart jurnal-guru --update-env`. Push ke GitHub hanya utk riwayat/sinkron — TIDAK auto-deploy (Vercel tidak dipakai; DNS tidak menunjuk ke Vercel).
- **DB:** SQLite file `data.db` (drizzle-libsql, fallback `file:./data.db`). `src/db/index.ts`: D1 (dipakai hanya di Cloudflare Worker legacy; di VPS dinonaktifkan via env `D1_ACTIVE=false` di `.env.local`) -> `DATABASE_URL` (Turso, TIDAK dipakai lagi) -> file lokal.
- **Migrasi schema:** file `drizzle/*.sql` utk arsip; schema dikelola `src/db/schema.ts`; perubahan kolom dijalankan langsung di `data.db` (sqlite3/node @libsql/client) lalu sinkronkan schema.ts.
- **PM2 (VPS):** `jurnal-guru` (app) + `cloudflared` (tunnel). Jangan matikan keduanya bersamaan — app tanpa tunnel tidak bisa diakses dari luar.
- **Direktori kerja (live):** `/home/ubuntu24/teacher-dashboard-next` (VPS). `/root/teacher-dashboard-next` (lokal) = salinan sinkron.
- **GitHub:** repo `herulife/jurnal-guru`, branch `main`; commit terakhir: lihat `git log`

## Perhatian Khusus
- **LATIHAN: Lokal = salinan VPS.** Semua kerja harus dimulai dari kode di `/home/ubuntu24/teacher-dashboard-next` di VPS (kode live). Folder lokal `/root/teacher-dashboard-next` adalah salinan yang disinkronkan dari VPS.
- **Jangan pernah tulis ke folder `undangan`/folder lama** — itu kode usang (sudah dihapus).
- **Secret TIDAK ikut commit**: JWT_SECRET, Resend key, FONNTE_TOKEN, `~/cloudflared-token` hanya di env VPS/`.env.local` (`.env.local` & `data.db` sudah di `.gitignore`). Jangan pernah tempel isi secret ke repo/chat.
- **Chain paket:** Gratis (trial 2 hari, lalu fitur dasar) -> Pro (Rp29rb/6 bulan: +nilai++rekap nilai+kelompok) -> Premium (Rp49rb/6 bulan, akses semua: +LCKH & LKB). Minimal pembelian 6 bulan. Rapor sudah DIHAPUS.
- **Email aktivasi:** wajib saat register (Resend, domain `benuatech.web.id` verified); akun lama tetap aktif; anti-enumeration di resend link.

## Context
Lihat `.agents/session-backup.md` & `.agents/product-marketing.md` untuk detail lengkap.

## Orchestrator Doctrine
- **Pola kerja utama:** `.agents/ORCHESTRATOR.md` (dimuat otomatis via `opencode.json` instructions) — agent utama berperan sebagai autonomous orchestrator: UNDERSTAND → ANALYZE → PLAN → DELEGATE → EXECUTE → VERIFY → REVIEW → CORRECT → UPDATE STATE → DECIDE NEXT ACTION.
- **Project brain:** `.agents/PROJECT_STATUS.md` (status & ownership), `.agents/ARCHITECTURE.md`, `.agents/DATABASE.md`, `.agents/API.md`, `.agents/audit-center.json`. Prioritas kebenaran: source code > schema > API > tests > git > state files > docs (SOURCE CODE WINS).
- **Delegasi:** pakai built-in `explore` (riset) / `general` (eksekusi) + brief; jangan buat subagent utk tugas kecil.
- **Quality gate:** feature COMPLETE hanya jika code + DB + API + UI + validation + test + security (bila relevan) + documentation + audit semua ✓.

## Marketing Skills (GitHub)
Referensi skill marketing AI-agent + marketing plan 90 hari ada di `.agents/marketing-skills.md`. Utamakan SEO Bahasa Indonesia + GEO (AI citation). Repo utama: `coreyhaines31/marketingskills` & `ekinciio/saas-growth-marketing-skills`.

## User Preferences
- Bahasa Indonesia, concise
- No school names in content
- No emojis kecuali diminta