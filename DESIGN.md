---
version: alpha
name: Jurnal Guru
description: Dashboard guru gratis untuk kelola absensi, nilai, dan jurnal mengajar — visual identity Indonesia yang praktis, modern, dan dapat diandalkan.
colors:
  primary: "#0D7C66"
  primary-hover: "#0A6352"
  primary-light: "#eefbf8"
  secondary: "#4a5568"
  accent: "#E8A317"
  accent-hover: "#ca8a04"
  danger: "#dc2626"
  danger-hover: "#b91c1c"
  surface: "#ffffff"
  surface-hover: "#faf9f6"
  background: "#F5F3EF"
  border: "#E8E4DC"
  border-focus: "#0072f5"
  text-primary: "#2D3748"
  text-on-primary: "#ffffff"
  text-on-accent: "#1A2332"
  # Badge colors
  badge-success-bg: "#d1fae5"
  badge-success-text: "#065f46"
  badge-warning-bg: "#fef3c7"
  badge-warning-text: "#92400e"
  badge-info-bg: "#dbeafe"
  badge-info-text: "#1e40af"
  badge-danger-bg: "#fee2e2"
  badge-danger-text: "#991b1b"
  # Dark mode
  dark-background: "#0f172a"
  dark-surface: "#1e293b"
  dark-surface-elevated: "#1a2332"
  dark-border: "#334155"
  dark-text-primary: "#e2e8f0"
typography:
  h1:
    fontFamily: "Inter"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Inter"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  h3:
    fontFamily: "Inter"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.4
  h4:
    fontFamily: "Inter"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body-lg:
    fontFamily: "Inter"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: "Inter"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Inter"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.02em"
  badge:
    fontFamily: "Inter"
    fontSize: "0.625rem"
    fontWeight: 510
    lineHeight: 1.4
  button:
    fontFamily: "Inter"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  card-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    typography: "{typography.body-sm}"
  label:
    textColor: "{colors.secondary}"
    typography: "{typography.label}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-on-primary}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    typography: "{typography.button}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.text-on-primary}"
  button-primary-active:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.text-on-primary}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.text-on-accent}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    typography: "{typography.button}"
  button-accent-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.text-on-primary}"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.text-on-primary}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    typography: "{typography.button}"
  button-danger-hover:
    backgroundColor: "{colors.danger-hover}"
    textColor: "{colors.text-on-primary}"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    typography: "{typography.button}"
  button-outline-hover:
    backgroundColor: "{colors.primary-light}"
    textColor: "{colors.primary}"
  button-sm:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-on-primary}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
    typography:
      fontFamily: "Inter"
      fontSize: "0.75rem"
      fontWeight: 500
      lineHeight: 1.4
  badge:
    rounded: "{rounded.full}"
    padding: "2px 8px"
    typography: "{typography.badge}"
  badge-success:
    backgroundColor: "{colors.badge-success-bg}"
    textColor: "{colors.badge-success-text}"
  badge-warning:
    backgroundColor: "{colors.badge-warning-bg}"
    textColor: "{colors.badge-warning-text}"
  badge-info:
    backgroundColor: "{colors.badge-info-bg}"
    textColor: "{colors.badge-info-text}"
  badge-danger:
    backgroundColor: "{colors.badge-danger-bg}"
    textColor: "{colors.badge-danger-text}"
  table-header:
    backgroundColor: "{colors.dark-surface-elevated}"
    textColor: "{colors.dark-text-primary}"
    rounded: "{rounded.md} 0 0 0"
    padding: "12px 16px"
    typography:
      fontFamily: "Inter"
      fontSize: "0.8125rem"
      fontWeight: 600
      lineHeight: 1.4
      letterSpacing: "0.05em"
      textTransform: "uppercase"
  table-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    padding: "12px 16px"
  table-row-even:
    backgroundColor: "{colors.surface-hover}"
    textColor: "{colors.text-primary}"
  table-row-hover:
    backgroundColor: "#f8f6f2"
    textColor: "{colors.text-primary}"
  modal-overlay:
    backgroundColor: "rgba(0,0,0,0.5)"
  modal-content:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "{spacing.lg}"
  focus-visible:
    backgroundColor: "transparent"
    textColor: "{colors.border-focus}"
    rounded: "{rounded.sm}"
---

## Overview

**Jurnal Guru** adalah platform administrasi mengajar gratis untuk guru Indonesia. Visual identity dirancang **praktis, modern, dan dapat diandalkan** — mencerminkan brand voice: ramah, profesional, membantu. 

Design system ini mengadopsi prinsip *Monitor Surface* (claude-design): dashboard guru memantau state (absensi, nilai, jurnal) dengan density tinggi, hierarchy glanceable, tanpa hero/centered card. Referensi design system: **Linear** (dark-native, single accent, weight 510) dan **Vercel** (light-native, shadow-as-border, accessible blue focus ring).

## Colors

Palette dibangun di atas **teal brand (`#0D7C66`)** sebagai primary accent tunggal — konsisten dengan identitas pendidikan Indonesia. Warna tambahan hanya **gold (`#E8A317`)** untuk accent warning/upsell, dan **semantic colors** (success/warning/info/danger) untuk badge status.

- **Primary (`#0D7C66`):** Brand teal — tombol utama, link, accent utama.
- **Primary-hover (`#0A6352`):** Hover state primary.
- **Accent (`#E8A317`):** Gold — CTA upsell (Pro/Premium), warning badge.
- **Secondary (`#4a5568`):** Supporting text, label, border input idle.
- **Surface (`#ffffff`):** Card, input, modal background (light mode).
- **Background (`#F5F3EF`):** Page background warm off-white.
- **Border (`#E8E4DC`):** Border card, input, table (light mode).
- **Border-focus (`#0072f5`):** **Accessible blue** untuk focus ring (WCAG AA) — menggantikan teal.
- **Dark mode:** Near-black base (`#0f172a`), elevated surface (`#1e293b`), border `#334155`, text `#e2e8f0`.

