# AGENTS.md — Jurnal Guru

## Project
Dashboard guru (Jurnal Guru) untuk kelola absensi, nilai, jurnal mengajar, kelompok belajar, LCKH/LKB, dan data siswa.

## Quick Reference (VERSA SAAT INI — 14 Agustus 2026)
- **Live URL:** `https://guru.cintabuku.site` (Vercel, project `jurnal-guru`, CNAME -> cname.vercel-dns.com via Cloudflare proxy)
- **Login admin:** `admin` / `admin123`
- **Stack:** Next.js di **Vercel** (auto-deploy dari push ke GitHub branch `main`) + database (drizzle; sesi lama pernah pakai D1/Cloudflare, cek `.agents/session-backup.md` utk riwayat) — bukan lagi Cloudflare Worker/D1
- **Deploy live = `git push origin main`** -> Vercel auto-build (integrasi GitHub). Verifikasi: `curl` harga/endpoint di guru.cintabuku.site setelah ~1-4 menit. `deploy.sh` (worker Cloudflare "guru") HANYA melayani domain lama `guru.benuatech.web.id` yang 301 ke domain baru — bukan jalan deploy utama.
- **DB Turso:** CLI di `/tmp/turso-cli/turso` (token user di `~/.turso`), URL+token tersimpan di `/tmp/turso.env` (jangan commit); shell: `/tmp/turso-cli/turso db shell jurnal-guru`
- **Direktori kerja:** `/root/teacher-dashboard-next` (lokal) -> `/home/ubuntu24/teacher-dashboard-next` (VPS)
- **GitHub:** repo `herulife/jurnal-guru`, branch `main` (HP & VPS pull/push langsung ke `main`); commit terakhir: lihat `git log`
- **Migrasi schema:** file `drizzle/*.sql` dipakai utk riwayat/arsip — schema dikelola di `src/db/schema.ts` (drizzle); perubahan kolom dijalankan langsung di DB (wrangler d1 / turso, sesuai DB aktif) lalu sinkronkan schema.ts

## Perhatian Khusus
- **LATIHAN: Lokal = salinan VPS.** Semua kerja harus dimulai dari kode di `/home/ubuntu24/teacher-dashboard-next` di VPS (kode live). Folder lokal `/root/teacher-dashboard-next` adalah salinan yang disinkronkan dari VPS.
- **Jangan pernah tulis ke folder `undangan`/folder lama** — itu kode usang (sudah dihapus).
- **Secret TIDAK ikut commit**: JWT_SECRET, Turso token, Resend key, Vercel token hanya di env VPS/Vercel/`.env.local`. Jangan pernah tempel isi secret ke repo/chat.
- **Chain paket:** Gratis (trial 2 hari, lalu fitur dasar) -> Pro (Rp29rb/6 bulan: +nilai++rekap nilai+kelompok) -> Premium (Rp49rb/6 bulan, akses semua: +LCKH & LKB). Minimal pembelian 6 bulan. Rapor sudah DIHAPUS.
- **Email aktivasi:** wajib saat register (Resend, domain `benuatech.web.id` verified); akun lama tetap aktif; anti-enumeration di resend link.

## Context
Lihat `.agents/session-backup.md` & `.agents/product-marketing.md` untuk detail lengkap.

## Marketing Skills (GitHub)
Referensi skill marketing AI-agent + marketing plan 90 hari ada di `.agents/marketing-skills.md`. Utamakan SEO Bahasa Indonesia + GEO (AI citation). Repo utama: `coreyhaines31/marketingskills` & `ekinciio/saas-growth-marketing-skills`.

## User Preferences
- Bahasa Indonesia, concise
- No school names in content
- No emojis kecuali diminta