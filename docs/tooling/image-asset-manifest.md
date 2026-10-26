# Karali Fabrication — Image Asset Manifest & Visual Strategy (Phase 3C)

**Status:** Active (`feature/coming-soon`)  
**Policy:** Zero Fabrication Policy (`AGENTS.md` Rule 4) — Never label illustrative or schematic graphics as completed Karali Fabrication client project photographs.

---

## 1. Initial Audit Findings (Why the Site Appeared Text-Heavy)

1. **Missing Image Assets in `public/`:** Prior to Phase 3C, `public/` contained only `favicon.svg`, `_headers`, `robots.txt`, and `sitemap.xml`. Zero `<img>` tags or standalone visual asset files existed across `index.html`, `services/*/index.html`, or `catalogue/index.html`.
2. **Text-Only Homepage Hero & Service Cards:**
   - The homepage hero (`index.html`) used a plain `#f4f6fa` background with an 8%-opacity stroke SVG (`svg.truss`) and no hero photograph/visual panel.
   - All 5 homepage service cards (`#services .service-card`) and related service cards on `/services/*/` and `/catalogue/` were text-only boxes without card media headers.
   - The capabilities section (`#capabilities`) consisted of two dense text lists and a 3-column text list of 57 localities without process visuals.
3. **Minimal Wireframe Placeholders:** The 3 gallery slots and 10 catalogue items used a 3-line geometric SVG wireframe (`svg.gallery-card__blueprint`) rather than rich, high-contrast industrial illustrations.
4. **Content-Security-Policy (`public/_headers`):** `img-src 'self' data:` is strictly enforced. External hotlinked images are both prohibited by project rules and blocked by CSP. All assets must reside locally under `public/images/`.

---

## 2. Image Asset Inventory (`public/images/`)

All 20 assets below are first-party, locally stored SVG industrial illustrations and technical schematics created specifically for this repository (MIT/first-party project license, zero external dependencies, 3–5 KB per file).

### Group A — Homepage Hero (`public/images/hero/`)

| Asset ID | Local Path (`public/`) | Public URL | Dimensions | Loading | Intended Section(s) | Classification / Source Type |
|---|---|---|---|---|---|---|
| `KF-HERO-01` | `public/images/hero/industrial-steel-fabrication-hero.svg` | `/images/hero/industrial-steel-fabrication-hero.svg` | `1280×800` (`16:10`) | `eager`, `fetchpriority="high"` | Homepage Hero (`index.html` `.hero`) | **First-Party Illustrative Industrial Visual** (Multi-bay structural portal frame, H-columns, roof truss & arc-welding graphic; not claimed as a specific client site photo) |

### Group B — Five Service Hero & Reused Service Card Visuals (`public/images/services/`)

Each service visual is used as the primary hero visual (`fetchpriority="high"`) on its dedicated `/services/<slug>/` page and reused (`loading="lazy"`) on the corresponding homepage service card (`#services`) and related-service cards so identical files are never duplicated.

| Asset ID | Local Path (`public/`) | Public URL | Dimensions | Intended Section(s) | Classification / Source Type |
|---|---|---|---|---|---|
| `KF-SVC-01` | `public/images/services/structural-steel-fabrication.svg` | `/images/services/structural-steel-fabrication.svg` | `800×500` (`16:10`) | 1. `/services/structural-steel-fabrication/` hero<br>2. Homepage `#service-structural-steel` card<br>3. Related service cards | **Technical Service Illustration / Placeholder** (Awaiting verified Karali Fabrication site photograph) |
| `KF-SVC-02` | `public/images/services/lift-shaft-steelwork-crash-decks.svg` | `/images/services/lift-shaft-steelwork-crash-decks.svg` | `800×500` (`16:10`) | 1. `/services/lift-shaft-steelwork-crash-decks/` hero<br>2. Homepage `#service-lift-shafts` card<br>3. Related service cards | **Technical Service Illustration / Placeholder** (Awaiting verified Karali Fabrication site photograph) |
| `KF-SVC-03` | `public/images/services/industrial-sheds-mezzanines.svg` | `/images/services/industrial-sheds-mezzanines.svg` | `800×500` (`16:10`) | 1. `/services/industrial-sheds-mezzanines/` hero<br>2. Homepage `#service-industrial-sheds` card<br>3. Related service cards | **Technical Service Illustration / Placeholder** (Awaiting verified Karali Fabrication site photograph) |
| `KF-SVC-04` | `public/images/services/staircases-railings-gates.svg` | `/images/services/staircases-railings-gates.svg` | `800×500` (`16:10`) | 1. `/services/staircases-railings-gates/` hero<br>2. Homepage `#service-staircases-railings-gates` card<br>3. Related service cards | **Technical Service Illustration / Placeholder** (Awaiting verified Karali Fabrication site photograph) |
| `KF-SVC-05` | `public/images/services/custom-metal-fabrication.svg` | `/images/services/custom-metal-fabrication.svg` | `800×500` (`16:10`) | 1. `/services/custom-metal-fabrication/` hero<br>2. Homepage `#service-custom-fabrication` card<br>3. Related service cards | **Technical Service Illustration / Placeholder** (Awaiting verified Karali Fabrication site photograph) |

