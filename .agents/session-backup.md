# Session Backup — Jurnal Guru (9 Agustus 2026 — sesi sore)

## Status: DEPLOYED & LIVE
- **Live URL:** `https://guru.benuatech.web.id` — Cloudflare Worker `guru`
- **Versi aktif:** lihat output `Current Version ID` di deploy terakhir (`bash deploy.sh`)
- **D1:** `teacher-dashboard-db` (17 tabel — termsuk `kalender_catatan` + kolom `users.email`)

## Sesi 9-Agustus sore
- **DATABASE DIPUSH DEMO (9-8):** semua data dihapus & diganti dummy via `drizzle/9999_seed_demo.sql` (sudah dieksekusi ke D1 remote). Akun: admin/admin123 (Admin), demo@jurnal.guru/demo1234 (guru, plan **premium**), guru2@jurnal.guru/demo1234 (guru, gratis). Data demo: 2 kelas (X IPA 1, XI IPS 1), 12 siswa, jadwal 6, absensi 19, nilai 8, jurnal 3, kelompok 8, LCKH 3, LKB 2, catatan kalender 2, surat template 2, settings 10. payments & subscriptions KOSONG. Backup data lama: `/home/ubuntu24/d1-backup-20260809.sql` (di VPS).
- Login/Register pindah ke **email** (kolom baru `users.email`, unique). Register: `namaLengkap + email + password` (tanpa kode undangan — **kode undangan DIHAPUS** 9-8; field, validasi, dan pesan error invite dihapus dari UI & API; key `invite_code` di tabel settings dibiarkan, tidak dipakai); server set `username = email` (kompatibel dengan admin lama); validate format email; duplikat ditolak; **auto-login langsung setelah daftar**.
- Login: field **Email** (icon envelope), API terima `email` ATAU `username` (admin lama tetap login pakai `admin`). Error "Email atau password salah".
- UI login/register: pola input diubah ke **ikon absolute + `input pl-10`** (pola yang sama dengan halaman siswa) — placeholder & icon tidak bisa numpuk lagi.
- Login page kini punya link **"Lupa password?" → `/faq`** (jawaban: hubungi admin untuk reset) dan **"Belum punya akun? Daftar di sini" → `/register`**.
- Migrasi: `drizzle/0004_users_email.sql` (`ALTER TABLE users ADD COLUMN email text;` + unique index) — SUDAH dieksekusi ke D1 remote. Arahkan: schema users punya `email` unique; `verifyCredentials` di `src/lib/auth.ts` pakai `or(eq(email), eq(username))`.
- Teruji end-to-end via curl: register→login pakai email, duplikat email tertolak; data uji (`tes-otomatis@benua.test`) sudah dihapus dari D1.

## Skills opencode (terpasang 9-8-2026)
- **87 skill** di `~/.config/opencode/skills` (root lokal) — sama di VPS (`~/.config/opencode/skills`, 131 dir ≈ 87 skill + sisa lama).
- Sumber utama: `param087/saas-ui-skills` (15 skill UI shadcn — sudah ada), `rmzstack` (marketing+code+design, prefix `rmz-`), `coreyhaines31/marketingskills` (social, copywriting, launch, marketing-plan, pricing, cro, ai-seo, dll), `arpitexplores/super-marketing-strategy`, `addyosmani/agent-skills` (senior dev workflows), `waybarrios/opencode-power-pack` (code-review/architect/explorer/feature-dev), `neonetz/opencode-skills` (nextjs, api-designer, sql-pro, dll).
- Clone sources di `/tmp/opencode/` (agent-skills, marketingskills, rmzstack, saas-ui-skills, super-marketing-strategy, opencode-skills, opencode-power-pack).

