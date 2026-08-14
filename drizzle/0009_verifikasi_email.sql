ALTER TABLE `users` ADD COLUMN `email_verified` integer DEFAULT 1;
ALTER TABLE `users` ADD COLUMN `verify_token` text;
ALTER TABLE `users` ADD COLUMN `verify_token_expires` text;