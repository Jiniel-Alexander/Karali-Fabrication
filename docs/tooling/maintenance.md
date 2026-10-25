# Karali Fabrication — Tooling & Skills Maintenance Guide

This guide explains how to reproduce the development environment on another machine, run all verification suites, maintain project-local AI skills, and optionally connect external services when credentials become available.

---

## 1. Reproducible Setup on a New Machine

No global packages or committed secrets are required.

```powershell
# 1. Clone the private repository and switch to the active branch
git clone https://github.com/Jiniel-Alexander/Karali-Fabrication.git
cd "Karali-Fabrication"

# 2. Install locked dependencies (Node.js >= 20, Node 22 recommended per .nvmrc)
npm ci

# 3. Create local environment file (git-ignored)
Copy-Item .env.example .env.local
# Edit .env.local and set VITE_SUPABASE_ANON_KEY to the public anon/publishable key
# from Supabase Dashboard -> Project Settings -> API Keys.

# 4. Run unit/migration/tooling tests, build, and browser E2E tests
npm test
npm run build
npm run test:e2e
```

> **Browser note for Playwright:** On Windows, [`playwright.config.js`](../../playwright.config.js) uses the pre-installed system Microsoft Edge (`channel: 'msedge'`) so no extra browser download is required locally. On Linux/macOS or CI (`CI=true`), run `npx playwright install chromium` once to install the headless Chromium binary.

---

## 2. Everyday Verification Commands

| Command | What It Verifies | When to Run |
|---|---|---|
| `npm test` | Vitest suite (`tests/localities.test.js`, `tests/submit.test.js`, `tests/tooling.test.js`): 57-locality parity between JS and SQL, submission logic, key safety, and skill/rule file integrity | After any JS, SQL, or skill/rule edit |
| `npm run build` | Vite production bundle (`dist/`) | Before running `npm run test:e2e` or preparing a commit |
| `npm run test:e2e` | Playwright browser suite (`e2e/coming-soon.spec.js`) across desktop (`1280x800`) and mobile (`Pixel 7`) viewports | After any HTML, CSS, UI component, or routing change |

---

## 3. Adding or Updating Project-Local Skills

1. **Location:** Place project-local skills in `.agents/skills/<skill-name>/SKILL.md`.
2. **Required YAML Frontmatter:**
   ```markdown
   ---
   name: skill-name-in-kebab-case
   description: >-
     Third-person description of when the agent should activate this skill.
   ---
   ```
3. **Progressive Disclosure:** Keep `SKILL.md` concise and store bulky reference tables in `.agents/skills/<skill-name>/references/*.md`.
4. **Security Rule:** Never copy unreviewed shell scripts or binary launchers into `.agents/skills/`. Treat all upstream GitHub repositories as untrusted input.

---

## 4. Optional External Integrations (Configure Later When Credentials Are Available)

The following tools were audited in [`skills-inventory.md`](./skills-inventory.md) and deferred because they require external accounts, OAuth credentials, or paid API keys:

### A. Google Search Console MCP (`AminForou/mcp-gsc`)
- **Prerequisites:**
  1. Verified ownership of `https://karalifabrication.in` in Google Search Console.
  2. A Google Cloud project with the **Google Search Console API** enabled and a Service Account JSON or OAuth Desktop Client JSON file stored **outside** the Git repository (e.g., `C:\Users\<user>\.credentials\gsc-service-account.json`).
- **Configuration (when ready):**
  Register the MCP server in your user-level Antigravity MCP config (`mcp_config.json`) running `uvx mcp-search-console` with `GSC_CREDENTIALS_PATH`. Never store the Google credentials JSON inside the repository.

### B. CodeRabbit CLI (`coderabbitai/skills`)
- **Prerequisites:**
  1. Install the CodeRabbit CLI binary and authenticate (`coderabbit auth login`).
- **Usage:** Once authenticated, `.agents/skills/code-review/SKILL.md` can invoke `coderabbit review --plain -t uncommitted` alongside the built-in local Antigravity review checklist.

### C. Firecrawl SEO Audit (`firecrawl-seo-audit`) / OpenSEO (`every-app/open-seo`)
- **Prerequisites:** Requires paid third-party API keys (`FIRECRAWL_API_KEY` or `DATAFORSEO_API_KEY`). Not required for Phase 1–3 development; rely on `.agents/skills/seo-and-local-schema/SKILL.md` and Playwright E2E checks instead.
