CREATE TABLE `kalender_catatan` (
	`id` text PRIMARY KEY NOT NULL,
	`tanggal` text NOT NULL,
	`isi` text NOT NULL,
	`user_id` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	`updated_at` text DEFAULT 'datetime(''now'')' NOT NULL
);