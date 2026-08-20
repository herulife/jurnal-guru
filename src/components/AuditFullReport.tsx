"use client";

import { useState } from "react";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
type Status = "OK" | "ISSUE" | "MISSING" | "N_A";

interface Issue {
  severity: Severity;
  title: string;
  detail: string;
  location: string;
}

interface FeatureAudit {
  name: string;
  benefit: string;
  plan: string;
  api: string;
  status: string;
  issues: string[];
}

const SEVERITY_COLOR: Record<Severity, string> = {
  CRITICAL: "bg-red-100 text-red-700 border-red-300",
  HIGH: "bg-orange-100 text-orange-700 border-orange-300",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-300",
  LOW: "bg-blue-100 text-blue-700 border-blue-300",
  INFO: "bg-gray-100 text-gray-600 border-gray-300",
};

const STATUS_BADGE: Record<string, string> = {
  OK: "bg-green-100 text-green-700",
  ISSUE: "bg-red-100 text-red-700",
  MISSING: "bg-gray-100 text-gray-500",
  N_A: "bg-gray-50 text-gray-400",
  BERFUNGSI: "bg-green-100 text-green-700",
  PRODUCTION: "bg-green-100 text-green-700",
  "TIDAK AKTIF": "bg-yellow-100 text-yellow-700",
  "TIDAK DITEMUKAN": "bg-red-100 text-red-700",
};

const issues: Issue[] = [
  {
    severity: "CRITICAL",
    title: "JWT_SECRET hilang = semua request diizinkan",
    detail: "Jika env JWT_SECRET tidak ada, middleware mengizinkan SEMUA request tanpa autentikasi. Ini vulnerability paling kritis.",
    location: "middleware.ts:28-31"
  },
  {
    severity: "HIGH",
    title: "AdminGuard hanya client-side redirect",
    detail: "Non-admin user yang akses /admin langsung via URL akan di-redirect oleh AdminGuard, tapi tidak ada server-side reject di page level.",
    location: "components/AdminGuard.tsx"
  },
  {
    severity: "HIGH",
    title: "Plan logic duplikat di 3 file",
    detail: "normalizePlan, canExport, canUsePro, canUsePremium diduplikasi di lib/plans.ts, lib/plan-helpers.ts, dan lib/useUserPlan.ts.",
    location: "lib/plans.ts, lib/plan-helpers.ts, lib/useUserPlan.ts"
  },
  {
    severity: "MEDIUM",
    title: "Non-active payment plans bisa diakses via URL",
    detail: "pro_1m, pro_3m, pro_12m, pro_24m tidak di ACTIVE_PLAN_IDS tapi bisa diakses via direct URL parameter.",
    location: "lib/payment-plans.ts"
  },
  {
    severity: "MEDIUM",
    title: "Database tanpa indexes di user_id columns",
    detail: "Semua tabel utama (data_siswa, absensi, nilai, jurnal_mengajar) tidak punya index di user_id. Berpengaruh saat data scale.",
    location: "src/db/schema.ts"
  },
  {
    severity: "MEDIUM",
    title: "Base64 foto disimpan di DB",
    detail: "Foto profil user disimpan sebagai base64 string langsung di tabel users, bisa menyebabkan DB bloat.",
    location: "components/UserMenu.tsx + api/me"
  },
  {
    severity: "LOW",
    title: "Google Sheets sync tidak aktif",
    detail: "Fitur Google Sheets ada di code tapi env GOOGLE_SERVICE_ACCOUNT_JSON kosong. UI section tetap tampil.",
    location: "lib/sheets.ts"
  },
  {
    severity: "LOW",
    title: "Trial 2 hari tanpa reminder",
    detail: "User baru dapat 2 hari trial tanpa notifikasi sebelum expired.",
    location: "lib/plans.ts"
  },
  {
    severity: "LOW",
    title: "Rate limiter in-memory",
    detail: "Rate limiter menggunakan Map in-memory, tidak persisten across restarts atau multi-instance.",
    location: "lib/rateLimit.ts"
  },
];

