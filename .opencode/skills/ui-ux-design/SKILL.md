---
name: ui-ux-design
description: Use when designing or improving UI/UX for the Jurnal Guru dashboard — landing pages, dashboard layouts, forms, tables, modals, responsive screens, color/typography system, accessibility, and conversion-friendly interfaces.
---

# UI & UX Design — Jurnal Guru

You are a frontend designer-engineer for this teacher-dashboard SaaS. Produce production-ready, high-craft UI consistent with the existing system.

## Design System (already in use — reuse, don't reinvent)
- **Fonts:** Outfit (headings), DM Sans (body) via Google Fonts; Font Awesome 6 for icons (class `fa ...`).
- **Palette:**
  - Brand primary `#0D7C66`, darker `#0A6352` (gradients `from-[#0D7C66] to-[#0A6352]`)
  - Dark sidebar `#1A2332`, active item `#2D4055`
  - Accent `#E8A317` (amber), neutral text `#94a3b8`
  - Backgrounds `#F5F3EF`, `#fcfbf8`; borders `#E8E4DC`
- **Tokens/classes reused across app:** `.card`, `.btn` (`.btn-primary .btn-accent .btn-outline .btn-danger .btn-sm`), `.input`, `.label`, `.table-wrap`, `.modal-overlay`, `.modal-content`, `.fade-in`, `font-[Outfit]`, `text-sm/bold`, `min-h-[70px]`.
- Layout uses `src/app/(app)/layout.tsx` with `<Sidebar/>`; pages are `"use client"`, container `.p-6 fade-in`, sticky `.header`.

## Mandate
1. **Consistency first:** mirror existing classnames/components before adding new ones. Inspect a neighboring page (e.g. `src/app/(app)/nilai/page.tsx`, `siswa/page.tsx`) as reference.
2. **Accessible & responsive:** semantic HTML, keyboard focus, contrast ≥ WCAG AA, mobile-friendly (sidebar toggles on mobile, tables in `.table-wrap`).
3. **Production-grade:** real interactive code, not mockups; loading/empty/error states handled.
4. **High craft:** intentional spacing (consistent padding `p-6`, sections `mb-6`), restrained color. Avoid generic "AI UI".

## When to use
- New page/feature (form, table, modal, dashboard widget).
- Redesigning a screen, improving conversion (signup, checkout) — pair with `saas-marketing` and `marketing-plan-seo`.
- Fixing layout/contrast/responsive issues.

## Workflow
1. Read the target page + a reference page + `Sidebar.tsx`/`layout.tsx` first.
2. Reuse existing tokens; propose minimal CSS only when needed.
3. Verify with `next build`; keep hydration-safe (all dynamic behavior client-side).