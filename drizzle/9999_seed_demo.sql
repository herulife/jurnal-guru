-- Seed DEMO Jurnal Guru (9 Agustus 2026) — menghapus semua data & mengisi dummy
PRAGMA defer_foreign_keys = ON;

DELETE FROM activity_log;
DELETE FROM payments;
DELETE FROM subscriptions;
DELETE FROM kalender_catatan;
DELETE FROM lkb;
DELETE FROM lckh;
DELETE FROM kelompok_belajar;
DELETE FROM nilai;
DELETE FROM jurnal_mengajar;
DELETE FROM absensi;
DELETE FROM jadwal_mengajar;
DELETE FROM data_surat;
DELETE FROM data_siswa;
DELETE FROM data_kelas;
DELETE FROM profil_sekolah;
DELETE FROM users;
DELETE FROM settings;

-- ================= SETTINGS =================
INSERT INTO settings (key, value) VALUES
 ('app_name', 'Jurnal Guru'),
 ('version', '1.0'),
 ('semester', '1'),
 ('tahun_ajaran', '2026/2027'),
 ('kkm_default', '75'),
 ('bank_name', 'BRI'),
 ('bank_account_number', '0000000000000000'),
 ('bank_account_name', 'Jurnal Guru'),
 ('bank_note', 'Konfirmasi otomatis setelah admin verifikasi bukti transfer.'),
 ('dark_mode', '0');

-- ================= USERS =================
INSERT INTO users (id, username, email, password_hash, nama_lengkap, role, plan, created_at) VALUES
 ('u-admin',  'admin',              NULL,             '$2b$10$lQRg58TXFKMdIHMSTL1rnOi2GSvu4zwSTOirbvkIOSKK6krRkuNvS', 'Administrator',  'Admin', 'gratis',   datetime('now')),
 ('u-demo',   'demo@jurnal.guru',   'demo@jurnal.guru', '$2b$10$AEUAK2Mb9bInVWcKDXswnuoUCGYsEUIzzfjecfvfyUDrmKNvagPny', 'Dewi Lestari',   'guru',   'premium', datetime('now')),
 ('u-guru2',  'guru2@jurnal.guru',  'guru2@jurnal.guru', '$2b$10$AEUAK2Mb9bInVWcKDXswnuoUCGYsEUIzzfjecfvfyUDrmKNvagPny', 'Budi Santoso',   'guru',   'gratis',  datetime('now'));

-- ================= PROFIL SEKOLAH =================
INSERT INTO profil_sekolah (id, nama_sekolah, alamat, npsn, kota, provinsi, telepon, kepala_sekolah, nip_kepsek, nama_guru, nip_guru, logo_url) VALUES
 ('u-admin', 'SMA Nusantara Jaya', 'Jl. Pendidikan No. 1', '12345678', 'Kota Malang', 'Jawa Timur', '0341-000000', 'Drs. H. Ahmad Fauzi, M.Pd.', '197001012000001001', 'Administrator', '', '');

-- ================= KELAS =================
INSERT INTO data_kelas (id, nama_kelas, tingkat, jurusan, tahun_ajaran, wali_kelas) VALUES
 ('k1', 'X IPA 1', 10, 'IPA',   '2026/2027', 'Dewi Lestari'),
 ('k2', 'XI IPS 1', 11, 'IPS',   '2026/2027', 'Budi Santoso');

