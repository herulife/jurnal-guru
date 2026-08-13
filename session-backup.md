# Session Backup — Jurnal Guru (9 Agustus 2026)

## Status: DEPLOYED & LIVE
- **Live URL:** `https://guru.benuatech.web.id` — Cloudflare Worker `guru`
- **Current Version (sekarang):** `2ba5f3b6-cb2f-4384-94a3-a5053b6e9807`
- **D1:** `teacher-dashboard-db` (17 tabel — termsuk `kalender_catatan`)

## Arsitektur & Deploy
- **Source of truth ada di VPS** (`/home/ubuntu24/teacher-dashboard-next`). Lokal `/home/awipari/Developer/teacher-dashboard-next` = salinan sinkron.
- **Satu-satunya cara deploy: `bash deploy.sh`** (di folder lokal): tar+scp seluruh src (exclude node_modules/.next/.open-next/.git/data.db/.env*/.dev.vars/docs/screenshots/tsconfig.tsbuildinfo) ke VPS -> `npx tsc --noEmit` di VPS -> `npm run deploy` (opennextjs-cloudflare) di VPS -> verifikasi 3 URL.
- Secret: JWT_SECRET & service account Google set sebagai **worker secrets** di Cloudflare (bukan di wrangler.jsonc). `.env.local`, `.dev.vars`, isi `docs/aplikasi/` TIDAK ikut deploy.
- Build di awal (`next build`) hanya berjalan di VPS; lokal tanpa node_modules.

## Skema Paket (tiering sudah terverifikasi server-side)
| Plan | Harga | Fitur |
|------|-------|-------|
| gratis | Rp0 | Dashboard, Data Siswa, Data Kelas, Jadwal, Absensi, Rekap Absensi, Cetak Presensi, Jurnal Mengajar, Kalender (+catatan), Surat, FAQ, Panduan |
| pro | Rp29.000/bln | Semua gratis + Nilai, Rekap Nilai, Generate Kelompok Belajar |
| premium | Rp49.000/bln | Semua pro + Generate LCKH & LKB pegawai |

- Paket lama "sekolah" (Rp299rb) dihapus; plan `sekolah` di DB otomatis dipetakan ke `premium`.
- **Rapor SISWA DIHAPUS** (halaman, API, tombol di `nilai`, referensi sidebar/panduan) — jangan dihidupkan kembali.

## Kontrol Akses & Gating
- Semua menu di sidebar tampil untuk semua plan; fitur terkunci (Nilai/Rekap Nilai/Kelompok/LCKH/LKB) diberi badge gembok 29K/49K; klik -> layer "Fitur Terkunci" + CTA upgrade (`src/components/PlanGuard.tsx`).
- **Server-side enforcement:** `src/lib/plans.ts` -> `requirePlan(role,userId,min)`. nilai/kelompok=pro; lckh/lkb=premium; Admin =skip. Route 403 bila tak cukup.
- Console/browser cache: session 8h.

## Payments/Monetization
- `PLANS` di `src/app/api/payments/route.ts`: pro 29000, premium 49000.
- Verifikasi (`payments/[id]/route.ts` PATCH): pakai `PLANS.months`; **blokir re-verify** jika payment status != pending (guard `... sudah diproses sebelumnya`); `users.plan` diskron dari sub.planId (sekolah->premium).
- Checkout & landing = 3 kartu: Gratis/Pro/Premium; FAQ, `subscription` page & `billing` (filter "confirmed" sudah dihapus) sesuai struktur ini.
- **PENDING MANUAL:** isi no rekening BRI asli di `/settings` (masih `0000...0`). Invite code untuk register: `JG-TEST-2026` (bisa diubah di settings).

## Kalender Catatan
- Tabel `kalender_catatan` (id, tanggal, isi, user_id, created_at, updated_at). Migration: `drizzle/0003_kalender_catatan.sql` (telah dieksekusi ke D1 remote).
- API: GET `/api/kalender` (gabung event + catatan, tipe "catatan" + id); POST/PUT/DELETE di file yang sama (`src/app/api/kalender/route.ts`).
- UI: klik tanggal -> panel kanan; tambah/edit/hapus catatan. Auto-print presensi via `/rekap-absensi?cetak=1`.

## Keamanan Audit (oleh sesi sebelumnya)
- Rate limit login/register: `src/lib/rateLimit.ts` (in-memory, 10/menit).
- `useApi.ts` interceptor 401 -> redirect `/login`.
- `deploy.sh` exclude .env/.dev.vars/docs (private key Google di docs/aplikasi/).
- Semua route protected (requireAuth/requireAdmin); backup/upload/sync admin-only.

## Cara Kerja di Sesi Berikutnya
1. Buka folder ini di opencode di VPS (`/home/ubuntu24/teacher-dashboard-next`) ATAU di lokal `/home/awipari/Developer/teacher-dashboard-next`.
2. Konteks otomatis: AGENTS.md -> session-backup.md; pelindung pertama: `git pull` di VPS? — **VPS bukan git repo utama**; kerja source di VPS folder langsung.
3. Jika mau sync lokal->VPS: edit di lokal, `bash deploy.sh`.
4. Perubahan schema: update `src/db/schema.ts` + buat file `drizzle/XXXX_nama.sql` (ikuti format 0003) + execute ke D1 remote.

## Skrip Helper
- `deploy.sh` — 1 perintah build+deploy+verify
- `scripts/` — seed/import/lainnya (tidak ikut deploy.sh jika ada import secret; cek dulu)
- Migrasi D1 contoh: `npx wrangler d1 execute teacher-dashboard-db --remote --file=drizzle/0003_kalender_catatan.sql`