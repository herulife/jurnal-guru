CREATE TABLE IF NOT EXISTS `user_settings` (
  `user_id` text NOT NULL,
  `key` text NOT NULL,
  `value` text,
  PRIMARY KEY (`user_id`, `key`)
);
CREATE INDEX IF NOT EXISTS `user_settings_user_id_idx` ON `user_settings` (`user_id`);