# Karali Fabrication — Phase 3B Product & Fabrication Catalogue Proposal

## 1. Objective & Evidence-Based Scope

Provide a searchable, filterable **Fabrication & Steelwork Catalogue (`/catalogue/`)** that helps contractors, engineers, facility managers, and society committees quickly identify standard and custom-fabricated items and initiate a pre-filled WhatsApp or Quote enquiry.

In strict compliance with our **Zero Fabrication Policy (`AGENTS.md` Rule 4)**:
- We will **not** invent SKU numbers, off-the-shelf inventory stock counts, unverified load tables, or fixed prices.
- Every catalogue entry represents a **made-to-order / build-to-drawing fabrication capability** mapped to one of the 5 verified `CORE_SERVICES` pillars in [`src/data/services.js`](../../src/data/services.js).
- Dimensions, section sizes, material grades, and surface finishes are marked as *"Per Client Drawing / Site Measurement"* unless verified standard specs are supplied by the owner.

---

## 2. Proposed Catalogue Categories

Mapped directly to `CORE_SERVICES`:

1. **`all`** — All Fabrication Categories
2. **`structural-steel-fabrication`** — Structural Steel (Columns, Beams, Trusses, Portal Frames, Base Plates)
3. **`lift-shaft-steelwork-crash-decks`** — Lift Shafts & Site Safety (Lift Shaft Steel Cages, Divider Beams, Crash Decks, Working Platforms)
4. **`industrial-sheds-mezzanines`** — Sheds & Mezzanines (Factory Shed Frames, Mezzanine Floor Grids, Canopies)
5. **`staircases-railings-gates`** — Staircases, Railings & Gates (Fire-Exit Stairs, MS/SS Handrails, Sliding/Swing Compound Gates, Security Grilles)
6. **`custom-metal-fabrication`** — Custom Metalwork (Equipment Skids, Trench Covers, Drain Gratings, Pipe Supports)

---

## 3. Proposed Data Model (`src/data/catalogue.js`)

```js
{
  id: 'cat-lift-crash-deck',
  serviceSlug: 'lift-shaft-steelwork-crash-decks',
  categoryLabel: 'Lift Shafts & Crash Decks',
  title: 'Heavy-Duty Elevator Shaft Crash Deck',
  summary: 'Engineered steel and deck platform installed inside active elevator shafts for overhead site protection and working access.',
  executionBasis: 'Built to shaft dimensions & project engineer specifications',
  typicalApplications: ['High-rise construction cores', 'Lift installation & modernization'],
  whatsappText: 'Hello Karali Fabrication, I would like to enquire about an Elevator Shaft Crash Deck.',
}
```

---

## 4. Filtering & Search Behaviour

- **Category Filter Chips:** Accessible `<button type="button" aria-pressed="true|false" data-category="...">` buttons that filter cards client-side with zero page reload.
- **Keyword Search Input:** Case-insensitive search matching `title`, `summary`, `categoryLabel`, and `typicalApplications`.
- **Empty State:** When no items match a search query, display a clear message with a one-click **"Reset Filters"** button and a direct **"Discuss Custom Fabrication on WhatsApp"** CTA.

---

## 5. Enquiry Flow per Item

Each catalogue card includes:
1. **Primary CTA:** Pre-filled WhatsApp link (`https://wa.me/917977591792?text=...`) naming the exact catalogue item.
2. **Secondary Link:** Link to the parent dedicated service page (`/services/<serviceSlug>/`) for full workflow and scope details.