-- ================= SISWA =================
INSERT INTO data_siswa (id, nis, nisn, nama_siswa, jenis_kelamin, kelas_id, alamat, telepon, email, nama_ortu) VALUES
 ('s1',  '202601001', '0111123001', 'Ahmad Fauzan', 'L', 'k1', 'Jl. Melati No. 1', '081234560001', 'ahmad.fauzan@mail.test', 'H. Suryadi'),
 ('s2',  '202601002', '0111123002', 'Anisa Rahma',   'P', 'k1', 'Jl. Melati No. 2', '081234560002', 'anisa.rahma@mail.test', 'Sri Wahyuni'),
 ('s3',  '202601003', '0111123003', 'Bagas Pratama', 'L', 'k1', 'Jl. Kenanga No. 3', '081234560003', 'bagas.pratama@mail.test', 'Joko Susilo'),
 ('s4',  '202601004', '0111123004', 'Citra Ayu', 'P', 'k1', 'Jl. Kenanga No. 4', '081234560004', 'citra.ayu@mail.test', 'Rina Kumala'),
 ('s5',  '202601005', '0111123005', 'Dimas Aditya', 'L', 'k1', 'Jl. Mawar No. 5', '081234560005', 'dimas.aditya@mail.test', 'Agus Prasojo'),
 ('s6',  '202601006', '0111123006', 'Eka Sari', 'P', 'k1', 'Jl. Mawar No. 6', '081234560006', 'eka.sari@mail.test', 'Tuti Haryati'),
 ('s7',  '202601007', '0111123007', 'Fajar Nugroho', 'L', 'k1', 'Jl. Anggrek No. 7', '081234560007', 'fajar.nugroho@mail.test', 'Bambang Wibowo'),
 ('s8',  '202601008', '0111123008', 'Gita Permata', 'P', 'k1', 'Jl. Anggrek No. 8', '081234560008', 'gita.permata@mail.test', 'Dewi Lestari'),
 ('s9',  '202601009', '0111123009', 'Hendra Wijaya', 'L', 'k2', 'Jl. Dahlia No. 9', '081234560009', 'hendra.wijaya@mail.test', 'Rusdi Hartono'),
 ('s10', '202601010', '0111123010', 'Intan Permatasari', 'P', 'k2', 'Jl. Dahlia No. 10', '081234560010', 'intan.permata@mail.test', 'Siti Nurhaliza'),
 ('s11', '202601011', '0111123011', 'Joko Widodo', 'L', 'k2', 'Jl. Cempaka No. 11', '081234560011', 'joko.widodo@mail.test', 'H. Slamet'),
 ('s12', '202601012', '0111123012', 'Kirana Dewi', 'P', 'k2', 'Jl. Cempaka No. 12', '081234560012', 'kirana.dewi@mail.test', 'Endang Purwanti');

-- ================= JADWAL =================
INSERT INTO jadwal_mengajar (id, kelas_id, mata_pelajaran, hari, jam_mulai, jam_selesai, semester, ruangan) VALUES
 ('jd1', 'k1', 'Matematika', 'Senin', '07:00', '08:30', '1', 'R.101'),
 ('jd2', 'k1', 'Bahasa Indonesia', 'Senin', '08:30', '10:00', '1', 'R.101'),
 ('jd3', 'k1', 'Biologi', 'Selasa', '07:00', '08:30', '1', 'R.Lab'),
 ('jd4', 'k1', 'Kimia', 'Rabu', '09:00', '10:30', '1', 'R.Lab'),
 ('jd5', 'k1', 'Fisika', 'Kamis', '07:00', '08:30', '1', 'R.102'),
 ('jd6', 'k2', 'Matematika', 'Senin', '10:00', '11:30', '1', 'R.103');

