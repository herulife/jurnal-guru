import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash").notNull(),
  namaLengkap: text("nama_lengkap").notNull(),
  role: text("role").notNull().default("free"),
  plan: text("plan").notNull().default("gratis"),
  planExpires: text("plan_expires"),
  googleSheetsUrl: text("google_sheets_url"),
  foto: text("foto"),
  emailVerified: integer("email_verified").default(1),
  verifyToken: text("verify_token"),
  verifyTokenHash: text("verify_token_hash"),
  verifyTokenExpires: text("verify_token_expires"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});

export const profilSekolah = sqliteTable("profil_sekolah", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  namaSekolah: text("nama_sekolah"),
  alamat: text("alamat"),
  npsn: text("npsn"),
  kota: text("kota"),
  provinsi: text("provinsi"),
  telepon: text("telepon"),
  kepalaSekolah: text("kepala_sekolah"),
  nipKepsek: text("nip_kepsek"),
  namaGuru: text("nama_guru"),
  nipGuru: text("nip_guru"),
  logoUrl: text("logo_url"),
}, (t) => [index("profil_user_idx").on(t.userId)]);

export const dataKelas = sqliteTable("data_kelas", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  namaKelas: text("nama_kelas").notNull(),
  tingkat: integer("tingkat").notNull(),
  jurusan: text("jurusan"),
  tahunAjaran: text("tahun_ajaran"),
  waliKelas: text("wali_kelas"),
}, (t) => [index("kelas_user_idx").on(t.userId)]);

export const dataSiswa = sqliteTable("data_siswa", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  nis: text("nis").notNull(),
  nisn: text("nisn"),
  namaSiswa: text("nama_siswa").notNull(),
  jenisKelamin: text("jenis_kelamin").notNull().default("L"),
  kelasId: text("kelas_id").references(() => dataKelas.id),
  alamat: text("alamat"),
  telepon: text("telepon"),
  email: text("email"),
  namaOrtu: text("nama_ortu"),
}, (t) => [index("siswa_user_idx").on(t.userId), index("siswa_kelas_idx").on(t.kelasId)]);

export const jadwalMengajar = sqliteTable("jadwal_mengajar", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  kelasId: text("kelas_id").references(() => dataKelas.id),
  mataPelajaran: text("mata_pelajaran").notNull(),
  hari: text("hari").notNull(),
  jamMulai: text("jam_mulai"),
  jamSelesai: text("jam_selesai"),
  semester: text("semester"),
  ruangan: text("ruangan"),
}, (t) => [index("jadwal_user_idx").on(t.userId), index("jadwal_kelas_idx").on(t.kelasId)]);

export const absensi = sqliteTable("absensi", {
  id: text("id").primaryKey(),
  tanggal: text("tanggal").notNull(),
  siswaId: text("siswa_id").references(() => dataSiswa.id),
  kelasId: text("kelas_id").references(() => dataKelas.id),
  mataPelajaran: text("mata_pelajaran"),
  status: text("status").notNull().default("Hadir"),
  keterangan: text("keterangan"),
  userId: text("user_id"),
}, (t) => [index("absensi_user_idx").on(t.userId), index("absensi_siswa_idx").on(t.siswaId), index("absensi_kelas_idx").on(t.kelasId)]);

export const nilai = sqliteTable("nilai", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  tanggal: text("tanggal"),
  siswaId: text("siswa_id").references(() => dataSiswa.id),
  kelasId: text("kelas_id").references(() => dataKelas.id),
  mataPelajaran: text("mata_pelajaran"),
  kategori: text("kategori"),
  bab: text("bab"),
  tujuanPembelajaran: text("tujuan_pembelajaran"),
  bentukPenugasan: text("bentuk_penugasan"),
  nilai: real("nilai").default(0),
  kkm: real("kkm").default(75),
  remedial: text("remedial"),
}, (t) => [index("nilai_user_idx").on(t.userId), index("nilai_siswa_idx").on(t.siswaId), index("nilai_kelas_idx").on(t.kelasId)]);

export const jurnalMengajar = sqliteTable("jurnal_mengajar", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  tanggal: text("tanggal"),
  kelasId: text("kelas_id").references(() => dataKelas.id),
  mataPelajaran: text("mata_pelajaran"),
  jamKe: text("jam_ke"),
  materi: text("materi"),
  deskripsi: text("deskripsi"),
  kendala: text("kendala"),
  solusi: text("solusi"),
  kehadiranSiswa: text("kehadiran_siswa"),
  catatan: text("catatan"),
}, (t) => [index("jurnal_user_idx").on(t.userId), index("jurnal_kelas_idx").on(t.kelasId)]);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value"),
});

