# Session Backup — 5 Agustus 2026

## Status: DEPLOYED & LIVE

### VPS Deployment (REMOVED)
**Status:** Dihapus, hanya ada di Cloudflare Workers
**VPS:** `103.107.206.10:2480` | User: `ubuntu24` | Password: `Ubuntu@2025`
**Project Path:** `/home/ubuntu24/teacher-dashboard-next` (tersisa file source saja)

### Cloudflare Workers (PRIMARY)
**Live URL:** `https://guru.aksarasunda.workers.dev`
**Custom Domain:** `https://guru.benuatech.web.id`
**Cloudflare Account:** `candraloka81@gmail.com` | Account ID `21deff05a4b7b45135ac5bc3d660bdf3`
**D1 Database:** `teacher-dashboard-db` | ID `c3833f4d-500f-4693-b077-cdb19543c479`
**Zone:** `benuatech.web.id` | ID `7cd096d96f366fdfdb16966d03e41ae8`
**DNS:** CNAME `guru.benuatech.web.id` → `guru.aksarasunda.workers.dev`

### GitHub
**Repo:** `https://github.com/benuatec/teacher-dashboard-next`
**Branch:** `master` | Latest commit: `3698591`
**Git User:** `Awiparo` (`awiparo32@gmail.com`), `gh auth setup-git`

## Stack
- Next.js 16 App Router, TypeScript, Drizzle ORM, Tailwind CSS v4, Chart.js
- `@opennextjs/cloudflare` v1.20.2 → deploy via `npm run deploy`
- VPS: Ubuntu 24.04, Node.js v24.18.0, npm 11.16.0, pm2, nginx

## Brand
- **Product:** Jurnal Guru
- **Colors:** emerald `#0D7C66`/`#0A6352`, navy `#1A2332`, cream `#F5F3EF`, accent amber `#E8A317`
- **Fonts:** Outfit (headings) + DM Sans (body) via Google Fonts + Font Awesome 6
- **Tone:** Profesional, friendly, bahasa Indonesia, zero "MAN 1 Kota Tasikmalaya" (user explicitly requested removal)

## Pricing (Freemium)
| Tier | Harga | Limit |
|------|-------|-------|
| Gratis | Rp 0 | 1 kelas |
| Pro | Rp 29.000/bulan | Unlimited kelas + backup |
| Sekolah | Rp 299.000/bulan | Multi-guru, unlimited |
Garansi 30 hari uang kembali.

## Files Created/Modified This Session
- `src/app/page.tsx` — landing page (hero, masalah, fitur, pricing, testimonials, social proof, CTA)
- `src/app/login/page.tsx` — branded login
- `src/app/layout.tsx` — SEO (title template, OG, Twitter, favicon)
- `src/app/globals.css` — theme + component styles
- `src/middleware.ts` — `/` added to publicPaths
- `src/components/SocialProof.tsx` — notification popup + stats bar
- `public/logo.svg`, `public/favicon.svg` — graduation cap icon, emerald
- `public/og-image.html` — OG image template 1200x630
- `public/robots.txt`, `public/sitemap.xml`
- `wrangler.jsonc`, `open-next.config.ts`
- `src/db/index.ts` — dual-mode (D1 Cloudflare / libsql local)
- `.agents/product-marketing.md` — product marketing context v1
- `docs/marketing/` — 11 files: content-strategy, social-content, social-content-ready, directory-submissions, directory-guide, social-setup, press-kit, submission-materials, checklist-lengkap, email-templates, pricing-strategy
- `scripts/take-screenshots.js`, `scripts/convert-logo.js`
- `screenshots/` — landing-desktop.png, landing-mobile.png, login-desktop.png, login-mobile.png

## Pending Manual Steps
1. **Workers Builds** — setup auto-deploy from GitHub (needs API token + GitHub App in browser)
2. **Directory submissions** — Product Hunt, BetaList, AlternativeTo, SaaSHub (manual login required)
3. **Social media accounts** — Instagram, Twitter, Facebook, LinkedIn, TikTok as @jurnalguru (manual + email verification)
4. **Google Search Console** — submit sitemap for SEO indexing

## User Preferences
- Always communicate in **Bahasa Indonesia**
- Concise responses preferred
- No school names in content
- No emojis unless asked
