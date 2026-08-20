"use client";

import { useState } from "react";

const SECTIONS = [
  { id: "s1", title: "1. Executive Summary" },
  { id: "s2", title: "2. Scope & Methodology" },
  { id: "s3", title: "3. Findings at a Glance" },
  { id: "s4", title: "4. HIGH: No Password Reset" },
  { id: "s5", title: "5. HIGH: Session Invalidation" },
  { id: "s6", title: "6. HIGH: Rate Limit Bypass" },
  { id: "s7", title: "7. HIGH: Admin Default Credential" },
  { id: "s8", title: "8. MED: Enumeration via Login" },
  { id: "s9", title: "9. MED: Enumeration via Resend" },
  { id: "s10", title: "10. MED: Orphan Data on Register" },
  { id: "s11", title: "11. MED: Verify Token Plaintext" },
  { id: "s12", title: "12. MED: Delete User No Cascade" },
  { id: "s13", title: "13. MED: Misc (Race, Lockout, Length)" },
  { id: "s14", title: "14. Area Verdicts" },
  { id: "s15", title: "15. False Positives (Verified OK)" },
  { id: "s16", title: "16. Final Checklist" },
  { id: "s17", title: "17. Top 10 Priorities" },
];

const findingsAtGlance: [string, string, string, string][] = [
  ["F-01", "Tidak ada fitur reset/lupa password (link login → /faq)", "HIGH", "src/app/login/page.tsx:166, src/lib/email.ts"],
  ["F-02", "Sesi JWT tidak bisa dicabut: ganti password, delete user, demote role", "HIGH", "src/lib/auth.ts:26-53"],
  ["F-03", "Rate limit memakai X-Forwarded-For pertama (bisa dipalsukan)", "HIGH", "src/lib/rateLimit.ts:48-52"],
  ["F-04", "Akun admin default admin/admin123 dibuat otomatis (seed)", "HIGH", "src/lib/seed.ts:24-31"],
  ["F-05", "Enumeration via login: pesan beda utk akun belum verifikasi", "MED", "src/app/api/auth/login/route.ts:33-35"],
  ["F-06", "Enumeration via resend: pesan & timing berbeda", "MED", "src/app/api/auth/resend-verification/route.ts:22,47"],
  ["F-07", "Register gagal kirim email → user dihapus tapi data dummy tersisa (orphan)", "MED", "src/app/api/auth/register/route.ts:72-87"],
  ["F-08", "Verify token disimpan plaintext di DB (64 hex x2, 24 jam)", "MED", "src/db/schema.ts:15, src/lib/email.ts:70-72"],
  ["F-09", "Delete user (admin) tanpa cascade data & tanpa cabut sesi", "MED", "src/app/api/users/[id]/route.ts:59"],
  ["F-10", "Race register (select-then-insert) → 500; role default schema 'admin'", "MED", "src/db/schema.ts:9"],
  ["F-11", "Tidak ada lockout per akun — rate limit hanya per IP", "MED", "src/lib/rateLimit.ts"],
  ["F-12", "Tidak ada batas panjang password (bcrypt truncate 72 byte)", "LOW", "src/app/api/auth/register/route.ts"],
];