-- ================= ABSENSI =================
INSERT INTO absensi (id, tanggal, siswa_id, kelas_id, mata_pelajaran, status, keterangan, user_id) VALUES
 ('a01', '2026-07-27', 's1', 'k1', 'Matematika', 'Hadir', '', 'u-demo'),
 ('a02', '2026-07-27', 's2', 'k1', 'Matematika', 'Hadir', '', 'u-demo'),
 ('a03', '2026-07-27', 's3', 'k1', 'Matematika', 'Sakit', 'Demam', 'u-demo'),
 ('a04', '2026-07-27', 's4', 'k1', 'Matematika', 'Hadir', '', 'u-demo'),
 ('a05', '2026-07-27', 's5', 'k1', 'Matematika', 'Izin', 'Acara keluarga', 'u-demo'),
 ('a06', '2026-07-27', 's6', 'k1', 'Matematika', 'Hadir', '', 'u-demo'),
 ('a07', '2026-07-27', 's7', 'k1', 'Matematika', 'Alpha', 'Tanpa keterangan', 'u-demo'),
 ('a08', '2026-07-27', 's8', 'k1', 'Matematika', 'Hadir', '', 'u-demo'),
 ('a09', '2026-07-28', 's1', 'k1', 'Biologi', 'Hadir', '', 'u-demo'),
 ('a10', '2026-07-28', 's2', 'k1', 'Biologi', 'Hadir', '', 'u-demo'),
 ('a11', '2026-07-28', 's3', 'k1', 'Biologi', 'Hadir', '', 'u-demo'),
 ('a12', '2026-07-28', 's4', 'k1', 'Biologi', 'Sakit', 'Sakit kepala', 'u-demo'),
 ('a13', '2026-07-28', 's5', 'k1', 'Biologi', 'Hadir', '', 'u-demo'),
 ('a14', '2026-07-28', 's6', 'k1', 'Biologi', 'Hadir', '', 'u-demo'),
 ('a15', '2026-07-28', 's7', 'k1', 'Biologi', 'Hadir', '', 'u-demo'),
 ('a16', '2026-07-30', 's9', 'k2', 'Matematika', 'Hadir', '', 'u-guru2'),
 ('a17', '2026-07-30', 's10', 'k2', 'Matematika', 'Hadir', '', 'u-guru2'),
 ('a18', '2026-07-30', 's11', 'k2', 'Matematika', 'Izin', 'Sakit', 'u-guru2'),
 ('a19', '2026-07-30', 's12', 'k2', 'Matematika', 'Hadir', '', 'u-guru2');

-- ================= NILAI =================
INSERT INTO nilai (id, tanggal, siswa_id, kelas_id, mata_pelajaran, kategori, bab, tujuan_pembelajaran, bentuk_penugasan, nilai, kkm) VALUES
 ('n01', '2026-07-29', 's1', 'k1', 'Matematika', 'Ulangan Harian', 'Persamaan Linear', 'Menyelesaikan SPLDV', 'Tes Tulis', 88, 75),
 ('n02', '2026-07-29', 's2', 'k1', 'Matematika', 'Ulangan Harian', 'Persamaan Linear', 'Menyelesaikan SPLDV', 'Tes Tulis', 92, 75),
 ('n03', '2026-07-29', 's3', 'k1', 'Matematika', 'Ulangan Harian', 'Persamaan Linear', '', 'Tes Tulis', 70, 75),
 ('n04', '2026-07-29', 's4', 'k1', 'Matematika', 'Ulangan Harian', 'Persamaan Linear', '', 'Tes Tulis', 85, 75),
 ('n05', '2026-07-29', 's5', 'k1', 'Matematika', 'Ulangan Harian', 'Persamaan Linear', '', 'Tes Tulis', 76, 75),
 ('n06', '2026-07-29', 's6', 'k1', 'Matematika', 'Ulangan Harian', 'Persamaan Linear', '', 'Tes Tulis', 80, 75),
 ('n07', '2026-07-29', 's7', 'k1', 'Matematika', 'Ulangan Harian', 'Persamaan Linear', '', 'Tes Tulis', 65, 75),
 ('n08', '2026-07-29', 's8', 'k1', 'Matematika', 'Ulangan Harian', 'Persamaan Linear', '', 'Tes Tulis', 90, 75);

-- ================= JURNAL MENGAJAR =================
INSERT INTO jurnal_mengajar (id, tanggal, kelas_id, mata_pelajaran, jam_ke, materi, deskripsi, kendala, solusi, kehadiran_siswa, catatan) VALUES
 ('j1', '2026-07-27', 'k1', 'Matematika', '1-2', 'Persamaan Linear Dua Variabel', 'Pembahasan konsep SPLDV dan contoh soal', 'Beberapa siswa kesulitan aljabar dasar', 'Diberikan latihan bertingkat', '8 hadir, 1 sakit, 1 izin, 1 alpha', 'Lanjutkan pertemuan ke-2'),
 ('j2', '2026-07-28', 'k1', 'Biologi', '3-4', 'Struktur Sel', 'Praktikum pengamatan sel di bawah mikroskop', 'Jumlah mikroskop terbatas', 'Siswa dibagi 4 kelompok', '8 hadir, 1 sakit', 'Persiapkan laporan praktikum'),
 ('j3', '2026-07-30', 'k2', 'Matematika', '1-2', 'Eksponen dan Logaritma', 'Pengenalan sifat-sifat eksponen', 'Media belum tersedia', 'Digunakan papan tulis', '4 hadir, 1 izin', '');

