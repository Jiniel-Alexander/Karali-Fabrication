---
name: playwright-testing
description: >-
  Use this skill when writing, running, debugging, or expanding Playwright
  end-to-end browser tests across desktop and mobile viewports for the Karali
  Fabrication Vite application.
---

# Playwright Browser Automation & Regression Testing Skill

## Metadata & Provenance

- **Original Source Repository:** `microsoft/playwright` (https://github.com/microsoft/playwright — `packages/playwright-core/src/tools/skills/playwright-cli/SKILL.md`, Apache-2.0 License)
- **Purpose:** Run and maintain real browser regression tests (`@playwright/test`) verifying desktop and mobile layouts, navigation, click-to-call/WhatsApp CTAs, combobox accessibility, Supabase form states, console/page error freedom, and SEO metadata.
- **Installation & Usage:** Installed project-locally at `.agents/skills/playwright-testing/SKILL.md` paired with `@playwright/test` in [`package.json`](../../../package.json), [`playwright.config.js`](../../../playwright.config.js), and [`e2e/coming-soon.spec.js`](../../../e2e/coming-soon.spec.js).
- **Required Dependencies & Credentials:** `@playwright/test` (installed in `node_modules`) and Microsoft Edge (`msedge` channel on Windows) or Chromium in CI. Zero API keys required.
- **Antigravity Compatibility:** Native workspace skill discovered from `.agents/skills/playwright-testing/SKILL.md`.
- **Verification Command:** Run `npm run test:e2e`.

---

## 1. Test Architecture & Separation from Vitest

- **Unit & SQL Static Tests (Vitest):**
  - Directory: `tests/**/*.test.js`
  - Command: `npm test` (`vitest run`)
- **Browser End-to-End Tests (Playwright):**
  - Directory: `e2e/*.spec.js`
  - Config: [`playwright.config.js`](../../../playwright.config.js)
  - Command: `npm run test:e2e` (`playwright test`)
  - Web Server: Automatically runs `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort` against the built `dist/` bundle. Always run `npm run build` before `npm run test:e2e` when testing source changes.
  - Viewports Tested:
    - `desktop-chromium` (`1280x800`)
    - `mobile-chromium` (`Pixel 7` — `412x915` mobile touch emulation)

---

## 2. Mandatory Regression Coverage

Every major UI or routing change must be verified against these assertions in `e2e/`:

1. **Zero Runtime Errors:** Listen to `page.on('console')` (`type === 'error'`) and `page.on('pageerror')` and assert both arrays are empty.
2. **Responsive Layout Integrity:** Assert `document.documentElement.scrollWidth <= document.documentElement.clientWidth` on both desktop and mobile projects.
3. **Direct Contact CTAs:** Verify `tel:+917977591792` and `https://wa.me/917977591792` (`target="_blank"`, `rel*="noopener"`) are visible and intact.
4. **Searchable Combobox & Form States:**
   - Rejects empty or arbitrary unlisted text (`aria-invalid="true"`, `data-state="error"`).
   - Filters the 57 localities case-insensitively and selects via keyboard (`ArrowDown`, `Enter`) or pointer.
   - Uses `page.route('**/rest/v1/**', ...)` in automated tests so E2E runs deterministically test both HTTP `201` success and HTTP `401`/`500` error banners **without** inserting test spam into the live production Supabase database.
5. **SEO & Accessibility Semantics:**
   - Verify `<title>`, `<meta name="description">`, `<link rel="canonical">`, OpenGraph tags, `.skip-link`, `role="combobox"`, `aria-expanded`, and `role="status"` live regions.
6. **Honest Pending Tests:**
   - For features/routes not yet built (e.g., dedicated service sub-pages, product catalogue filters, multi-step quote form), use `test.skip(...)` with a clear prerequisite comment — **never** write fake passing assertions.