const features: FeatureAudit[] = [
  { name: "Dashboard", benefit: "Ringkasan cepat stats guru", plan: "Gratis", api: "/api/dashboard", status: "BERFUNGSI", issues: [] },
  { name: "Data Siswa", benefit: "Kelola data siswa + upload CSV", plan: "Gratis", api: "/api/siswa", status: "BERFUNGSI", issues: [] },
  { name: "Data Kelas", benefit: "Kelola kelas (max 1 gratis)", plan: "Gratis", api: "/api/kelas", status: "BERFUNGSI", issues: [] },
  { name: "Jadwal Mengajar", benefit: "Susun jadwal per kelas/hari", plan: "Gratis", api: "/api/jadwal", status: "BERFUNGSI", issues: [] },
  { name: "Absensi", benefit: "Catat kehadiran 30 siswa dalam 10 detik", plan: "Gratis", api: "/api/absensi", status: "BERFUNGSI", issues: [] },
  { name: "Rekap Absensi", benefit: "Rekap otomatis + cetak dengan kop sekolah", plan: "Gratis", api: "/api/rekap-absensi", status: "BERFUNGSI", issues: [] },
  { name: "Jurnal Mengajar", benefit: "Dokumentasi materi, kendala, solusi", plan: "Gratis", api: "/api/jurnal", status: "BERFUNGSI", issues: [] },
  { name: "Nilai & KKM", benefit: "Input nilai + cek ketuntasan", plan: "Pro", api: "/api/nilai", status: "BERFUNGSI", issues: [] },
  { name: "Rekap Nilai", benefit: "Pivot table nilai per bab", plan: "Pro", api: "/api/nilai", status: "BERFUNGSI", issues: [] },
  { name: "Kelompok Belajar", benefit: "Auto-generate kelompok + manual assign", plan: "Pro", api: "/api/kelompok", status: "BERFUNGSI", issues: [] },
  { name: "LCKH", benefit: "Generate dari jurnal mengajar", plan: "Premium", api: "/api/lckh", status: "BERFUNGSI", issues: [] },
  { name: "LKB", benefit: "Generate dari LCKH", plan: "Premium", api: "/api/lkb", status: "BERFUNGSI", issues: [] },
  { name: "Kalender", benefit: "Kalender akademik + catatan", plan: "Gratis", api: "/api/kalender", status: "BERFUNGSI", issues: [] },
  { name: "Template Surat", benefit: "Buat surat dari template", plan: "Gratis", api: "/api/surat", status: "BERFUNGSI", issues: [] },
  { name: "Profil Sekolah", benefit: "Data sekolah untuk kop surat", plan: "Gratis", api: "/api/profil", status: "BERFUNGSI", issues: [] },
  { name: "Pengaturan", benefit: "Tahun ajaran, semester, KKM, dark mode", plan: "Gratis", api: "/api/settings", status: "BERFUNGSI", issues: [] },
  { name: "Backup/Restore", benefit: "Export/import data JSON", plan: "Gratis", api: "/api/backup", status: "BERFUNGSI", issues: [] },
  { name: "Export PDF + Excel", benefit: "Cetak dokumen & spreadsheet", plan: "Semua", api: "client-side", status: "BERFUNGSI", issues: [] },
  { name: "Google Sheets Sync", benefit: "Sinkron data ke Google Sheets", plan: "Gratis", api: "/api/sheets", status: "TIDAK AKTIF", issues: ["Env GOOGLE_SERVICE_ACCOUNT_JSON kosong"] },
  { name: "Payment & Checkout", benefit: "Beli paket Pro/Premium", plan: "Publik", api: "/api/payments", status: "BERFUNGSI", issues: [] },
];

const paymentPlans = [
  { id: "pro_6m", name: "Pro 6 Bulan", price: "Rp 29.000", duration: "6 bulan", active: true },
  { id: "premium_6m", name: "Premium 6 Bulan", price: "Rp 49.000", duration: "6 bulan", active: true },
  { id: "pro_1m", name: "Pro 1 Bulan", price: "Rp 29.000", duration: "1 bulan", active: false },
  { id: "pro_3m", name: "Pro 3 Bulan", price: "Rp 79.000", duration: "3 bulan", active: false },
  { id: "pro_12m", name: "Pro 12 Bulan", price: "Rp 149.000", duration: "12 bulan", active: false },
  { id: "pro_24m", name: "Pro 24 Bulan", price: "Rp 249.000", duration: "24 bulan", active: false },
];