const findings = [
  {
    id: "f1",
    title: "F-01 — HIGH: Tidak Ada Fitur Reset / Lupa Password",
    loc: "src/app/login/page.tsx:166 · src/lib/email.ts (tidak ada template reset) · schema users (tidak ada kolom reset token)",
    detail: "Link 'Lupa password?' di halaman login hanya mengarah ke /faq (FAQ). Tidak ada endpoint /api/auth/forgot-password atau /api/auth/reset-password, tidak ada kolom resetToken/resetExpires di tabel users, tidak ada template email reset. Akibat: user yang lupa password terkunci permanen — satu-satunya jalan adalah admin me-reset lewat /api/users/[id] PUT. Ini gap fungsional sekaligus risiko account lockout / support overload.",
    fix: "Tambahkan flow: POST /api/auth/forgot-password (rate-limited, generic response) → buat resetToken 1x pakai 24 jam → POST /api/auth/reset-password (validasi token + expiry + invalidasi semua sesi) → email template reset. Tambah kolom reset_token & reset_token_expires.",
  },
  {
    id: "f2",
    title: "F-02 — HIGH: Sesi JWT Tidak Bisa Dicabut (No Revocation)",
    loc: "src/lib/auth.ts:26-53 (createSession/getSession) · src/app/api/me/password/route.ts:34 · src/app/api/users/[id]/route.ts:59",
    detail: "Sesi adalah JWT stateless 30 hari tanpa jti/version. getSession() hanya memverifikasi tanda tangan — tidak pernah cek user masih ada di DB. Konsekuensi terverifikasi: (a) ganti password tidak menonaktifkan sesi lama; (b) admin menghapus user → token user masih valid 30 hari dan semua API tetap bisa dipakai (requireAuth hanya cek JWT); (c) admin menurunkan role → token lama tetap berisi role admin sampai 30 hari (middleware + requireAdmin menerima).",
    fix: "Minimal: tambah kolom session_version di users, masukkan ke payload JWT, cek di getSession. Atau jadikan sesi server-side (tabel sessions). Untuk (b): getSession wajib cek user exists. Demote role: pakai role dari DB saat requireAdmin (1 query) atau bump session_version.",
  },
  {
    id: "f3",
    title: "F-03 — HIGH: Rate Limit Bypass via X-Forwarded-For Spoofable",
    loc: "src/lib/rateLimit.ts:48-52",
    detail: "ipOf() mengambil nilai PERTAMA dari header x-forwarded-for. VPS ada di belakang Cloudflare Tunnel, dan Cloudflare meneruskan XFF asli client sebagai nilai pertama tanpa menimpa. Jadi attacker bisa kirim header X-Forwarded-For: 1.2.3.4 dan membuat bucket rate limit baru tiap nilai berbeda → brute force login/register/resend tanpa hambatan berarti. Batas 10 percobaan/10 menit per IP+path menjadi tidak efektif.",
    fix: "Pakai CF-Connecting-IP dulu (header Cloudflare yang dijamin), fallback x-real-ip, lalu remote address. Tambahkan juga throttle per-akun (email) di samping per-IP.",
  },
  {
    id: "f4",
    title: "F-04 — HIGH: Akun Admin Default admin/admin123 (Seed)",
    loc: "src/lib/seed.ts:24-31",
    detail: "seedDatabase() membuat user admin dengan password hardcoded 'admin123'. Kredensial ini dicantumkan di dokumentasi proyek. Siapa pun yang tahu email/username admin bisa login langsung dengan password default jika tidak pernah diganti. Admin punya akses penuh: kelola user, verifikasi pembayaran, settings global, semua data user.",
    fix: "Segerakan: ganti password admin via /api/me/password atau /api/users. Jangka panjang: buat password awal acak dari env (ADMIN_INITIAL_PASSWORD), paksa ganti saat login pertama, dan tambah rate limit + audit log untuk login admin.",
  },
  {
    id: "f5",
    title: "F-05 — MED: Enumeration via Login (Pesan Berbeda)",
    loc: "src/app/api/auth/login/route.ts:33-35",
    detail: "Untuk akun yang TERDAFTAR tapi belum verifikasi email, login mengembalikan 'Email belum dikonfirmasi...' (403). Untuk email tidak dikenal: 'Email atau password salah'. Attacker dapat memvalidasi daftar email terdaftar (terutama yang belum verifikasi). Bcrypt dummy compare sudah mencegah timing leak untuk password, tapi pesan error membocorkan status akun.",
    fix: "Kembalikan pesan generik yang sama untuk semua kegagalan ('Email atau password salah'), lalu di UI selalu tampilkan opsi 'Kirim ulang link aktivasi' + 'Lupa password' tanpa membedakan alasan. Alternatif: kirim kode status sama (401) dan seragamkan pesan.",
  },
  {
    id: "f6",
    title: "F-06 — MED: Enumeration via Resend-Verification",
    loc: "src/app/api/auth/resend-verification/route.ts:22,47",
    detail: "resend-verification sudah memakai pesan generik untuk email tidak dikenal / sudah terverifikasi: 'Jika email terdaftar...'. TAPI untuk akun yang valid & belum verifikasi, pesan berbeda: 'Link aktivasi baru telah dikirim ke email Anda.' — plus timing berbeda (panggilan Resend API berlangsung lebih lama). Keduanya membocorkan keberadaan akun.",
    fix: "Seragamkan pesan respons menjadi generic untuk semua kasus; untuk anti-timing, lakukan sleep kecil pada jalur 'tidak ada' atau kirim ke jalur tanpa network call. Rate limit tetap melindungi.",
  },
  {
    id: "f7",
    title: "F-07 — MED: Orphan Data Saat Register Gagal Kirim Email",
    loc: "src/app/api/auth/register/route.ts:72-87",
    detail: "Urutan: insert user → seedDummyData() (1 kelas, 6 siswa, jadwal, absensi, nilai, jurnal, kelompok, LCKH, LKB, kalender, profil) → kirim email. Jika email gagal, user dihapus TAPI data dummy tidak ikut dihapus → baris orphan menumpuk di 11 tabel per percobaan gagal. Seed juga dijalankan SEBELUM verifikasi email, jadi attacker bisa membuat akun unverified + data dummy berulang (dibatasi rate limit, tapi tetap). Tidak ada transaksi: insert + seed + email tidak atomik.",
    fix: "Bungkus insert+seed dalam transaksi; hapus data dummy saat rollback (atau lebih baik: pindahkan seedDummyData setelah verifikasi email pertama kali login — akun baru mulai dengan dashboard kosong + tombol 'Muat contoh data').",
  },
  {
    id: "f8",
    title: "F-08 — MED: Verify Token Plaintext di DB",
    loc: "src/db/schema.ts:15 (verify_token) · src/lib/email.ts:70-72 (generateVerifyToken)",
    detail: "Verify token (128 karakter hex, 512-bit — entropy sangat tinggi, 24 jam expiry, one-time dihapus setelah dipakai) disimpan plaintext di kolom users.verify_token dan dikirim via query param URL. Risiko rendah karena entropy, tapi: DB leak → semua token valid terpapar; link di email/log email provider. Praktik terbaik: simpan hash token (SHA-256) dan bandingkan hash.",
    fix: "Simpan sha256(verifyToken); bandingkan hash saat verify. Atau gunakan signed URL dengan JWT pendek tanpa kolom DB. Header Referrer-Policy strict-origin sudah ada — pertahankan.",
  },
  {
    id: "f9",
    title: "F-09 — MED: Delete User Tanpa Cascade & Tanpa Revoke Sesi",
    loc: "src/app/api/users/[id]/route.ts:45-67",
    detail: "DELETE /api/users/[id] hanya menghapus baris users. Data milik user (kelas, siswa, absensi, nilai, jurnal, kelompok, LCKH, LKB, kalender, profil, subscriptions, payments, events, log) tetap tersisa → orphan dan kebocoran penyimpanan. Kombinasi dengan F-02: token JWT user tetap valid, bisa membuat data baru dengan userId yang tidak ada di users.",
    fix: "Cascade delete semua tabel child (atau soft-delete + marker). Revoke sesi: hapus semua sesi / bump session_version. Pertimbangkan juga payment history tetap disimpan utk admin.",
  },
  {
    id: "f10",
    title: "F-10 — MED: Race Register & Default Role 'admin' di Schema",
    loc: "src/app/api/auth/register/route.ts:49-51 · src/db/schema.ts:9",
    detail: "(a) Cek duplikat 'select then insert' tidak atomik: dua request bersamaan dengan email sama sama-sama lolos cek, insert kedua melanggar unique constraint → error mentah → 500 alih-alih 'Email sudah terdaftar'. (b) users.role default di schema = 'admin'. Semua jalur kode saat ini menset role eksplisit, tapi default berbahaya: satu insert yang lupa role = akun admin tak sengaja.",
    fix: "(a) Tangkap error unique constraint → kembalikan pesan duplikat; atau gunakan INSERT OR CONFLICT. (b) Ubah default schema jadi 'free'.",
  },
  {
    id: "f11",
    title: "F-11 — MED: Tidak Ada Lockout Per Akun",
    loc: "src/lib/rateLimit.ts (hanya per IP+path)",
    detail: "Batas 10/10 menit per IP mudah dihindari dengan banyak IP (botnet / proxy). Tidak ada penghitung kegagalan per akun/email. Untuk proteksi login yang kuat: track failed attempts per identifier dan beri lockout bertahap (mis. 5 gagal → 5 menit, 10 gagal → 30 menit).",
    fix: "Tambahkan bucket per identifier di rateLimit.ts (mis. key `acct:{email}` untuk jalur login) dengan cooldown progresif; tetap pertahankan per-IP dengan header yang benar (F-03).",
  },
  {
    id: "f12",
    title: "F-12 — LOW: Panjang Password Tidak Dibatasi",
    loc: "src/app/api/auth/register/route.ts, src/app/api/auth/login/route.ts, src/app/api/me/password/route.ts",
    detail: "Validasi hanya min 8 karakter. bcrypt memotong input di 72 byte secara diam-diam → dua password panjang yang berbagi 72 byte pertama dianggap sama. Input sangat panjang juga memperlambat bcrypt (lambat = hampir linear terhadap panjang? bcrypt memproses sampai 72 byte, sisanya diabaikan — beban tetap kecil, tapi 5MB body JSON juga membebani parsing).",
    fix: "Tambah batas maksimal (mis. 128 karakter) + validasi tipe string, di client & server.",
  },
];

