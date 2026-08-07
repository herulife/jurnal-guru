---
name: core-web-vitals
description: Use when optimizing page performance — loading speed, Core Web Vitals (LCP, CLS, INP), bundle size, fonts, images, caching. Especially for marketing/landing pages and dashboard.
---

# Core Web Vitals / Performance — Jurnal Guru

## Targets
- **LCP < 2.5s**, **INP < 200ms**, **CLS < 0.1**.
- Page loads fast on slow school Wi-Fi; first meaningful screen quick.

## Current known specifics (check before changing)
- Fonts via Google Fonts (Outfit, DM Sans) — preloaded (see layout). Icon Font Awesome 6 CDN with `crossorigin` + `integrity`.
- `xlsx.full.min.js` loaded `defer` on app pages only — keep out of critical path on landing.
- Next.js App Router: app pages likely `"use client"` (hydration cost) — lazy-load heavy components.

## Practices
1. **Measure first:** Lighthouse / Core Web Vitals. Identify LCP element & bundle weight.
2. **Reduce JS:** code-split; lazy dynamic imports for charts/xlsx; avoid over-fetching data client-side.
3. **Optimize assets:** compress images; use CDN (Cloudflare default); proper caching `Cache-Control`.
4. **Fonts:** preconnect + `display=swap`; preload key fonts; subset if possible.
5. **Render:** avoid layout shift (reserve space for images/tables), keep tables in scroll wrapper (`.table-wrap`) on mobile.
6. **Server (Cloudflare):** caching headers via OpenNext asset rules — verify static assets cached, HTML fallback apier.

## Workflow
1. Decide goal (metric to improve).
2. Baseline with an audit.
3. Make a targeted change (avoid side-effects on data/UX); verify build + re-measure.
4. If unsure hook to `web-performance-optimization` reference skill content.