# Jurnal Guru

Dashboard guru untuk mengelola administrasi sekolah: absensi, nilai, jurnal mengajar, kelompok belajar, LCKH/LKB, dan data siswa. Plus alur pembelian paket (Gratis/Pro/Premium) dengan notifikasi otomatis via WhatsApp & email.

**Live:** https://guru.cintabuku.site

## Fitur Utama

- Absensi & rekap absensi + cetak presensi
- Jurnal mengajar harian
- Nilai & rekap nilai (paket Pro+)
- Kelompok belajar (paket Pro+)
- LCKH & LKB (paket Premium)
- Data siswa, kelas, jadwal mengajar, kalender, template surat, panduan
- Panel admin: kelola user, verifikasi pembayaran, activity log, tagihan
- Checkout 1 halaman (wizard) + invoice otomatis via WhatsApp (Fonnte) & email (Resend)
- Notifikasi WA ke admin saat ada order baru

## Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14+ (App Router, TypeScript) |
| UI | Tailwind CSS, Font Awesome |
| Database | Turso (libSQL) via drizzle-orm |
| Auth | JWT (jose) — cookie `session` |
| Email | Resend (verifikasi aktivasi, invoice) |
| WhatsApp | Fonnte (invoice user, notifikasi order ke admin) |
| Deploy | Vercel (auto-deploy dari push ke `main`) |

## Struktur Direktori

```
src/
  app/
    (app)/          # Halaman dashboard (sidebar layout)
    api/            # Route handlers (auth, payments, dll.)
    checkout/       # Wizard pembelian 1 halaman
  components/       # Sidebar, Navbar, SocialProof, dll.
  db/               # schema.ts (drizzle) — definisi tabel
  lib/              # auth, email, notifWa, invoice, utils
tests/              # Playwright API tests (payments)
drizzle/            # Arsip SQL migrasi (riwayat)
```

## Setup Lokal

1. `npm install`
2. Buat `.env.local` dari contoh di bawah (isi nilai sendiri, jangan commit):
   ```bash
   JWT_SECRET=...            # rahasia utk sesi login
   DATABASE_URL=...          # Turso URL (libsql://...)
   TURSO_AUTH_TOKEN=...      # Turso token
   RESEND_API_KEY=...        # Resend API key (email)
   RESEND_FROM_EMAIL=...     # opsional; default: Jurnal Guru <noreply@cintabuku.site>
   FONNTE_TOKEN=...          # Fonnte token (WhatsApp gateway)
   ```
3. `npm run dev` → http://localhost:3000

> Catatan: DB di lingkungan dev lokal harus Turso (bukan D1 Cloudflare) agar sesi login berfungsi penuh.

## Migrasi Database

Schema dikelola di `src/db/schema.ts` (drizzle). Perubahan kolom/tabel dijalankan langsung di DB (Turso) lalu disinkronkan ke `schema.ts`; file `drizzle/*.sql` hanya arsip riwayat.

## Deploy

- **Live = `git push origin main`** → Vercel auto-build & deploy (integrasi GitHub)
- Verifikasi setelah ~1-4 menit: `curl https://guru.cintabuku.site/api/health`
- `deploy.sh` & `open-next.config.ts` hanya untuk domain lama (Cloudflare Worker) yang 301 ke domain baru — bukan jalur deploy utama

## Alur Pembayaran & Notifikasi

1. User pilih paket di `/checkout` (wizard: Paket → Pembayaran → Kirim bukti → Sukses)
2. Order dibuat (tabel `payments` + `subscriptions`, status `pending`) →
   - WA invoice ke nomor pembeli (Fonnte)
   - Email invoice ke email pembeli (Resend)
   - WA notifikasi order baru ke admin (Fonnte)
3. Admin verifikasi di panel admin (`/admin`) →
   - Status jadi `paid` → WA + email invoice lunas ke pembeli
   - Plan user di-upgrade sesuai paket

Paket: **Gratis** → **Pro** (Rp29rb/6 bln: +nilai, rekap nilai, kelompok) → **Premium** (Rp49rb/6 bln: +LCKH & LKB).

## Test

```bash
# API tests (butuh server live): default localhost:3000
TEST_BASE_URL=https://guru.cintabuku.site npx playwright test tests/payments-api.spec.ts
```

## Akun Demo

- Admin: `admin` / `admin123` (demo, untuk pengembangan)