---
name: marketing-plan-seo
description: Use when creating marketing plans, SEO work, landing/content strategy, or growth campaigns for Jurnal Guru — website copy, Google Search Console, sitemap, content calendar, analytics. Pair with saas-marketing and social-media-marketing.
---

# Marketing Plan & SEO — Jurnal Guru

Audience: Indonesian teachers/administrators (Bahasa Indonesia). Brand: "Jurnal Guru — Teacher Dashboard". Domain: `benuatech.web.id`, app at `guru.benuatech.web.id`.

## Positioning
- Value: free dashboard for attendance, grades, teaching journal, student data; auto-recap; private Google Sheets sync; save admin time.
- Message: "Hemat waktu administrasi, rekap otomatis." Teacher is the hero; the tool is the guide.

## SEO Foundations (E-E-A-T + Core Web Vitals)
- Meta/title/OG already set (title + description in layout). Keep it keyword-aware (e.g. "jurnal guru", "absensi siswa", "rekap nilai otomatis").
- Ensure `robots noindex` is only where intended (app pages are noindex; public landing should be indexable).
- Core Web Vitals: LCP < 2.5s, CLS stable, INP responsive. Mind bundle size (xlsx CDN loads deferred).
- `docs/` may hold sitemap/SEO notes (e.g. Google Search Console submit). Prefer semantic heading structure.

## Marketing Plan Template (monthly)
1. **Audience & goal** (e.g. 100 new teachers, 30% activation).
2. **Channels** (choose ~3): Google search/SEO, social media (see social-media-marketing), WhatsApp/community groups, school referrals, Google Sheets users.
3. **Content calendar:** 1 post/konten per channel per week — tips (cara buat jurnal otomatis, rekap nilai cepat), testimonials, mini-tutorial.
4. **Funnel:** landing → register → first dashboard task → activate → upgrade prompt.
5. **Metrics:** signups, activation, upgrade, retention. Review monthly.

## Workflow
1. Check existing `README.md`, `docs/`, and landing pages before writing new copy.
2. Keep copy in Bahasa Indonesia, no school names, concise and concrete.
3. For on-page edits, follow ui-ux-design tokens.