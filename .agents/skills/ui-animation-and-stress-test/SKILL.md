---
name: ui-animation-and-stress-test
description: >-
  Use this skill when adding or reviewing CSS transitions, keyframe animations,
  micro-interactions, or stress-testing UI components for layout, pointer,
  keyboard, and viewport edge cases.
---

# UI Animation & Stress-Testing Skill

## Metadata & Provenance

- **Original Source Repository:** `emilkowalski/skills` (https://github.com/emilkowalski/skills — `emil-design-eng`, `animation-performance`, `break-ui`, MIT License)
- **Purpose:** Ensure all animations and micro-interactions on Karali Fabrication are fast, purposeful, compositor-friendly (`transform` and `opacity`), respect `prefers-reduced-motion`, and survive adversarial UI stress testing (`break-ui`).
- **Installation & Usage:** Installed project-locally at `.agents/skills/ui-animation-and-stress-test/SKILL.md`. Activate when adding hover/focus/popover transitions, page-load reveals, or stress-testing new interactive components.
- **Required Dependencies & Credentials:** None. Pure CSS and vanilla JS guidelines.
- **Antigravity Compatibility:** Native workspace skill discovered from `.agents/skills/ui-animation-and-stress-test/SKILL.md`.
- **Verification Command:** Confirm file presence with `Test-Path ".agents/skills/ui-animation-and-stress-test/SKILL.md"` and run `npm run test:e2e`.

---

## 1. Animation Engineering Principles (`emil-design-eng` & `animation-performance`)

1. **Animate Only Compositor Properties:**
   - Restrict animations and transitions to `transform` (`translate`, `scale`, `rotate`) and `opacity` (plus cheap paint properties like `color`, `background-color`, `border-color`, `box-shadow` on individual controls).
   - **Never** animate layout properties (`height`, `width`, `top`, `left`, `margin`, `padding`) that trigger main-thread reflow on every frame.
2. **Timing & Easing Discipline:**
   - Use `--ease: cubic-bezier(0.2, 0.7, 0.2, 1)` for responsive UI feedback.
   - Keep micro-interactions fast:
     - Option/button hover: `120ms–200ms`
     - Popover/listbox open: `150ms–180ms` (`translateY(-4px)` to `0`)
     - Active press feedback: instant or `<= 100ms`
   - High-frequency controls (such as moving `is-active` across combobox options with arrow keys) must be instant (`0ms` transform) so keyboard navigation feels lag-free.
3. **Progressive Enhancement & Reduced Motion:**
   - Gate entrance animations behind `.js` on `<html>` (added by `src/main.js`) so the page remains 100% visible if JavaScript is disabled or slow to load.
   - Always maintain the global `@media (prefers-reduced-motion: reduce)` override in `src/style.css`.

---

## 2. Adversarial UI Stress Testing (`break-ui` Protocol)

Before signing off on any interactive component (combobox, filter bar, modal, quote form, mobile menu), test these failure modes:

1. **Rapid / Double Interaction:**
   - Double-clicking or spamming Enter on the Submit button while a network request is pending (`submitting` lock + `submitBtn.disabled = true` must prevent duplicate inserts).
2. **Popover & Z-Index Collisions:**
   - Opening the combobox listbox when zero options match (`No matching locality`) and verifying the user can dismiss it (`Escape` / outside click / toggle button) without getting stuck unable to click the button underneath.
3. **Input Extremes:**
   - Empty submission, whitespace-only input (`"   "`), pasted text with leading/trailing spaces (`"  thane west "`), special characters, and SQL-like strings (`"Worli'); drop table x;--"`).
4. **Viewport Extremes:**
   - Narrow mobile (`360px–390px` width), landscape mobile (`height: 420px` where listbox `max-height: min(320px, 42dvh)` prevents clipping off-screen), and desktop (`1280px–1920px`).
5. **Network Failures & Offline State:**
   - `navigator.onLine === false`, slow 15-second timeout (`AbortController`), and HTTP `401`/`500` responses from Supabase.