## API keys opencode (9-8-2026)
- **VPS:** `~/.local/share/opencode/auth.json` DIHAPUS (berisi key `openrouter` sk-or-v1-... & `opencode` sk-q8Zhnz...). Delete → restore default. Kalau butuh login ulang: `opencode auth login`.
- **omniroute TETAP** (key via `OMNIROUTE_API_KEY` di `~/.bashrc` VPS; config `omniroute` + model `omniroute/auto/best-coding` di `~/.config/opencode/opencode.json` VPS). Tidak dihapus.
- Lokal `~/.config/opencode/opencode.jsonc` kosong-default; tidak ada auth.json di mesin ini.

## Arsitektur & Deploy
- **Source of truth ada di VPS** (`/home/ubuntu24/teacher-dashboard-next`). Lokal `/root/teacher-dashboard-next` = salinan sinkron.
- **Satu-satunya cara deploy: `bash deploy.sh`** (di folder lokal): tar+scp (exclude node_modules/.next/.open-next/.git/data.db/.env*/.dev.vars/docs/screenshots/tsconfig.tsbuildinfo) ke VPS -> typecheck `npx tsc --noEmit` di VPS -> `npm run deploy` (opennextjs-cloudflare) di VPS -> verifikasi URL / /checkout /api/auth/check.
- `.agents/` ikut deploy (session-backup.md + product-marketing.md terpanggil otomatis oleh `instructions` di `opencode.json` proyek, lokal & VPS).
- Secret: JWT_SECRET & service account Google sebagai **worker secrets** Cloudflare; `.env.local/.dev.vars/docs` tidak ikut deploy.

## Skema Paket (tiering sudah terverifikasi server-side)
| Plan | Harga | Fitur |
|------|-------|-------|
| gratis | Rp0 | Dashboard, Data Siswa, Data Kelas, Jadwal, Absensi, Rekap Absensi, Cetak Presensi, Jurnal Mengajar, Kalender (+catatan), Surat, FAQ, Panduan |
| pro | Rp29.000/bln | Semua gratis + Nilai, Rekap Nilai, Generate Kelompok Belajar |
| premium | Rp49.000/bln | Semua pro + Generate LCKH & LKB pegawai |

- Paket lama "sekolah" dihapus; plan `sekolah` di DB dipetakan ke `premium`. **Rapor SISWA DIHAPUS** — jangan dihidupkan kembali.

## Kontrol Akses & Gating
- Menu sidebar tampil semua plan; fitur terkunci (Nilai/Rekap/Kelompok/LCKH/LKB) badge gembok 29K/49K; klik -> layer "Fitur Terkunci" (`src/components/PlanGuard.tsx`).
- Server-side: `src/lib/plans.ts` -> `requirePlan(role,userId,min)`; nilai/kelompok=pro; lckh/lkb=premium; Admin=skip. Route 403.
- Session cookie/console: 8h.

## Payments/Monetization
- `PLANS` di `src/app/api/payments/route.ts`: pro 29000, premium 49000; verifikasi via `payments/[id]/route.ts` PATCH (blokir re-verify; users.plan diskron dari planId).
- Checkout/landing = 3 kartu Gratis/Pro/Premium.
- **PENDING MANUAL:** no rekening BRI asli di `/settings` (masih `0000...0`).

## Kalender Catatan
- Tabel `kalender_catatan` (0003). API GET/POST/PUT/DELETE di `src/app/api/kalender/route.ts`; panel kanan klik tanggal.

## Cara Kerja di Sesi
1. Buka folder di VPS (`/home/ubuntu24/teacher-dashboard-next`) lalu `opencode` (binary: `~/.npm-global/bin/opencode`; tambahkan ke PATH).
2. Konteks otomatis: AGENTS.md -> session-backup.md -> product-marketing.md (dipanggil via `instructions` pada `opencode.json`).
3. Edit lokal lalu `bash deploy.sh` (sync URI ke VPS).
4. Change schema: `src/db/schema.ts` + `drizzle/XXXX_*.sql` + jalankan ke D1 remote (dari VPS, `source ~/.cf_token.sh`).

