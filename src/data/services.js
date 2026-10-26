/**
 * Verified service definitions, dedicated service page content, address data,
 * and project gallery slots for Karali Fabrication.
 *
 * ZERO FABRICATION POLICY:
 *   - Only list verified service scopes, structural assembly workflows, and
 *     regional coverage (Mumbai, Thane, Navi Mumbai / 57 MMR localities).
 *   - Do NOT invent certifications, workshop square footage, machine counts,
 *     material grades/load ratings, years in business, completed project counts,
 *     client names, or pricing.
 *   - Use ONLY the owner-approved verified business address.
 */

export const SITE_URL = 'https://karalifabrication.in';
export const PHONE_E164 = '+917977591792';
export const PHONE_DISPLAY = '+91 79775 91792';
export const WHATSAPP_BASE = 'https://wa.me/917977591792';

/**
 * Owner-authorized physical business address for Karali Fabrication.
 */
export const BUSINESS_ADDRESS = Object.freeze({
  companyName: 'Karali Fabrication',
  streetAddress: 'Radha Park Building, Shop No 11, Vijay Home Complex, St Jalaram Nagar, Burhani Nagar',
  addressLocality: 'Bhayandar West, Mumbai',
  addressRegion: 'Maharashtra',
  postalCode: '401101',
  addressCountry: 'IN',
  fullAddress:
    'Karali Fabrication, Radha Park Building, Shop No 11, Vijay Home Complex, St Jalaram Nagar, Burhani Nagar, Bhayandar West, Mumbai, Maharashtra 401101',
});

export const HOMEPAGE_HERO_IMAGE = '/images/hero/industrial-steel-fabrication-hero.svg';
export const PROCESS_WORKFLOW_IMAGE = '/images/process/fabrication-workflow-diagram.svg';

