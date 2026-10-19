# Karali Fabrication — Coming Soon Landing Page

Temporary, production-quality **Coming Soon** landing page for **Karali Fabrication** (`https://karalifabrication.in`), built to verify the end-to-end **GitHub → Cloudflare Pages** deployment pipeline and a secure **Supabase** write path before launching the full website.

## Stack

- **Bundler:** Vite (static HTML, CSS, vanilla ES modules)
- **Database:** Supabase (`@supabase/supabase-js`, anonymous `INSERT`-only via Row Level Security)
- **Hosting target:** Cloudflare Pages
- **Tests:** Vitest (`npm test`)

---

## 1. Local Setup

### Prerequisites

- **Node.js** `>= 20` (`.nvmrc` pins Node `22`)
- **npm** `>= 10`

### Install dependencies

```bash
npm install
```

### Configure environment variables

1. Copy `.env.example` to `.env.local` (which is ignored by Git):

   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and set your public Supabase anon/publishable key from **Supabase Dashboard → Project Settings → API Keys**:

   ```ini
   VITE_SUPABASE_URL=https://smdxbjkeruhjerbrdply.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-or-publishable-key>
   ```

> **Security note:** Never place `service_role` keys, `sb_secret_...` keys, database passwords, or personal access tokens in `.env.local` or any `VITE_` variable. Everything prefixed with `VITE_` is bundled into public browser code. As a safeguard, `src/lib/config.js` detects and refuses `service_role` and `sb_secret_` keys at runtime.

### Run locally

```bash
# Start development server
npm run dev

# Run unit & migration safety tests
npm test

# Build production bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

> **Behaviour without `.env.local`:** The page, click-to-call button (`tel:+917977591792`), WhatsApp button (`https://wa.me/917977591792`), and searchable locality combobox all work without a database connection. Submitting the form when `VITE_SUPABASE_ANON_KEY` is not configured displays a clear *"Submissions are temporarily unavailable"* notice rather than a fake success message.

---

## 2. Database Migration (`supabase/migrations/`)

The proposed SQL migration is located at:

- [`supabase/migrations/20261020000000_create_location_test_submissions.sql`](./supabase/migrations/20261020000000_create_location_test_submissions.sql)

### What it creates

- **`private.is_allowed_locality(text)`**: Immutable allow-list check function in a non-exposed `private` schema restricting values to the 57 curated localities across Mumbai (31), Thane (14), and Navi Mumbai (12).
- **`public.location_test_submissions`**:
  - `id uuid primary key default gen_random_uuid()`
  - `locality text not null check (private.is_allowed_locality(locality))`
  - `created_at timestamptz not null default now()`
- **Row Level Security & Grants**:
  - RLS is enabled on `public.location_test_submissions`.
  - Default `ALL` privileges are revoked from `anon` and `authenticated`.
  - `anon` is granted **only** `INSERT (locality)` — the browser cannot supply its own `id` or `created_at`, and cannot `SELECT`, `UPDATE`, or `DELETE` rows.
  - The frontend inserts `{ locality }` without requesting returned rows.

### Applying the migration (only after owner approval)

Either paste the contents of `supabase/migrations/20261020000000_create_location_test_submissions.sql` into the **Supabase SQL Editor** and run it, or apply via the Supabase CLI:

```bash
npx supabase link --project-ref smdxbjkeruhjerbrdply
npx supabase db push
```

---

## 3. Cloudflare Pages Deployment Plan

| Setting | Value |
|---|---|
| **Framework preset** | Vite |
| **Root directory** | `/` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Production branch** | `main` |
| **Preview branches** | All non-production branches (`develop`, `feature/*`) |
| **Environment variables** (Production & Preview) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `NODE_VERSION=22` |

### Safe rollout sequence

1. **Git branches:** Commit on a feature branch (e.g. `feat/coming-soon`), push to GitHub, and open a Pull Request into `main`.
2. **Preview verification:** Connect the GitHub repository to Cloudflare Pages and verify the preview deployment URL (`*.pages.dev`) — including mobile layout, click-to-call, WhatsApp link, and live Supabase locality insert.
3. **Production merge:** Merge the reviewed PR into `main` to trigger the production Pages build.
4. **Custom domain (`karalifabrication.in`):** Attach `karalifabrication.in` in **Cloudflare Pages → Custom domains** only after preview verification succeeds. Add/update only the apex/`www` web records (`CNAME`), leaving existing `MX`, `TXT` (SPF/DKIM/DMARC), and other unrelated DNS records untouched.
