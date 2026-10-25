# Karali Fabrication — GitHub Skills & Tooling Inventory (`docs/tooling/skills-inventory.md`)

**Audit Date:** 2026-10-25  
**Target Environment:** Google Antigravity (`AGENTS.md` + `.agents/skills/<skill-name>/SKILL.md`)  
**Target Stack:** Vite + Vanilla JavaScript (ES Modules) + CSS Custom Properties + Supabase (PostgreSQL + RLS) + Cloudflare Pages

Every repository below was audited as untrusted external input by inspecting its GitHub API metadata, branch status (`archived` flag), license, dependency manifests (`package.json`, `pyproject.toml`), installation scripts, and raw `SKILL.md` contents before making any installation decision.

---

## 1. Summary Classification Table

| # | Repository | License | Repo Status | Classification | Project-Local Path / Action |
|---|---|---|---|---|---|
| 1 | [`microsoft/playwright`](https://github.com/microsoft/playwright) | Apache-2.0 | Active (`main`) | **Configure as a development dependency** (+ **Install an individual skill only**) | `@playwright/test` in `package.json`, `playwright.config.js`, `e2e/coming-soon.spec.js`, and `.agents/skills/playwright-testing/SKILL.md` |
| 2 | [`leonxlnx/taste-skill`](https://github.com/leonxlnx/taste-skill) | MIT | Active (`main`) | **Unnecessary, redundant, archived, or not recommended** | Not installed — redundant with `ui-ux-pro-max` + `impeccable` and relies on external Wikimedia/Openverse image fetching scripts |
| 3 | [`nextlevelbuilder/ui-ux-pro-max-skill`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | MIT | Active (`main`) | **Install now** | `.agents/skills/ui-ux-pro-max/SKILL.md` (+ `references/design-system-tokens.md`) |
| 4 | [`alchaincyf/huashu-design`](https://github.com/alchaincyf/huashu-design) | MIT | Active (`master`) | **Unnecessary, redundant, archived, or not recommended** | Not installed — Chinese-primary multi-format studio (PPTX/video/infographics) requiring `pptxgenjs`/`pdf-lib`/`sharp` and optional Volcano Engine TTS keys |
| 5 | [`pbakaus/impeccable`](https://github.com/pbakaus/impeccable) | Apache-2.0 | Active (`main`) | **Install now** | `.agents/skills/impeccable/SKILL.md` (+ `references/craft-and-anti-slop.md`, pure Markdown mode without external binary downloads) |
| 6 | [`sickn33/agentic-awesome-skills`](https://github.com/sickn33/agentic-awesome-skills) | MIT | Active (`main`) | **Unnecessary, redundant, archived, or not recommended** | Not installed — 2,750+ uncurated mega-catalog (`8,589` `SKILL.md` files) would bloat repo and context window |
| 7 | [`gsd-build/get-shit-done`](https://github.com/gsd-build/get-shit-done) | MIT | **Archived** (moved to `open-gsd/gsd-core`) | **Unnecessary, redundant, archived, or not recommended** | Not installed — original repo is archived (`0` skills), and its successor (`@opengsd/gsd-core`) is a heavyweight autonomous phase-loop orchestrator |
| 8 | [`snarktank/ralph`](https://github.com/snarktank/ralph) | MIT | Active (`main`) | **Unnecessary, redundant, archived, or not recommended** | Not installed — autonomous bash loop (`ralph.sh`) that repeatedly modifies/commits code and requires Amp/Claude CLI |
| 9 | [`coderabbitai/skills`](https://github.com/coderabbitai/skills) | MIT | Active (`main`) | **Install an individual skill only** (+ **Configure later when credentials are available** for CLI) | `.agents/skills/code-review/SKILL.md` adapted for local Antigravity diff/RLS/security review; live CodeRabbit CLI requires account auth |
| 10 | [`RooCodeInc/Roo-Code`](https://github.com/RooCodeInc/Roo-Code) | Apache-2.0 | **Archived / Discontinued** (Shut down May 15) | **Not compatible with Antigravity** (and **Unnecessary, redundant, archived, or not recommended**) | Not installed — discontinued VS Code extension monorepo with only internal repo-maintenance skills |
| 11 | [`emilkowalski/skills`](https://github.com/emilkowalski/skills) | MIT | Active (`main`) | **Install an individual skill only** | `.agents/skills/ui-animation-and-stress-test/SKILL.md` (distilled from `emil-design-eng`, `animation-performance`, and `break-ui`) |
| 12 | [`AminForou/mcp-gsc`](https://github.com/AminForou/mcp-gsc) | MIT | Active (`main`) | **Configure later when credentials are available** | Documented MCP setup; requires Google Cloud OAuth/Service Account JSON + verified GSC property for `karalifabrication.in` |
| 13 | [`every-app/open-seo`](https://github.com/every-app/open-seo) | MIT | Active (`main`) | **Configure later when credentials are available** (or **Unnecessary, redundant, archived, or not recommended**) | Not installed — full-stack Cloudflare Worker/Docker app whose skills require a live OpenSEO MCP server and paid `DATAFORSEO_API_KEY` |
| 14 | [`zubair-trabzada/geo-seo-claude`](https://github.com/zubair-trabzada/geo-seo-claude) | MIT | Active (`main`) | **Unnecessary, redundant, archived, or not recommended** | Not installed as a separate plugin — Claude Code venv/subagent suite; useful local citation/entity rules folded into `.agents/skills/seo-and-local-schema/SKILL.md` |
| 15 | [`AgriciDaniel/claude-seo`](https://github.com/AgriciDaniel/claude-seo) | MIT | Active (`main`) | **Install an individual skill only** | Core technical/local SEO & JSON-LD rules adapted into `.agents/skills/seo-and-local-schema/SKILL.md` without the heavy Python/WeasyPrint/Matplotlib runtime |
| 16 | [`coreyhaines31/marketingskills`](https://github.com/coreyhaines31/marketingskills) | MIT | Active (`main`) | **Install an individual skill only** | Installed curated skills: `.agents/skills/cro-and-copywriting/SKILL.md`, `.agents/skills/seo-and-local-schema/SKILL.md`, `.agents/skills/analytics-and-conversions/SKILL.md` |
| 17 | [`firecrawl/firecrawl-workflows` (`firecrawl-seo-audit`)](https://github.com/firecrawl/firecrawl-workflows/blob/main/skills/firecrawl-seo-audit/SKILL.md) | ISC | Active (`main`) | **Configure later when credentials are available** | Not activated — requires `firecrawl` CLI, paid/authenticated `FIRECRAWL_API_KEY`, and Alexandria credits |

---

## 2. Detailed Repository Evaluations

### 1. `microsoft/playwright`
- **URL:** https://github.com/microsoft/playwright
- **Status & License:** Active (`main`), `Apache-2.0`.
- **Architecture:** Node.js cross-browser testing and automation framework (`@playwright/test`) plus official agent skills (`packages/playwright-core/src/tools/skills/playwright-cli/SKILL.md`).
- **Classification:** **Configure as a development dependency** (+ **Install an individual skill only**).
- **Rationale & Action Taken:** Installed `@playwright/test` in `package.json`, configured [`playwright.config.js`](../../playwright.config.js) against Vite (`http://127.0.0.1:4173`) across Desktop and Mobile viewports, created [`e2e/coming-soon.spec.js`](../../e2e/coming-soon.spec.js), and installed `.agents/skills/playwright-testing/SKILL.md` (incorporating upstream `playwright-cli` guidance and Karali Fabrication E2E regression requirements).

### 2. `leonxlnx/taste-skill`
- **URL:** https://github.com/leonxlnx/taste-skill
- **Status & License:** Active (`main`), `MIT`.
- **Architecture:** Agent skill (`design-taste-frontend`) paired with Node.js scripts (`scripts/draw.mjs`, `scripts/inspect.mjs`, `scripts/assets.mjs`) that fetch external stock images from Wikimedia Commons/Openverse/Met and launch local browser inspections.
- **Classification:** **Unnecessary, redundant, archived, or not recommended**.
- **Rationale:** Overlaps heavily with `ui-ux-pro-max` and `pbakaus/impeccable`. Furthermore, Karali Fabrication requires authentic industrial fabrication imagery rather than auto-fetched Wikimedia/Openverse stock art, and Playwright already handles deterministic browser inspection.

### 3. `nextlevelbuilder/ui-ux-pro-max-skill`
- **URL:** https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- **Status & License:** Active (`main`), `MIT`.
- **Architecture:** Multi-platform UI/UX design intelligence skill (`.claude/skills/ui-ux-pro-max/SKILL.md` and `.claude/skills/design-system/SKILL.md`) with three-layer token architecture (primitive → semantic → component), responsive breakpoints, typography/color hierarchy, and UX quality checklists.
- **Classification:** **Install now**.
- **Rationale & Action Taken:** Installed into [`.agents/skills/ui-ux-pro-max/SKILL.md`](../../.agents/skills/ui-ux-pro-max/SKILL.md) with [`references/design-system-tokens.md`](../../.agents/skills/ui-ux-pro-max/references/design-system-tokens.md), explicitly anchored to Karali Fabrication's Vite + Vanilla JS/CSS stack and industrial token palette (`--navy: #1F3C88`, `--orange: #F5A623`).

### 4. `alchaincyf/huashu-design`
- **URL:** https://github.com/alchaincyf/huashu-design
- **Status & License:** Active (`master`), `MIT`.
- **Architecture:** Chinese-primary (`SKILL.md` written in Mandarin) multi-medium studio skill covering PPTX slide decks, MP4 launch videos, print infographics, and iOS prototypes; depends on `pptxgenjs`, `pdf-lib`, `sharp`, and optional ByteDance Volcano Engine API keys (`DOUBAO_TTS_API_KEY`, `ARK_API_KEY`).
- **Classification:** **Unnecessary, redundant, archived, or not recommended**.
- **Rationale:** Adds heavy binary/Node dependencies (`sharp`, `pptxgenjs`) for slide decks and video generation that are unrelated to Karali Fabrication's web platform, and would create conflicting design rules with `ui-ux-pro-max` and `impeccable`.

### 5. `pbakaus/impeccable`
- **URL:** https://github.com/pbakaus/impeccable
- **Status & License:** Active (`main`), `Apache-2.0`.
- **Architecture:** Frontend design refinement and quality review harness (`.agents/skills/impeccable/SKILL.md`) with 62 deterministic anti-AI-slop rules, surface mode calibration (`Persuade`, `Read`, `Operate`), typography/spacing hierarchy, and accessibility checks.
- **Classification:** **Install now**.
- **Rationale & Action Taken:** Installed into [`.agents/skills/impeccable/SKILL.md`](../../.agents/skills/impeccable/SKILL.md) with [`references/craft-and-anti-slop.md`](../../.agents/skills/impeccable/references/craft-and-anti-slop.md) in safe, zero-binary Markdown mode (we intentionally omitted `scripts/impeccable` so the workspace never downloads unverified external binaries at runtime) and harmonized its rules with `ui-ux-pro-max`.

### 6. `sickn33/agentic-awesome-skills`
- **URL:** https://github.com/sickn33/agentic-awesome-skills
- **Status & License:** Active (`main`), `MIT`.
- **Architecture:** Mega-catalog containing 2,750+ skills (`8,589` total `SKILL.md` files across `skills/` and `plugins/`) and an `aas` MCP control plane.
- **Classification:** **Unnecessary, redundant, archived, or not recommended**.
- **Rationale:** Installing a 2,750-skill collection violates context hygiene, introduces overlapping/unvetted prompts, and bloats version control. We already install focused, audited skills directly from their primary upstream repositories.

### 7. `gsd-build/get-shit-done`
- **URL:** https://github.com/gsd-build/get-shit-done
- **Status & License:** **Archived** (`archived: true`, moved to `open-gsd/gsd-core`), `MIT`.
- **Architecture:** The requested repository URL is an archived redirect stub containing `0` skills. Its new home (`open-gsd/gsd-core`) is a 71-skill meta-prompting CLI (`@opengsd/gsd-core`) that manages its own `STATE.md`/`CONTEXT.md` files and subagent loops.
- **Classification:** **Unnecessary, redundant, archived, or not recommended**.
- **Rationale:** The requested repo is archived, and the successor framework overrides Antigravity's native planning/subagent lifecycle and safe approval gates.

### 8. `snarktank/ralph`
- **URL:** https://github.com/snarktank/ralph
- **Status & License:** Active (`main`), `MIT`.
- **Architecture:** Autonomous bash loop (`ralph.sh`) that repeatedly spawns `amp` or `claude` CLI instances to edit code and create Git commits until stories in `prd.json` pass.
- **Classification:** **Unnecessary, redundant, archived, or not recommended**.
- **Rationale:** Directly conflicts with project safety rules prohibiting autonomous coding loops that repeatedly modify files, commit code, or consume API credits without explicit owner approval.

### 9. `coderabbitai/skills`
- **URL:** https://github.com/coderabbitai/skills
- **Status & License:** Active (`main`), `MIT`.
- **Architecture:** Multi-agent wrapper (`skills/code-review/SKILL.md` and `skills/autofix/SKILL.md`) around the external `coderabbit` CLI binary and CodeRabbit cloud service.
- **Classification:** **Install an individual skill only** (+ **Configure later when credentials are available** for the external CodeRabbit CLI/GitHub App).
- **Rationale & Action Taken:** Installed [`.agents/skills/code-review/SKILL.md`](../../.agents/skills/code-review/SKILL.md), preserving upstream CodeRabbit CLI commands for when the `coderabbit` binary and account auth are configured, while providing a complete **offline Antigravity review checklist** (staged diff inspection, Supabase RLS & privilege review, secret scanning, and accessibility/CSP verification) that works immediately without an external account.

### 10. `RooCodeInc/Roo-Code`
- **URL:** https://github.com/RooCodeInc/Roo-Code
- **Status & License:** **Archived / Discontinued** (`archived: true`, shut down May 15), `Apache-2.0`.
- **Architecture:** Discontinued VS Code extension monorepo. Contains only 3 internal monorepo-maintenance skills (`.roo/skills/evals-context`, `roo-conflict-resolution`, `roo-translation`).
- **Classification:** **Not compatible with Antigravity** (and **Unnecessary, redundant, archived, or not recommended**).
- **Rationale:** Archived VS Code extension with no portable web-development skills.

### 11. `emilkowalski/skills`
- **URL:** https://github.com/emilkowalski/skills
- **Status & License:** Active (`main`), `MIT`.
- **Architecture:** 15 zero-dependency `SKILL.md` playbooks by Emil Kowalski covering UI engineering (`emil-design-eng`), CSS/web animation performance (`animation-performance`, `review-animations`), and adversarial UI stress-testing (`break-ui`).
- **Classification:** **Install an individual skill only**.
- **Rationale & Action Taken:** Installed the relevant web-engineering subset (`emil-design-eng`, `animation-performance`, and `break-ui` stress testing) into [`.agents/skills/ui-animation-and-stress-test/SKILL.md`](../../.agents/skills/ui-animation-and-stress-test/SKILL.md), omitting iOS/Swift/React-Expo skills (`write-swift`, `animate-expo`, `ask-sonner`).

### 12. `AminForou/mcp-gsc`
- **URL:** https://github.com/AminForou/mcp-gsc
- **Status & License:** Active (`main`), `MIT`.
- **Architecture:** Python MCP server (`mcp-search-console`) + 4 GSC workflow skills (`indexing-audit`, `cannibalization-check`, `content-opportunities`, `seo-weekly-report`).
- **Classification:** **Configure later when credentials are available**.
- **Rationale:** Requires a Google Cloud project with Search Console API enabled, an OAuth Client JSON or Service Account JSON credential, and verified Google Search Console property ownership for `karalifabrication.in`. Setup instructions are documented in [`docs/tooling/maintenance.md`](./maintenance.md) for activation once GSC credentials are created.

### 13. `every-app/open-seo`
- **URL:** https://github.com/every-app/open-seo
- **Status & License:** Active (`main`), `MIT`.
- **Architecture:** Full-stack Cloudflare Workers / Docker web application and MCP server whose 12 SEO skills (`plugins/openseo/skills/*`) require a running OpenSEO MCP backend and a paid `DATAFORSEO_API_KEY`.
- **Classification:** **Configure later when credentials are available** (and unnecessary to provision now).
- **Rationale:** The skills explicitly halt if the OpenSEO MCP server and paid DataForSEO credentials are not provisioned. Per project safety rules, we do not provision external infrastructure or paid SEO APIs automatically.

### 14. `zubair-trabzada/geo-seo-claude`
- **URL:** https://github.com/zubair-trabzada/geo-seo-claude
- **Status & License:** Active (`main`), `MIT`.
- **Architecture:** Claude Code plugin (`~/.claude/skills/geo`) with 5 Claude subagents and a Python virtualenv (`beautifulsoup4`, `reportlab`, `flask`) focused on Generative Engine Optimization (GEO) and `llms.txt`.
- **Classification:** **Unnecessary, redundant, archived, or not recommended** (as a standalone installation).
- **Rationale:** Installing a separate Python venv + Flask/ReportLab suite for GEO is unnecessary overhead at this stage. Key factual-clarity and entity-consistency principles for AI search citation are incorporated directly into `.agents/skills/seo-and-local-schema/SKILL.md` subordinate to core technical and local SEO.

### 15. `AgriciDaniel/claude-seo`
- **URL:** https://github.com/AgriciDaniel/claude-seo
- **Status & License:** Active (`main`), `MIT`.
- **Architecture:** Claude Code plugin with 26 core SEO skills, 9 paid-API extensions, 19 Claude subagents, and a heavy Python runtime (`weasyprint`, `matplotlib`, `trafilatura`, `openpyxl`).
- **Classification:** **Install an individual skill only**.
- **Rationale & Action Taken:** Rather than installing the Claude-specific plugin runner and heavy Python PDF/charting dependencies, we combined its technical SEO, local SEO (`seo-local`), and Schema.org (`seo-schema`) guidelines with `coreyhaines31/marketingskills` (`seo-audit`, `schema`, `site-architecture`) into [`.agents/skills/seo-and-local-schema/SKILL.md`](../../.agents/skills/seo-and-local-schema/SKILL.md).

### 16. `coreyhaines31/marketingskills`
- **URL:** https://github.com/coreyhaines31/marketingskills
- **Status & License:** Active (`main`), `MIT`.
- **Architecture:** 53 zero-dependency, standards-compliant `SKILL.md` playbooks (`agentskills.io`).
- **Classification:** **Install an individual skill only** (curated subset of 6 relevant skills consolidated into 3 focused project-local skills).
- **Rationale & Action Taken:** Inspected all 53 skills and selected only the 6 skills directly relevant to Karali Fabrication's B2B/industrial conversion and search goals (omitting SaaS churn, paywalls, cold email, influencer marketing, etc.):
  1. `cro` + `copywriting` → installed in [`.agents/skills/cro-and-copywriting/SKILL.md`](../../.agents/skills/cro-and-copywriting/SKILL.md) (with strict anti-fabrication rules for industrial B2B claims).
  2. `seo-audit` + `schema` + `site-architecture` (combined with `claude-seo` local SEO rules) → installed in [`.agents/skills/seo-and-local-schema/SKILL.md`](../../.agents/skills/seo-and-local-schema/SKILL.md).
  3. `conversion-tracking` → installed in [`.agents/skills/analytics-and-conversions/SKILL.md`](../../.agents/skills/analytics-and-conversions/SKILL.md) (enforcing firing events only after confirmed Supabase HTTP 201 writes).

### 17. `firecrawl/firecrawl-workflows` (`skills/firecrawl-seo-audit/SKILL.md`)
- **URL:** https://github.com/firecrawl/firecrawl-workflows/blob/main/skills/firecrawl-seo-audit/SKILL.md
- **Status & License:** Active (`main`), `ISC`.
- **Architecture:** Workflow skill that invokes the external `firecrawl` CLI (`firecrawl map`, `firecrawl scrape`, `firecrawl search`) using a paid `FIRECRAWL_API_KEY`.
- **Classification:** **Configure later when credentials are available**.
- **Rationale:** Every step in `firecrawl-seo-audit/SKILL.md` executes `firecrawl` CLI commands that require a paid/authenticated `FIRECRAWL_API_KEY` and incur API credit usage. For local and pre-production SEO verification without API charges, use `.agents/skills/seo-and-local-schema/SKILL.md` and Playwright E2E assertions.