const areaVerdicts: [string, string, string][] = [
  ["Authentication (login/register)", "OK — bcrypt cost 10, verify email wajib, dummy bcrypt compare", "PASS"],
  ["Session management", "Risky — JWT 30 hari tanpa revocation/jti/cek DB", "WARN"],
  ["Rate limiting", "Bypassable — XFF pertama bisa dipalsukan", "FAIL"],
  ["Authorization (role/plan)", "OK — requireAdmin + requirePlan server-side, plan dari DB", "PASS"],
  ["IDOR / data isolation", "OK — scopeUserId + canUseKelas/canUseSiswa di semua CRUD", "PASS"],
  ["Password management", "Gap — tanpa reset password; ganti password tanpa invalidasi sesi", "FAIL"],
  ["Account lifecycle", "Gap — delete tanpa cascade; token tetap valid", "FAIL"],
  ["Payments", "OK — harga dari PLANS server, ACTIVE_PLAN_IDS, verifikasi admin-only", "PASS"],
  ["Upload bukti bayar", "OK — ekstensi JPG/PNG/PDF + maks 5MB", "PASS"],
  ["Backup/restore", "OK — scoped per user, kolom divalidasi regex, nilai parameterized", "PASS"],
  ["Settings/global", "OK — whitelist key admin vs user", "PASS"],
  ["Tracking", "OK — event whitelist, meta dibatasi panjang", "PASS"],
  ["Google Sheets", "OK — tanpa SSRF (ID spreadsheet divalidasi, hanya sheets.googleapis.com)", "PASS"],
];

