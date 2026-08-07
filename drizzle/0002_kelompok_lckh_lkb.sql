CREATE TABLE `kelompok_belajar` (
	`id` text PRIMARY KEY NOT NULL,
	`kelas_id` text,
	`kelompok` text NOT NULL,
	`no` text,
	`siswa_id` text,
	`nis` text,
	`nama_siswa` text,
	`jenis_kelamin` text,
	`kelas_asal` text,
	`nilai` text,
	FOREIGN KEY (`kelas_id`) REFERENCES `data_kelas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`siswa_id`) REFERENCES `data_siswa`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lckh` (
	`id` text PRIMARY KEY NOT NULL,
	`no` text,
	`kegiatan` text,
	`pekerjaan` text,
	`tanggal` text,
	`jurnal_id` text
);
--> statement-breakpoint
CREATE TABLE `lkb` (
	`id` text PRIMARY KEY NOT NULL,
	`no` text,
	`uraian_tugas` text,
	`vol` real DEFAULT 0,
	`bukti_dokumen` text,
	`bulan` text,
	`tahun` text
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`subscription_id` text,
	`amount` real NOT NULL,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text,
	`bank_name` text,
	`account_number` text,
	`account_name` text,
	`proof_url` text,
	`notes` text,
	`verified_at` text,
	`verified_by` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`started_at` text NOT NULL,
	`expires_at` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `users` ADD `plan` text DEFAULT 'gratis' NOT NULL;