### Group C — Ten Product & Fabrication Catalogue Illustrations (`public/images/catalogue/`)

| Asset ID | Local Path (`public/`) | Public URL | Dimensions | Intended Catalogue Item (`catalogue/index.html`) | Classification / Source Type |
|---|---|---|---|---|---|
| `KF-CAT-01` | `public/images/catalogue/cat-01-columns-beams-frames.svg` | `/images/catalogue/cat-01-columns-beams-frames.svg` | `640×400` (`16:10`) | `#cat-structural-columns-beams` — Structural Steel Columns, Beams & Portal Frames | **Labeled Schematic Placeholder** (`Schematic Placeholder · Awaiting Owner Asset`) |
| `KF-CAT-02` | `public/images/catalogue/cat-02-clear-span-roof-trusses.svg` | `/images/catalogue/cat-02-clear-span-roof-trusses.svg` | `640×400` (`16:10`) | `#cat-structural-roof-trusses` — Clear-Span Roof Trusses & Lattice Girders | **Labeled Schematic Placeholder** (`Schematic Placeholder · Awaiting Owner Asset`) |
| `KF-CAT-03` | `public/images/catalogue/cat-03-lift-shaft-steel-cage.svg` | `/images/catalogue/cat-03-lift-shaft-steel-cage.svg` | `640×400` (`16:10`) | `#cat-lift-shaft-steel-cage` — Lift Shaft Steel Structure & Divider Beams | **Labeled Schematic Placeholder** (`Schematic Placeholder · Awaiting Owner Asset`) |
| `KF-CAT-04` | `public/images/catalogue/cat-04-elevator-crash-deck-platform.svg` | `/images/catalogue/cat-04-elevator-crash-deck-platform.svg` | `640×400` (`16:10`) | `#cat-lift-crash-deck-platform` — Heavy-Duty Elevator Shaft Crash Deck & Working Platform | **Labeled Schematic Placeholder** (`Schematic Placeholder · Awaiting Owner Asset`) |
| `KF-CAT-05` | `public/images/catalogue/cat-05-mezzanine-floor-grid.svg` | `/images/catalogue/cat-05-mezzanine-floor-grid.svg` | `640×400` (`16:10`) | `#cat-industrial-mezzanine-floor` — Structural Steel Mezzanine Floor Grid & Decking | **Labeled Schematic Placeholder** (`Schematic Placeholder · Awaiting Owner Asset`) |
| `KF-CAT-06` | `public/images/catalogue/cat-06-industrial-shed-canopy.svg` | `/images/catalogue/cat-06-industrial-shed-canopy.svg` | `640×400` (`16:10`) | `#cat-industrial-shed-canopy` — Industrial Factory Shed & Loading Bay Canopy | **Labeled Schematic Placeholder** (`Schematic Placeholder · Awaiting Owner Asset`) |
| `KF-CAT-07` | `public/images/catalogue/cat-07-steel-staircases-handrails.svg` | `/images/catalogue/cat-07-steel-staircases-handrails.svg` | `640×400` (`16:10`) | `#cat-steel-staircase-handrails` — Steel Staircases, Fire-Exit Stairs & Safety Handrails | **Labeled Schematic Placeholder** (`Schematic Placeholder · Awaiting Owner Asset`) |
| `KF-CAT-08` | `public/images/catalogue/cat-08-sliding-swing-compound-gates.svg` | `/images/catalogue/cat-08-sliding-swing-compound-gates.svg` | `640×400` (`16:10`) | `#cat-sliding-swing-compound-gates` — Heavy-Duty Sliding & Swing Compound Gates | **Labeled Schematic Placeholder** (`Schematic Placeholder · Awaiting Owner Asset`) |
| `KF-CAT-09` | `public/images/catalogue/cat-09-custom-base-plates-brackets.svg` | `/images/catalogue/cat-09-custom-base-plates-brackets.svg` | `640×400` (`16:10`) | `#cat-custom-base-plates-brackets` — Custom Base Plates, Gussets & Structural Mounting Brackets | **Labeled Schematic Placeholder** (`Schematic Placeholder · Awaiting Owner Asset`) |
| `KF-CAT-10` | `public/images/catalogue/cat-10-equipment-skids-trench-covers.svg` | `/images/catalogue/cat-10-equipment-skids-trench-covers.svg` | `640×400` (`16:10`) | `#cat-equipment-skids-trench-covers` — Equipment Skids, Trench Covers & Chequered Plate Gratings | **Labeled Schematic Placeholder** (`Schematic Placeholder · Awaiting Owner Asset`) |

