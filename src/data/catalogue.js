/**
 * Maintainable, evidence-only Product & Fabrication Catalogue data model and
 * pure filtering/search utilities for Karali Fabrication (`/catalogue/`).
 *
 * ZERO FABRICATION POLICY:
 *   - Every item represents a made-to-order / build-to-drawing fabrication
 *     capability mapped to one of the 5 verified `CORE_SERVICES` pillars.
 *   - Do NOT invent SKU numbers, off-the-shelf stock counts, load ratings,
 *     certifications, material grades, fixed prices, or lead times.
 */
import { CORE_SERVICES, getWhatsAppUrl } from './services.js';

export const CATALOGUE_CATEGORIES = Object.freeze([
  Object.freeze({
    id: 'all',
    label: 'All Categories',
    shortLabel: 'All',
  }),
  ...CORE_SERVICES.map((svc) =>
    Object.freeze({
      id: svc.slug,
      label: svc.shortLabel,
      shortLabel: svc.shortLabel,
      servicePath: svc.path,
      serviceTitle: svc.title,
    }),
  ),
]);

const VALID_SERVICE_SLUGS = new Set(CORE_SERVICES.map((s) => s.slug));

export function isValidCatalogueCategory(categoryId) {
  return categoryId === 'all' || VALID_SERVICE_SLUGS.has(categoryId);
}

/**
 * Builds a pre-filled WhatsApp enquiry message for a specific catalogue item,
 * prompting the customer to share dimensions, quantity, material preferences,
 * and site locality in MMR.
 *
 * @param {{ title: string }} item
 * @returns {string}
 */
export function buildCatalogueEnquiryMessage(item) {
  const title = String(item?.title ?? 'Fabrication Component').trim();
  return `Hello Karali Fabrication, I would like to enquire about "${title}". Here are my approximate dimensions, quantity, material requirements, and project locality in Mumbai/Thane/Navi Mumbai:`;
}

/**
 * Returns the URL-encoded WhatsApp `https://wa.me/917977591792?text=...` URL
 * for a catalogue item.
 *
 * @param {{ title: string }} item
 * @returns {string}
 */
export function getCatalogueItemWhatsAppUrl(item) {
  return getWhatsAppUrl(buildCatalogueEnquiryMessage(item));
}