export const CORE_SERVICES = Object.freeze([
  // 1. Structural Steel Fabrication
  Object.freeze({
    id: 'service-structural-steel',
    slug: 'structural-steel-fabrication',
    path: '/services/structural-steel-fabrication/',
    canonical: 'https://karalifabrication.in/services/structural-steel-fabrication/',
    eyebrow: '01 / Primary Steelwork',
    shortLabel: 'Structural Steel',
    title: 'Structural Steel Fabrication',
    metaTitle: 'Structural Steel Fabrication | Karali Fabrication — Mumbai, Thane & Navi Mumbai',
    metaDescription:
      'Structural steel fabrication and on-site erection across Mumbai, Thane and Navi Mumbai. Columns, beams, roof trusses and welded steel frames. Call or WhatsApp +91 79775 91792.',
    summary:
      'Columns, portal beams, roof trusses, and load-bearing steel frameworks fabricated to structural drawings and erected on site across MMR.',
    heroIntro:
      'Karali Fabrication executes structural steelwork for civil contractors, industrial plants, commercial buildings, and retrofit projects across Mumbai, Thane, and Navi Mumbai. We work directly from your structural drawings and Bill of Quantities (BoQ) to cut, fit, weld, and erect steel frames on site.',
    heroImage: '/images/services/structural-steel-fabrication.svg',
    cardImage: '/images/services/structural-steel-fabrication.svg',
    deliverables: Object.freeze([
      'Rolled steel section cutting, edge preparation, drilling & fit-up to drawing',
      'Welded and bolted beam-to-column connections, base plates & gusset assemblies',
      'Roof trusses, portal frames, bracings, purlins & structural canopy frames',
      'On-site alignment, erection, structural strengthening & retrofit modifications',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'Commercial & Civil Developments',
        detail: 'Primary structural framing, entrance canopies, transfer beams, and floor support steelwork.',
      }),
      Object.freeze({
        title: 'Industrial Plants & Warehouses',
        detail: 'Heavy support frames, equipment structures, pipe supports, and bay extensions across MMR industrial zones.',
      }),
      Object.freeze({
        title: 'Building Retrofits & Strengthening',
        detail: 'Additional columns, jacketing steelwork, and load-bearing reinforcement for existing structures.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Share your structural drawings, section schedule, or BoQ along with the site locality.',
      'We prepare an itemised material and fabrication estimate based on drawings.',
      'Shop fabrication, quality welding, coordinated delivery, and on-site erection across MMR.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-01 // STRUCTURAL STEEL',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'Structural Steel Column-Beam & Truss Erection Scope',
      caption:
        'Technical visual representing heavy rolled steel sections, bolted beam-to-column connections, and structural roof truss erection. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Structural Steel Fabrication — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'Commercial buildings, industrial plants, warehouse structures & civil framing',
    ctaLabel: 'Request Structural Steel Quote',
    whatsappText: 'Hello Karali Fabrication, I have an enquiry for Structural Steel Fabrication.',
    relatedSlugs: Object.freeze([
      'lift-shaft-steelwork-crash-decks',
      'industrial-sheds-mezzanines',
      'custom-metal-fabrication',
    ]),
  }),

  // 2. Lift Shaft Steelwork, Crash Decks & Platforms
  Object.freeze({
    id: 'service-lift-shafts',
    slug: 'lift-shaft-steelwork-crash-decks',
    path: '/services/lift-shaft-steelwork-crash-decks/',
    canonical: 'https://karalifabrication.in/services/lift-shaft-steelwork-crash-decks/',
    eyebrow: '02 / Elevator Steelwork',
    shortLabel: 'Lift Shafts & Decks',
    title: 'Lift Shaft Steelwork, Crash Decks & Platforms',
    metaTitle: 'Lift Shaft Steelwork, Crash Decks & Platforms | Karali Fabrication — MMR',
    metaDescription:
      'Engineered lift shaft steel structures, divider beams, and heavy-duty crash decks for high-rise buildings across Mumbai, Thane and Navi Mumbai. Call +91 79775 91792.',
    summary:
      'Self-supporting elevator shaft steel frameworks, divider I-beams, guide-rail brackets, and heavy-duty temporary/permanent crash decks.',
    heroIntro:
      'We engineer and fabricate structural elevator shaft frameworks and crash protection decks tailored to shaft dimensions and contractor requirements. From independent steel elevator towers in retrofit buildings to heavy working platforms in ongoing high-rise construction, all assemblies are fabricated to exact site measurements.',
    heroImage: '/images/services/lift-shaft-steelwork-crash-decks.svg',
    cardImage: '/images/services/lift-shaft-steelwork-crash-decks.svg',
    deliverables: Object.freeze([
      'Self-supporting lift shaft steel structural cages, corner columns & bracings',
      'Intermediate elevator divider beams, separator channels & guide-rail support brackets',
      'Heavy-duty overhead crash decks, pit protection platforms & temporary working decks',
      'Counterweight divider steelwork, machine-room header beams & entrance door frames',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'High-Rise Residential & Commercial Towers',
        detail: 'Heavy crash decks and divider steelwork for ongoing construction safety across Mumbai and Thane.',
      }),
      Object.freeze({
        title: 'Building Redevelopment & Retrofits',
        detail: 'External and internal self-supporting steel elevator shaft towers for existing societies without lift cores.',
      }),
      Object.freeze({
        title: 'Industrial & Hospital Facilities',
        detail: 'Stretcher and freight elevator shaft structural frameworks engineered for heavy hoistway loads.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Site dimension verification or structural shaft drawing review with civil/elevator contractors.',
      'Component shop fabrication: cutting, bracket fit-up, and welding of divider beams and crash platform frames.',
      'Hoisting, alignment, bolting, and certified site welding inside the elevator core.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-02 // LIFT SHAFT & CRASH DECKS',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'Elevator Shaft Structural Caging & Heavy Crash Deck Platform',
      caption:
        'Technical visual representing elevator divider beams, guide-rail bracket supports, and crash protection platforms. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Lift Shaft Steelwork and Crash Decks — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'High-rise elevator cores, retrofit lift towers, freight elevators & hoistways',
    ctaLabel: 'Enquire for Lift Shaft Steelwork',
    whatsappText: 'Hello Karali Fabrication, I have an enquiry for Lift Shaft Steelwork or Crash Decks.',
    relatedSlugs: Object.freeze([
      'structural-steel-fabrication',
      'industrial-sheds-mezzanines',
      'staircases-railings-gates',
    ]),
  }),

  // 3. Industrial Sheds & Mezzanines
  Object.freeze({
    id: 'service-industrial-sheds',
    slug: 'industrial-sheds-mezzanines',
    path: '/services/industrial-sheds-mezzanines/',
    canonical: 'https://karalifabrication.in/services/industrial-sheds-mezzanines/',
    eyebrow: '03 / Enclosures & Floors',
    shortLabel: 'Sheds & Mezzanines',
    title: 'Industrial Sheds & Mezzanines',
    metaTitle: 'Industrial Sheds & Mezzanine Floors | Karali Fabrication — Mumbai & Thane',
    metaDescription:
      'Factory sheds, warehouse enclosures, and heavy structural steel mezzanine floors fabricated across Mumbai, Thane and Navi Mumbai. Call or WhatsApp +91 79775 91792.',
    summary:
      'Factory sheds, warehouse enclosures, storage mezzanines, and structural canopies engineered for high usable floor space and coastal weather durability.',
    heroIntro:
      'Karali Fabrication manufactures and erects structural steel factory sheds, warehouse enclosures, and industrial mezzanine floors across Mumbai, Thane, and Navi Mumbai. We combine rigid column-and-rafter framing with precision purlin grids and decking to expand industrial operational capacity.',
    heroImage: '/images/services/industrial-sheds-mezzanines.svg',
    cardImage: '/images/services/industrial-sheds-mezzanines.svg',
    deliverables: Object.freeze([
      'Structural steel portal rafter frames, bowstring trusses & heavy tubular columns',
      'Industrial mezzanine floor platforms with primary/secondary beams & deck supports',
      'Z/C purlin networks, roof bracing systems, tie rods & structural canopies',
      'Integrated steel access staircases, perimeter safety handrails & loading gates',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'Manufacturing & Workshop Facilities',
        detail: 'Clear-span factory sheds with high eave clearance for machinery and overhead hoist operations.',
      }),
      Object.freeze({
        title: 'Logistics Hubs & Warehouses',
        detail: 'Structural mezzanine floors to double storage capacity without expanding building footprint.',
      }),
      Object.freeze({
        title: 'Commercial & Terrace Extensions',
        detail: 'Rooftop protective sheds and weather-resistant structural canopies across MMR commercial estates.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Review of floor plan, eave height, column grid, and anticipated dead/live load requirements.',
      'Jig-welded shop fabrication of trusses, columns, and mezzanine floor beams.',
      'Coordinated transport, crane/hoist rigging, and on-site bolted/welded assembly.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-03 // SHEDS & MEZZANINES',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'Factory Shed Portal Trusses & Heavy Structural Mezzanine Grid',
      caption:
        'Technical visual representing pitched roof trusses, structural columns, and modular mezzanine decking. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Industrial Sheds and Mezzanines — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'Factories, godowns, warehouse mezzanines, terrace sheds & loading bays',
    ctaLabel: 'Get Industrial Shed / Mezzanine Quote',
    whatsappText: 'Hello Karali Fabrication, I have an enquiry for an Industrial Shed or Mezzanine.',
    relatedSlugs: Object.freeze([
      'structural-steel-fabrication',
      'roofing-sheets-cladding',
      'industrial-racking-storage',
    ]),
  }),

  // 4. Staircases, Railings & Gates
  Object.freeze({
    id: 'service-staircases-railings-gates',
    slug: 'staircases-railings-gates',
    path: '/services/staircases-railings-gates/',
    canonical: 'https://karalifabrication.in/services/staircases-railings-gates/',
    eyebrow: '04 / Access & Perimeter',
    shortLabel: 'Stairs, Railings & Gates',
    title: 'Staircases, Railings & Gates',
    metaTitle: 'Steel Staircases, Railings & Gates Fabrication | Karali Fabrication — MMR',
    metaDescription:
      'Heavy-duty commercial fire escape staircases, industrial safety handrails, and automated compound gates fabricated across Mumbai, Thane and Navi Mumbai.',
    summary:
      'Commercial fire escapes, spiral stairways, safety handrails, and heavy compound sliding/swing gates fabricated for durability and security.',
    heroIntro:
      'We fabricate rigid, high-capacity access and security metalwork for housing societies, commercial towers, factories, and residential developments. From code-compliant external fire escape staircases to heavy industrial sliding gates and safety balustrades, every element is welded for structural rigidity.',
    heroImage: '/images/services/staircases-railings-gates.svg',
    cardImage: '/images/services/staircases-railings-gates.svg',
    deliverables: Object.freeze([
      'Industrial steel staircases with channel stringers & anti-slip chequered treads',
      'External emergency fire escape staircase towers with mid-landings and safety cages',
      'Heavy MS/SS perimeter compound gates (sliding, cantilever & swing configurations)',
      'Balcony safety railings, staircase balustrades & industrial walkway guardrails',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'Housing Societies & Commercial Buildings',
        detail: 'Main entrance security gates, boundary railings, and external fire exit access stairways.',
      }),
      Object.freeze({
        title: 'Industrial Facilities & Warehouses',
        detail: 'Heavy plant catwalk access stairs, mezzanine safety railings, and commercial loading bay gates.',
      }),
      Object.freeze({
        title: 'Residential Villas & Duplexes',
        detail: 'Architectural spiral staircases, modern terrace balustrades, and custom designer compound gates.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Site measurement of stair rise, run, landing levels, or entrance gate span dimensions.',
      'Shop cutting of stringers, treads, and gate frames with anti-corrosive primer coating.',
      'On-site anchor bolting, welding, alignment, and hinge/track installation.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-04 // STAIRS, RAILINGS & GATES',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'Commercial Steel Fire Escape, Safety Handrails & Sliding Compound Gate',
      caption:
        'Technical visual representing staircase stringers with non-slip treads, safety handrails, and industrial sliding gates. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Staircases, Railings and Gates — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'Commercial fire escapes, society gates, mezzanine stairs & safety railings',
    ctaLabel: 'Enquire for Stairs, Railings or Gates',
    whatsappText: 'Hello Karali Fabrication, I have a requirement for Staircases, Railings, or Gates.',
    relatedSlugs: Object.freeze([
      'structural-steel-fabrication',
      'commercial-rolling-shutters',
      'security-window-grills',
    ]),
  }),

  // 5. Custom Metal Fabrication & Site Welding
  Object.freeze({
    id: 'service-custom-fabrication',
    slug: 'custom-metal-fabrication',
    path: '/services/custom-metal-fabrication/',
    canonical: 'https://karalifabrication.in/services/custom-metal-fabrication/',
    eyebrow: '05 / Custom & Site Welding',
    shortLabel: 'Custom Metalwork',
    title: 'Custom Metal Fabrication',
    metaTitle: 'Custom Metal Fabrication & Site Welding | Karali Fabrication — MMR',
    metaDescription:
      'Build-to-drawing MS base plates, gusset brackets, equipment skids, trench covers, and on-site structural welding across Mumbai, Thane and Navi Mumbai.',
    summary:
      'Build-to-drawing MS base plates, gusset brackets, equipment skids, trench covers, and dedicated on-site structural welding work across MMR.',
    heroIntro:
      'Karali Fabrication provides tailored metal fabrication and on-site welding solutions for general contractors, mechanical equipment suppliers, and interior fit-out teams. Whether you need batch production of drilled structural base plates or immediate on-site structural welding, we execute to drawing.',
    heroImage: '/images/services/custom-metal-fabrication.svg',
    cardImage: '/images/services/custom-metal-fabrication.svg',
    deliverables: Object.freeze([
      'Heavy MS base plates, stiffened brackets, beam cleats & anchor plates cut to drawing',
      'Industrial equipment mounting skids, generator frames & pump base assemblies',
      'Heavy-duty floor trench covers, drainage gratings & chequered plate service covers',
      'On-site structural welding, retrofit modifications, column strengthening & repair',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'General Civil & MEP Contractors',
        detail: 'Structural connection plates, pipe supports, duct brackets, and embedded anchor assemblies.',
      }),
      Object.freeze({
        title: 'Industrial Plants & Mills',
        detail: 'Custom machine foundations, conveyor frames, hopper chutes, and trench access covers.',
      }),
      Object.freeze({
        title: 'Architectural & Interior Fit-Outs',
        detail: 'Exposed steel feature frames, partition mullions, and architectural metal support systems.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Send your drawing, sketch, dimensions, and quantity requirement via WhatsApp or phone.',
      'We review cut sizes, weld requirements, and whether shop fabrication or site welding is needed.',
      'Precision fabrication and delivery or on-site welding execution across MMR.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-05 // CUSTOM METALWORK',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'Custom Fabricated Brackets, Skids, Gratings & Site Weldments',
      caption:
        'Technical visual representing custom steel weldments, base plates, trench covers, and site welding work. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Custom Metal Fabrication — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'Custom architectural steel, MEP supports, machine skids & plant maintenance',
    ctaLabel: 'Discuss Custom Fabrication',
    whatsappText: 'Hello Karali Fabrication, I have drawings or specifications for Custom Metal Fabrication.',
    relatedSlugs: Object.freeze([
      'structural-steel-fabrication',
      'industrial-racking-storage',
      'unipole-structures-hoardings',
    ]),
  }),

  // 6. Roofing Sheets & Cladding (Newly Approved)
  Object.freeze({
    id: 'service-roofing-sheets',
    slug: 'roofing-sheets-cladding',
    path: '/services/roofing-sheets-cladding/',
    canonical: 'https://karalifabrication.in/services/roofing-sheets-cladding/',
    eyebrow: '06 / Roofing & Cladding',
    shortLabel: 'Roofing & Cladding',
    title: 'Roofing Sheets & Cladding',
    metaTitle: 'Roofing Sheets & Wall Cladding | Karali Fabrication — Mumbai & Thane',
    metaDescription:
      'Turnkey corrugated Galvalume roofing sheets, polycarbonate skylights, wall cladding, and rainwater gutter installation across Mumbai, Thane and Navi Mumbai.',
    summary:
      'Precision installation of color-coated Galvalume profile sheets, insulated panels, polycarbonate daylight skylights, and custom rainwater gutters.',
    heroIntro:
      'Karali Fabrication provides complete roofing sheet installation and exterior wall cladding for industrial factory sheds, commercial warehouses, and terrace structures across MMR. We integrate profile sheeting with purlin networks, flashing, and gutter systems to ensure weather-tight performance.',
    heroImage: '/images/services/roofing-sheets-cladding.svg',
    cardImage: '/images/services/roofing-sheets-cladding.svg',
    deliverables: Object.freeze([
      'PPGI and bare Galvalume trapezoidal profile roofing sheet installation',
      'Multiwall and solid polycarbonate natural daylighting skylight panels',
      'Heavy-gauge galvanized ridge caps, corner flashings & gable trims',
      'Custom fabricated MS/GI rainwater drainage gutters and downspout systems',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'Industrial Plants & Warehouses',
        detail: 'Complete re-roofing, profile sheet replacement, and daylight skylight integration in active facilities.',
      }),
      Object.freeze({
        title: 'Commercial Sheds & Loading Bays',
        detail: 'Cantilevered canopy roofing, loading dock rain shelters, and exterior side-wall cladding.',
      }),
      Object.freeze({
        title: 'Residential & Terrace Structures',
        detail: 'Rooftop rain protection, terrace shed coverings, and coastal weather-resistant roofing extensions.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Site roof dimension measurement, pitch assessment, and purlin span verification.',
      'Material procurement of approved gauge profile sheets, fasteners, and flashing accessories.',
      'Precision on-site installation with self-drilling EPDM washer screws and watertight sealing.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-06 // ROOFING & CLADDING',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'Industrial Profile Sheeting, Ridge Flashing & Daylighting Panels',
      caption:
        'Technical visual representing corrugated Galvalume roof profiles, purlin fastening, and gutter systems. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Roofing Sheets and Cladding — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'Factory shed roofing, warehouse cladding, terrace covers & skylight panels',
    ctaLabel: 'Request Roofing Quote',
    whatsappText: 'Hello Karali Fabrication, I have an enquiry for Roofing Sheets or Wall Cladding.',
    relatedSlugs: Object.freeze([
      'industrial-sheds-mezzanines',
      'structural-steel-fabrication',
      'animal-farm-sheds',
    ]),
  }),

  // 7. Industrial Racking & Metal Furniture (Newly Approved)
  Object.freeze({
    id: 'service-industrial-racking',
    slug: 'industrial-racking-storage',
    path: '/services/industrial-racking-storage/',
    canonical: 'https://karalifabrication.in/services/industrial-racking-storage/',
    eyebrow: '07 / Storage & Furniture',
    shortLabel: 'Racking & Furniture',
    title: 'Industrial Racking & Metal Furniture',
    metaTitle: 'Industrial Warehouse Racking & Steel Furniture | Karali Fabrication — MMR',
    metaDescription:
      'Heavy-duty warehouse pallet racks, cantilever storage, industrial workbenches, and custom steel furniture fabricated across Mumbai, Thane and Navi Mumbai.',
    summary:
      'Heavy-duty warehouse pallet racking, cantilever storage racks, industrial steel workbenches, and durable commercial metal furniture fabricated to order.',
    heroIntro:
      'Karali Fabrication manufactures heavy-capacity warehouse storage systems, industrial workstations, and custom steel furniture for logistics centers, factories, and commercial operations across Mumbai, Thane, and Navi Mumbai. All frames are built with heavy-gauge steel for high payload endurance.',
    heroImage: '/images/services/industrial-racking-storage.svg',
    cardImage: '/images/services/industrial-racking-storage.svg',
    deliverables: Object.freeze([
      'Heavy-duty multi-tier warehouse pallet storage racking systems and upright frames',
      'Cantilever storage racks for steel pipes, bars, timber, and long-load materials',
      'Industrial assembly workbenches, packing tables & tool storage stations',
      'Custom commercial steel furniture, display frameworks & heavy storage units',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'Logistics Parks & Warehouses',
        detail: 'Multi-level pallet racking configurations optimized for forklift access across Bhiwandi, Taloja, and Panvel.',
      }),
      Object.freeze({
        title: 'Manufacturing & Assembly Plants',
        detail: 'Heavy-duty steel workbenches, component storage shelving, and production floor mobile carts.',
      }),
      Object.freeze({
        title: 'Commercial & Hospitality Fit-Outs',
        detail: 'Heavy minimalist steel frames, shelving partitions, and durable back-of-house storage units.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Review of storage bay dimensions, vertical clearance, and pallet/workload requirements.',
      'Precision cutting, hole-punching of uprights, and welding of load beams with durable primer coating.',
      'On-site floor anchoring, alignment, and load-beam safety locking across your facility.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-07 // WAREHOUSE RACKING',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'Heavy-Duty Pallet Racking Uprights & Industrial Steel Workbench',
      caption:
        'Technical visual representing warehouse racking frames, load beams, and steel workshop tables. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Industrial Racking and Metal Furniture — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'Warehouse pallet storage, industrial workbenches, pipe racking & commercial furniture',
    ctaLabel: 'Enquire for Storage Racks',
    whatsappText: 'Hello Karali Fabrication, I have an enquiry for Industrial Racking or Metal Furniture.',
    relatedSlugs: Object.freeze([
      'industrial-sheds-mezzanines',
      'custom-metal-fabrication',
      'commercial-rolling-shutters',
    ]),
  }),

  // 8. Unipole Structures & Advertising Hoardings (Newly Approved)
  Object.freeze({
    id: 'service-unipole-structures',
    slug: 'unipole-structures-hoardings',
    path: '/services/unipole-structures-hoardings/',
    canonical: 'https://karalifabrication.in/services/unipole-structures-hoardings/',
    eyebrow: '08 / Outdoor Steelwork',
    shortLabel: 'Unipoles & Hoardings',
    title: 'Unipole Structures & Advertising Hoardings',
    metaTitle: 'Unipole Structures & Advertising Hoardings | Karali Fabrication — MMR',
    metaDescription:
      'High-wind resistant outdoor advertising unipole structures, highway billboard frameworks, and commercial rooftop hoardings fabricated across Mumbai and Thane.',
    summary:
      'Heavy-wall cylindrical steel unipole columns, cantilevered truss frameworks, and highway billboard structures engineered for high wind loads.',
    heroIntro:
      'We fabricate and erect large-format outdoor advertising unipoles, highway gantries, and commercial rooftop hoarding frameworks across the Mumbai Metropolitan Region. Engineered with heavy-diameter steel pipe columns and rigid truss framing, our structures are built to withstand severe coastal monsoon squalls.',
    heroImage: '/images/services/unipole-structures-hoardings.svg',
    cardImage: '/images/services/unipole-structures-hoardings.svg',
    deliverables: Object.freeze([
      'Heavy-wall cylindrical steel pipe unipole columns (350mm to 750mm diameter)',
      'Cantilevered display grid frameworks, catwalks, safety handrails & access ladders',
      'Precision anchor bolt cages, base flange plates & foundation template assemblies',
      'Commercial rooftop advertising frames & highway toll plaza sign gantries',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'Outdoor Media & OOH Agencies',
        detail: 'Turnkey fabrication of high-visibility roadside unipoles and multi-story billboard structures.',
      }),
      Object.freeze({
        title: 'Highway & Infrastructure Projects',
        detail: 'Directional signage gantries, toll plaza overhead frames, and highway advertising spans.',
      }),
      Object.freeze({
        title: 'Commercial Building Rooftops',
        detail: 'Engineered rooftop hoarding frameworks anchored securely into primary structural RCC columns.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Review of structural stability drawings, display dimensions, height clearance, and wind zone requirements.',
      'Heavy pipe cutting, flange welding, full-penetration butt welds, and cat-ladder assembly.',
      'Transportation coordination, crane rigging, vertical alignment, and heavy anchor torque tightening.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-08 // UNIPOLES & HOARDINGS',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'Heavy Cylindrical Column Unipole & Billboard Truss Structure',
      caption:
        'Technical visual representing heavy cylindrical steel columns, base flanges, and display truss frames. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Unipole Structures and Hoardings — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'Highway billboards, roadside unipoles, rooftop hoardings & toll plaza gantries',
    ctaLabel: 'Request Unipole Quote',
    whatsappText: 'Hello Karali Fabrication, I have an enquiry for Unipole Structures or Hoardings.',
    relatedSlugs: Object.freeze([
      'structural-steel-fabrication',
      'industrial-sheds-mezzanines',
      'custom-metal-fabrication',
    ]),
  }),

  // 9. Pergolas & Gazebos (Newly Approved)
  Object.freeze({
    id: 'service-pergolas-gazebos',
    slug: 'pergolas-gazebos',
    path: '/services/pergolas-gazebos/',
    canonical: 'https://karalifabrication.in/services/pergolas-gazebos/',
    eyebrow: '09 / Architectural Living',
    shortLabel: 'Pergolas & Gazebos',
    title: 'Pergolas & Gazebos',
    metaTitle: 'Architectural Steel Pergolas & Metal Gazebos | Karali Fabrication — MMR',
    metaDescription:
      'Custom architectural steel pergolas, terrace canopies, louvered roofs, and metal gazebos fabricated across Mumbai, Thane and Navi Mumbai.',
    summary:
      'Modern architectural steel pergolas, terrace shade canopies, louvered roof structures, and garden gazebos built for aesthetic outdoor living.',
    heroIntro:
      'Karali Fabrication designs and fabricates custom metal pergolas, garden gazebos, and terrace louvered canopies for residential villas, penthouses, and commercial hospitality venues. We combine clean structural lines with options for tempered glass or polycarbonate roof covers, built to withstand coastal weather.',
    heroImage: '/images/services/pergolas-gazebos.svg',
    cardImage: '/images/services/pergolas-gazebos.svg',
    deliverables: Object.freeze([
      'Architectural hollow section steel pergola frameworks with clean ground welds',
      'Terrace shade canopies with integrated glass or polycarbonate roof mounting',
      'Louvered steel roof slats, decorative solar-shading screens & privacy panels',
      'Freestanding garden gazebos with anchor base plates for lawns and podiums',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'Residential Penthouses & Terraces',
        detail: 'Rooftop living extensions, weather-protected lounge canopies, and private terrace pergolas.',
      }),
      Object.freeze({
        title: 'Villas, Bungalows & Farmhouses',
        detail: 'Garden gazebos, swimming pool shade structures, and courtyard architectural steelwork.',
      }),
      Object.freeze({
        title: 'Cafes, Restaurants & Lounges',
        detail: 'Outdoor dining canopies, commercial rooftop pavilions, and entrance feature structures.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Site dimension survey or architect drawing review to determine span and aesthetic details.',
      'Precision workshop cutting, TIG/MIG welding, seam grinding, and multi-coat anti-corrosive primer application.',
      'On-site chemical anchor fastening, frame assembly, and roof sheet/glass mounting.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-09 // PERGOLAS & GAZEBOS',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'Architectural Steel Pergola Framework with Rafter Louvers',
      caption:
        'Technical visual representing hollow section steel pergolas, louvered rafters, and roof canopies. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Pergolas and Gazebos — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'Rooftop terraces, villa gardens, outdoor restaurant pavilions & pool canopies',
    ctaLabel: 'Discuss Pergola Project',
    whatsappText: 'Hello Karali Fabrication, I have an enquiry for a Pergola or Gazebo.',
    relatedSlugs: Object.freeze([
      'staircases-railings-gates',
      'roofing-sheets-cladding',
      'security-window-grills',
    ]),
  }),

  // 10. Commercial Rolling Shutters (Newly Approved)
  Object.freeze({
    id: 'service-rolling-shutters',
    slug: 'commercial-rolling-shutters',
    path: '/services/commercial-rolling-shutters/',
    canonical: 'https://karalifabrication.in/services/commercial-rolling-shutters/',
    eyebrow: '10 / Commercial Access',
    shortLabel: 'Rolling Shutters',
    title: 'Commercial Rolling Shutters',
    metaTitle: 'Commercial & Industrial Rolling Shutters | Karali Fabrication — MMR',
    metaDescription:
      'Heavy-duty motorized and manual steel rolling shutters, warehouse loading bay doors, and shopfront security shutters in Mumbai, Thane & Navi Mumbai.',
    summary:
      'Heavy-gauge manual and motorized steel rolling shutters, warehouse bay doors, perforated display shutters, and commercial security closures.',
    heroIntro:
      'We fabricate, install, and retrofit heavy-duty steel rolling shutters for commercial shops, industrial godowns, warehouse loading bays, and commercial complexes across MMR. From manual spring-balanced shutters to heavy motorized rolling doors, all units are built for high security and smooth daily operation.',
    heroImage: '/images/services/commercial-rolling-shutters.svg',
    cardImage: '/images/services/commercial-rolling-shutters.svg',
    deliverables: Object.freeze([
      'Heavy-gauge cold-rolled steel interlocking slat curtains (18 to 22 gauge)',
      'Motorized industrial rolling shutters with central or side-mount tubular motors',
      'Side guide channels, heavy bottom locking bars & safety center lock brackets',
      'Perforated and grill-type display rolling shutters for commercial retail fronts',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'Commercial Retail & Showrooms',
        detail: 'Secure, smooth-rolling shopfront shutters and perforated display grilles for malls and high-street stores.',
      }),
      Object.freeze({
        title: 'Industrial Warehouses & Godowns',
        detail: 'Wide-span motorized loading bay shutters engineered for frequent truck and pallet movement.',
      }),
      Object.freeze({
        title: 'Garages & Commercial Basements',
        detail: 'Basement parking ramp shutters, equipment room closures, and heavy utility bay doors.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Clear opening measurement (width, height, lintel depth, and motorized electrical conduit check).',
      'Precision slat roll-forming, barrel spring assembly, and guide rail fabrication in shop.',
      'On-site bracket mounting, curtain hoisting, spring tension calibration, and motor setup.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-10 // ROLLING SHUTTERS',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'Motorized Industrial Steel Rolling Shutter & Guide Rail Assembly',
      caption:
        'Technical visual representing cold-rolled shutter slats, barrel hood, and heavy bottom lock rail. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Commercial Rolling Shutters — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'Retail shopfronts, warehouse loading bays, factory doors & commercial garages',
    ctaLabel: 'Request Rolling Shutter Quote',
    whatsappText: 'Hello Karali Fabrication, I have an enquiry for Commercial Rolling Shutters.',
    relatedSlugs: Object.freeze([
      'staircases-railings-gates',
      'industrial-sheds-mezzanines',
      'industrial-racking-storage',
    ]),
  }),

  // 11. Security & Window Grills (Newly Approved)
  Object.freeze({
    id: 'service-security-grills',
    slug: 'security-window-grills',
    path: '/services/security-window-grills/',
    canonical: 'https://karalifabrication.in/services/security-window-grills/',
    eyebrow: '11 / Building Safety',
    shortLabel: 'Security & Grills',
    title: 'Security & Window Grills',
    metaTitle: 'Security & Window Safety Grills | Karali Fabrication — Mumbai & Thane',
    metaDescription:
      'Housing society window safety grills, child-safe box grills with planter trays, and balcony security cages fabricated across Mumbai, Thane and Navi Mumbai.',
    summary:
      'High-security solid square bar window grills, child-safe box grills with flower-bed extensions, and building-wide society safety cages.',
    heroIntro:
      'Karali Fabrication executes bulk window safety grill and security cage fabrication for housing societies, residential redevelopment projects, and commercial buildings across MMR. Constructed from high-tensile solid bright bars and heavy square tubes, every grill is custom-measured to window jambs for tamper-resistant anchoring.',
    heroImage: '/images/services/security-window-grills.svg',
    cardImage: '/images/services/security-window-grills.svg',
    deliverables: Object.freeze([
      'Solid square bar (10mm to 16mm) window grills with child-safe spacing',
      'Full-box grills with integrated flower-pot planter trays and utility ledges',
      'Heavy balcony safety enclosures, AC compressor security cages & duct grilles',
      'Dual-coat anti-corrosive primer and durable polyurethane exterior enamel finishing',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'Housing Societies & Redevelopments',
        detail: 'Bulk building-wide facade window grill fabrication maintaining strict architectural uniformity.',
      }),
      Object.freeze({
        title: 'Residential High-Rises & Apartments',
        detail: 'Child-safe balcony grills, French window safety barriers, and utility area box cages.',
      }),
      Object.freeze({
        title: 'Commercial Offices & Institutions',
        detail: 'Ground-floor perimeter window protection, school window safety bars, and utility cages.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Jamb-to-jamb precision measurement across all window openings to ensure uniform site fit.',
      'Jig-based bar cutting, precision spacing, hand-ground fillet welding, and anti-rust priming.',
      'Through-wall mechanical anchor bolting and final touch-up on site across MMR.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-11 // WINDOW SAFETY GRILLS',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'Solid Bar Window Safety Grill & Extended Box Planter Frame',
      caption:
        'Technical visual representing child-safe bar spacing, box grill extensions, and wall mounting anchors. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Security and Window Grills — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'Housing society facades, high-rise box grills, balcony safety & AC cages',
    ctaLabel: 'Enquire for Window Grills',
    whatsappText: 'Hello Karali Fabrication, I have an enquiry for Security or Window Grills.',
    relatedSlugs: Object.freeze([
      'staircases-railings-gates',
      'pergolas-gazebos',
      'custom-metal-fabrication',
    ]),
  }),

  // 12. Animal Farm Sheds (Newly Approved)
  Object.freeze({
    id: 'service-animal-farm-sheds',
    slug: 'animal-farm-sheds',
    path: '/services/animal-farm-sheds/',
    canonical: 'https://karalifabrication.in/services/animal-farm-sheds/',
    eyebrow: '12 / Agricultural Sheds',
    shortLabel: 'Farm Sheds',
    title: 'Animal Farm Sheds',
    metaTitle: 'Ventilated Animal Farm Sheds | Karali Fabrication — Mumbai Outskirts & Thane',
    metaDescription:
      'High-ventilation structural steel sheds for cattle dairy farms (tabelas), poultry coops, and livestock shelters in Kalyan, Bhiwandi, Panvel & MMR outskirts.',
    summary:
      'Ventilated structural steel sheds engineered for cattle dairy farms (tabelas), poultry farming, and livestock protection with corrosion-resistant framing.',
    heroIntro:
      'We fabricate and erect heavy structural steel farm sheds engineered for cattle dairy operations (tabelas), poultry coops, and livestock shelters across the outer Mumbai Metropolitan Region, Thane rural, Kalyan, Bhiwandi, and Panvel. Designed with raised ridge vents and elevated eave heights for natural airflow and washdown durability.',
    heroImage: '/images/services/animal-farm-sheds.svg',
    cardImage: '/images/services/animal-farm-sheds.svg',
    deliverables: Object.freeze([
      'High-clearance portal frame steel sheds with central raised ridge ventilation monitors',
      'Ammonia-resistant protective epoxy coating on steel columns and lower structural members',
      'Integrated feeding trough separation railings, pipe gates & internal pen partitions',
      'Wide roof overhangs and gutter drainage to protect livestock from heavy monsoon rains',
    ]),
    sectorsServed: Object.freeze([
      Object.freeze({
        title: 'Cattle Dairy Farms (Tabela Operations)',
        detail: 'Spacious, well-ventilated dairy shelters with easy-cleaning drainage and durable pipe dividers.',
      }),
      Object.freeze({
        title: 'Poultry & Layer Farming Units',
        detail: 'Clear-span sheds designed for environmental control, feeder lines, and bird safety.',
      }),
      Object.freeze({
        title: 'Livestock & Goat Shelters',
        detail: 'Raised-floor or ground-level metal pens engineered for animal comfort and predator protection.',
      }),
    ]),
    workflowSteps: Object.freeze([
      'Site plan review to optimize natural breeze direction, sunlight angle, and animal capacity.',
      'Shop prefabrication of portal trusses, elevated ridge monitors, and galvanized/epoxy-coated columns.',
      'On-site erection on concrete pier foundations and corrugated roofing sheet installation.',
    ]),
    placeholderPhoto: Object.freeze({
      code: 'KF-SVC-12 // ANIMAL FARM SHEDS',
      badge: 'Illustrative Visual · Awaiting Verified Site Photo',
      title: 'High-Ventilation Cattle Dairy Portal Shed & Raised Ridge Monitor',
      caption:
        'Technical visual representing open-span farm shed trusses, ridge ventilation vents, and feeding partitions. Reserved for verified Karali Fabrication site photography.',
      alt: 'Technical illustration for Animal Farm Sheds — awaiting verified Karali Fabrication site photograph',
    }),
    applications: 'Cattle dairy sheds (tabelas), poultry sheds, goat shelters & rural livestock housing',
    ctaLabel: 'Request Farm Shed Quote',
    whatsappText: 'Hello Karali Fabrication, I have an enquiry for Animal Farm Sheds.',
    relatedSlugs: Object.freeze([
      'industrial-sheds-mezzanines',
      'roofing-sheets-cladding',
      'structural-steel-fabrication',
    ]),
  }),
]);

export function getServiceBySlug(slug) {
  return CORE_SERVICES.find((service) => service.slug === slug) ?? null;
}

export function getWhatsAppUrl(text) {
  if (!text) return WHATSAPP_BASE;
  return `${WHATSAPP_BASE}?text=${encodeURIComponent(text)}`;
}

export const GALLERY_SLOTS = Object.freeze([
  Object.freeze({
    id: 'gallery-slot-structural',
    category: 'Structural Steel',
    title: 'Structural Beam, Column & Truss Assemblies',
    statusBadge: 'Illustrative Placeholder · Awaiting Owner Site Photo',
    caption:
      'Reserved slot for verified Karali Fabrication site photography showing structural steel frame erection and welded beam-column connections.',
    drawingCode: 'KF-REF-01 // STRUCTURAL FRAME',
    image: '/images/gallery/gallery-01-structural-frame.svg',
    imageAlt:
      'Illustrative placeholder for Structural Beam, Column and Truss Assemblies — awaiting verified Karali Fabrication site photo',
  }),
  Object.freeze({
    id: 'gallery-slot-shaft',
    category: 'Lift Shafts & Crash Decks',
    title: 'Elevator Shaft Steelwork & Working Platforms',
    statusBadge: 'Illustrative Placeholder · Awaiting Owner Site Photo',
    caption:
      'Reserved slot for verified Karali Fabrication photography of lift shaft divider beams, support brackets, and safety crash deck installations.',
    drawingCode: 'KF-REF-02 // SHAFT & DECK',
    image: '/images/gallery/gallery-02-lift-shaft-deck.svg',
    imageAlt:
      'Illustrative placeholder for Elevator Shaft Steelwork and Working Platforms — awaiting verified Karali Fabrication site photo',
  }),
  Object.freeze({
    id: 'gallery-slot-sheds-stairs',
    category: 'Sheds, Mezzanines & Access Steel',
    title: 'Industrial Shed Trusses, Mezzanines & Staircases',
    statusBadge: 'Illustrative Placeholder · Awaiting Owner Site Photo',
    caption:
      'Reserved slot for verified Karali Fabrication photography of industrial roof trusses, mezzanine floor grids, staircases, and compound gates.',
    drawingCode: 'KF-REF-03 // SHED & ACCESS',
    image: '/images/gallery/gallery-03-shed-mezzanine-access.svg',
    imageAlt:
      'Illustrative placeholder for Industrial Shed Trusses, Mezzanines and Staircases — awaiting verified Karali Fabrication site photo',
  }),
]);
