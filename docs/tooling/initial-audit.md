# Karali Fabrication — Initial Read-Only Tooling & Project Audit

**Audit Date:** 2026-10-25  
**Workspace Root:** `C:\Roy\Welderwale\Karali fabrication website`  
**GitHub Remote:** `https://github.com/Jiniel-Alexander/Karali-Fabrication.git`  
**Production Domain:** `https://karalifabrication.in`  
**Supabase Project:** `https://smdxbjkeruhjerbrdply.supabase.co` (`smdxbjkeruhjerbrdply`)

---

## 1. Current Project & Repository State

### 1.1 Working Directory & Git Status
- **Repository Root:** `C:\Roy\Welderwale\Karali fabrication website`
- **Current Branch:** `feature/coming-soon` (tracking `origin/feature/coming-soon`, commit `984e134`)
- **Uncommitted Changes (Preserved):**
  - `M .env.example` — Updated placeholder to `YOUR_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`.
  - `M src/lib/config.js` — Generalized case-insensitive placeholder detection (`/^(your[-_]|<your|replace[-_]|placeholder)/i`).
  - `M src/main.js` — Added `combobox.setDisabled(value)` while a form submission is in flight.
  - `M supabase/migrations/20261020000000_create_location_test_submissions.sql` — Added `if not exists`, `force row level security`, `revoke all ... from public, anon, authenticated`, and `drop policy if exists`.
  - `M tests/submit.test.js` — Added tests for all 57 localities, the `YOUR_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` placeholder, and updated RLS assertions.
- **Untracked / Ignored Files:**
  - `.env.local` (verified Git-ignored via `git check-ignore .env.local`)
  - `dist/` (verified Git-ignored)
  - `node_modules/` (verified Git-ignored)

### 1.2 Package Manager, Manifest & Lockfile
- **Package Manager:** `npm` v10.9.2 with `package-lock.json` (`lockfileVersion: 3`)
- **Node.js Runtime:** `v22.17.1` (pinned to `22` in `.nvmrc`; `engines.node >= 20` in `package.json`)
- **Python Runtime:** `Python 3.13.5` (available in system `PATH`, useful for optional skill search scripts)
- **Production Dependencies (`package.json`):**
  - `@fontsource-variable/inter`: `^5.3.0`
  - `@fontsource/barlow-condensed`: `^5.3.0`
  - `@supabase/supabase-js`: `^2.118.0`
- **Development Dependencies (`package.json`):**
  - `vite`: `^8.3.4`
  - `vitest`: `^5.0.5`
- **Existing NPM Scripts:**
  - `dev`: `vite`
  - `build`: `vite build`
  - `preview`: `vite preview`
  - `test`: `vitest run`

### 1.3 Vite Configuration & Source Structure
- [`vite.config.js`](../../vite.config.js):
  - `build.outDir`: `'dist'`, `build.sourcemap`: `false`
  - `test.environment`: `'node'`, `test.include`: `['tests/**/*.test.js']`
- **Source Files:**
  - [`index.html`](../../index.html): Responsive industrial-themed Coming Soon page with Karali Fabrication branding, click-to-call (`tel:+917977591792`), WhatsApp (`https://wa.me/917977591792`), and searchable locality combobox.
  - [`src/main.js`](../../src/main.js): Form controller with lazy Supabase client loading and accessible status messages.
  - [`src/style.css`](../../src/style.css): Industrial design tokens (`#1F3C88` navy, `#F5A623` safety orange), blueprint grid, hazard stripe, and mobile-first responsive rules.
  - [`src/components/combobox.js`](../../src/components/combobox.js): WAI-ARIA 1.2 searchable combobox component.
  - [`src/data/localities.js`](../../src/data/localities.js): Single source of truth for the 57 curated localities across Mumbai (31), Thane (14), and Navi Mumbai (12).
  - [`src/lib/config.js`](../../src/lib/config.js): Environment variable validator that blocks missing, placeholder, and privileged (`service_role` / `sb_secret_`) keys.
  - [`src/lib/supabase.js`](../../src/lib/supabase.js): Session-less `@supabase/supabase-js` client factory.
  - [`src/lib/submit-locality.js`](../../src/lib/submit-locality.js): Write-only `insert({ locality })` wrapper with a 15-second `AbortController` timeout and error sanitization.

### 1.4 Existing Tests
- [`tests/localities.test.js`](../../tests/localities.test.js): 11 unit tests verifying region counts, uniqueness, search/filter ranking, and exact match between the JS locality array and the SQL migration allow-list.
- [`tests/submit.test.js`](../../tests/submit.test.js): 13 unit tests verifying valid submissions across all 57 localities, rejection of arbitrary text, missing/placeholder key handling, privileged key rejection, timeout handling, and SQL migration RLS assertions.
- **Browser / E2E Tests:** None installed yet (`@playwright/test` is not yet configured).

### 1.5 Supabase & Cloudflare Pages Configuration
- **Supabase Migration:** [`supabase/migrations/20261020000000_create_location_test_submissions.sql`](../../supabase/migrations/20261020000000_create_location_test_submissions.sql) defines `private.is_allowed_locality(text)` and `public.location_test_submissions` with RLS enabled/forced and column-level `INSERT (locality)` for `anon`.
- **Cloudflare Pages Configuration:** [`public/_headers`](../../public/_headers) defines strict `Content-Security-Policy`, `Permissions-Policy: geolocation=()`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and immutable asset caching for `/assets/*`.

---

## 2. Existing Antigravity Environment & Customization Support

