# AGENTS.md — Jurnal Guru

## Project
Dashboard guru (Jurnal Guru) untuk kelola absensi, nilai, jurnal mengajar, kelompok belajar, LCKH/LKB, dan data siswa.

## Quick Reference (VERSA SAAT INI — 9 Agustus 2026)
- **Live URL:** `https://guru.benuatech.web.id` (Cloudflare Worker `guru`, bukan VPS/nginx)
- **Login admin:** `admin` / `admin123`
- **Deploy:** `bash deploy.sh` — typecheck + sync + build + deploy dari **folder ini**, BUKAN dari folder mana pun lain
- **Direktori kerja:** `/root/teacher-dashboard-next` (lokal) -> `/home/ubuntu24/teacher-dashboard-next` (VPS)
- **Migrasi D1:** `npx wrangler d1 execute teacher-dashboard-db --remote --file=drizzle/0003_kalender_catatan.sql` (dari VPS, setelah `source ~/.cf_token.sh`)

## Perhatian Khusus
- **LATIHAN: Lokal = salinan VPS.** Semua kerja harus dimulai dari kode di `/home/ubuntu24/teacher-dashboard-next` di VPS (kode live). Folder lokal `/root/teacher-dashboard-next` adalah salinan yang disinkronkan dari VPS.
- **Jangan pernah tulis ke folder `undangan`/folder lama** — itu kode usang (sudah dihapus).
- **JWT_SECRET, Google service account, .env.local TIDAK ikut deploy** (di-exclude deploy.sh). Dan jangan pernah menyentuh isi secret ke file repo.
- **Chain paket:** Gratis -> Pro (Rp29rb: +nilai++rekap nilai+kelompok) -> Premium (Rp49rb: +LCKH & LKB). Rapor sudah DIHAPUS.

## Context
Lihat `.agents/session-backup.md` & `.agents/product-marketing.md` untuk detail lengkap.

## Marketing Skills (GitHub)
Referensi skill marketing AI-agent + marketing plan 90 hari ada di `.agents/marketing-skills.md`. Utamakan SEO Bahasa Indonesia + GEO (AI citation). Repo utama: `coreyhaines31/marketingskills` & `ekinciio/saas-growth-marketing-skills`.

## User Preferences
- Bahasa Indonesia, concise
- No school names in content
- No emojis kecuali diminta