---
name: ui-ux-pro-max
description: >-
  Use this skill when designing, structuring, or refactoring pages, components,
  design tokens, typography, color systems, responsive layouts, service pages,
  product catalogues, or quote forms for the Karali Fabrication website.
---

# UI/UX Pro Max — Karali Fabrication Design System Skill

## Metadata & Provenance

- **Original Source Repository:** `nextlevelbuilder/ui-ux-pro-max-skill` (https://github.com/nextlevelbuilder/ui-ux-pro-max-skill — `.claude/skills/ui-ux-pro-max/SKILL.md` & `.claude/skills/design-system/SKILL.md`, MIT License)
- **Purpose:** Generate and maintain a coherent industrial design system across Karali Fabrication's pages (Home, Structural Steel, Lift Shafts & Crash Decks, Custom Fabrication, Staircases/Railings/Gates, Industrial Sheds & Mezzanines, Product Catalogue, Projects Gallery, and Request-a-Quote).
- **Installation & Usage:** Installed project-locally at `.agents/skills/ui-ux-pro-max/SKILL.md`. Activate whenever creating or updating HTML structure, CSS tokens (`src/style.css`), layout grids, cards, navigation, or interactive form controls.
- **Required Dependencies & Credentials:** None. Uses the project's existing Vite + Vanilla JavaScript + CSS Custom Properties stack and local `@fontsource-variable/inter` and `@fontsource/barlow-condensed` packages.
- **Antigravity Compatibility:** Native workspace skill discovered automatically from `.agents/skills/ui-ux-pro-max/SKILL.md`.
- **Verification Command:** Confirm file presence with `Test-Path ".agents/skills/ui-ux-pro-max/SKILL.md"` and verify visual/layout compliance with `npm run test:e2e`.

---

## 1. Non-Negotiable Stack & Architecture Rules

1. **Preserve the Stack:** Write clean semantic HTML5, modular vanilla ES JavaScript (`src/`), and CSS Custom Properties (`src/style.css`). **Never** introduce React, Next.js, Tailwind CSS, or external UI component frameworks unless explicitly requested by the project owner.
2. **Reuse Existing Tokens & Components:** Inspect [`src/style.css`](../../../src/style.css) and [`references/design-system-tokens.md`](./references/design-system-tokens.md) before adding new CSS rules or components.
3. **Industrial Precision Aesthetic:** Karali Fabrication is an engineering-grade structural steel and metal fabrication company. Visual style must convey **structural strength, dimensional accuracy, and B2B trustworthiness** — crisp borders, blueprint grid accents, structural steel navy (`#1F3C88`), safety orange (`#F5A623`), and high-contrast legibility.

---

## 2. Three-Layer Token System

Always use the semantic tokens in [`src/style.css`](../../../src/style.css) (detailed in [`references/design-system-tokens.md`](./references/design-system-tokens.md)):

- **Brand & Surface Palette:**
  - Primary Structural Navy: `--navy: #1f3c88`, `--navy-700: #183070`, `--navy-900: #0f1f4a`
  - High-Visibility Safety Orange: `--orange: #f5a623`, `--orange-600: #e0920f`, `--orange-100: #fdf0d8`
  - Neutral Surfaces & Ink: `--bg: #f4f6fa`, `--surface: #ffffff`, `--ink: #141d33`, `--muted: #4a5672`
  - Structural Borders: `--line: #dde3ee`, `--line-strong: #c3ccdc`
  - Status Tokens: `--success-bg` / `--success-ink`, `--danger` / `--danger-bg`, `--info-bg`
- **Typography Scale:**
  - Display / Headings (`--font-display`): `'Barlow Condensed'` (`600`, `700`), uppercase with tight line-height (`0.98–1.08`) for primary section headers.
  - Body & UI Controls (`--font-body`): `'Inter Variable'`, `1rem` (`16px` minimum on all form inputs to prevent iOS auto-zoom), line-height `1.6`, max measure `56–65ch`.
- **Spacing & Radii:**
  - Radii: `--radius-sm: 8px`, `--radius: 12px`, `--radius-lg: 20px`
  - Container: `--container: 1180px` with fluid horizontal padding `clamp(1.1rem, 4vw, 2rem)`
  - Focus Ring: `--focus-ring: 0 0 0 3px #fff, 0 0 0 6px var(--orange)`

---

## 3. Responsive Breakpoints & Mobile-First Ergonomics

1. **Zero Horizontal Overflow:** Every grid container must use `minmax(0, 1fr)` on mobile viewports (`< 960px`) and `min-width: 0` on grid children so long technical terms or input placeholders never cause horizontal scroll.
2. **Touch Targets:** All interactive buttons, phone/WhatsApp CTAs, combobox options, and navigation links must maintain a minimum hit area of `44x44px` (`54px` height for primary CTAs and `56px` height for form inputs).
3. **Breakpoints:**
   - `<= 640px` (Mobile): Single-column stack, full-width primary/secondary CTAs, compact icon-only header call button, sticky/accessible contact actions, combobox scrolls into view on focus.
   - `641px–959px` (Tablet): Fluid spacing, multi-chip service rows, 2-column card grids where appropriate.
   - `>= 960px` (Desktop): Asymmetric 2-column hero grids (`1.15fr / 0.85fr`), 3-column service/catalogue grids.

---

## 4. Component Design Patterns for Karali Fabrication

### A. Service Pages & Cards (Structural Steel, Lift Shafts, Sheds, Staircases/Railings)
- Structure each service card/section around **engineering clarity**:
  1. Clear category eyebrow (`0.78rem`, uppercase, `--navy`)
  2. Display heading (`Barlow Condensed`, uppercase)
  3. Concrete scope summary (materials, structural applications, fabrication & on-site assembly workflow)
  4. Technical specification pills/table (only verified specs — never invent certifications or capacities)
  5. Direct contextual CTA (*Request Quote for this Service* / *WhatsApp Enquiry*)

### B. Product & Project Catalogue
- Filter controls (by category: Structural Steel, Lift Shaft Steelwork, Crash Decks, Industrial Sheds, Staircases & Railings, Gates) must use accessible `aria-pressed` filter chips or the existing WAI-ARIA combobox pattern.
- Empty filter states must provide a one-click reset and a direct link to request custom fabrication.

### C. Lead & Quote Forms
- Keep forms progressive and low-friction:
  - Always validate inputs client-side before network calls AND enforce constraints via Supabase RLS.
  - Lock inputs and show `aria-busy="true"` with a visible spinner while requests are in flight.
  - Show a green confirmation banner (`data-state="success"`) **only** after Supabase confirms the insert.
  - Keep direct fallback channels (`tel:+917977591792` and `https://wa.me/917977591792`) visible alongside every form.

---

## 5. Pre-Delivery UI/UX Checklist

Before completing any UI change:
- [ ] All colors, fonts, radii, and shadows reference CSS custom properties in `src/style.css`.
- [ ] All form inputs have explicit `<label for="...">` elements, `font-size >= 1rem`, and `aria-invalid` / `aria-describedby` wiring.
- [ ] `:focus-visible` rings are clearly visible on every interactive element.
- [ ] Contrast ratios meet WCAG AA (`>= 4.5:1` for body text, `>= 3:1` for large headings and UI borders).
- [ ] Zero horizontal overflow on both `390px` (mobile) and `1280px` (desktop) viewports (`npm run test:e2e`).
