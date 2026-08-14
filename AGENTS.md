# AGENTS.md — Jurnal Guru

## Project
Dashboard guru (Jurnal Guru) untuk kelola absensi, nilai, jurnal mengajar, kelompok belajar, LCKH/LKB, dan data siswa.

## Quick Reference (VERSA SAAT INI — 14 Agustus 2026)
- **Live URL:** `https://guru.benuatech.web.id` (Vercel, domain via Cloudflare proxy)
- **Login admin:** `admin` / `admin123`
- **Stack baru:** Next.js di **Vercel** (project `jurnal-guru`, alias `jurnal-guru-kappa.vercel.app`) + **Turso (libSQL)** database `jurnal-guru` (region Tokyo) — bukan lagi Cloudflare Worker/D1
- **Deploy Vercel:** `npx vercel deploy --prod --token $VERCEL_TOKEN` dari folder ini; env vars (DATABASE_URL, TURSO_AUTH_TOKEN, JWT_SECRET, RESEND_API_KEY, RESEND_FROM_EMAIL) sudah diset di Vercel project
- **DB Turso:** CLI di `/tmp/turso-cli/turso` (token user di `~/.turso`), URL+token tersimpan di `/tmp/turso.env` (jangan commit); shell: `/tmp/turso-cli/turso db shell jurnal-guru`
- **Direktori kerja:** `/root/teacher-dashboard-next` (lokal) -> `/home/ubuntu24/teacher-dashboard-next` (VPS)
- **GitHub:** branch lokal `master` di-push ke remote `main` (`git push origin master:main`); commit terakhir `ec26be6`
- **Migrasi schema lama (D1):** file `drizzle/*.sql` hanya dipakai untuk referensi/arsip — schema kini dikelola langsung di `src/db/schema.ts` (drizzle); jika ada kolom baru, jalankan ALTER di Turso (`turso db shell jurnal-guru`) lalu sinkronkan schema.ts

## Perhatian Khusus
- **LATIHAN: Lokal = salinan VPS.** Semua kerja harus dimulai dari kode di `/home/ubuntu24/teacher-dashboard-next` di VPS (kode live). Folder lokal `/root/teacher-dashboard-next` adalah salinan yang disinkronkan dari VPS.
- **Jangan pernah tulis ke folder `undangan`/folder lama** — itu kode usang (sudah dihapus).
- **Secret TIDAK ikut commit**: JWT_SECRET, Turso token, Resend key, Vercel token hanya di env VPS/Vercel/`.env.local`. Jangan pernah tempel isi secret ke repo/chat.
- **Chain paket:** Gratis -> Pro (Rp29rb: +nilai++rekap nilai+kelompok) -> Premium (Rp49rb: +LCKH & LKB). Rapor sudah DIHAPUS.
- **Email aktivasi:** wajib saat register (Resend, domain `benuatech.web.id` verified); akun lama tetap aktif; anti-enumeration di resend link.

## Context
Lihat `.agents/session-backup.md` & `.agents/product-marketing.md` untuk detail lengkap.

## Marketing Skills (GitHub)
Referensi skill marketing AI-agent + marketing plan 90 hari ada di `.agents/marketing-skills.md`. Utamakan SEO Bahasa Indonesia + GEO (AI citation). Repo utama: `coreyhaines31/marketingskills` & `ekinciio/saas-growth-marketing-skills`.

## User Preferences
- Bahasa Indonesia, concise
- No school names in content
- No emojis kecuali diminta