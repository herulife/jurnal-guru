# Marketing Skills (GitHub) untuk Jurnal Guru

Referensi skill AI-agent (Agent Skills spec) dari GitHub yang cocok memasarkan Jurnal Guru.
Instal via `npx skills add <owner/repo>` atau clone ke `.agents/skills/`.

## Repo Utama yang Direkomendasikan

### 1. coreyhaines31/marketingskills — PAKET LENGKAP (prioritas #1)
- ~282rb install, MIT, bekerja di Claude Code / Cursor / Codex / OpenCode
- Skill paling relevan: `seo-audit`, `programmatic-seo`, `content-strategy`,
  `copywriting`, `email-sequence`, `pricing`, `referral-program`,
  `marketing-psychology`, `competitors`, `ab-test-setup`, `analytics-tracking`
- Cocok untuk pemasar 1 orang (kondisi proyek kita)

### 2. ekinciio/saas-growth-marketing-skills — KHUSUS SaaS FREEMIUM
- 15 skill: `pricing-analyzer`, `competitor-intel`, `web-app-growth-engine`,
  `saas-landing-builder`, `plg-funnel-analyzer`, `reddit-opportunity-finder`,
  `brand-mention-scanner`, `geo-seo-auditor`
- Cocok dengan model Gratis -> Pro -> Premium

### 3. Skill GEO/AEO (mis. zubair-trabzada/geo-seo-claude)
- Optimasi agar Jurnal Guru dikutip AI (ChatGPT / Perplexity / Gemini)
- Guru kini bertanya ke AI: "aplikasi jurnal mengajar gratis" -> target kita jadi jawaban
- Output: GEO audit, llms.txt, FAQ/HowTo schema JSON-LD

### Lainnya (cadangan)
- whyashthakker/agent-skills-marketing — 50+ skill (SEO, GEO, lifecycle, creator)
- BrianRWagner/ai-marketing-claude-code-skills — 19 skill, mode quick/standard/deep
- donatassimkus/claude-ai-skills — growth marketing, seo-hacks, marketing-hacks

## Marketing Plan — Ringkasan (detail lengkap ada di .agents/session-backup.md)

Target: 100 guru terdaftar organik dalam 90 hari, 50% konversi ke Pro/Premium.

### Fase 1 — Fondasi & SEO (Hari 1-30)
- Audit teknis SEO guru.benuatech.web.id: meta, schema, sitemap, llms.txt, FAQ schema
  (skill: seo-audit, geo-seo-claude)
- Halaman programmatic per fitur: /aplikasi-jurnal-mengajar, /aplikasi-absensi-guru,
  /contoh-jurnal-mengajar, /rekap-nilai-guru (skill: programmatic-seo, content-strategy)
- Fix canonical & meta semua halaman landing (skill: seo-audit)
- Analisa kompetitor -> celah positioning (skill: competitors, competitor-intel)

### Fase 2 — Konten & Trafik (Hari 31-60)
- 8-10 artikel SEO Bahasa Indonesia: "cara membuat jurnal mengajar",
  "cara input nilai rapor", "template LCKH/LKB" (skill: content-production)
- Landing page pricing di-optimasi: CTA, testimoni, garansi (skill: copywriting)
- Email sequence: welcome -> aktivasi -> upsell Pro -> upsell Premium
  (skill: email-sequence, churn-prevention)
- Pantau mention di Reddit/FB/Twitter Indonesia (skill: brand-mention-scanner)

### Fase 3 — Konversi & Referral (Hari 61-90)
- Analisa funnel AARRR: regis gratis -> pakai fitur -> bayar (skill: campaign-analytics)
- A/B test harga & CTA paywall (skill: ab-test-setup, pricing-analyzer)
- Program referral antar guru (skill: referral-program)
- Kumpulkan testimoni guru -> halaman social proof (skill: case-study-writer)

### KPI per Fase
- Fase 1: PageSpeed >= 90, sitemap ter-index, 5 keyword page 1 Google
- Fase 2: 2.000 kunjungan organik/bulan, 100 pendaftar, 30% aktivasi
- Fase 3: konversi 5-8% free->paid, 50 pelanggan, MRR >= Rp1,5 jt

## Catatan
- Skill hanya panduan prosedur; eksekusi tetap di tangan kita (agent/human)
- Utamakan SEO Bahasa Indonesia + GEO (AI citation) karena target guru lokal