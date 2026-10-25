---
name: impeccable
description: >-
  Use this skill when critiquing, auditing, polishing, simplifying, or hardening
  the visual hierarchy, spacing, typography, component consistency, interaction
  details, and anti-AI-slop craft of Karali Fabrication frontend interfaces.
---

# Impeccable — Frontend Refinement & Anti-Slop Design Quality Skill

## Metadata & Provenance

- **Original Source Repository:** `pbakaus/impeccable` (https://github.com/pbakaus/impeccable — `.agents/skills/impeccable/SKILL.md`, Apache-2.0 License, v4.7.1)
- **Purpose:** Refine visual hierarchy, spacing rhythm, typographic contrast, accessibility, edge-case resilience, and remove generic AI-generated UI tells ("AI slop") across Karali Fabrication interfaces.
- **Installation & Usage:** Installed project-locally at `.agents/skills/impeccable/SKILL.md` in pure Markdown mode (without the external native binary launcher) alongside [`references/craft-and-anti-slop.md`](./references/craft-and-anti-slop.md). Use after or alongside `ui-ux-pro-max` to critique and polish UI work.
- **Required Dependencies & Credentials:** None. Zero external binaries or API keys required.
- **Antigravity Compatibility:** Native workspace skill discovered from `.agents/skills/impeccable/SKILL.md`. Harmonized with `ui-ux-pro-max` so token definitions live exclusively in `ui-ux-pro-max` (`src/style.css`).
- **Verification Command:** Confirm file presence with `Test-Path ".agents/skills/impeccable/SKILL.md"`.

---

## 1. Calibrate Ambition to Surface Mode

Before styling or refactoring a section, classify its primary mode:

1. **Persuade** *(Hero sections, Service showcases, Project highlights)*:
   - High typographic contrast (`Barlow Condensed` uppercase display headers paired with crisp `Inter` body text).
   - Purposeful industrial motifs (blueprint grid, Warren truss SVG, corner rivets, safety-orange accents) that reinforce structural steel craftsmanship.
2. **Read** *(Service specifications, Technical tolerances, Privacy notices, FAQs)*:
   - Quiet, scannable layout: `55–65ch` line width, generous vertical rhythm, clear subheadings, scannable tables/lists, zero decorative distraction.
3. **Operate** *(Locality combobox, Quote request forms, Catalogue filters, Admin views)*:
   - Maximum predictability and speed: unmistakable labels, `>= 44px` hit areas, instant keyboard navigation, explicit pending/error/success feedback, and zero layout shift when errors or dropdowns appear.

---

## 2. Visual Hierarchy & Spacing Rules

1. **One Dominant Focal Point per Viewport:** Every screen must make immediately clear what to read first (headline), what to understand second (service scope), and what action to take third (Call / WhatsApp / Quote submission).
2. **Grouping by Proximity before Borders:** Use tighter internal spacing (`0.45rem–0.85rem`) inside related field groups and wider structural gaps (`1.5rem–4rem`) between distinct sections. Do not wrap every sub-element in its own bordered box.
3. **Alignment Discipline:** Keep left edges aligned along a small number of shared vertical axes inside `.container`. Avoid centering body paragraphs longer than two lines.
4. **Defensive Layout (Harden):**
   - Test long locality names, multi-line error messages, narrow `360px` mobile screens, and `200%` browser zoom.
   - Ensure floating popovers (`.combobox__listbox`) can be dismissed via `Escape` or outside click so they never permanently block submit buttons.

---

## 3. Anti-AI-Slop Review Protocol

Run every new UI section or copy block through [`references/craft-and-anti-slop.md`](./references/craft-and-anti-slop.md) and eliminate:
- Generic SaaS gradients (purple/indigo/neon cyan) — stick strictly to Karali Fabrication's industrial Navy (`#1F3C88`) and Safety Orange (`#F5A623`).
- Identical 3-card icon grids with vague filler text ("Seamless Integration", "Next-Gen Solutions", "Unparalleled Excellence").
- Decorative elements that lack industrial/structural meaning.
- Fake metrics, unverified badges, placeholder "Lorem ipsum", or fabricated client quotes.
- Missing interactive states (every button/input needs `:hover`, `:focus-visible`, `:active`, `:disabled`, and `[aria-busy="true"]` states).