const falsePositives: [string, string][] = [
  ["Tidak ada CSRF token", "VERIFIED OK — SameSite=Strict + httpOnly cookie sudah memadai untuk API state-changing tanpa form legacy"],
  ["JWT_SECRET bocor ke client", "VERIFIED OK — hanya diakses di server (middleware + lib auth); tidak ada NEXT_PUBLIC_JWT_SECRET"],
  ["D1/Turso dianggap tidak aman", "VERIFIED OK — D1 dinonaktifkan di VPS (D1_ACTIVE=false); SQLite file lokal dipakai"],
  ["XSS via data siswa/kelas", "VERIFIED OK — React auto-escape; tidak ada dangerouslySetInnerHTML pada data user"],
  ["IDOR pada /api/surat", "VERIFIED OK — GET semua user memang sengaja (template global); write/delete requireAdmin"],
  ["SSRF pada Google Sheets", "VERIFIED OK — extractSpreadsheetId hanya /d/{id} atau pola [\\w-]{20,}; fetch terbatas ke sheets.googleapis.com"],
  ["SQL injection pada /api/backup", "VERIFIED OK — nama kolom divalidasi regex, nilai pakai parameter binding"],
  ["Rate limit tidak persist", "VERIFIED OK — persist ke /tmp/jg_rate_limits.json + cleanup 60s (valid karena VPS bukan serverless)"],
  ["Enumeration via register ('Email sudah terdaftar')", "ACCEPTED RISK — wajib punya email + verifikasi; leak info minimal, didokumentasikan"],
  ["Login timing enumeration password", "VERIFIED OK — dummy bcrypt compare untuk user tak dikenal (src/lib/auth.ts:101)"],
];

const finalChecklist: [string, string][] = [
  ["Password hashing bcrypt (cost 10)", "PASS"],
  ["Cookie httpOnly + secure + SameSite=Strict, 30 hari", "PASS"],
  ["Email wajib diverifikasi sebelum login (403 jika belum)", "PASS"],
  ["Dummy bcrypt compare (anti timing)", "PASS"],
  ["Rate limit login/register/resend per IP+path (10/10m)", "PARTIAL"],
  ["IP rate limit dari header anti-spoof (CF-Connecting-IP)", "FAIL"],
  ["Lockout per akun", "FAIL"],
  ["Plan gating server-side (nilai/kelompok=pro, lckh/lkb=premium)", "PASS"],
  ["Plan & expiry dibaca dari DB (getUserPlan), bukan JWT", "PASS"],
  ["Ownership check semua CRUD (kelas, siswa, nilai, absensi, jurnal, jadwal, kalender, kelompok, lckh, lkb, payments)", "PASS"],
  ["Payment amount dari server, bukan body client", "PASS"],
  ["Verifikasi pembayaran hanya admin; reject kalau sudah diproses", "PASS"],
  ["Upload bukti: ekstensi + ukuran dibatasi", "PASS"],
  ["Anti-enumeration register", "PARTIAL"],
  ["Anti-enumeration login (pesan seragam)", "FAIL"],
  ["Anti-enumeration resend (pesan seragam + anti-timing)", "FAIL"],
  ["Fitur lupa/reset password", "FAIL"],
  ["Invalidasi sesi saat ganti password / hapus user / demote role", "FAIL"],
  ["Delete user: cascade data", "FAIL"],
  ["getSession cek user masih ada di DB", "FAIL"],
  ["Verify token di-hash di DB (bukan plaintext)", "FAIL"],
  ["Default role schema = 'free' (bukan 'admin')", "FAIL"],
  ["Max panjang password", "FAIL"],
  ["Admin default credential diganti / acak", "FAIL"],
  ["SQL injection defense (parameterized queries)", "PASS"],
  ["XSS defense (React escaping)", "PASS"],
  ["CSRF defense (SameSite=Strict)", "PASS"],
  ["Security headers (X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy)", "PASS"],
  ["HSTS header", "FAIL"],
  ["CSP header", "FAIL"],
  ["Registrasi atomik (rollback seed saat email gagal)", "FAIL"],
];