### Group D — Three Homepage Project Gallery Slots (`public/images/gallery/`)

| Asset ID | Local Path (`public/`) | Public URL | Dimensions | Intended Gallery Slot (`index.html` `#projects`) | Classification / Source Type |
|---|---|---|---|---|---|
| `KF-REF-01` | `public/images/gallery/gallery-01-structural-frame.svg` | `/images/gallery/gallery-01-structural-frame.svg` | `800×500` (`16:10`) | `#gallery-slot-structural` — Structural Beam, Column & Truss Assemblies | **Explicitly Labeled Portfolio Placeholder** (`Illustrative Placeholder · Awaiting Owner Site Photo`) |
| `KF-REF-02` | `public/images/gallery/gallery-02-lift-shaft-deck.svg` | `/images/gallery/gallery-02-lift-shaft-deck.svg` | `800×500` (`16:10`) | `#gallery-slot-shaft` — Elevator Shaft Steelwork & Working Platforms | **Explicitly Labeled Portfolio Placeholder** (`Illustrative Placeholder · Awaiting Owner Site Photo`) |
| `KF-REF-03` | `public/images/gallery/gallery-03-shed-mezzanine-access.svg` | `/images/gallery/gallery-03-shed-mezzanine-access.svg` | `800×500` (`16:10`) | `#gallery-slot-sheds-stairs` — Industrial Shed Trusses, Mezzanines & Staircases | **Explicitly Labeled Portfolio Placeholder** (`Illustrative Placeholder · Awaiting Owner Site Photo`) |

### Group E — Supporting Process & Workflow Visual (`public/images/process/`)

| Asset ID | Local Path (`public/`) | Public URL | Dimensions | Intended Section(s) | Classification / Source Type |
|---|---|---|---|---|---|
| `KF-PROC-01` | `public/images/process/fabrication-workflow-diagram.svg` | `/images/process/fabrication-workflow-diagram.svg` | `960×280` | 1. Homepage Capabilities & Process (`#capabilities`)<br>2. Dedicated Service Pages (`#scope`) | **First-Party Process Diagram** (3-stage workflow illustration: Drawing/BoQ Review → Cutting, Fit-Up & Welding → MMR Site Erection) |

---

## 3. How to Replace Placeholders with Verified Owner Photography Later

When the project owner supplies verified workshop or site photographs (`.webp` or `.jpg`):
1. Place the optimized image files under `public/images/services/`, `public/images/catalogue/`, or `public/images/gallery/`.
2. Update the `image` / `heroImage` path and `statusBadge` / `placeholderStatus` in [`src/data/services.js`](../../src/data/services.js) and [`src/data/catalogue.js`](../../src/data/catalogue.js).
3. Regenerate the static HTML pages and run `npm test`, `npm run build`, and `npm run test:e2e`.