-- ================= KELOMPOK BELAJAR =================
INSERT INTO kelompok_belajar (id, kelas_id, kelompok, no, siswa_id, nis, nama_siswa, jenis_kelamin, kelas_asal, nilai) VALUES
 ('kb01', 'k1', 'Kelompok A', '1', 's1', '202601001', 'Ahmad Fauzan', 'L', 'X IPA 1', '88'),
 ('kb02', 'k1', 'Kelompok A', '2', 's2', '202601002', 'Bunga Rahma', 'P', 'X IPA 1', '92'),
 ('kb03', 'k1', 'Kelompok A', '3', 's3', '202601003', 'Bagas Pratama', 'L', 'X IPA 1', '70'),
 ('kb04', 'k1', 'Kelompok A', '4', 's4', '202601004', 'Citra Ayu', 'P', 'X IPA 1', '85'),
 ('kb05', 'k1', 'Kelompok B', '1', 's5', '202601005', 'Dimas Aditya', 'L', 'X IPA 1', '76'),
 ('kb06', 'k1', 'Kelompok B', '2', 's6', '202601006', 'Eka Sari', 'P', 'X IPA 1', '80'),
 ('kb07', 'k1', 'Kelompok B', '3', 's7', '202601007', 'Fajar Nugroho', 'L', 'X IPA 1', '65'),
 ('kb08', 'k1', 'Kelompok B', '4', 's8', '202601008', 'Gita Permata', 'P', 'X IPA 1', '90');

-- ================= LCKH =================
INSERT INTO lckh (id, no, kegiatan, pekerjaan, tanggal, jurnal_id) VALUES
 ('lc01', '1', 'Kegiatan pembelajaran Matematika', 'Penyusunan materi ajar, pelaksanaan PBM', '2026-07-27', 'j1'),
 ('lc02', '2', 'Pembelajaran Biologi - praktikum', 'Pendampingan praktikum, penilaian laporan', '2026-07-28', 'j2'),
 ('lc03', '3', 'Kegiatan penilaian harian', 'Penyusunan dan koreksi soal', '2026-07-29', NULL);

-- ================= LKB =================
INSERT INTO lkb (id, no, uraian_tugas, vol, bukti_dokumen, bulan, tahun) VALUES
 ('lb01', '1', 'Penyusunan silabus dan RPP', 3, 'Dokumen RPP 3 pertemuan', 'Agustus', '2026'),
 ('lb02', '2', 'Evaluasi hasil belajar siswa', 2, 'Analisis nilai ulangan harian', 'Agustus', '2026');

-- ================= KALENDER CATATAN =================
INSERT INTO kalender_catatan (id, tanggal, isi, user_id, created_at, updated_at) VALUES
 ('kc01', '2026-08-10', 'Rapat koordinasi guru (07.00 wib, ruang guru)', 'u-demo', datetime('now'), datetime('now')),
 ('kc02', '2026-08-18', 'Batas pengumpulan nilai tengah semester', 'u-demo', datetime('now'), datetime('now'));

-- ================= DEFAULT SURAT =================
INSERT INTO data_surat (id, judul, jenis, tujuan, template, created_at, updated_at) VALUES
 ('su1', 'Surat Daftar Hadir', 'daftar_hadir', '', 'Daftar hadir siswa {kelas} pada {tanggal} sebagai berikut: {daftar}', datetime('now'), datetime('now')),
 ('su2', 'Surat Keterangan', 'keterangan', '', 'Surat keterangan bahwa {nama} adalah siswa aktif di {sekolah}.', datetime('now'), datetime('now'));

-- ================= ACTIVITY LOG =================
INSERT INTO activity_log (id, timestamp, user_id, action, description) VALUES
 ('lg01', datetime('now'), 'u-admin', 'SEED', 'Database direset dan diisi data demo'),
 ('lg02', datetime('now'), 'u-demo', 'REGISTER', 'demo@jurnal.guru mendaftar');