const top10: [string, string, string][] = [
  ["1", "Ganti password admin default (admin123) sekarang", "HIGH"],
  ["2", "Buat flow forgot/reset password (token 1x pakai + expiry + email)", "HIGH"],
  ["3", "Revoke sesi: session_version di JWT + cek user exists di getSession", "HIGH"],
  ["4", "Perbaiki ipOf(): CF-Connecting-IP → x-real-ip → remote addr", "HIGH"],
  ["5", "Seragamkan pesan error login & resend (anti-enumeration)", "MED"],
  ["6", "Register atomik: transaksi + rollback data dummy", "MED"],
  ["7", "Cascade delete data saat hapus user (atau soft-delete)", "MED"],
  ["8", "Hash verify token di DB (sha256)", "MED"],
  ["9", "Lockout per akun + catch unique constraint → pesan duplikat", "MED"],
  ["10", "Default role schema 'free' + max panjang password + HSTS", "LOW"],
];

const riskiestFiles: [string, string][] = [
  ["src/lib/auth.ts", "Session stateless tanpa revocation; getSession tidak cek user masih ada"],
  ["src/lib/rateLimit.ts", "ipOf() memakai XFF pertama — spoofable"],
  ["src/app/api/auth/register/route.ts", "Orphan data saat email gagal; race; seed sebelum verifikasi"],
  ["src/app/api/auth/login/route.ts", "Pesan beda utk akun unverified = enumeration"],
  ["src/app/api/auth/resend-verification/route.ts", "Pesan & timing beda = enumeration"],
  ["src/app/api/users/[id]/route.ts", "DELETE tanpa cascade; sesi tetap valid"],
  ["src/app/api/me/password/route.ts", "Ganti password tanpa invalidasi sesi lain"],
  ["src/db/schema.ts", "role default 'admin'; verify_token plaintext"],
  ["src/lib/seed.ts", "Akun admin admin/admin123 otomatis"],
  ["src/middleware.ts", "Trust penuh payload JWT utk admin; HSTS/CSP belum ada"],
];

const missingTests = [
  "No unit test untuk auth (register validation, rate limit behavior, JWT expiry/tamper)",
  "Playwright security suite ada (tests/_security.spec.ts, 6 tes: plan gates, payment self-verify, IDOR, upload) tapi tidak menutupi: password change, enumeration, session revocation, middleware admin, rate limit",
  "Entitlement suite (13 tes) 1 gagal menurut audit/full (12/13) — perlu diverifikasi",
  "Tidak ada test untuk register fail-email → orphan cleanup",
  "Tidak ada test untuk race duplicate register",
];

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${className || "bg-gray-100 text-gray-600"}`}>
      {children}
    </span>
  );
}

function SeverityBadge({ level }: { level: string }) {
  if (level === "HIGH") return <Badge className="bg-red-100 text-red-700">HIGH</Badge>;
  if (level === "MED") return <Badge className="bg-amber-100 text-amber-700">MED</Badge>;
  return <Badge className="bg-blue-100 text-blue-700">LOW</Badge>;
}

function VerdictBadge({ v }: { v: string }) {
  if (v === "PASS") return <Badge className="bg-green-100 text-green-700">PASS</Badge>;
  if (v === "PARTIAL") return <Badge className="bg-amber-100 text-amber-700">PARTIAL</Badge>;
  if (v === "WARN") return <Badge className="bg-amber-100 text-amber-700">WARN</Badge>;
  if (v === "FAIL") return <Badge className="bg-red-100 text-red-700">FAIL</Badge>;
  return <Badge className="bg-gray-100 text-gray-600">{v}</Badge>;
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <h2 className="text-2xl font-extrabold text-[#1A2332] mb-6 flex items-center gap-3">
      <span className="w-10 h-10 bg-[#0D7C66] text-white rounded-xl flex items-center justify-center text-lg font-bold shrink-0">
        {number}
      </span>
      {title}
    </h2>
  );
}

function InfoBox({ icon, text, color }: { icon: string; text: string; color?: string }) {
  const bg = color === "amber" ? "bg-amber-50 border-amber-200 text-amber-700" : color === "red" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700";
  return (
    <div className={`${bg} border rounded-xl p-3 mb-4 text-sm`}>
      <i className={`fas fa-${icon} mr-1`}></i> {text}
    </div>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border border-gray-200 mb-6">{children}</div>;
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-left px-3 py-2 text-xs font-bold text-white bg-[#1A2332] uppercase tracking-wider whitespace-nowrap">{children}</th>;
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 text-sm border-b border-gray-100 ${className || ""}`}>{children}</td>;
}