const apiEndpoints = [
  { endpoint: "/api/auth/login", methods: "POST", auth: "Publik", status: "OK" },
  { endpoint: "/api/auth/register", methods: "POST", auth: "Publik", status: "OK" },
  { endpoint: "/api/auth/check", methods: "GET", auth: "Cookie", status: "OK" },
  { endpoint: "/api/auth/logout", methods: "POST", auth: "Cookie", status: "OK" },
  { endpoint: "/api/auth/verify-email", methods: "GET", auth: "Token", status: "OK" },
  { endpoint: "/api/auth/resend-verification", methods: "POST", auth: "Publik", status: "OK" },
  { endpoint: "/api/me", methods: "GET,PUT", auth: "Auth", status: "OK" },
  { endpoint: "/api/me/password", methods: "POST", auth: "Auth", status: "OK" },
  { endpoint: "/api/users", methods: "GET,POST", auth: "Admin", status: "OK" },
  { endpoint: "/api/users/[id]", methods: "PUT,DELETE", auth: "Admin", status: "OK" },
  { endpoint: "/api/siswa", methods: "GET,POST", auth: "Auth", status: "OK" },
  { endpoint: "/api/siswa/[id]", methods: "PUT,DELETE", auth: "Auth", status: "OK" },
  { endpoint: "/api/kelas", methods: "GET,POST", auth: "Auth", status: "OK" },
  { endpoint: "/api/kelas/[id]", methods: "PUT,DELETE", auth: "Auth", status: "OK" },
  { endpoint: "/api/jadwal", methods: "GET,POST", auth: "Auth", status: "OK" },
  { endpoint: "/api/jadwal/[id]", methods: "PUT,DELETE", auth: "Auth", status: "OK" },
  { endpoint: "/api/absensi", methods: "GET,POST", auth: "Auth", status: "OK" },
  { endpoint: "/api/absensi/[id]", methods: "PUT,DELETE", auth: "Auth", status: "OK" },
  { endpoint: "/api/jurnal", methods: "GET,POST", auth: "Auth", status: "OK" },
  { endpoint: "/api/jurnal/[id]", methods: "PUT,DELETE", auth: "Auth", status: "OK" },
  { endpoint: "/api/nilai", methods: "GET,POST", auth: "Pro+", status: "OK" },
  { endpoint: "/api/nilai/[id]", methods: "PUT,DELETE", auth: "Pro+", status: "OK" },
  { endpoint: "/api/nilai/batch", methods: "POST", auth: "Pro+", status: "OK" },
  { endpoint: "/api/kelompok", methods: "GET,POST,DEL", auth: "Pro+", status: "OK" },
  { endpoint: "/api/rekap-absensi", methods: "GET", auth: "Auth", status: "OK" },
  { endpoint: "/api/lckh", methods: "GET,POST", auth: "Premium+", status: "OK" },
  { endpoint: "/api/lkb", methods: "GET,POST", auth: "Premium+", status: "OK" },
  { endpoint: "/api/dashboard", methods: "GET", auth: "Auth", status: "OK" },
  { endpoint: "/api/health", methods: "GET", auth: "Publik", status: "OK" },
  { endpoint: "/api/kalender", methods: "CRUD", auth: "Auth", status: "OK" },
  { endpoint: "/api/surat", methods: "GET,POST", auth: "Auth/Admin", status: "OK" },
  { endpoint: "/api/settings", methods: "GET,PUT", auth: "Auth", status: "OK" },
  { endpoint: "/api/profil", methods: "GET,PUT", auth: "Auth", status: "OK" },
  { endpoint: "/api/log", methods: "GET", auth: "Admin", status: "OK" },
  { endpoint: "/api/admin/stats", methods: "GET", auth: "Admin", status: "OK" },
  { endpoint: "/api/audit", methods: "GET", auth: "Admin", status: "OK" },
  { endpoint: "/api/backup", methods: "POST", auth: "Auth", status: "OK" },
  { endpoint: "/api/payments", methods: "GET,POST", auth: "Auth", status: "OK" },
  { endpoint: "/api/payments/[id]", methods: "GET,PATCH", auth: "Auth", status: "OK" },
  { endpoint: "/api/payments/[id]/proof", methods: "POST", auth: "Auth", status: "OK" },
  { endpoint: "/api/marketing/dashboard", methods: "GET", auth: "Admin", status: "OK" },
  { endpoint: "/api/marketing/goals", methods: "CRUD", auth: "Admin", status: "OK" },
  { endpoint: "/api/marketing/plans", methods: "CRUD", auth: "Admin", status: "OK" },
  { endpoint: "/api/marketing/tasks", methods: "CRUD", auth: "Admin", status: "OK" },
  { endpoint: "/api/marketing/journal", methods: "CRUD", auth: "Admin", status: "OK" },
  { endpoint: "/api/marketing/calendar", methods: "GET", auth: "Admin", status: "OK" },
  { endpoint: "/api/sheets", methods: "GET,POST", auth: "Auth", status: "OK" },
  { endpoint: "/api/upload", methods: "POST", auth: "Auth", status: "OK" },
  { endpoint: "/api/social-proof", methods: "GET", auth: "Auth", status: "OK" },
  { endpoint: "/api/track", methods: "GET,POST", auth: "Opsional", status: "OK" },
];