Inspected via the built-in `agy-customizations` reference (`C:\Users\MSUSERSL123\.gemini\antigravity\builtin\skills\agy-customizations\SKILL.md`):

1. **Supported Project-Local Skill Discovery Path:**
   - `.agents/skills/<skill-name>/SKILL.md` at the repository root (`C:\Roy\Welderwale\Karali fabrication website\.agents\skills\`).
   - Each `SKILL.md` requires YAML frontmatter with `name` (lowercase, hyphenated) and `description` (third-person trigger description), plus optional `references/`, `scripts/`, `resources/`, or `examples/` subdirectories.
   - Antigravity uses **progressive disclosure**: only `name` and `description` are loaded initially, and full skill content is read on demand.
2. **Supported Project-Local Rules Discovery Path:**
   - `AGENTS.md` (or `GEMINI.md`) at the repository root.
   - Standalone `AGENTS.md` files do not use YAML frontmatter, are always active for the repository scope, and have a `24 KB` per-file cap.
3. **Current Project-Local Customizations:**
   - No `.agents/` directory, `AGENTS.md`, or `GEMINI.md` exists in the repository yet.
4. **Current Global Rules & MCP Servers:**
   - Global rule: `C:\Users\MSUSERSL123\.gemini\config\plugins\science\rules\AGENTS.md` (Science visualization sidecar rule).
   - Global MCP server: `science_biomolecular_structure_viewer_mcp` (unrelated to web development). No Supabase or Google Search Console MCP server is currently configured.

---

## 3. Risks & Compatibility Findings

1. **Framework Preservation:** Some third-party design skills default to React, Next.js, Tailwind, or shadcn/ui examples. Project-local skills and `AGENTS.md` must explicitly instruct the agent to preserve the **Vite + Vanilla JavaScript + CSS custom properties** architecture.
2. **Untrusted Repository Scripts & CLI Installers:** Several GitHub skill repositories advertise `npx` installers or shell scripts that write to global directories (`~/.claude`, `~/.cursor`, etc.) or pull unpinned packages. Instead of running opaque remote installer scripts, we will inspect the raw `SKILL.md` and reference files directly and vendor clean, audited project-local skills into `.agents/skills/`.
3. **Autonomous Coding Loops:** Repositories such as `snarktank/ralph` and `gsd-build/get-shit-done` implement autonomous multi-commit loops or full-repo meta-prompting orchestration that conflict with our strict approval rules (no unapproved commits, pushes, DB writes, or deployments). These must **not** be enabled.
4. **Vitest vs. Playwright Test Runner Collision:** Vitest is configured with `include: ['tests/**/*.test.js']`. Playwright E2E tests should be placed in a separate directory (`e2e/*.spec.js`) so `npm test` (Vitest) and `npm run test:e2e` (Playwright) never collide.
5. **Fabricated Content Risk:** Marketing and SEO skills often encourage adding social proof, client counts, or certifications. Every installed marketing/SEO/design skill and `AGENTS.md` must enforce a strict zero-fabrication rule for Karali Fabrication.

---

## 4. Proposed Installation Plan

1. **Audit all 17 GitHub repositories** in [`docs/tooling/skills-inventory.md`](./skills-inventory.md) with exact classifications and rationale.
2. **Install Core Project-Local Skills** under `.agents/skills/<skill-name>/SKILL.md`:
   - `ui-ux-pro-max` (from `nextlevelbuilder/ui-ux-pro-max-skill`, tailored for Vite + Vanilla JS/CSS industrial fabrication UI and backed by its design tokens/checklists).
   - `frontend-design-review` (adapted from `pbakaus/impeccable` and `emilkowalski/skills` for visual hierarchy, spacing, typography, motion restraint, and anti-AI-slop review).
   - `cro-and-copywriting` (curated from `coreyhaines31/marketingskills`: page-cro, copywriting, form-cro, and analytics-tracking with strict evidence-only guardrails).
   - `technical-and-local-seo` (synthesized from `AgriciDaniel/claude-seo`, `firecrawl-seo-audit`, and `zubair-trabzada/geo-seo-claude` for MMR/India local fabrication SEO, `LocalBusiness` JSON-LD, meta tags, and crawlability without requiring paid API keys).
   - `code-review-and-security` (adapted from `coderabbitai/skills` for static diff review, Supabase RLS review, secret scanning, and accessibility verification).
   - `playwright-Verification` (runbook for running and maintaining Playwright E2E regression checks).
3. **Install & Configure Playwright (`@playwright/test`)** as a development dependency in `package.json`:
   - Create [`playwright.config.js`](../../playwright.config.js) wired to Vite (`npm run preview -- --port 4173`) and local Chromium/Edge.
   - Add `e2e/coming-soon.spec.js` covering desktop/mobile layout, navigation/landmarks, click-to-call & WhatsApp links, combobox search/selection, form validation, unconfigured/error state handling, broken links/console errors, basic accessibility checks, and SEO metadata/canonical URLs (plus `test.skip` stubs for future multi-page catalogue/quote routes).
4. **Create Project Rules (`AGENTS.md`)** at the repository root enforcing stack preservation, design/marketing/SEO skill usage, Playwright regression checks, Supabase RLS safety, and non-negotiable approval gates.
5. **Document Setup & Maintenance** in [`docs/tooling/installation-report.md`](./installation-report.md) and [`docs/tooling/maintenance.md`](./maintenance.md), and verify all tests (`npm test` and `npm run test:e2e`) and production build (`npm run build`).
