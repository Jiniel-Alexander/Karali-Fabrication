---
name: code-review
description: >-
  Use this skill when performing code reviews, pre-commit inspections, security
  and Supabase RLS audits, accessibility checks, or running CodeRabbit CLI
  reviews on Karali Fabrication changes.
---

# Code Review & Security Audit Skill

## Metadata & Provenance

- **Original Source Repository:** `coderabbitai/skills` (https://github.com/coderabbitai/skills — `skills/code-review/SKILL.md` v0.1.0, MIT License)
- **Purpose:** Perform structured code quality, security, Supabase RLS, CSP, and accessibility reviews on uncommitted diffs or pull requests — using either Antigravity's built-in local inspection workflow or the external CodeRabbit CLI when installed and authenticated.
- **Installation & Usage:** Installed project-locally at `.agents/skills/code-review/SKILL.md`. Activate before staging/committing code, reviewing database migrations, or preparing a pull request.
- **Required Dependencies & Credentials:**
  - **Local Antigravity Review Mode (Default):** Zero external dependencies or accounts required; uses `git diff`, `npm test`, `npm run build`, and `npm run test:e2e`.
  - **External CodeRabbit CLI Mode (Optional):** Requires the `coderabbit` CLI binary and an authenticated CodeRabbit account (`coderabbit auth status`). Currently not installed on this machine — do not pretend CodeRabbit CLI ran unless verified.
- **Antigravity Compatibility:** Native workspace skill discovered from `.agents/skills/code-review/SKILL.md`.
- **Verification Command:** Confirm file presence with `Test-Path ".agents/skills/code-review/SKILL.md"`.

---

## 1. Local Antigravity Review Protocol (Always Run)

Before any commit or PR recommendation, execute and inspect:

1. **Diff & Whitespace Hygiene:**
   ```powershell
   git status --short --ignored
   git diff --stat
   git diff --check
   ```
2. **Secret & Credential Scan:**
   - Verify `.env.local`, `.env.*` (except `.env.example`), `.dev.vars`, `*.pem`, and `*.key` are **never** staged.
   - Verify no `service_role` JWT, `sb_secret_...` key, database password, or personal access token appears in any file.
   - Verify `src/lib/config.js` continues to reject `service_role` and `sb_secret_` keys at runtime.
3. **Supabase & PostgreSQL Migration Safety:**
   - Every table in `public` must have `ENABLE ROW LEVEL SECURITY` and `FORCE ROW LEVEL SECURITY`.
   - Default broad grants must be revoked (`REVOKE ALL ON TABLE ... FROM public, anon, authenticated`).
   - `anon` must receive only minimal column-level `INSERT` grants for public lead/locality forms — **never** `SELECT`, `UPDATE`, or `DELETE` on visitor submissions.
   - Server-side `CHECK` constraints and RLS `WITH CHECK` clauses must validate inputs independently of browser code.
   - Frontend `.insert(...)` calls from `anon` must **not** chain `.select()`.
4. **Frontend Quality, CSP & Accessibility:**
   - Verify [`public/_headers`](../../../public/_headers) CSP matches all required `connect-src` / `font-src` / `img-src` origins.
   - Verify all unit tests (`npm test`), production build (`npm run build`), and browser E2E tests (`npm run test:e2e`) pass.

---

## 2. Optional External CodeRabbit CLI Workflow (When Configured)

If the project owner installs and authenticates the CodeRabbit CLI in the future:

```powershell
# 1. Verify CLI installation and authentication
coderabbit --version
coderabbit auth status

# 2. Run review on uncommitted changes
coderabbit review --plain -t uncommitted

# 3. Run review on branch against main
coderabbit review --plain --base main
```
If `coderabbit` is not found in `PATH` or not authenticated, clearly report that the review was performed using the **Local Antigravity Review Protocol** above.