function Collapsible({ title, defaultOpen, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="border border-gray-200 rounded-xl mb-3 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[#1A2332] hover:bg-gray-50 transition-colors">
        <span>{title}</span>
        <i className={`fas fa-chevron-${open ? "up" : "down"} text-gray-400 text-xs transition-transform`}></i>
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-100">{children}</div>}
    </div>
  );
}

function FindingCard({ f }: { f: (typeof findings)[number] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex items-start justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <SeverityBadge level={f.id.includes("f12") ? "LOW" : f.id.includes("f1") || f.id.includes("f2") || f.id.includes("f3") || f.id.includes("f4") ? "HIGH" : "MED"} />
            <span className="text-sm font-bold text-[#1A2332]">{f.title}</span>
          </div>
          <p className="text-xs text-gray-500 font-mono">{f.loc}</p>
        </div>
        <i className={`fas fa-chevron-${open ? "up" : "down"} text-gray-400 text-xs mt-1 shrink-0`}></i>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">{f.detail}</p>
          <p className="text-sm"><span className="font-bold text-[#0D7C66]">Fix:</span> <span className="text-gray-700">{f.fix}</span></p>
        </div>
      )}
    </div>
  );
}

export default function AuthSecurityAudit() {
  const [activeSection, setActiveSection] = useState("s1");

  const summaryRows: [string, string][] = [
    ["Ruang lingkup", "Sistem akun & autentikasi: register, login, logout, verify email, resend, ganti password, sesi (JWT), rate limit, middleware, ownership, plan gating, payments, upload, backup, settings"],
    ["Metode", "Review kode aktual (bukan dokumentasi) — 25+ file dibaca, termasuk semua route auth, auth.ts, rateLimit.ts, middleware.ts, schema.ts, seed.ts, CRUD terpilih untuk verifikasi pola IDOR"],
    ["Verifikasi", "npx next build — PASS (typecheck + bundle)"],
    ["Jumlah temuan", "12 — 4 HIGH, 7 MED, 1 LOW (dari review statis)"],
    ["False positive yang dibuktikan aman", "10 (lihat bagian 15)"],
    ["Status umum", "Auth core solid (bcrypt, email verify, SameSite, gating server-side, ownership) — 3 gap HIGH perlu ditutup sebelum skala besar: reset password, revoke sesi, rate limit anti-spoof"],
  ];

  return (
    <div className="min-h-screen bg-white">
      <aside className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 bg-[#1A2332] overflow-y-auto z-40">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-xl flex items-center justify-center">
              <i className="fas fa-user-shield text-white text-sm"></i>
            </div>
            <div>
              <h2 className="text-white font-bold text-sm">Auth Security</h2>
              <p className="text-gray-500 text-[10px]">Jurnal Guru — Audit Akun</p>
            </div>
          </div>
        </div>
        <nav className="py-3">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSection(s.id);
                document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-full text-left px-5 py-2.5 text-xs font-medium transition-colors ${
                activeSection === s.id
                  ? "bg-[#2D4055] text-white border-l-3 border-[#0D7C66]"
                  : "text-gray-400 hover:text-white hover:bg-[#243447]"
              }`}
            >
              {s.title}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-gray-500 text-[10px] text-center">20 Agustus 2026</p>
          <p className="text-gray-600 text-[10px] text-center mt-1">25+ file · review kode aktual</p>
          <p className="text-amber-400 text-[10px] text-center mt-1 font-bold">4 HIGH · 7 MED · 1 LOW</p>
        </div>
      </aside>

      <main className="lg:ml-64">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="mb-10">
            <Badge className="bg-[#0D7C66] text-white mb-3">LIVE AUDIT — SOURCE CODE REVIEW</Badge>
            <h1 className="text-3xl font-extrabold text-[#1A2332] mb-2"># AUTH SECURITY AUDIT</h1>
            <p className="text-gray-500 text-sm">Jurnal Guru — Sistem Akun, Autentikasi & Authorisasi · 20 Agustus 2026 · Berbasis kode aktual, bukan dokumentasi</p>
          </div>

          {/* s1 */}
          <section id="s1" className="mb-12 scroll-mt-6">
            <SectionHeader number="01" title="Executive Summary" />
            <TableWrap>
              <table className="w-full">
                <tbody>
                  {summaryRows.map(([k, v]) => (
                    <tr key={k}>
                      <Td className="font-bold text-[#1A2332] whitespace-nowrap align-top w-40">{k}</Td>
                      <Td>{v}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
            <InfoBox icon="shield-halved" text="Kekuatan inti: bcrypt cost 10 + dummy compare, verifikasi email wajib, cookie httpOnly/SameSite=Strict, gating fitur server-side dari DB, ownership check konsisten di semua CRUD, harga payment dari server." />
            <InfoBox icon="triangle-exclamation" color="red" text="3 gap HIGH harus ditutup sebelum scale-up: (1) tidak ada reset password, (2) sesi JWT tidak bisa dicabut (ganti password/hapus user/demote role tidak berefek ke token lama), (3) rate limit bisa dilewati dengan memalsukan X-Forwarded-For. Plus akun admin default admin/admin123." />
            <InfoBox icon="check-circle" color="amber" text="Verdict: CONDITIONALLY PRODUCTION-READY — aman untuk volume kecil saat ini, wajib perbaiki F-01 s/d F-04 sebelum pertumbuhan user & penanganan pembayaran lebih besar." />
          </section>

          {/* s2 */}
          <section id="s2" className="mb-12 scroll-mt-6">
            <SectionHeader number="02" title="Scope & Methodology" />
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              Audit dilakukan terhadap <b>kode aktual</b> di direktori live <span className="font-mono text-xs">/home/ubuntu24/teacher-dashboard-next</span> (commit 68c3baf), bukan dokumentasi. Semua klaim diverifikasi dengan membaca source:
            </p>
            <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 mb-4">
              <li>Auth core: <span className="font-mono text-xs">src/lib/auth.ts</span>, <span className="font-mono text-xs">src/lib/rateLimit.ts</span>, <span className="font-mono text-xs">src/middleware.ts</span>, <span className="font-mono text-xs">src/lib/email.ts</span>, <span className="font-mono text-xs">src/lib/seed.ts</span></li>
              <li>Auth routes (7/7 dibaca penuh): login, register, logout, check, verify-email, resend-verification, me/password, me</li>
              <li>Admin routes: users (CRUD), settings, log, audit, backup, surat</li>
              <li>Entitlement: <span className="font-mono text-xs">src/lib/plans.ts</span>, <span className="font-mono text-xs">src/lib/plan-helpers.ts</span>, <span className="font-mono text-xs">src/lib/ownership.ts</span></li>
              <li>CRUD (pola IDOR): kelas, kelas/[id], siswa, nilai, nilai/[id], lckh, payments, payments/[id], payments/[id]/proof, upload, sheets, track</li>
              <li>Schema lengkap: <span className="font-mono text-xs">src/db/schema.ts</span> (23 tabel)</li>
            </ul>
            <InfoBox icon="flask" text="Verifikasi build: npx next build PASS. Test Playwright yang ada (tests/_security.spec.ts — 6 tes keamanan) tercatat, tidak dijalankan karena memodifikasi DB produksi (menambah user & payment test)." />
          </section>

          {/* s3 */}
          <section id="s3" className="mb-12 scroll-mt-6">
            <SectionHeader number="03" title="Findings at a Glance" />
            <TableWrap>
              <table className="w-full">
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Temuan</Th>
                    <Th>Severity</Th>
                    <Th>Lokasi</Th>
                  </tr>
                </thead>
                <tbody>
                  {findingsAtGlance.map(([id, t, sev, loc]) => (
                    <tr key={id}>
                      <Td className="font-mono text-xs font-bold text-[#0D7C66]">{id}</Td>
                      <Td>{t}</Td>
                      <Td><SeverityBadge level={sev} /></Td>
                      <Td className="font-mono text-xs text-gray-500">{loc}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </section>

          {/* s4-s13 */}
          <section id="s4" className="mb-12 scroll-mt-6">
            <SectionHeader number="04" title="Detail Temuan (1/3 — HIGH)" />
            {findings.filter((f) => ["f1", "f2", "f3", "f4"].includes(f.id)).map((f) => <FindingCard key={f.id} f={f} />)}
          </section>
          <section id="s8" className="mb-12 scroll-mt-6">
            <SectionHeader number="05" title="Detail Temuan (2/3 — MEDIUM)" />
            {findings.filter((f) => ["f5", "f6", "f7", "f8"].includes(f.id)).map((f) => <FindingCard key={f.id} f={f} />)}
          </section>
          <section id="s10" className="mb-12 scroll-mt-6">
            <SectionHeader number="06" title="Detail Temuan (3/3 — MEDIUM & LOW)" />
            {findings.filter((f) => ["f9", "f10", "f11", "f12"].includes(f.id)).map((f) => <FindingCard key={f.id} f={f} />)}
          </section>

          {/* s14 */}
          <section id="s14" className="mb-12 scroll-mt-6">
            <SectionHeader number="07" title="Area Verdicts" />
            <TableWrap>
              <table className="w-full">
                <thead>
                  <tr>
                    <Th>Area</Th>
                    <Th>Penilaian</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {areaVerdicts.map(([a, d, v]) => (
                    <tr key={a}>
                      <Td className="font-bold text-[#1A2332]">{a}</Td>
                      <Td>{d}</Td>
                      <Td><VerdictBadge v={v} /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </section>

          {/* s15 */}
          <section id="s15" className="mb-12 scroll-mt-6">
            <SectionHeader number="08" title="False Positives (Verified OK)" />
            <InfoBox icon="circle-check" color="amber" text="Dugaan masalah yang setelah verifikasi kode ternyata AMAN / dianggap acceptable — dipisahkan agar tidak mengacaukan prioritas." />
            <TableWrap>
              <table className="w-full">
                <thead>
                  <tr>
                    <Th>Dugaan</Th>
                    <Th>Hasil Verifikasi</Th>
                  </tr>
                </thead>
                <tbody>
                  {falsePositives.map(([d, v]) => (
                    <tr key={d}>
                      <Td className="align-top">{d}</Td>
                      <Td className="text-gray-600">{v}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </section>

          {/* s16 */}
          <section id="s16" className="mb-12 scroll-mt-6">
            <SectionHeader number="09" title="Final Checklist" />
            <TableWrap>
              <table className="w-full">
                <thead>
                  <tr>
                    <Th>Item</Th>
                    <Th>Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {finalChecklist.map(([item, st]) => (
                    <tr key={item}>
                      <Td>{item}</Td>
                      <Td><VerdictBadge v={st} /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          </section>

          {/* s17 */}
          <section id="s17" className="mb-12 scroll-mt-6">
            <SectionHeader number="10" title="Top 10 Prioritas" />
            <TableWrap>
              <table className="w-full">
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Prioritas</Th>
                    <Th>Severity</Th>
                  </tr>
                </thead>
                <tbody>
                  {top10.map(([n, item, sev]) => (
                    <tr key={n}>
                      <Td className="font-mono text-xs font-bold text-[#0D7C66]">{n}</Td>
                      <Td>{item}</Td>
                      <Td><SeverityBadge level={sev} /></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>

            <Collapsible title="Riskiest Files (untuk review mendalam berikutnya)" defaultOpen>
              <TableWrap>
                <table className="w-full">
                  <thead>
                    <tr>
                      <Th>File</Th>
                      <Th>Alasan</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {riskiestFiles.map(([f, r]) => (
                      <tr key={f}>
                        <Td className="font-mono text-xs align-top">{f}</Td>
                        <Td>{r}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            </Collapsible>

            <Collapsible title="Missing Tests (gap cakupan pengujian)" defaultOpen>
              <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 py-2">
                {missingTests.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </Collapsible>

            <div className="bg-[#1A2332] text-white rounded-xl p-5">
              <p className="text-sm font-bold mb-1">VERDICT</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                CONDITIONALLY PRODUCTION-READY — fondasi auth kuat dan sesuai pola best-practice untuk SaaS kecil (bcrypt, verifikasi email, SameSite=Strict, gating server-side, anti-IDOR). Wajib menutup F-01 (reset password), F-02 (revoke sesi), F-03 (rate limit anti-spoof) dan mengganti kredensial admin default sebelum memperluas basis pengguna atau menerima pembayaran dalam volume lebih besar.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
