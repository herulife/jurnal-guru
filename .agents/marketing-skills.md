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

## Marketing Plan — RENCANA LENGKAP (v1, 16 Agu 2026)
- **Dokumen utama:** `.agents/marketing-plan-jurnal-guru.md` (13 seksi, AARRR, 90 hari + 12 bulan, Bahasa Indonesia, ~6.700 kata) — hasil skill `marketing-plan` (coreyhaines31/marketingskills), terpasang lokal di `~/.config/opencode/skills/`.
- Working files + riset: folder lokal `~/marketing-plans/jurnal-guru/` (research.md, sections/, progress.md, final_plan.md).
- Inti: SEO Bahasa Indonesia + GEO (llms.txt, schema FAQ/HowTo, kutipan AI) + komunitas guru (FB/WA) + referral dua-pihak + siklus tahun ajaran. Semua biaya Rp 0, dieksekusi founder + agen AI.
- Skill terpasang lokal: `marketing-plan`, `marketing-ideas` (plus marketing-context, product-marketing, content-strategy, ai-seo, launch-strategy, community-marketing, dll).
- Prioritas 90 hari: (1) analitik funnel, (2) audit SEO teknis, (3) pillar + 10 artikel + template, (4) aktif 5 grup guru, (5) email welcome/perpanjangan/reaktivasi, (6) referral + momen share.

## Skill Kustom: organic-marketing (dikembangkan sendiri, 16 Agu 2026)
- **Kenapa dibuat:** tidak ada skill "organic marketing" khusus di coreyhaines31/marketingskills (punya `social` yang hanya konten) maupun ekinciio/saas-growth-marketing-skills.
- **Lokasi:** `.agents/skills/organic-marketing/SKILL.md` (repo, versi v1.0.0) + terpasang di `~/.config/opencode/skills/organic-marketing/`.
- **Isi:** orchestrator pemasaran organik Jurnal Guru — aturan brand voice, 7 kanal organik (SEO, GEO, konten, komunitas, sosial, email, referral), workflow 5 langkah, KPI per fase (AARRR), template cepat per kanal, checklist selesai. Semua Rp 0, bahasa Indonesia.
- **Pemakaian:** muat saat minta "marketing organik" / eksekusi prioritas 90 hari; skill ini mengarahkan ke skill spesifik (seo-audit, ai-seo, content-strategy, community-marketing, social, referrals, email-sequence).

## Catatan
- Skill hanya panduan prosedur; eksekusi tetap di tangan kita (agent/human)
- Utamakan SEO Bahasa Indonesia + GEO (AI citation) karena target guru lokal