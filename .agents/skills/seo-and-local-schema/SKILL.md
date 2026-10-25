---
name: seo-and-local-schema
description: >-
  Use this skill when planning site architecture, URLs, internal linking,
  technical SEO metadata, canonical tags, sitemaps, robots.txt, Mumbai/MMR
  local SEO, or Schema.org JSON-LD structured data for Karali Fabrication.
---

# Technical SEO, Local SEO & Schema.org Skill

## Metadata & Provenance

- **Original Source Repositories:**
  - `coreyhaines31/marketingskills` (https://github.com/coreyhaines31/marketingskills — `skills/seo-audit/SKILL.md`, `skills/schema/SKILL.md`, `skills/site-architecture/SKILL.md`, MIT License)
  - `AgriciDaniel/claude-seo` (https://github.com/AgriciDaniel/claude-seo — `skills/seo-local/SKILL.md`, `skills/seo-technical/SKILL.md`, `skills/seo-schema/SKILL.md`, MIT License)
- **Purpose:** Guide site information architecture, on-page technical SEO, local MMR search visibility (Mumbai, Thane, Navi Mumbai), and valid Schema.org JSON-LD markup without requiring paid third-party SEO API keys.
- **Installation & Usage:** Installed project-locally at `.agents/skills/seo-and-local-schema/SKILL.md`. Activate when creating new pages, editing `<head>` metadata, structuring service/catalogue URLs, or adding JSON-LD structured data.
- **Required Dependencies & Credentials:** None for on-page/technical SEO and schema generation. (Optional external integrations like Google Search Console MCP or Firecrawl require separate user credentials and are documented in `docs/tooling/maintenance.md`.)
- **Antigravity Compatibility:** Native workspace skill discovered from `.agents/skills/seo-and-local-schema/SKILL.md`.
- **Verification Command:** Confirm file presence with `Test-Path ".agents/skills/seo-and-local-schema/SKILL.md"` and run `npm run test:e2e` to verify metadata/canonical assertions.

---

## 1. Site Architecture & URL Conventions (`site-architecture`)

Keep the URL hierarchy shallow (max 2–3 levels), descriptive, lowercase, and hyphen-separated:

- `/` — Home (Brand overview, core service pillars, MMR coverage, primary CTAs)
- `/services/structural-steel-fabrication` — Structural steel frameworks, beams, columns, trusses
- `/services/lift-shaft-steelwork-crash-decks` — Lift shaft steelwork, crash decks, working platforms
- `/services/industrial-sheds-mezzanines` — Factory sheds, PEB structures, mezzanine floors
- `/services/staircases-railings-gates` — MS/SS staircases, safety railings, industrial & society gates
- `/services/custom-metal-fabrication` — Custom sheet/plate/section fabrication & site welding
- `/catalogue` — Searchable product & fabrication component catalogue
- `/projects` — Completed work gallery (only verified owner-supplied photos)
- `/request-quote` — Multi-step quote & BoQ submission form
- `/contact` — Direct phone, WhatsApp, service-area map/localities

**Internal Linking Rules:**
- Every service page must link to `/request-quote` (pre-selecting that service where helpful) and related services.
- Every page must be reachable within `<= 2` clicks from the Home page.

---

## 2. On-Page Technical SEO Checklist (`seo-audit` & `seo-technical`)

Every indexable HTML page must include:

1. **Unique `<title>` (`50–60` characters):**
   - Pattern: `<Primary Service or Page> | Karali Fabrication — Mumbai, Thane & Navi Mumbai`
2. **Unique `<meta name="description">` (`140–160` characters):**
   - Clearly state the fabrication service, MMR coverage (Mumbai, Thane, Navi Mumbai), and direct contact (`+91 79775 91792`).
3. **Self-Referencing `<link rel="canonical">`:**
   - Always use the canonical `https://karalifabrication.in/...` HTTPS URL.
4. **Heading Hierarchy:**
   - Exactly **one `<h1>`** per page matching the primary page topic, followed by logical `<h2>` and `<h3>` sub-sections. Never skip heading levels for styling.
5. **OpenGraph & Social Meta:**
   - `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:locale="en_IN"`.
6. **Core Web Vitals & Crawlability:**
   - Self-hosted fonts (`@fontsource`), explicit `width`/`height` on images/SVGs to maintain `CLS = 0`, lazy-loaded non-critical JS chunks, and clean `robots.txt` + `sitemap.xml` when multi-page routes go live.

---

## 3. Local SEO for Mumbai, Thane & Navi Mumbai (`seo-local`)

1. **Consistent NAP+W (Name, Area, Phone, Website):**
   - **Name:** Karali Fabrication
   - **Phone / WhatsApp:** `+91 79775 91792` (`tel:+917977591792` / `https://wa.me/917977591792`)
   - **Website:** `https://karalifabrication.in`
   - **Service Regions:** Mumbai, Thane, Navi Mumbai (57 curated localities in `src/data/localities.js`).
   - *Never* invent a street address or postal code in visible text or JSON-LD until the owner provides the verified workshop/office address.
2. **Genuine Regional Relevance:**
   - Reference real industrial/commercial hubs naturally from our curated locality list (e.g., MIDC/industrial corridors across Andheri, Kurla, Mulund, Bhandup, Vikhroli, Thane, Kalwa, Dombivli, Kalyan, Ambernath, Badlapur, Vashi, Nerul, Belapur, Kharghar, Panvel, Airoli, Rabale/Ghansoli, Koparkhairane, Taloja).

---

## 4. Schema.org JSON-LD Rules (`schema` & `seo-schema`)

1. **Format:** Always use `<script type="application/ld+json">`.
2. **Truthfulness:** Every property in JSON-LD **must** match visible page content and verified business facts. Omit `streetAddress`, `postalCode`, `geo`, `aggregateRating`, or `review` fields unless verified data exists.
3. **Recommended Schema Types for Karali Fabrication:**
   - **Home / Contact Page:** `LocalBusiness` (or `HomeAndConstructionBusiness`) with `name`, `url`, `telephone: "+91-7977591792"`, and `areaServed` (`Mumbai`, `Thane`, `Navi Mumbai`).
   - **Service Pages:** `Service` linked to `provider` (`Karali Fabrication`) and `areaServed`.
   - **Multi-Page Navigation:** `BreadcrumbList`.
   - **Service FAQs (when present visibly on page):** `FAQPage`.