export const CATALOGUE_ITEMS = Object.freeze([
  // 1. Structural Steel Fabrication (2 items)
  Object.freeze({
    id: 'cat-structural-columns-beams',
    slug: 'structural-steel-columns-beams-frames',
    serviceSlug: 'structural-steel-fabrication',
    servicePath: '/services/structural-steel-fabrication/',
    categoryLabel: 'Structural Steel',
    title: 'Structural Steel Columns, Beams & Portal Frames',
    summary:
      'Custom-cut, drilled, and welded structural steel columns, main beams, and load-bearing portal frames fabricated to structural consultant drawings.',
    executionBasis: 'Fabricated to client structural drawings & Bill of Quantities (BoQ)',
    typicalApplications: Object.freeze([
      'Commercial building frames',
      'Industrial plant structures',
      'Civil structural retrofits',
    ]),
    image: '/images/catalogue/cat-01-columns-beams-frames.svg',
    imageAlt:
      'Schematic illustration of Structural Steel Columns, Beams and Portal Frames — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-01 // COLUMNS & BEAMS',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),
  Object.freeze({
    id: 'cat-structural-roof-trusses',
    slug: 'clear-span-roof-trusses-girders',
    serviceSlug: 'structural-steel-fabrication',
    servicePath: '/services/structural-steel-fabrication/',
    categoryLabel: 'Structural Steel',
    title: 'Clear-Span Roof Trusses & Lattice Girders',
    summary:
      'Welded and bolted tubular or angle-section roof trusses, purlin cleats, and wind bracing assemblies for wide-span roofs and canopies.',
    executionBasis: 'Built to span drawings & site erection schedule',
    typicalApplications: Object.freeze([
      'Factory & warehouse roofs',
      'Entrance canopies',
      'Long-span commercial halls',
    ]),
    image: '/images/catalogue/cat-02-clear-span-roof-trusses.svg',
    imageAlt:
      'Schematic illustration of Clear-Span Roof Trusses and Lattice Girders — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-02 // ROOF TRUSSES',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),

  // 2. Lift Shaft Steelwork, Crash Decks & Platforms (2 items)
  Object.freeze({
    id: 'cat-lift-shaft-steel-cage',
    slug: 'lift-shaft-structural-steel-cage-divider-beams',
    serviceSlug: 'lift-shaft-steelwork-crash-decks',
    servicePath: '/services/lift-shaft-steelwork-crash-decks/',
    categoryLabel: 'Lift Shafts & Crash Decks',
    title: 'Lift Shaft Steel Structure & Divider Beams',
    summary:
      'Self-supporting structural steel elevator shaft cages, intermediate divider beams, and guide-rail mounting brackets for new cores and lift retrofits.',
    executionBasis: 'Built to elevator GA drawing & shaft plumb dimensions',
    typicalApplications: Object.freeze([
      'Society elevator retrofits',
      'High-rise lift cores',
      'Multi-car shaft partitions',
    ]),
    image: '/images/catalogue/cat-03-lift-shaft-steel-cage.svg',
    imageAlt:
      'Schematic illustration of Lift Shaft Steel Structure and Divider Beams — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-03 // LIFT SHAFT CAGE',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),
  Object.freeze({
    id: 'cat-lift-crash-deck-platform',
    slug: 'elevator-shaft-crash-deck-working-platform',
    serviceSlug: 'lift-shaft-steelwork-crash-decks',
    servicePath: '/services/lift-shaft-steelwork-crash-decks/',
    categoryLabel: 'Lift Shafts & Crash Decks',
    title: 'Heavy-Duty Elevator Shaft Crash Deck & Working Platform',
    summary:
      'Temporary or permanent steel shaft crash decks and working platforms designed for overhead site protection and safe installation access inside active shafts.',
    executionBasis: 'Custom-fitted to internal shaft clear dimensions',
    typicalApplications: Object.freeze([
      'High-rise tower construction',
      'Elevator installation & modernization',
      'Shaft maintenance access',
    ]),
    image: '/images/catalogue/cat-04-elevator-crash-deck-platform.svg',
    imageAlt:
      'Schematic illustration of Heavy-Duty Elevator Shaft Crash Deck and Working Platform — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-04 // CRASH DECK',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),

  // 3. Industrial Sheds & Mezzanines (2 items)
  Object.freeze({
    id: 'cat-industrial-mezzanine-floor',
    slug: 'structural-steel-mezzanine-floor-system',
    serviceSlug: 'industrial-sheds-mezzanines',
    servicePath: '/services/industrial-sheds-mezzanines/',
    categoryLabel: 'Sheds & Mezzanines',
    title: 'Structural Steel Mezzanine Floor Grid & Decking',
    summary:
      'Column-supported structural steel mezzanine floor systems with primary/secondary beams, chequered plate or deck support, access stairs, and perimeter handrails.',
    executionBasis: 'Engineered & fabricated to floor layout and intended usage',
    typicalApplications: Object.freeze([
      'MIDC factory storage expansion',
      'Warehouse mezzanine levels',
      'Commercial back-of-house floors',
    ]),
    image: '/images/catalogue/cat-05-mezzanine-floor-grid.svg',
    imageAlt:
      'Schematic illustration of Structural Steel Mezzanine Floor Grid and Decking — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-05 // MEZZANINE FLOOR',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),
  Object.freeze({
    id: 'cat-industrial-shed-canopy',
    slug: 'industrial-factory-shed-loading-canopy',
    serviceSlug: 'industrial-sheds-mezzanines',
    servicePath: '/services/industrial-sheds-mezzanines/',
    categoryLabel: 'Sheds & Mezzanines',
    title: 'Industrial Factory Shed & Loading Bay Canopy',
    summary:
      'Complete structural steel shed framing including columns, rafters, purlins, tie rods, and cantilevered loading-bay weather canopies.',
    executionBasis: 'Built to plot dimensions, clear height & roofing layout',
    typicalApplications: Object.freeze([
      'Industrial workshops & plants',
      'Warehouse loading bays',
      'Rooftop utility enclosures',
    ]),
    image: '/images/catalogue/cat-06-industrial-shed-canopy.svg',
    imageAlt:
      'Schematic illustration of Industrial Factory Shed and Loading Bay Canopy — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-06 // INDUSTRIAL SHED',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),

  // 4. Staircases, Railings & Gates (2 items)
  Object.freeze({
    id: 'cat-steel-staircase-handrails',
    slug: 'steel-staircase-fire-exit-safety-railings',
    serviceSlug: 'staircases-railings-gates',
    servicePath: '/services/staircases-railings-gates/',
    categoryLabel: 'Staircases, Railings & Gates',
    title: 'Steel Staircases, Fire-Exit Stairs & Safety Handrails',
    summary:
      'Straight-flight, dog-leg, and external emergency fire-escape staircases with chequered plate treads, paired with MS or SS tubular handrails and guardrails.',
    executionBasis: 'Fabricated to floor-to-floor height & architectural drawings',
    typicalApplications: Object.freeze([
      'Commercial fire-escape stairs',
      'Mezzanine & plant access stairs',
      'Balcony & terrace safety railings',
    ]),
    image: '/images/catalogue/cat-07-steel-staircases-handrails.svg',
    imageAlt:
      'Schematic illustration of Steel Staircases, Fire-Exit Stairs and Safety Handrails — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-07 // STAIRS & RAILINGS',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),
  Object.freeze({
    id: 'cat-sliding-swing-compound-gates',
    slug: 'heavy-duty-sliding-swing-compound-gates',
    serviceSlug: 'staircases-railings-gates',
    servicePath: '/services/staircases-railings-gates/',
    categoryLabel: 'Staircases, Railings & Gates',
    title: 'Heavy-Duty Sliding & Swing Compound Gates',
    summary:
      'Track-mounted sliding gates, double-leaf swing entrance gates, wicket gates, and security grilles fabricated for industrial premises and housing societies.',
    executionBasis: 'Custom-built to entrance clear opening & security design',
    typicalApplications: Object.freeze([
      'Factory & warehouse entrances',
      'Housing society main gates',
      'Perimeter security barriers',
    ]),
    image: '/images/catalogue/cat-08-sliding-swing-compound-gates.svg',
    imageAlt:
      'Schematic illustration of Heavy-Duty Sliding and Swing Compound Gates — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-08 // COMPOUND GATES',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),

  // 5. Custom Metal Fabrication (2 items)
  Object.freeze({
    id: 'cat-custom-base-plates-brackets',
    slug: 'custom-ms-base-plates-cleats-brackets',
    serviceSlug: 'custom-metal-fabrication',
    servicePath: '/services/custom-metal-fabrication/',
    categoryLabel: 'Custom Fabrication',
    title: 'Custom Base Plates, Gussets & Structural Mounting Brackets',
    summary:
      'Build-to-drawing MS base plates, anchor bolt templates, cleats, stiffeners, and heavy mounting brackets for structural and MEP installations.',
    executionBasis: 'Cut, drilled & welded to CAD drawing or sample',
    typicalApplications: Object.freeze([
      'Structural column anchorage',
      'MEP pipe & cable-tray supports',
      'Facade & canopy brackets',
    ]),
    image: '/images/catalogue/cat-09-custom-base-plates-brackets.svg',
    imageAlt:
      'Schematic illustration of Custom Base Plates, Gussets and Structural Mounting Brackets — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-09 // BRACKETS & PLATES',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),
  Object.freeze({
    id: 'cat-equipment-skids-trench-covers',
    slug: 'equipment-skids-trench-covers-chequered-gratings',
    serviceSlug: 'custom-metal-fabrication',
    servicePath: '/services/custom-metal-fabrication/',
    categoryLabel: 'Custom Fabrication',
    title: 'Equipment Skids, Trench Covers & Chequered Plate Gratings',
    summary:
      'Welded steel base skids for pumps/generators/HVAC units, along with removable trench covers, drain gratings, and chequered plate floor covers.',
    executionBasis: 'Fabricated to equipment footprint or trench span dimensions',
    typicalApplications: Object.freeze([
      'HVAC / DG / pump mounting skids',
      'Industrial floor cable & drain trenches',
      'Plant maintenance walkways',
    ]),
    image: '/images/catalogue/cat-10-equipment-skids-trench-covers.svg',
    imageAlt:
      'Schematic illustration of Equipment Skids, Trench Covers and Chequered Plate Gratings — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-10 // SKIDS & GRATINGS',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),

  // 6. Roofing Sheets & Cladding (2 items)
  Object.freeze({
    id: 'cat-galvalume-roofing-sheets',
    slug: 'color-coated-galvalume-trapezoidal-roofing-sheets',
    serviceSlug: 'roofing-sheets-cladding',
    servicePath: '/services/roofing-sheets-cladding/',
    categoryLabel: 'Roofing & Cladding',
    title: 'Color-Coated Galvalume Trapezoidal Roofing Sheets',
    summary:
      'Trapezoidal profile PPGI and bare Galvalume roofing sheets cut to length with weather-resistant primer, self-drilling fastener lines, and corner trims.',
    executionBasis: 'Supplied and installed to shed span and pitch dimensions',
    typicalApplications: Object.freeze([
      'Factory shed roofing',
      'Warehouse cladding',
      'Terrace weather covers',
    ]),
    image: '/images/catalogue/cat-11-galvalume-roofing-sheets.svg',
    imageAlt:
      'Schematic illustration of Color-Coated Galvalume Trapezoidal Roofing Sheets — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-11 // GALVALUME ROOFING',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),
  Object.freeze({
    id: 'cat-polycarbonate-skylights',
    slug: 'multiwall-polycarbonate-daylighting-skylight-panels',
    serviceSlug: 'roofing-sheets-cladding',
    servicePath: '/services/roofing-sheets-cladding/',
    categoryLabel: 'Roofing & Cladding',
    title: 'Multiwall Polycarbonate Daylighting Skylight Panels',
    summary:
      'Translucent multiwall and solid polycarbonate daylighting panels integrated into steel shed roofing grids for energy-efficient factory illumination.',
    executionBasis: 'Fitted with aluminum capping profiles and EPDM seals',
    typicalApplications: Object.freeze([
      'Natural factory lighting',
      'Warehouse roof skylights',
      'Industrial bay canopies',
    ]),
    image: '/images/catalogue/cat-12-polycarbonate-skylights.svg',
    imageAlt:
      'Schematic illustration of Multiwall Polycarbonate Daylighting Skylight Panels — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-12 // POLYCARBONATE SKYLIGHTS',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),

  // 7. Industrial Racking & Metal Furniture (2 items)
  Object.freeze({
    id: 'cat-heavy-pallet-racks',
    slug: 'heavy-duty-industrial-warehouse-pallet-storage-racks',
    serviceSlug: 'industrial-racking-storage',
    servicePath: '/services/industrial-racking-storage/',
    categoryLabel: 'Racking & Furniture',
    title: 'Heavy-Duty Industrial Warehouse Pallet Storage Racking',
    summary:
      'Adjustable multi-tier pallet racking systems with slotted upright frames, safety-locking load beams, and column anchor floor plates for logistics hubs.',
    executionBasis: 'Custom designed to warehouse bay height and pallet weight',
    typicalApplications: Object.freeze([
      'Warehouse logistics storage',
      'Factory inventory bays',
      'High-density pallet storage',
    ]),
    image: '/images/catalogue/cat-13-heavy-pallet-racks.svg',
    imageAlt:
      'Schematic illustration of Heavy-Duty Industrial Warehouse Pallet Storage Racking — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-13 // PALLET RACKING',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),
  Object.freeze({
    id: 'cat-industrial-workbenches',
    slug: 'heavy-steel-workshop-workbenches-assembly-tables',
    serviceSlug: 'industrial-racking-storage',
    servicePath: '/services/industrial-racking-storage/',
    categoryLabel: 'Racking & Furniture',
    title: 'Heavy Steel Workshop Workbenches & Assembly Tables',
    summary:
      'Welded heavy-gauge steel workbench tables, tool storage benches, and packing stations built for industrial maintenance and factory production floors.',
    executionBasis: 'Fabricated to shop dimensions with MS/hardwood top options',
    typicalApplications: Object.freeze([
      'Maintenance workshops',
      'Production assembly lines',
      'Packing & shipping benches',
    ]),
    image: '/images/catalogue/cat-14-industrial-workbenches.svg',
    imageAlt:
      'Schematic illustration of Heavy Steel Workshop Workbenches and Assembly Tables — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-14 // WORKBENCHES',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),

  // 8. Unipole Structures & Advertising Hoardings (1 item)
  Object.freeze({
    id: 'cat-unipole-billboard-structures',
    slug: 'heavy-cylindrical-highway-billboard-unipole-structures',
    serviceSlug: 'unipole-structures-hoardings',
    servicePath: '/services/unipole-structures-hoardings/',
    categoryLabel: 'Unipoles & Hoardings',
    title: 'Heavy Cylindrical Highway Billboard Unipole Structures',
    summary:
      'High-diameter cylindrical steel pipe columns, cantilevered display grid trusses, base flanges, and safety catwalk ladders engineered for high wind zones.',
    executionBasis: 'Fabricated to structural stability calculations and site height',
    typicalApplications: Object.freeze([
      'Highway advertising billboards',
      'Roadside commercial unipoles',
      'Toll plaza signage gantries',
    ]),
    image: '/images/catalogue/cat-15-unipole-billboard-structures.svg',
    imageAlt:
      'Schematic illustration of Heavy Cylindrical Highway Billboard Unipole Structures — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-15 // UNIPOLE BILLBOARD',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),

  // 9. Pergolas & Gazebos (1 item)
  Object.freeze({
    id: 'cat-architectural-metal-pergolas',
    slug: 'architectural-steel-garden-terrace-louver-pergolas',
    serviceSlug: 'pergolas-gazebos',
    servicePath: '/services/pergolas-gazebos/',
    categoryLabel: 'Pergolas & Gazebos',
    title: 'Architectural Steel Garden & Terrace Louver Pergolas',
    summary:
      'Custom architectural hollow section steel pergolas, terrace shade canopies, and louvered roof structures with glass or polycarbonate mounting.',
    executionBasis: 'Custom measured to terrace or garden footprint with ground welds',
    typicalApplications: Object.freeze([
      'Rooftop terrace lounges',
      'Villa garden gazebos',
      'Outdoor restaurant pavilions',
    ]),
    image: '/images/catalogue/cat-16-architectural-metal-pergolas.svg',
    imageAlt:
      'Schematic illustration of Architectural Steel Garden and Terrace Louver Pergolas — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-16 // PERGOLAS',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),

  // 10. Commercial Rolling Shutters (1 item)
  Object.freeze({
    id: 'cat-motorized-rolling-shutters',
    slug: 'heavy-duty-motorized-manual-steel-rolling-shutters',
    serviceSlug: 'commercial-rolling-shutters',
    servicePath: '/services/commercial-rolling-shutters/',
    categoryLabel: 'Rolling Shutters',
    title: 'Heavy-Duty Motorized & Manual Steel Rolling Shutters',
    summary:
      'Cold-rolled interlocking steel slat curtains, spring barrels, side guide channels, and motorized tubular drives for commercial shops and loading bays.',
    executionBasis: 'Manufactured to clear opening width and lintel height',
    typicalApplications: Object.freeze([
      'Warehouse loading bays',
      'Commercial shopfronts',
      'Industrial plant entrances',
    ]),
    image: '/images/catalogue/cat-17-motorized-rolling-shutters.svg',
    imageAlt:
      'Schematic illustration of Heavy-Duty Motorized and Manual Steel Rolling Shutters — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-17 // ROLLING SHUTTERS',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),

  // 11. Security & Window Grills (1 item)
  Object.freeze({
    id: 'cat-society-window-safety-grills',
    slug: 'housing-society-window-safety-grills-balcony-cages',
    serviceSlug: 'security-window-grills',
    servicePath: '/services/security-window-grills/',
    categoryLabel: 'Security & Grills',
    title: 'Housing Society Window Safety Grills & Balcony Cages',
    summary:
      'Solid square bar window grills with child-safe spacing, box extensions for planter trays, and building-wide safety cages fabricated for housing societies.',
    executionBasis: 'Batch fabricated to window opening schedules with wall anchors',
    typicalApplications: Object.freeze([
      'Housing society facades',
      'High-rise balcony safety cages',
      'French window security grilles',
    ]),
    image: '/images/catalogue/cat-18-society-window-safety-grills.svg',
    imageAlt:
      'Schematic illustration of Housing Society Window Safety Grills and Balcony Cages — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-18 // WINDOW GRILLS',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),

  // 12. Animal Farm Sheds (1 item)
  Object.freeze({
    id: 'cat-ventilated-dairy-farm-sheds',
    slug: 'ventilated-structural-steel-cattle-dairy-poultry-sheds',
    serviceSlug: 'animal-farm-sheds',
    servicePath: '/services/animal-farm-sheds/',
    categoryLabel: 'Farm Sheds',
    title: 'Ventilated Structural Steel Cattle Dairy & Poultry Sheds',
    summary:
      'Open-span portal frame steel sheds with central raised ridge monitors, corrosion-resistant column epoxy coating, and livestock feeding trough dividers.',
    executionBasis: 'Erected on concrete pedestals with high-pitch roofing',
    typicalApplications: Object.freeze([
      'Cattle dairy farms (tabelas)',
      'Poultry farming sheds',
      'Rural livestock shelters',
    ]),
    image: '/images/catalogue/cat-19-ventilated-dairy-farm-sheds.svg',
    imageAlt:
      'Schematic illustration of Ventilated Structural Steel Cattle Dairy and Poultry Sheds — awaiting verified owner asset',
    placeholderCode: 'KF-CAT-19 // FARM SHEDS',
    placeholderStatus: 'Schematic Placeholder · Awaiting Owner Asset',
  }),
]);

/**
 * Pure, case-insensitive filter function combining category selection and
 * keyword search across `title`, `summary`, `categoryLabel`, `executionBasis`,
 * and `typicalApplications`.
 *
 * @param {{ category?: string, query?: string }} [filters]
 * @returns {readonly typeof CATALOGUE_ITEMS[number][]}
 */
export function filterCatalogueItems({ category = 'all', query = '' } = {}) {
  const activeCategory = category && isValidCatalogueCategory(category) ? category : 'all';
  const normalizedQuery = String(query ?? '')
    .trim()
    .toLowerCase();

  return CATALOGUE_ITEMS.filter((item) => {
    if (activeCategory !== 'all' && item.serviceSlug !== activeCategory) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      item.title,
      item.summary,
      item.categoryLabel,
      item.executionBasis,
      ...item.typicalApplications,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}
