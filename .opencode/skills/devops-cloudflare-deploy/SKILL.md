---
name: devops-cloudflare-deploy
description: Use when deploying, debugging production, or managing Cloudflare for this project — wrangler deploy, workers, D1, secrets, custom domain, OpenNext build, versions, routes, performance/limits. Pair with frontend-backend-dev.
---

# DevOps / Deploy — Cloudflare (guru worker)

App: Next.js + **OpenNext** → Cloudflare Worker on custom domain `guru.benuatech.web.id`. Config in `wrangler.jsonc` (worker name `guru`, D1 binding `DB`).

## Deploy flow
- Build first: **`npx next build`** — TS type errors abort the Cloudflare deploy. Fix them before deploying.
- Deploy: `npm run deploy` (runs build then `wrangler deploy`). Custom domain routes handled in `wrangler.jsonc` (`routes` / `zone_name`).

## Secrets & env
- Set/update secrets: `wrangler secret put <NAME> --name guru` (reads from stdin — pipe the value).
- Read in code via `process.env.<NAME>`.
- Existing secrets: `JWT_SECRET`, `GOOGLE_SERVICE_ACCOUNT_JSON`. Never print or commit them; **never** commit `dashboard-guru.json` (contains API token) or `docs/aplikasi/*.json` (service-account private key).

## D1 / database
- D1 binding `DB` (see `wrangler.jsonc`). Migrations in `drizzle/` (`*.sql`), meta in `drizzle/meta`. Apply/sync per setup (e.g. `npx drizzle-kit push` or `wrangler d1 execute`).

## Gotchas
- Always verify final built worker is the freshly-deployed Version (check deploy output `Current Version ID`).
- After a code change that affects routes (adding/removing a page/API), confirm old route returns 404 and new one works (curl with login cookie).
- Config not hot-reloaded by opencode → restart opencode applies changes; not related to worker deploy.

## Workflow
1. Read `wrangler.jsonc`, `package.json` (`deploy` script), `drizzle.config.ts`.
2. Make changes → `npx next build` → fix errors → `npm run deploy`.
3. Smoke-test critical routes/APIs with a session cookie.