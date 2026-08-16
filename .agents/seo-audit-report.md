# SEO Audit — guru.cintabuku.site

**Tanggal:** 2026-08-16 (Minggu 1–2, marketing plan Q1 — Move 1 SEO)
**Metode:** curl (live), seo_checker.py (on-page), seo_health_scorer.py (health), inspeksi kode (layout.tsx, page.tsx, middleware.ts, public/)
**Skor kesehatan:** **48.1/100 (Grade D)** — industry saas, 25 checks (7 pass, 9 warn, 9 fail)

## Executive Summary

- **3 blocker kritis:** (1) sitemap.xml tidak bisa diakses (307 ke /login) dan isinya domain lama; (2) canonical & metadataBase menunjuk domain lama `benuatech.web.id/guru` padahal live di `guru.cintabuku.site`; (3) JSON-LD juga pakai domain lama + `offers.price="0"` padahal ada paket berbayar.
- **GEO rusak:** `/llms.txt` di-redirect ke login — aset GEO (dikutip AI) belum hidup.
- **On-page OK tapi belum optimal:** landing 80/100 (title 38 char, meta desc 125 char, heading 1 level-skip); schema Organization/SoftwareApplication sudah ada.
- **Belum terukur:** PageSpeed (quota API habis; tandai ulang besok). Google Fonts + FontAwesome eksternal berpotensi render-blocking.
- **Quick wins:** perbaikan domain (metadataBase), llms.txt publik, title/desc — semuanya < 30 menit kerja.

## Technical SEO Findings

| Issue | Impact | Evidence | Fix | Priority |
|---|---|---|---|---|
| Sitemap tidak dapat diakses; isi domain lama | HIGH — Google tidak bisa menemukan halaman | `/sitemap.xml` → 307 ke `/login?returnUrl=%2Fsitemap.xml`; `public/sitemap.xml` berisi 3 URL `benuatech.web.id/guru/` | Buat `src/app/sitemap.ts` dinamis (domain `guru.cintabuku.site`), hapus `public/sitemap.xml`, exclude `.xml` di middleware matcher | CRITICAL |
| Canonical salah domain | HIGH — sinyal ranking terpecah ke domain lama | `<link rel="canonical" href="https://benuatech.web.id/guru/">` di semua halaman; `layout.tsx` `metadataBase: benuatech.web.id/guru` | `metadataBase` → `https://guru.cintabuku.site`; `alternates.canonical: "/"` cukup (relatif) | CRITICAL |
| Soft 404: rute tak dikenal → halaman login 200 | MEDIUM — crawl budget & duplikat | `/landing`, `/harga`, `/pricing`, `/fitur` semua 200 berisi form login | Middleware hanya redirect untuk rute aplikasi (prefix terdaftar); rute lain biarkan 404 (hapus redirect catch-all) | MEDIUM |
| robots.txt (CF managed) blokir AI crawler | MEDIUM — menghambat GEO | GPTBot/ClaudeBot/CCBot/Google-Extended `Disallow: /` (Cloudflare managed) | Di dashboard Cloudflare: izinkan AI crawler untuk grounding/reference (pertahankan ai-train=no) | MEDIUM |
| Halaman login/register tidak relevan di SEO | LOW | Tidak ada noindex di /login, /register | Tambah `robots: noindex` di halaman auth (kecuali strategi lain) | LOW |

## On-Page Findings

| Issue | Impact | Evidence | Fix | Priority |
|---|---|---|---|---|
| Title 38 char, tanpa keyword | HIGH — CTR & relevansi | "Jurnal Guru — Sistem Manajemen Sekolah" | "Jurnal Guru — Aplikasi Jurnal Mengajar & Administrasi Guru Gratis" (±54 char) | HIGH |
| Meta description 125 char | MEDIUM | `layout.tsx` description | Perpanjang 150–160 char dengan keyword ("rekap otomatis", "gratis") | MEDIUM |
| Heading level-skip | LOW | seo_checker 75/100 | Rapikan h2→h3 berurutan | LOW |

## Schema / GEO Findings

| Issue | Impact | Evidence | Fix | Priority |
|---|---|---|---|---|
| JSON-LD url domain lama | HIGH | `page.tsx` schemaOrg url `guru.benuatech.web.id` | Ganti ke `https://guru.cintabuku.site` | HIGH |
| offers.price="0" | MEDIUM — rich results menyesatkan | SoftwareApplication offers price 0 IDR padahal Pro 29rb/Premium 49rb | Hapus blok `offers` (atau isi harga nyata) | MEDIUM |
| llms.txt tidak publik | HIGH — GEO blocker | `/llms.txt` → 307 ke login | Buat `public/llms.txt` (daftar halaman + deskripsi siap dikutip AI); exclude `.txt` di middleware matcher | HIGH |
| FAQ/HowTo schema belum ada | MEDIUM | Tidak ada JSON-LD FAQ | Tambah FAQ/HowTo di landing + halaman FAQ (M3–4 sesuai rencana) | MEDIUM |
| Landing belum answer-first | MEDIUM | H2 tidak langsung menjawab query guru | Konten future (pillar page `/aplikasi-jurnal-mengajar`) wajib jawaban langsung di paragraf pertama | MEDIUM |

## Prioritized Action Plan

1. **CRITICAL — Domain benar dulu:** `metadataBase` → `https://guru.cintabuku.site` (layout.tsx), canonical relatif, JSON-LD url + hapus offers (page.tsx). [±10 menit]
2. **CRITICAL — Sitemap hidup:** `src/app/sitemap.ts` + hapus `public/sitemap.xml` + exclude `.xml` di middleware matcher. [±15 menit]
3. **HIGH — llms.txt publik:** `public/llms.txt` + exclude `.txt` di middleware. [±10 menit]
4. **HIGH — Title & description** di layout.tsx (keyword jurnal mengajar / administrasi guru gratis). [±5 menit]
5. **MEDIUM — Soft-404:** middleware hanya lindungi prefix terdaftar (dashboard, absensi, dsb), sisanya 404.
6. **MEDIUM — Cloudflare:** izinkan AI crawler (grounding), pertahankan ai-train=no.
7. **Ukur ulang PageSpeed** (LCP/CLS/INP) besok — PSI quota harian pulih; target PageSpeed >= 90.
8. **Minggu 3–4:** FAQ/HowTo schema + pillar page `/aplikasi-jurnal-mengajar` (per marketing plan M3–4).

*Lampiran: skor on-page landing 80/100 (seo_checker); health 48.1/100 (seo_health_scorer, checks di /tmp/opencode/seo_checks.json).*