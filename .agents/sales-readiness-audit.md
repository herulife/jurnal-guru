# SALES READINESS FINAL AUDIT — Jurnal Guru

Target: GURU · Prioritas: BISA DIJUAL SEKARANG
Tanggal: 2026-08-19 · Live: https://guru.cintabuku.site
Dasar audit: source code + QA Playwright nyata (checkout 5/5, security 6/6, mobile 4/4, full suite 28/28 + suite baru)

## PHASE 1 — LANDING PAGE SALES AUDIT

Metode: baca source `src/app/page.tsx` (569 baris) + test mobile 3 viewport.

| # | Item | Hasil |
|---|---|---|
| 1 | 5 detik pertama tahu apa/untuk siapa/manfaat | PASS — hero: "Dashboard Guru untuk Kelola Absensi, Nilai, & Jurnal", badge "Platform Digital Guru", subcopy masalah guru manual |
| 2 | CTA utama jelas | PASS — 3 CTA di hero: "Coba Gratis Sekarang" (register), "Beli Sekarang" (checkout), "Lihat Fitur" (anchor #fitur) |
| 3 | CTA Daftar / Coba Gratis / Upgrade | PASS — Coba Gratis x2 (hero + CTA bawah), Beli Sekarang, harga section punya Beli Pro/Beli Premium |
| 4 | Harga terlihat jelas | PASS — section #harga: Rp 0 / Rp 29.000 / Rp 49.000 per 6 bulan, kartu Pro "REKOMENDASI" |
| 5 | Benefit paket sesuai fitur nyata | PASS — Gratis: absensi/rekap/jurnal/profil; Pro: nilai+KKM/rekap/kelompok/unlimited; Premium: LCKH/LKB/ekspor laporan. Semua fitur benar-benar ada di app (guard nyata, bukan kosmetik) |
| 6 | Klaim fitur yang belum ada | MEDIUM — (a) "Garansi 30 Hari: Uang Kembali Penuh" & "Garansi Keamanan Data - Enkripsi & Backup" di section harga: TIDAK ada mekanisme refund dan DB tidak terenkripsi (hanya backup ada). (b) Social proof "281 guru aktif / 4.9 / 1.200+ absensi" = angka statis hardcode — jika belum riil, berisiko saat diverifikasi iklan |
| 7 | Bahasa mudah dipahami guru | PASS — bahasa sehari-hari guru ("Waktu guru habis untuk administrasi"), tanpa jargon |
| 8 | Mobile landing bagus | PASS — QA overflow 375/390/412px: tanpa horizontal overflow |
| 9 | CTA tidak membingungkan | PASS — 1 CTA utama per section, urutan jelas |

## PHASE 2 — REGISTER / LOGIN

Metode: baca route & UI + QA nyata (register API, login UI/API, redirect).

REGISTER
- Validasi: email format regex, password min 8, namaLengkap wajib — PASS
- Error message: jelas bahasa Indonesia ("Email sudah terdaftar", "Format email tidak valid") — PASS
- Konfirmasi password: dicek client-side "Password tidak cocok" — PASS
- Redirect setelah daftar: halaman sukses "cek email untuk aktivasi" + tombol kirim ulang aktivasi — PASS
- Email verification: WAJIB (emailVerified=0 sampai klik link; login ditolak 403 "Email belum dikonfirmasi"); token expire; anti-enumeration di resend — PASS (keamanan, tapi lihat friction)

LOGIN
- username/email: keduanya diterima — PASS
- password salah: "Email atau password salah" (tanpa membocorkan mana yang salah) — PASS
- password benar: session JWT cookie httpOnly 30 hari — PASS
- redirect: ke returnUrl (dari middleware) atau /dashboard — PASS
- User masuk ke DASHBOARD, bukan admin — PASS (role disimpan server-side; AdminGuard hanya untuk /admin /billing /users /log)

Catatan: verifikasi email via Resend bisa melambat masuk guru (friction LOW-MEDIUM — ada tombol kirim ulang).

## PHASE 3 — ROLE & PLAN SECURITY

Metode: bypass test nyata `tests/_security.spec.ts` (akses URL/API langsung, bukan tombol UI) — 6/6 PASS.

| Test | Hasil |
|---|---|
| User gratis GET /api/nilai, /api/kelompok, /api/lckh, /api/lkb | 403 (ditolak) |
| User gratis POST /api/nilai, /api/nilai/batch | 403 |
| User gratis PATCH payment sendiri status "verifikasi" | ditolak (>=400) — hanya admin bisa |
| User tidak bisa GET payment user lain | ditolak (>=401) — ownership scope |
| User pro GET /api/nilai | 200 (bisa) |
| User pro GET /api/lckh | 403 (tetap ditolak) |
| User premium semua API fitur | 200 semua |

Mekanisme: `requirePlan(role, userId, min)` server-side di setiap route fitur (nilai, batch, kelompok, lckh, lkb) + `PlanGuard` UI (fitur terkunci + CTA upgrade); plan dihitung server dari DB (`getUserPlan`, expired otomatis → gratis); Admin bypass hanya untuk role Admin. Tidak ada bypass ditemukan.

## PHASE 4 — PAYMENT END-TO-END

Metode: QA nyata `tests/_checkout.spec.ts` 5/5 + baca route.

| Langkah | Hasil |
|---|---|
| User pilih Pro → payment dibuat | PASS — UI checkout |
| Amount benar (server-side) | PASS — `amount = PLANS[planId].price` (29.000 / 49.000), TIDAK dari browser |
| planId benar | PASS — whitelist `ACTIVE_PLAN_IDS`, planId tidak valid ditolak |
| userId benar | PASS — session.id dari cookie |
| Order ID benar | PASS — JG-XXXXXXXX (hex 8), muncul di bayar/pending/sukses |
| Status pending | PASS |
| User upload bukti | PASS — POST /api/payments/[id]/proof, tersimpan, status UI "Menunggu Verifikasi" + timeline |
| Admin melihat payment | PASS — GET /api/payments?admin=1 (billing page) |
| Admin approve | PASS — PATCH status "verifikasi" |
| Subscription aktif | PASS — subscriptions.status=active + startedAt/expiresAt (+6 bulan) |
| Plan user berubah | PASS — users.plan = pro/premium, planExpires = +6 bulan |
| Fitur Pro terbuka | PASS — requirePlan(pro) lolos setelah plan berubah (dibuktikan fase 3) |
| Premium | PASS — alur sama, 49.000, premium_6m |
| Admin reject | PASS — status rejected, subscription TETAP pending (tidak aktif), UI "Pembayaran Tidak Berhasil" + Coba Lagi |

## PHASE 5 — PAYMENT SECURITY

| Item | Hasil |
|---|---|
| Amount tidak bisa dimanipulasi browser | PASS — harga dari server, client hanya kirim planId |
| planId tidak mengaktifkan plan sembarangan | PASS — whitelist + status pending diblokir ganda |
| User tidak bisa approve payment sendiri | PASS — verifikasi/tolak hanya requireAdmin |
| User tidak bisa ubah status payment | PASS — status hanya lewat aksi admin |
| User tidak bisa lihat payment user lain | PASS — GET [id]: owner check + requireAdmin |
| User tidak bisa ubah subscription sendiri | PASS — tidak ada endpoint publik |
| Upload file berbahaya | PASS — whitelist .jpg/.jpeg/.png/.pdf, MIME tidak diandalkan (ext check), file disimpan apa adanya tanpa eksekusi |
| Batas ukuran | PASS — 5MB |
| Path traversal | PASS — filename di-generate server (payment-{id8}-{rand8}{ext}), bukan dari nama file user |
| TEMUAN (MEDIUM) | Bukti transfer disimpan di `public/uploads/` → URL publik tanpa auth. Nama acak (uuid) mempersulit tebakan, tapi siapa pun yang dapat URL bisa lihat. Tidak menghalangi iklan; rekomendasi: pindah ke folder privat + endpoint streaming ber-auth (pekerjaan kecil, bukan blocker) |

## PHASE 6 — CHECKOUT MOBILE

Metode: `tests/_mobile.spec.ts` — viewport 375x812 / 390x844 / 412x915, cek horizontal overflow di landing, register, login, checkout (guest), checkout terlogin, subscription terlogin — 4/4 PASS.
Tidak ada overflow, tombol keluar layar, teks terpotong, form/upload rusak.

## PHASE 7 — CONVERSION FRICTION

HIGH
1. Landing mengklaim "Garansi 30 Hari Uang Kembali Penuh" — tidak ada mekanisme refund/garansi di aplikasi. Guru yang menuntut garansi akan kecewa; iklan bisa ditolak/diverifikasi. (Fix copy atau buat mekanisme — rekomendasi: ubah copy.)
2. Social proof angka ("281 guru aktif", "4.9/5", "1.200+ absensi", testimoni fiktif) di-hardcode. Jika dibawa ke iklan dan diverifikasi = risiko. (Gunakan angka riil atau copy netral.)

MEDIUM
3. Hanya satu metode pembayaran (transfer BRI). Guru yang tidak punya BRI tetap bisa transfer antar-bank, tapi ada gesekan + biaya antar-bank.
4. Upload bukti di public/uploads (lihat fase 5).
5. Tidak ada estimasi waktu verifikasi per-akun (copy sudah bilang "maksimal 24 jam" — cukup; opsional tambah "biasanya < 2 jam").
6. Trial 2 hari berakhir tanpa pengingat → guru bisa bingung kenapa fitur terkunci.

LOW
7. Guest klik "Beli Pro" → prompt login (wajar, tapi 1 klik ekstra).
8. Rate limit login 10/10 menit per IP — bisa menjebak guru dari jaringan sekolah yang NAT (satu IP banyak user). Sisi baik: melindungi dari brute-force.

## PHASE 8 — SALES FUNNEL (dari source code)

| Tahap | URL / CTA | API | DB | Expected | Potential failure |
|---|---|---|---|---|---|
| Landing | / · CTA Coba Gratis / Beli | - | - | Guru paham & klik CTA | Klaim garansi/social proof tidak riil |
| Register | /register | POST /api/auth/register | users (verified=0) + seed dummy | Akun dibuat, email aktivasi terkirim | Email masuk spam → akun tak aktif |
| Verifikasi email | link /api/auth/verify-email?token= | GET verify-email | users.verified=1 | Akun aktif | Token expire; guru tak buka email |
| Login | /login | POST /api/auth/login | session cookie | Masuk ke dashboard | Password lupa; rate limit |
| Dashboard | /dashboard | GET /api/dashboard | kelas/siswa | Guru lihat data (seed dummy) | - |
| Pilih paket | section harga / PlanGuard upgrade | - | - | Klik Beli Pro/Premium | Harga kurang jelas di mobile (sudah pass) |
| Checkout | /checkout?plan= | GET/POST /api/payments | payments/subscriptions pending | Payment dibuat + Order ID | Guest harus login; pending ganda diblokir (by design) |
| Transfer | rekening BRI di checkout | - | - | Guru transfer | Salah nominal → ditolak admin |
| Upload bukti | stage konfirmasi | POST /api/payments/[id]/proof | payments.proofUrl | Bukti tersimpan, status pending | File >5MB / format salah → error jelas |
| Verifikasi admin | /billing (admin) | GET ?admin=1 · PATCH verifikasi/tolak | payments.status · subscriptions.active · users.plan | Plan aktif + WA/email notif | Admin lambat verifikasi (SLA 24 jam) |
| Plan aktif | /subscription · fitur | GET /api/auth/check · requirePlan | users.plan/planExpires | Fitur terbuka 6 bulan | Expired → otomatis gratis (by design) |

## PHASE 9 — TRACKING

Kondisi aktual: TIDAK ADA analytics sama sekali (tidak ada GA/Plausible, tidak ada tabel events, tidak ada server log bisnis selain addLog aktivitas).
Yang belum diketahui: visitor, konversi iklan → register, funnel drop-off, payment conversion rate.

Minimum yang diperlukan (TANPA library besar — cukup tabel events + 6 titik server-side):
1. register (sudah ada addLog — bisa dipakai)
2. login (addLog ada)
3. checkout_opened
4. payment_created
5. proof_uploaded
6. payment_approved / payment_rejected

Rekomendasi: mulai dari tabel `events` sederhana (event, user_id, ts, meta) ditulis di route yang sama — bukan GA. Ini pekerjaan kecil, tapi SESUAI INSTRUKSI: JANGAN dibuat sekarang — laporkan saja.

## PHASE 10 — FINAL SALES VERDICT

| Komponen | Status |
|---|---|
| Landing Page | PASS (2 catatan quick win) |
| Registration | PASS |
| Login | PASS |
| Role Security | PASS (bypass test 6/6) |
| Plan Guard | PASS (UI + API + expiry) |
| Checkout | PASS (order UX baru) |
| Payment | PASS (amount server-side, planId whitelist) |
| Upload Proof | PASS (5MB, whitelist, uuid) |
| Admin Verification | PASS (verifikasi/tolak → subscription & plan benar) |
| Subscription Activation | PASS (subscription active + users.plan + planExpires +6 bln) |
| Mobile UX | PASS (375/390/412 tanpa overflow) |
| Sales Funnel | PASS (tiap tahap punya API + expected result) |

## CRITICAL BLOCKERS

NONE — jalur iklan → guru membayar → plan aktif berfungsi penuh dan aman.
(Sebelum iklan berbayar besar: bersihkan 2 klaim HIGH di fase 7.)

## QUICK WINS

1. Ubah copy garansi: "Garansi 30 Hari Uang Kembali" → "Tanpa risiko: tim kami bantu setup & migrasi data" (1 baris, 2 file: landing + checkout).
2. Ganti angka social proof hardcode → angka riil (hitung dari DB) atau copy netral ("Guru di 45+ sekolah" hanya jika benar).
3. Pindah bukti transfer dari public/uploads ke folder privat + route ber-auth (keamanan penyimpanan).
4. Tambah teks kecil di checkout: "Verifikasi biasanya < 2 jam (maksimal 24 jam)" untuk menurunkan kecemasan menunggu.
5. Buat tabel events 6 titik (fase 9) sebelum iklan pertama — supaya ROI iklan terukur sejak hari 1.

## NEXT ACTION

1. Terapkan quick wins 1–2 (copy landing) — 15 menit, dampak langsung ke kepercayaan & kelayakan iklan.
2. Tracking minimal (quick win 5) sebelum kampanye pertama.
3. Quick win 3 (upload privat) — jadwalkan, bukan blocker.
4. Setelah itu: READY TO ADVERTISE penuh.