**Kontras WCAG AA:** Semua kombinasi text/background di atas 4.5:1. Focus ring biru `#0072f5` memenuhi aksesibilitas.

## Typography

**Satu font family: `Inter` (Variable cv01/ss03)** via Google Fonts CDN — menggantikan DM Sans + Outfit (2 font load). Weight signature: **510 (medium)** untuk heading & badge seperti Linear, 400 body, 600 label, 700 H1.

Mono: `JetBrains Mono` untuk kode/nomor rekening.

| Token | Size | Weight | Line-height | Letter-spacing | Use case |
|-------|------|--------|-------------|----------------|----------|
| h1 | 2rem | 700 | 1.2 | -0.02em | Page title |
| h2 | 1.5rem | 600 | 1.3 | -0.01em | Section heading |
| h3 | 1.25rem | 600 | 1.4 | — | Card title |
| h4 | 1.125rem | 600 | 1.4 | — | Sub-section |
| body-lg | 1.125rem | 400 | 1.6 | — | Lead paragraph |
| body-md | 1rem | 400 | 1.5 | — | Body text |
| body-sm | 0.875rem | 400 | 1.5 | — | Metadata, hint |
| label | 0.8125rem | 600 | 1.4 | 0.02em | Form label |
| badge | 0.625rem | 510 | 1.4 | — | Status pill |
| button | 0.875rem | 500 | 1.4 | — | Button text |

## Layout

Spacing scale **8px base unit** (Linear/Vercel standard):
- `xs` 4px — intra-element tight
- `sm` 8px — icon gaps, badge padding
- `md` 16px — form field gap, card internal gap
- `lg` 24px — card padding, section gap mobile
- `xl` 32px — section gap desktop
- `2xl` 48px — major section break

Container: `max-w-7xl` (1280px) untuk dashboard density. Sidebar: `w-60` (240px) — mengurangi dari 256px untuk ruang data lebih banyak (Monitor surface principle).

## Elevation & Depth

**Shadow-as-border (Vercel style)** — tidak pakai border solid + transform hover:
- Card idle: `0 0 0 1px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)`
- Card hover: `0 0 0 1px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)` (no transform)
- Modal: `0 25px 60px rgba(0,0,0,0.2)`
- Focus ring: `0 0 0 3px rgba(0,114,245,0.3)` (accessible blue)

Catatan: Elevation values (box-shadow) tidak disimpan sebagai color token karena bukan CSS color valid. Gunakan langsung di CSS/globals.css.

## Shapes

Radius standar:
- `sm` 4px — focus ring, button-sm
- `md` 8px — button, input, table header
- `lg` 12px — card, modal
- `xl` 16px — legacy card (migrasi ke lg)
- `full` 9999px — badge, avatar, pill CTA

## Components

### Card
Surface default untuk grouped content. **No border**, shadow-as-border. Padding `lg` (24px). Radius `lg` (12px). Hover: elevation naik, **no transform**.

### Input
Border 1px `#E8E4DC` (bukan 2px). Radius `md` (8px). Focus: border biru `#0072f5` + focus ring 3px rgba(0,114,245,0.3). Dark mode: bg `#1e293b`, border `#334155`.

### Button
Radius `md` (8px), weight 500, **no scale active**. Variants:
- Primary: teal `#0D7C66` → hover `#0A6352` + elevation
- Accent: gold `#E8A317` → hover `#ca8a04` (text putih)
- Danger: red `#dc2626` → hover `#b91c1c`
- Outline: surface + border 1px → hover border primary + bg primary-light
- Sm: padding 6px 12px, radius 4px, font 0.75rem

### Badge
**Pill** (`full` 9999px), font 0.625rem (10px), **weight 510** (Linear signature), padding 2px 8px. Semantic colors: success (hijau), warning (kuning), info (biru), danger (merah).

### Table
Header: bg dark elevated `#1a2332`, text putih, uppercase, letter-spacing 0.05em, radius top-only. Row: striped (even `#faf9f6`), hover `#f8f6f2`. Border `#E8E4DC`. Dark mode: header `#1a2332`, row `#1e293b`/`#1a2332`, border `#334155`.

### Modal
Overlay: rgba(0,0,0,0.5) + backdrop-blur 4px. Content: radius `xl` (16px), padding `lg`, max-w 720px, elevation modal.

### Focus Visible
Outline 2px biru `#0072f5`, offset 2px, radius 4px. **Bukan teal** — untuk WCAG AA.

## Do's and Don'ts

- **Do** gunakan token reference (`{colors.primary}`) di komponen, jangan hardcode hex.
- **Do** pakai `Inter` variable font weight 510 untuk heading/badge, 400 body.
- **Do** shadow-as-border untuk card/input/button — hapus border solid + transform hover.
- **Do** focus ring biru `#0072f5` untuk aksesibilitas.
- **Do** badge pill 9999px radius, 10px font, weight 510.
- **Don't** pakai 2 font family (DM Sans + Outfit) — konsolidasi ke Inter.
- **Don't** border input 2px — turunkan ke 1px + shadow-as-border.
- **Don't** transform hover pada card/button — Linear/Vercel tidak pakai.
- **Don't** radius 16px card — standarkan ke 12px (lg).
- **Don't** introduce warna baru di luar palette — extend palette dulu.
- **Don't** nested component variants (button-primary.hover salah; button-primary-hover benar).
- **Don't** sidebar 256px — gunakan 240px (w-60) untuk Monitor surface.