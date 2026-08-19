# BACKLOG — Jurnal Guru

## Private Payment Proof Storage

- Status: NON-BLOCKER FOR LAUNCH (dicatat 2026-08-19, Pre-Ad Launch)
- Masalah: bukti transfer disimpan di `public/uploads/` → URL publik tanpa auth (nama acak uuid mengurangi risiko tebakan, tapi siapa pun yang mendapat URL bisa melihat file).
- Rencana solusi (jangan dikerjakan sekarang):
  1. Pindah folder penyimpanan ke direktori privat di luar `public/` (mis. `.data/uploads/`).
  2. Route streaming ber-auth: `GET /api/uploads/[filename]` dengan owner-check/admin, stream file + Content-Type dari DB.
  3. Pertahankan whitelist ekstensi & batas 5MB yang sudah ada.
- Tidak mengubah payment flow / upload flow sekarang.