export const userSettings = sqliteTable("user_settings", {
  userId: text("user_id").notNull(),
  key: text("key").notNull(),
  value: text("value"),
});

export const dataSurat = sqliteTable("data_surat", {
  id: text("id").primaryKey(),
  judul: text("judul").notNull(),
  jenis: text("jenis").notNull(),
  tujuan: text("tujuan"),
  template: text("template").notNull(),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
});

export const kelompokBelajar = sqliteTable("kelompok_belajar", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  kelasId: text("kelas_id").references(() => dataKelas.id),
  kelompok: text("kelompok").notNull(),
  no: text("no"),
  siswaId: text("siswa_id").references(() => dataSiswa.id),
  nis: text("nis"),
  namaSiswa: text("nama_siswa"),
  jenisKelamin: text("jenis_kelamin"),
  kelasAsal: text("kelas_asal"),
  nilai: text("nilai"),
}, (t) => [index("kelompok_user_idx").on(t.userId)]);

export const lckh = sqliteTable("lckh", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  no: text("no"),
  kegiatan: text("kegiatan"),
  pekerjaan: text("pekerjaan"),
  tanggal: text("tanggal"),
  jurnalId: text("jurnal_id"),
}, (t) => [index("lckh_user_idx").on(t.userId)]);

export const kalenderCatatan = sqliteTable("kalender_catatan", {
  id: text("id").primaryKey(),
  tanggal: text("tanggal").notNull(),
  isi: text("isi").notNull(),
  userId: text("user_id"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
}, (t) => [index("kalender_user_idx").on(t.userId)]);

export const lkb = sqliteTable("lkb", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  no: text("no"),
  uraianTugas: text("uraian_tugas"),
  vol: real("vol").default(0),
  buktiDokumen: text("bukti_dokumen"),
  bulan: text("bulan"),
  tahun: text("tahun"),
}, (t) => [index("lkb_user_idx").on(t.userId)]);

export const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey(),
  timestamp: text("timestamp").notNull(),
  userId: text("user_id"),
  action: text("action"),
  description: text("description"),
}, (t) => [index("log_user_idx").on(t.userId)]);

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  planId: text("plan_id").notNull(),
  status: text("status").notNull().default("active"),
  startedAt: text("started_at").notNull(),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
}, (t) => [index("subs_user_idx").on(t.userId)]);

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  subscriptionId: text("subscription_id").references(() => subscriptions.id),
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("IDR"),
  status: text("status").notNull().default("pending"),
  paymentMethod: text("payment_method"),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  proofUrl: text("proof_url"),
  notes: text("notes"),
  verifiedAt: text("verified_at"),
  verifiedBy: text("verified_by"),
  whatsapp: text("whatsapp"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
}, (t) => [index("pay_user_idx").on(t.userId)]);

export const marketingGoals = sqliteTable("marketing_goals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  metric: text("metric"),
  targetValue: real("target_value").default(0),
  currentValue: real("current_value").default(0),
  period: text("period"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  status: text("status").notNull().default("ON_TRACK"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
}, (t) => [index("mgoals_user_idx").on(t.userId)]);

export const marketingPlans = sqliteTable("marketing_plans", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  objective: text("objective"),
  target: text("target"),
  period: text("period"),
  strategy: text("strategy"),
  channels: text("channels"),
  kpi: text("kpi"),
  status: text("status").notNull().default("ACTIVE"),
  goalId: text("goal_id").references(() => marketingGoals.id),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
}, (t) => [index("mplans_user_idx").on(t.userId)]);

export const marketingTasks = sqliteTable("marketing_tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("TODO"),
  priority: text("priority").notNull().default("MEDIUM"),
  dueDate: text("due_date"),
  startDate: text("start_date"),
  goalId: text("goal_id").references(() => marketingGoals.id),
  planId: text("plan_id").references(() => marketingPlans.id),
  campaignId: text("campaign_id"),
  leadId: text("lead_id"),
  assignedTo: text("assigned_to"),
  recurring: text("recurring"),
  notes: text("notes"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
}, (t) => [index("mtasks_user_idx").on(t.userId)]);

export const marketingJournal = sqliteTable("marketing_journal", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: text("date").notNull(),
  target: text("target"),
  activities: text("activities"),
  result: text("result"),
  problems: text("problems"),
  learning: text("learning"),
  nextAction: text("next_action"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
}, (t) => [index("mjournal_user_idx").on(t.userId)]);

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  event: text("event").notNull(),
  timestamp: text("timestamp").notNull(),
  userId: text("user_id"),
  meta: text("meta"),
}, (t) => [index("events_user_idx").on(t.userId)]);
