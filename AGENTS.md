# Karali Fabrication — Project AI Engineering Rules

These rules govern all AI-assisted development in the **Karali Fabrication** workspace (`https://karalifabrication.in`).

## 1. Preserve the Technology Stack & Architecture

- **Frontend:** Vite + Vanilla JavaScript (ES Modules in `src/`) + semantic HTML5 + CSS Custom Properties (`src/style.css`).
- **Backend & Database:** Supabase (`https://smdxbjkeruhjerbrdply.supabase.co`, PostgreSQL + Row Level Security).
- **Hosting:** Cloudflare Pages (`dist/` output, security headers in `public/_headers`).
- **Do NOT replace** Vite with Next.js, React, Vue, Tailwind, or another framework. **Do NOT replace** Supabase or Cloudflare.
- **Avoid unnecessary dependencies** and duplicate skills. Keep the runtime bundle small and fast.

## 2. Inspect Before Editing & Prefer Small Changes

- Always inspect existing source files, CSS tokens, tests, and Git status before proposing or making changes.
- Reuse existing components and utilities (`src/components/combobox.js`, `src/data/localities.js`, `src/lib/config.js`, `src/lib/supabase.js`, `src/lib/submit-locality.js`).
- Make small, focused, reviewable changes rather than sweeping rewrites.

## 3. Activate Project-Local Skills (`/.agents/skills/`)

Use the installed project-local skills for specialized work:

- **Design System & Layout:** [`ui-ux-pro-max`](./.agents/skills/ui-ux-pro-max/SKILL.md) (and [`references/design-system-tokens.md`](./.agents/skills/ui-ux-pro-max/references/design-system-tokens.md)) for tokens (`#1F3C88` navy, `#F5A623` orange), typography (`Barlow Condensed` + `Inter`), responsive breakpoints, and component patterns.
- **Visual Hierarchy & Anti-Slop Polish:** [`impeccable`](./.agents/skills/impeccable/SKILL.md) (and [`references/craft-and-anti-slop.md`](./.agents/skills/impeccable/references/craft-and-anti-slop.md)) for visual hierarchy, spacing, accessibility, and removing generic AI design tells.
- **Motion & Edge-Case Stress Testing:** [`ui-animation-and-stress-test`](./.agents/skills/ui-animation-and-stress-test/SKILL.md) for compositor-only transitions, `prefers-reduced-motion` support, and adversarial UI testing.
- **CRO & Industrial Copywriting:** [`cro-and-copywriting`](./.agents/skills/cro-and-copywriting/SKILL.md) for conversion-focused B2B copy and low-friction enquiry forms.
- **Technical SEO, Local MMR SEO & Schema:** [`seo-and-local-schema`](./.agents/skills/seo-and-local-schema/SKILL.md) for URL architecture, `<head>` metadata, Mumbai/Thane/Navi Mumbai local SEO, and Schema.org JSON-LD.
- **Conversion Measurement:** [`analytics-and-conversions`](./.agents/skills/analytics-and-conversions/SKILL.md) for firing lead events strictly on confirmed database writes.
- **Browser E2E Regression Testing:** [`playwright-testing`](./.agents/skills/playwright-testing/SKILL.md) for running and expanding Playwright tests (`e2e/`).
- **Pre-Commit Code & Security Review:** [`code-review`](./.agents/skills/code-review/SKILL.md) for diff inspection, RLS audits, and secret scanning.

## 4. Zero Fabrication Policy (Evidence-Only Business Content)

- **Never invent, guess, or extrapolate** company addresses, workshop capacities, project history, client names/logos, certifications (ISO/BIS/AWS), testimonials, pricing, or delivery timelines.
- Only publish business facts and photographs explicitly provided by the project owner.
- Phone (`tel:+917977591792`) and WhatsApp (`https://wa.me/917977591792`) CTAs must always work independently of JavaScript or database availability.

## 5. Supabase, RLS & Credential Security

- Only `VITE_SUPABASE_URL` and the public `VITE_SUPABASE_ANON_KEY` (publishable or anon key) may be used in frontend code.
- **Never** expose a Supabase `service_role` key, `sb_secret_...` key, database password, or personal access token in browser code, `.env.example`, Git history, or terminal logs.
- Never commit `.env.local` or any secret file.
- Every public table in `supabase/migrations/` must enable and force Row Level Security (`ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY`), revoke default privileges from `public, anon, authenticated`, and grant `anon` only minimal column-level `INSERT` permissions validated by server-side constraints.
- Never report a form submission as successful unless the database confirms the write (`error === null`).

## 6. Verification & Approval Gates

- Run `npm test` (Vitest unit & migration safety tests), `npm run build` (Vite production build), and `npm run test:e2e` (Playwright desktop & mobile browser tests) after meaningful changes.
- **Wait for explicit owner approval before:**
  - Executing SQL migrations or modifying live Supabase data/policies
  - Creating Git commits, pushing branches, or merging pull requests
  - Deploying to Cloudflare Pages or modifying DNS / custom domain settings
  - Deleting existing project files or making destructive changes
- Document architectural decisions, audit findings, and any incomplete or deferred work clearly (see [`docs/tooling/`](./docs/tooling/)).