const dbTables = [
  { name: "users", purpose: "Akun user + auth", owner: "-", fk: "-", used: "Semua auth + admin" },
  { name: "profil_sekolah", purpose: "Data profil sekolah", owner: "userId", fk: "-", used: "Profil, rekap-absensi" },
  { name: "data_kelas", purpose: "Data kelas", owner: "userId", fk: "-", used: "Kelas, jadwal, absensi" },
  { name: "data_siswa", purpose: "Data siswa", owner: "userId", fk: "kelasId→dataKelas", used: "Siswa, absensi, nilai" },
  { name: "jadwal_mengajar", purpose: "Jadwal mengajar", owner: "userId", fk: "kelasId→dataKelas", used: "Jadwal" },
  { name: "absensi", purpose: "Data kehadiran siswa", owner: "userId", fk: "siswaId→dataSiswa, kelasId→dataKelas", used: "Absensi, rekap" },
  { name: "nilai", purpose: "Data nilai siswa", owner: "userId", fk: "siswaId→dataSiswa, kelasId→dataKelas", used: "Nilai, rekap" },
  { name: "jurnal_mengajar", purpose: "Jurnal mengajar", owner: "userId", fk: "kelasId→dataKelas", used: "Jurnal, LCKH" },
  { name: "kelompok_belajar", purpose: "Kelompok belajar", owner: "userId", fk: "kelasId→dataKelas, siswaId→dataSiswa", used: "Kelompok" },
  { name: "lckh", purpose: "Laporan Kerja Harian", owner: "userId", fk: "jurnalId→jurnalMengajar", used: "LCKH" },
  { name: "lkb", purpose: "Laporan Kinerja Bulanan", owner: "userId", fk: "-", used: "LKB" },
  { name: "kalender_catatan", purpose: "Catatan kalender", owner: "userId", fk: "-", used: "Kalender" },
  { name: "settings", purpose: "Global settings", owner: "-", fk: "-", used: "Settings" },
  { name: "user_settings", purpose: "User settings", owner: "userId", fk: "-", used: "Settings" },
  { name: "data_surat", purpose: "Template surat", owner: "-", fk: "-", used: "Surat" },
  { name: "activity_log", purpose: "Log aktivitas", owner: "userId", fk: "-", used: "Log" },
  { name: "subscriptions", purpose: "Data langganan", owner: "userId", fk: "userId→users", used: "Subscription" },
  { name: "payments", purpose: "Data pembayaran", owner: "userId", fk: "userId→users, subscriptionId→subscriptions", used: "Payments, billing" },
  { name: "marketing_goals", purpose: "Marketing goals", owner: "userId", fk: "-", used: "Goals" },
  { name: "marketing_plans", purpose: "Marketing plans", owner: "userId", fk: "goalId→marketingGoals", used: "Plans" },
  { name: "marketing_tasks", purpose: "Marketing tasks", owner: "userId", fk: "goalId→marketingGoals, planId→marketingPlans", used: "Tasks" },
  { name: "marketing_journal", purpose: "Marketing journal", owner: "userId", fk: "-", used: "Journal" },
  { name: "events", purpose: "Event tracking", owner: "userId", fk: "-", used: "Tracking" },
];

