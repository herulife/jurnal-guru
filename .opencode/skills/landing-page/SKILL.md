---
name: landing-page
description: Use when building, editing, or writing content for the public/marketing pages of this project — landing page, homepage, pricing table, FAQ, meta/OG tags, and signup funnel. Pair with ui-ux-design, marketing-plan-seo, saas-marketing.
---

# Landing Page & Sales Copy — Jurnal Guru

Public brand: "Jurnal Guru — Teacher Dashboard" (`https://guru.benuatech.web.id`). Audience: guru/wali kelas Indonesia. Bahasa Indonesia. **No school names.** Value: dashboard absensi, nilai, jurnal mengajar, data siswa, rekap otomatis, sinkron Google Sheets.

## Tone
Hangat, solutif, praktis. Teacher is the hero; tool is the guide. Lead with universal pain → quick solution.

## Structure (homepage/landing)
1. **Hero:** hook on pain ("Rekap manual makan waktu?"), one clear value prop + primary CTA (Daftar gratis).
2. **Pain/benefit:** 3–5 benefits matching modules: Absensi, Rekap auto, Nilai, Jurnal, Surat, Rapor, Google Sheets sync (data privat milik sekolah).
3. **How it works:** 3 simple steps.
4. **Pricing:** freemium card — Basic (gratis) vs Pro (premium). Link to `/subscription` (after login) or `/checkout?plan=pro`.
5. **FAQ:** common questions → mirrors app FAQ + Google Sheets setup steps.
6. **CTA repeat + footer.**

## On-page SEO / meta
- Title + meta description + OG tags (set in layout) — keyword-aware e.g. "jurnal guru", "absensi siswa", "rekap nilai otomatis". Public pages indexable; app pages `noindex`.
- Semantic headings (`h1..h3`), one H1 per page.

## Workflow
1. Read the current public page(s) + `marketing-plan-seo` + `saas-marketing`.
2. Draft copy in Bahasa (concise); get hooks & CTA clear.
3. Use ui-ux-design tokens for visual; keep build passing (`next build`).