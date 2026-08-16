-- Tambah kolom nomor WhatsApp pada pembayaran (notifikasi order + hubungi kami)
ALTER TABLE payments ADD COLUMN whatsapp text;