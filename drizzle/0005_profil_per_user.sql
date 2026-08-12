ALTER TABLE `profil_sekolah` ADD COLUMN `user_id` text;
UPDATE `profil_sekolah` SET `user_id` = `id`;
CREATE INDEX IF NOT EXISTS `profil_sekolah_user_id_idx` ON `profil_sekolah` (`user_id`);