CREATE TABLE `absensi` (
	`id` text PRIMARY KEY NOT NULL,
	`tanggal` text NOT NULL,
	`siswa_id` text,
	`kelas_id` text,
	`mata_pelajaran` text,
	`status` text DEFAULT 'Hadir' NOT NULL,
	`keterangan` text,
	`user_id` text,
	FOREIGN KEY (`siswa_id`) REFERENCES `data_siswa`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `activity_log` (
	`id` text PRIMARY KEY NOT NULL,
	`timestamp` text NOT NULL,
	`user_id` text,
	`action` text,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `data_kelas` (
	`id` text PRIMARY KEY NOT NULL,
	`nama_kelas` text NOT NULL,
	`tingkat` integer NOT NULL,
	`jurusan` text,
	`tahun_ajaran` text,
	`wali_kelas` text
);
--> statement-breakpoint
CREATE TABLE `data_siswa` (
	`id` text PRIMARY KEY NOT NULL,
	`nis` text NOT NULL,
	`nisn` text,
	`nama_siswa` text NOT NULL,
	`jenis_kelamin` text DEFAULT 'L' NOT NULL,
	`kelas_id` text,
	`alamat` text,
	`telepon` text,
	`email` text,
	`nama_ortu` text,
	FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jadwal_mengajar` (
	`id` text PRIMARY KEY NOT NULL,
	`kelas_id` text,
	`mata_pelajaran` text NOT NULL,
	`hari` text NOT NULL,
	`jam_mulai` text,
	`jam_selesai` text,
	`semester` text,
	`ruangan` text,
	FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `jurnal_mengajar` (
	`id` text PRIMARY KEY NOT NULL,
	`tanggal` text,
	`kelas_id` text,
	`mata_pelajaran` text,
	`jam_ke` text,
	`materi` text,
	`deskripsi` text,
	`kendala` text,
	`solusi` text,
	`kehadiran_siswa` text,
	`catatan` text,
	FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `nilai` (
	`id` text PRIMARY KEY NOT NULL,
	`tanggal` text,
	`siswa_id` text,
	`kelas_id` text,
	`mata_pelajaran` text,
	`kategori` text,
	`bab` text,
	`tujuan_pembelajaran` text,
	`bentuk_penugasan` text,
	`nilai` real DEFAULT 0,
	`kkm` real DEFAULT 75,
	`remedial` text,
	FOREIGN KEY (`siswa_id`) REFERENCES `data_siswa`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `profil_sekolah` (
	`id` text PRIMARY KEY NOT NULL,
	`nama_sekolah` text,
	`alamat` text,
	`npsn` text,
	`kota` text,
	`provinsi` text,
	`telepon` text,
	`kepala_sekolah` text,
	`nip_kepsek` text,
	`nama_guru` text,
	`nip_guru` text,
	`logo_url` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`nama_lengkap` text NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);