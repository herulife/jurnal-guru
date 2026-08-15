import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  passwordHash: text("password_hash").notNull(),
  namaLengkap: text("nama_lengkap").notNull(),
  role: text("role").notNull().default("admin"),
  plan: text("plan").notNull().default("gratis"),
  planExpires: text("plan_expires"),
  googleSheetsUrl: text("google_sheets_url"),
  foto: text("foto"),
  emailVerified: integer("email_verified").default(1),
  verifyToken: text("verify_token"),
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
});

export const dataKelas = sqliteTable("data_kelas", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  namaKelas: text("nama_kelas").notNull(),
  tingkat: integer("tingkat").notNull(),
  jurusan: text("jurusan"),
  tahunAjaran: text("tahun_ajaran"),
  waliKelas: text("wali_kelas"),
});

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
});

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
});

export const absensi = sqliteTable("absensi", {
  id: text("id").primaryKey(),
  tanggal: text("tanggal").notNull(),
  siswaId: text("siswa_id").references(() => dataSiswa.id),
  kelasId: text("kelas_id").references(() => dataKelas.id),
  mataPelajaran: text("mata_pelajaran"),
  status: text("status").notNull().default("Hadir"),
  keterangan: text("keterangan"),
  userId: text("user_id"),
});

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
});

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
});

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
});

export const lckh = sqliteTable("lckh", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  no: text("no"),
  kegiatan: text("kegiatan"),
  pekerjaan: text("pekerjaan"),
  tanggal: text("tanggal"),
  jurnalId: text("jurnal_id"),
});

export const kalenderCatatan = sqliteTable("kalender_catatan", {
  id: text("id").primaryKey(),
  tanggal: text("tanggal").notNull(),
  isi: text("isi").notNull(),
  userId: text("user_id"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
});

export const lkb = sqliteTable("lkb", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  no: text("no"),
  uraianTugas: text("uraian_tugas"),
  vol: real("vol").default(0),
  buktiDokumen: text("bukti_dokumen"),
  bulan: text("bulan"),
  tahun: text("tahun"),
});

export const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey(),
  timestamp: text("timestamp").notNull(),
  userId: text("user_id"),
  action: text("action"),
  description: text("description"),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  planId: text("plan_id").notNull(),
  status: text("status").notNull().default("active"),
  startedAt: text("started_at").notNull(),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});

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
  createdAt: text("created_at").notNull().default("datetime('now')"),
});
