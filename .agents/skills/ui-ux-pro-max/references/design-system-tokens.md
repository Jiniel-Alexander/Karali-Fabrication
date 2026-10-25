# Karali Fabrication — Design System Tokens Reference

Canonical token reference mapped to [`src/style.css`](../../../../src/style.css).

## 1. Color Tokens

| Token | Hex / Value | Role & Usage |
|---|---|---|
| `--navy` | `#1f3c88` | Primary brand color, display headings, primary submit buttons, active option highlight |
| `--navy-700` | `#183070` | Primary button hover state |
| `--navy-900` | `#0f1f4a` | Deep industrial footer background, high-contrast button text on orange |
| `--orange` | `#f5a623` | Safety orange accent, click-to-call CTA background, focus ring outer border, hazard stripe |
| `--orange-600` | `#e0920f` | Selected checkmark and darker orange accents |
| `--orange-100` | `#fdf0d8` | Soft warm highlight surface |
| `--ink` | `#141d33` | Primary body copy and input text (`15.4:1` contrast on white) |
| `--muted` | `#4a5672` | Secondary copy, field hints, metadata (`7.2:1` contrast on white) |
| `--bg` | `#f4f6fa` | Page canvas background with subtle `32px` blueprint grid overlay |
| `--surface` | `#ffffff` | Card, header, button, and listbox surface |
| `--line` | `#dde3ee` | Subtle card and divider borders |
| `--line-strong` | `#c3ccdc` | Input borders, secondary button borders, corner rivets |
| `--success-bg` / `--success-ink` | `#e8f6ee` / `#0d5a36` | Confirmed Supabase submission banner |
| `--danger` / `--danger-bg` | `#b42318` / `#fdeeec` | Validation and submission error states |
| `--info-bg` / `--info-line` | `#edf1fa` / `#c4d0ec` | Neutral status banner and hover states |

## 2. Typography Tokens

| Token | Value | Usage |
|---|---|---|
| `--font-display` | `'Barlow Condensed', 'Arial Narrow', 'Inter Variable', sans-serif` | Hero headlines (`clamp(2.7rem, 7.2vw, 5rem)`), section titles (`clamp(1.8rem, 3.6vw, 2.2rem)`), brand wordmark |
| `--font-body` | `'Inter Variable', 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` | Body copy (`1rem`), labels, buttons, combobox options, privacy notice |

## 3. Elevation, Radii & Motion Tokens

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `8px` | Service chips, option items, icon buttons |
| `--radius` | `12px` | Primary/secondary buttons, form inputs, status banners |
| `--radius-lg` | `20px` | Primary interactive cards (with top orange accent bar and corner rivets) |
| `--shadow-sm` | `0 1px 2px rgb(15 31 74 / 0.06)` | Service pills and subtle surfaces |
| `--shadow` | `0 2px 4px rgb(15 31 74 / 0.04), 0 12px 32px -8px rgb(15 31 74 / 0.18)` | Main form/content cards |
| `--shadow-pop` | `0 18px 48px -12px rgb(15 31 74 / 0.32)` | Floating combobox listbox and popovers |
| `--focus-ring` | `0 0 0 3px #fff, 0 0 0 6px var(--orange)` | Keyboard `:focus-visible` indicator |
| `--ease` | `cubic-bezier(0.2, 0.7, 0.2, 1)` | Standard UI transition curve |
