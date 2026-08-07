CREATE TABLE `data_surat` (
	`id` text PRIMARY KEY NOT NULL,
	`judul` text NOT NULL,
	`jenis` text NOT NULL,
	`tujuan` text,
	`template` text NOT NULL,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	`updated_at` text DEFAULT 'datetime(''now'')' NOT NULL
);