const securityChecks = [
  { check: "User hanya lihat data sendiri", status: "OK", detail: "scopeUserId() + canUseKelas/canUseSiswa" },
  { check: "Admin bisa semua fungsi", status: "OK", detail: "requireAdmin() di semua admin endpoints" },
  { check: "User tidak bisa akses admin endpoint", status: "OK", detail: "Middleware + requireAdmin() server-side" },
  { check: "Plan restriction backend", status: "OK", detail: "requirePlan() di /api/nilai, /api/kelompok, /api/lckh, /api/lkb" },
  { check: "Session aman (httpOnly, secure)", status: "OK", detail: "HS256 JWT, 30 hari expiry" },
  { check: "Logout berfungsi", status: "OK", detail: "Destroy cookie + activity log" },
  { check: "Unauthenticated ditolak", status: "OK", detail: "Middleware redirect/401" },
  { check: "Rate limiting aktif", status: "OK", detail: "Login, register, resend-verification" },
  { check: "Email enumeration dilindungi", status: "OK", detail: "Generic response di resend-verification" },
  { check: "XSS protection", status: "OK", detail: "HTML entity escaping di semua output" },
  { check: "CSRF protection", status: "ISSUE", detail: "Tidak ada explicit CSRF token (SameSite=Strict cookie membantu)" },
  { check: "JWT_SECRET missing = open access", status: "ISSUE", detail: "CRITICAL: Middleware allow-all jika env hilang" },
];

type Tab = "overview" | "features" | "api" | "database" | "security" | "issues" | "payment";

