# Impeccable — Craft Floor & Anti-AI-Slop Checklist

Adapted from `pbakaus/impeccable` (Apache-2.0) for Karali Fabrication.

## 1. Visual & Structural Anti-Slop Rules

| Slop Pattern to Reject | Industrial Craft Replacement |
|---|---|
| Generic purple/blue SaaS gradients | Solid structural Navy (`--navy: #1f3c88`), crisp borders (`--line`), blueprint grid, and intentional Safety Orange (`--orange: #f5a623`) focal accents |
| Floating cards with heavy blurry shadows everywhere | Restrained elevation (`--shadow-sm` for pills, `--shadow` for primary interactive cards, `--shadow-pop` only for open popovers) |
| Cramped inputs or `< 16px` mobile text | `min-height: 56px` inputs with `font-size: 1rem` (`16px`) so iOS Safari never auto-zooms on focus |
| Unlabeled inputs relying only on placeholders | Persistent `<label class="field-label">` above every input + `<p class="field-hint">` below |
| Silent or optimistic fake form success | Explicit `aria-busy="true"` spinner during flight, `data-state="success"` only on HTTP 201, and actionable fallback links (`tel:` / `wa.me`) on error |

## 2. Typography & Micro-Copy Craft

- **No AI Rhetoric:** Never write *"In today's fast-paced construction landscape"*, *"Unlock the power of steel"*, or *"It's not just fabrication, it's peace of mind"*.
- **Name Concrete Fabrication Work:** Refer to actual work: *structural steel frameworks, lift shaft steelwork, crash decks, working platforms, staircases, railings, gates, industrial sheds, mezzanine floors, cutting, welding, and on-site erection*.
- **Numeric & Phone Formatting:** Always format Indian mobile numbers legibly in copy (`+91 79775 91792`) while keeping `href="tel:+917977591792"` and `href="https://wa.me/917977591792"` machine-readable.

## 3. Accessibility & Edge-Case Floor

1. **Keyboard Completeness:** Tab order follows visual reading order; `.skip-link` jumps straight to `#main`; custom widgets (`combobox`) support `ArrowDown`, `ArrowUp`, `Enter`, `Escape`, and `Tab`.
2. **Forced Colors & High Contrast:** Include `@media (forced-colors: active)` rules so active options and button borders remain visible in Windows High Contrast mode.
3. **Reduced Motion:** Respect `@media (prefers-reduced-motion: reduce)` by collapsing decorative animations (`animation-duration: 0.01ms !important`).