## Skrip Helper
- `deploy.sh` — 1 command build+deploy+verify.
- Migrasi D1 contoh: `npx wrangler d1 execute teacher-dashboard-db --remote --file=drizzle/0004_users_email.sql`
## 9 Agu 2026 — Cetak/Export Resmi (kop + TTD + tab baru)
- **Modul baru `src/lib/dokumen.ts`**: `getProfil()` (cache fetch `/api/profil`), `kopHtml`/`kopTeks`, `ttdHtml` (kepala sekolah kiri, guru mapel kanan, kota+tanggal kanan atas, NIP dari profil), `bukaDokumen({judul, subtitle, identitas, body, guru, jabatanGuru, catatan})` (tab baru + auto window.print, CSS kop A4 inline), `exportXlsx` (SheetJS dinamis; kop+judul+identitas+TTD dengan merge sel A:D).
- Pola identitas: string `"label~nilai"` (label diawali `:`), maksimal 4 kolom per baris.
- **ExportButton.tsx** diperkaya: pakai `bukaDokumen` (kop+TTD) — otomatis berlaku untuk rekap-nilai, rekap-absensi, kelompok, lckh, lkb.
- **Halaman lain diganti dari `window.print()`/CSV**: nilai (PDF+Excel), absensi (PDF+Excel), jurnal (PDF+Excel), lckh (cetak+excel), lkb (cetak+excel), kelompok (cetak PDF), rekap-absensi `?cetak=1` (buka dokumen, guard `sudahCetak` ref). Semua `window.print()` hilang dari page.
- **Excel semua file .xlsx** (bukan .csv lagi): nilai, riwayat-absensi, jurnal, lckh/lkb — baris pertama berisi kop/identitas/jam cetak (TTD di baris bawah merges).
- Data kop & TTD dari `/profil` (namaSekolah, alamat, kota, provinsi, telepon, npsn, kepalaSekolah, nipKepsek, namaGuru, nipGuru, logoUrl).
- Typecheck `npx tsc --noEmit` lokal lolos; lint hanya error lama `react-hooks/set-state-in-effect` (baris useEffect yang tidak disentuh); build lokal OOM di sandbox (build sesungguhnya di VPS via deploy.sh).
- **STATUS: SELESAI & LIVE** — `bash deploy.sh` sukses 9 Agu 2026: compiled, uploaded guru, Current Version `6ce4fc39-7d61-4a10-b3f5-e92065234378`; verifikasi `/`→200, `/checkout`→200, `/api/auth/check`→401 (normal tanpa cookie). Batch ini juga jadi "sync percakapan terakhir" — sesi berikutnya baca file ini.

## 13 Agu 2026 — Restore Fitur Profil User (UserMenu)
- **Masalah**: kartu profil di sidebar bawah (edit profil, ganti password, ganti foto) hilang + fitur lama "hilang". Ternyata salinan HP lebih tua dari git HEAD di VPS; deploy.sh menimpa working tree VPS (tanpa commit) sehingga fitur UserMenu hilang dari kode.
- **Bukti**: git HEAD `830fc83` di VPS punya `src/components/UserMenu.tsx`, `src/app/api/me/route.ts`, `src/app/api/me/password/route.ts`, `src/lib/plan-helpers.ts`, `drizzle/0007_user_foto.sql`, schema users.foto.
- **PENTING**: D1 produksi BUKAN skema per-user (tabel tanpa `user_id`; migrasi 0005/0006 belum pernah diterapkan) tapi `users.foto` SUDAH ada (0007 terapkan). → Restore SANGAT selektif: hanya fitur profil (UserMenu + api/me + plan-helpers + foto), JANGAN restore schema per-user.
- **Tindakan**: checkout HEAD di VPS → tarik file ke lokal → schema.ts + `foto` di users → Sidebar: UserMenu di bawah (desktop) + header mobile + tetap adminOnly utk Profil Sekolah → tsc lolos → deploy.
- Navbar landing juga diperbaiki (teks selalu gelap di header putih; sebelumnya text-white di bg transparan = tak terlihat).