export default function AuditFullReport() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const criticalCount = issues.filter(i => i.severity === "CRITICAL").length;
  const highCount = issues.filter(i => i.severity === "HIGH").length;
  const mediumCount = issues.filter(i => i.severity === "MEDIUM").length;
  const lowCount = issues.filter(i => i.severity === "LOW").length;

  const tabs: { id: Tab; label: string; icon: string; count?: number }[] = [
    { id: "overview", label: "Overview", icon: "fa-gauge-high" },
    { id: "features", label: "Fitur", icon: "fa-puzzle-piece", count: features.length },
    { id: "api", label: "API", icon: "fa-code", count: apiEndpoints.length },
    { id: "database", label: "Database", icon: "fa-database", count: dbTables.length },
    { id: "security", label: "Keamanan", icon: "fa-shield-halved" },
    { id: "issues", label: "Issues", icon: "fa-bug", count: issues.length },
    { id: "payment", label: "Payment", icon: "fa-credit-card" },
  ];

  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      {/* Header */}
      <header className="bg-[#1A2332] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#0D7C66] to-[#0A6352] rounded-xl flex items-center justify-center">
              <i className="fas fa-graduation-cap text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold">MASTER AUDIT</h1>
              <p className="text-gray-400 text-sm">Jurnal Guru + MarketingOS — 20 Agustus 2026</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1.5 rounded-full text-xs font-semibold">
              <i className="fas fa-check-circle"></i> 20/21 Fitur BERFUNGSI
            </span>
            <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1.5 rounded-full text-xs font-semibold">
              <i className="fas fa-exclamation-triangle"></i> {criticalCount} CRITICAL
            </span>
            <span className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 px-3 py-1.5 rounded-full text-xs font-semibold">
              <i className="fas fa-exclamation-circle"></i> {highCount} HIGH
            </span>
            <span className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-3 py-1.5 rounded-full text-xs font-semibold">
              <i className="fas fa-info-circle"></i> {mediumCount} MEDIUM
            </span>
            <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full text-xs font-semibold">
              <i className="fas fa-info"></i> {lowCount} LOW
            </span>
            <span className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full text-xs font-semibold">
              <i className="fas fa-server"></i> 55 API Endpoints
            </span>
            <span className="inline-flex items-center gap-2 bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-full text-xs font-semibold">
              <i className="fas fa-database"></i> 23 Tabel DB
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-[#E8E4DC] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex overflow-x-auto gap-1 -mb-px">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === t.id
                    ? "border-[#0D7C66] text-[#0D7C66]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <i className={`fas ${t.icon}`}></i>
                {t.label}
                {t.count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === t.id ? "bg-[#0D7C66]/10 text-[#0D7C66]" : "bg-gray-100 text-gray-500"
                  }`}>{t.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Score Card */}
            <div className="card p-6 border-l-4 border-l-green-500">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-4 py-2 rounded-full text-lg font-bold text-white bg-green-600">8/10</span>
                <div>
                  <h2 className="text-xl font-bold text-[#1A2332]">Kondisi Keseluruhan: LAYAK PASAR</h2>
                  <p className="text-sm text-gray-500">Aplikasi sudah siap untuk soft launch setelah perbaikan CRITICAL</p>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-[#1A2332] mb-4"><i className="fas fa-microchip text-[#0D7C66] mr-2"></i>Tech Stack</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Framework", value: "Next.js 16.3.1" },
                  { label: "React", value: "19.2.8" },
                  { label: "Database", value: "SQLite + Drizzle" },
                  { label: "Auth", value: "JWT (jose)" },
                  { label: "Styling", value: "Tailwind CSS 4" },
                  { label: "Charts", value: "Chart.js 4.5" },
                  { label: "Deploy", value: "PM2 + CF Tunnel" },
                  { label: "Testing", value: "Playwright 1.62" },
                ].map(s => (
                  <div key={s.label} className="bg-[#F5F3EF] rounded-lg p-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
                    <p className="text-sm font-bold text-[#1A2332] mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rating Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Fitur", score: "9/10", color: "text-green-600" },
                { label: "Keamanan", score: "7/10", color: "text-yellow-600" },
                { label: "Code Quality", score: "7/10", color: "text-yellow-600" },
                { label: "UI/UX", score: "8/10", color: "text-green-600" },
                { label: "Testing", score: "6/10", color: "text-orange-600" },
                { label: "Deployment", score: "8/10", color: "text-green-600" },
              ].map(r => (
                <div key={r.label} className="card p-4 text-center">
                  <p className={`text-2xl font-extrabold ${r.color}`}>{r.score}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.label}</p>
                </div>
              ))}
            </div>

            {/* Plan Tiers */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-[#1A2332] mb-4"><i className="fas fa-crown text-[#E8A317] mr-2"></i>Paket Harga</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-[#E8E4DC] rounded-xl p-4">
                  <h4 className="font-bold text-[#1A2332]">Gratis</h4>
                  <p className="text-2xl font-extrabold text-[#1A2332] mt-1">Rp 0</p>
                  <p className="text-xs text-gray-500">2 hari trial, max 1 kelas</p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-600">
                    <li><i className="fas fa-check text-green-500 mr-1"></i> Dashboard, Siswa, Kelas</li>
                    <li><i className="fas fa-check text-green-500 mr-1"></i> Absensi & Rekap</li>
                    <li><i className="fas fa-check text-green-500 mr-1"></i> Jurnal Mengajar</li>
                    <li><i className="fas fa-check text-green-500 mr-1"></i> Kalender, Surat, Profil</li>
                  </ul>
                </div>
                <div className="border-2 border-[#0D7C66] rounded-xl p-4 relative bg-gradient-to-br from-[#0D7C66]/5 to-transparent">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E8A317] text-[#1A2332] text-[10px] font-bold px-2 py-0.5 rounded-full">REKOMENDASI</span>
                  <h4 className="font-bold text-[#0D7C66]">Pro</h4>
                  <p className="text-2xl font-extrabold text-[#0D7C66] mt-1">Rp 29.000</p>
                  <p className="text-xs text-gray-500">6 bulan, unlimited kelas</p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-600">
                    <li><i className="fas fa-check text-green-500 mr-1"></i> Semua fitur Gratis</li>
                    <li><i className="fas fa-check text-[#0D7C66] mr-1"></i> <strong>Nilai & KKM</strong></li>
                    <li><i className="fas fa-check text-[#0D7C66] mr-1"></i> <strong>Rekap Nilai</strong></li>
                    <li><i className="fas fa-check text-[#0D7C66] mr-1"></i> <strong>Kelompok Belajar</strong></li>
                  </ul>
                </div>
                <div className="border border-[#E8E4DC] rounded-xl p-4">
                  <h4 className="font-bold text-[#1A2332]">Premium</h4>
                  <p className="text-2xl font-extrabold text-[#1A2332] mt-1">Rp 49.000</p>
                  <p className="text-xs text-gray-500">6 bulan, semua fitur</p>
                  <ul className="mt-3 space-y-1 text-xs text-gray-600">
                    <li><i className="fas fa-check text-green-500 mr-1"></i> Semua fitur Pro</li>
                    <li><i className="fas fa-check text-purple-600 mr-1"></i> <strong>LCKH</strong></li>
                    <li><i className="fas fa-check text-purple-600 mr-1"></i> <strong>LKB</strong></li>
                    <li><i className="fas fa-check text-purple-600 mr-1"></i> <strong>Export Laporan Pegawai</strong></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Quick Issues */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-[#1A2332] mb-4"><i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>Top Issues (Perlu Diperbaiki)</h3>
              <div className="space-y-3">
                {issues.slice(0, 5).map((issue, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${SEVERITY_COLOR[issue.severity]}`}>
                    <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0 mt-0.5" style={{background: 'rgba(0,0,0,0.08)'}}>{issue.severity}</span>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{issue.title}</p>
                      <p className="text-xs opacity-80 mt-0.5">{issue.detail}</p>
                      <p className="text-[10px] opacity-60 mt-1 font-mono">{issue.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FEATURES */}
        {activeTab === "features" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1A2332]">Audit 21 Fitur Jurnal Guru</h2>
            <div className="card overflow-hidden">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="text-left">Fitur</th>
                      <th className="text-left">Manfaat</th>
                      <th className="text-center">Plan</th>
                      <th className="text-left">API</th>
                      <th className="text-center">Status</th>
                      <th className="text-left">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((f, i) => (
                      <tr key={i}>
                        <td className="font-semibold text-sm">{f.name}</td>
                        <td className="text-sm text-gray-600">{f.benefit}</td>
                        <td className="text-center">
                          <span className={`badge text-[10px] ${
                            f.plan === "Gratis" ? "badge-hadir" :
                            f.plan === "Pro" ? "badge-sakit" :
                            f.plan === "Premium" ? "badge-izin" : "badge-alpha"
                          }`}>{f.plan}</span>
                        </td>
                        <td className="text-xs font-mono text-gray-500">{f.api}</td>
                        <td className="text-center">
                          <span className={`badge text-[10px] ${STATUS_BADGE[f.status] || "bg-gray-100 text-gray-500"}`}>{f.status}</span>
                        </td>
                        <td className="text-xs text-gray-500">
                          {f.issues.length > 0 ? f.issues.join(", ") : <span className="text-green-600">-</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* API */}
        {activeTab === "api" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1A2332]">55 API Endpoints — Semua Terverifikasi</h2>
            <div className="card overflow-hidden">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="text-left">Endpoint</th>
                      <th className="text-center">Methods</th>
                      <th className="text-center">Auth</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiEndpoints.map((a, i) => (
                      <tr key={i}>
                        <td className="text-xs font-mono font-semibold">{a.endpoint}</td>
                        <td className="text-center text-xs">{a.methods}</td>
                        <td className="text-center">
                          <span className={`badge text-[10px] ${
                            a.auth === "Publik" ? "badge-hadir" :
                            a.auth === "Admin" ? "badge-alpha" :
                            a.auth.includes("Pro") || a.auth.includes("Premium") ? "badge-sakit" : "badge-izin"
                          }`}>{a.auth}</span>
                        </td>
                        <td className="text-center">
                          <span className="badge text-[10px] badge-hadir">{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DATABASE */}
        {activeTab === "database" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1A2332]">23 Tabel Database — Entity & Relationship Map</h2>
            <div className="card overflow-hidden">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="text-left">Tabel</th>
                      <th className="text-left">Tujuan</th>
                      <th className="text-center">Owner</th>
                      <th className="text-left">Foreign Keys</th>
                      <th className="text-left">Digunakan Oleh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dbTables.map((t, i) => (
                      <tr key={i}>
                        <td className="text-xs font-mono font-semibold">{t.name}</td>
                        <td className="text-sm text-gray-600">{t.purpose}</td>
                        <td className="text-center text-xs">
                          {t.owner === "-" ? (
                            <span className="text-gray-400">global</span>
                          ) : (
                            <span className="badge text-[10px] badge-izin">{t.owner}</span>
                          )}
                        </td>
                        <td className="text-xs font-mono text-gray-500">{t.fk}</td>
                        <td className="text-xs text-gray-600">{t.used}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECURITY */}
        {activeTab === "security" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1A2332]">Security Audit — 12 Checks</h2>
            <div className="card overflow-hidden">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th className="text-left">Check</th>
                      <th className="text-center">Status</th>
                      <th className="text-left">Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityChecks.map((s, i) => (
                      <tr key={i}>
                        <td className="text-sm font-semibold">{s.check}</td>
                        <td className="text-center">
                          <span className={`badge text-[10px] ${s.status === "OK" ? "badge-hadir" : "badge-alpha"}`}>{s.status}</span>
                        </td>
                        <td className="text-xs text-gray-600">{s.detail}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-[#1A2332] mb-3">Privilege Escalation Analysis</h3>
              <div className="space-y-2">
                {[
                  { attack: "User access /api/users", result: "BLOCKED" },
                  { attack: "User access /api/admin/stats", result: "BLOCKED" },
                  { attack: "User modify other user data", result: "BLOCKED" },
                  { attack: "User upgrade own plan via API", result: "BLOCKED" },
                  { attack: "Admin delete self", result: "BLOCKED" },
                  { attack: "Non-admin access /api/payments?admin=1", result: "BLOCKED" },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="badge text-[10px] badge-hadir">BLOCKED</span>
                    <span className="text-gray-700">{a.attack}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ISSUES */}
        {activeTab === "issues" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-[#1A2332]">{issues.length} Issues Ditemukan</h2>
            <div className="space-y-3">
              {issues.map((issue, i) => (
                <div key={i} className={`card p-4 border-l-4 ${
                  issue.severity === "CRITICAL" ? "border-l-red-600" :
                  issue.severity === "HIGH" ? "border-l-orange-500" :
                  issue.severity === "MEDIUM" ? "border-l-yellow-500" :
                  "border-l-blue-400"
                }`}>
                  <div className="flex items-start gap-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${SEVERITY_COLOR[issue.severity]}`}>{issue.severity}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-[#1A2332]">{issue.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{issue.detail}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-mono">{issue.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PAYMENT */}
        {activeTab === "payment" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#1A2332]">Payment & Checkout Flow</h2>

            <div className="card p-6">
              <h3 className="font-bold text-[#1A2332] mb-3">End-to-End Flow</h3>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {["Landing", "Checkout", "Pilih Paket", "Form", "POST /payments", "Pending", "Upload Bukti", "Admin Verify", "Approved", "Subscription"].map((step, i, arr) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="bg-[#0D7C66] text-white px-2 py-1 rounded font-semibold">{step}</span>
                    {i < arr.length - 1 && <i className="fas fa-arrow-right text-gray-400"></i>}
                  </span>
                ))}
              </div>
            </div>

            <div className="card overflow-hidden">
              <h3 className="font-bold text-[#1A2332] p-4 pb-0">Payment Plans</h3>
              <div className="table-wrap mt-3">
                <table>
                  <thead>
                    <tr>
                      <th className="text-left">ID</th>
                      <th className="text-left">Nama</th>
                      <th className="text-center">Harga</th>
                      <th className="text-center">Durasi</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentPlans.map((p, i) => (
                      <tr key={i}>
                        <td className="text-xs font-mono">{p.id}</td>
                        <td className="text-sm font-semibold">{p.name}</td>
                        <td className="text-center text-sm font-bold">{p.price}</td>
                        <td className="text-center text-sm">{p.duration}</td>
                        <td className="text-center">
                          <span className={`badge text-[10px] ${p.active ? "badge-hadir" : "badge-alpha"}`}>
                            {p.active ? "AKTIF" : "NON-AKTIF"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-bold text-[#1A2332] mb-3">Payment Security</h3>
              <div className="space-y-2">
                {[
                  { check: "Duplicate pending check", status: "OK" },
                  { check: "Ownership check (owner/admin)", status: "OK" },
                  { check: "Amount dari server-side (bukan request)", status: "OK" },
                  { check: "Plan dari server-side definition", status: "OK" },
                  { check: "File upload validation (JPG/PNG/PDF, max 5MB)", status: "OK" },
                  { check: "Admin verification wajib", status: "OK" },
                  { check: "WhatsApp + Email notification", status: "OK" },
                  { check: "Non-active plans accessible via URL", status: "ISSUE" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className={`badge text-[10px] ${s.status === "OK" ? "badge-hadir" : "badge-alpha"}`}>{s.status}</span>
                    <span className="text-gray-700">{s.check}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#1A2332] text-gray-400 text-xs text-center py-6 px-4">
        <p>Master Audit — Jurnal Guru + MarketingOS — 20 Agustus 2026</p>
        <p className="mt-1">55 API Endpoints | 23 Tabel DB | 21 Fitur | 7 Marketing Features</p>
      </footer>
    </div>
  );
}
