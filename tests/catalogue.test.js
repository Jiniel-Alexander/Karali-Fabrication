import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  buildCatalogueEnquiryMessage,
  CATALOGUE_CATEGORIES,
  CATALOGUE_ITEMS,
  filterCatalogueItems,
  getCatalogueItemWhatsAppUrl,
  isValidCatalogueCategory,
} from '../src/data/catalogue.js';
import { CORE_SERVICES } from '../src/data/services.js';
import { renderCataloguePageHtml } from '../src/templates/catalogue-page.js';

const ROOT = join(import.meta.dirname, '..');

describe('Product & Fabrication Catalogue data & filtering (`src/data/catalogue.js`)', () => {
  it('defines 13 categories ("all" + the 12 verified core service slugs)', () => {
    expect(CATALOGUE_CATEGORIES).toHaveLength(13);
    expect(CATALOGUE_CATEGORIES[0].id).toBe('all');

    const serviceSlugs = CORE_SERVICES.map((s) => s.slug);
    expect(CATALOGUE_CATEGORIES.slice(1).map((c) => c.id)).toEqual(serviceSlugs);

    expect(isValidCatalogueCategory('all')).toBe(true);
    for (const slug of serviceSlugs) {
      expect(isValidCatalogueCategory(slug)).toBe(true);
    }
    expect(isValidCatalogueCategory('unknown-category')).toBe(false);
  });

  it('defines 19 catalogue items with unique stable IDs, valid category assignments, and honest placeholders', () => {
    expect(CATALOGUE_ITEMS).toHaveLength(19);

    const ids = new Set();
    const slugs = new Set();
    const validServiceSlugs = new Set(CORE_SERVICES.map((s) => s.slug));

    for (const item of CATALOGUE_ITEMS) {
      expect(item.id).toMatch(/^cat-[a-z0-9-]+$/);
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);

      expect(slugs.has(item.slug)).toBe(false);
      slugs.add(item.slug);

      expect(validServiceSlugs.has(item.serviceSlug)).toBe(true);
      expect(item.servicePath).toBe(`/services/${item.serviceSlug}/`);
      expect(item.title.length).toBeGreaterThan(10);
      expect(item.summary.length).toBeGreaterThan(25);
      expect(item.typicalApplications.length).toBeGreaterThanOrEqual(3);
      expect(item.placeholderStatus).toMatch(/Schematic Placeholder · Awaiting Owner Asset/i);
      expect(item.image).toMatch(/^\/images\/catalogue\/.+\.svg$/);
      expect(item.imageAlt.length).toBeGreaterThan(20);
      expect(existsSync(join(ROOT, 'public', item.image))).toBe(true);
    }
  });

  it('filters items by category and case-insensitive keyword query (independently and combined)', () => {
    // 1. Default returns all 19 items
    expect(filterCatalogueItems()).toHaveLength(19);
    expect(filterCatalogueItems({ category: 'all', query: '   ' })).toHaveLength(19);

    // 2. Category filtering returns items matching that service pillar
    for (const svc of CORE_SERVICES) {
      const catResults = filterCatalogueItems({ category: svc.slug });
      expect(catResults.length).toBeGreaterThanOrEqual(1);
      expect(catResults.every((item) => item.serviceSlug === svc.slug)).toBe(true);
    }

    // 3. Case-insensitive keyword matching across title, summary, and applications
    const crashDeckMatches = filterCatalogueItems({ query: 'OVERHEAD SITE PROTECTION' });
    expect(crashDeckMatches.map((i) => i.id)).toEqual(['cat-lift-crash-deck-platform']);

    const mezzanineMatches = filterCatalogueItems({ query: 'mezzanine' });
    expect(mezzanineMatches.length).toBeGreaterThanOrEqual(2);
    expect(mezzanineMatches.some((i) => i.id === 'cat-industrial-mezzanine-floor')).toBe(true);

    // 4. Combined category + keyword filtering
    const combinedMatch = filterCatalogueItems({
      category: 'staircases-railings-gates',
      query: 'mezzanine',
    });
    expect(combinedMatch.map((i) => i.id)).toEqual(['cat-steel-staircase-handrails']);

    const combinedEmpty = filterCatalogueItems({
      category: 'lift-shaft-steelwork-crash-decks',
      query: 'mezzanine',
    });
    expect(combinedEmpty).toEqual([]);

    // 5. Empty results and safe handling of special/HTML characters in search input
    expect(filterCatalogueItems({ query: '<script>alert(1)</script>' })).toEqual([]);
  });

  it('encodes item-specific WhatsApp enquiry URLs with the item title and prompt details', () => {
    for (const item of CATALOGUE_ITEMS) {
      const message = buildCatalogueEnquiryMessage(item);
      expect(message).toContain(item.title);
      expect(message).toMatch(/dimensions, quantity, material requirements, and project locality/i);

      const url = getCatalogueItemWhatsAppUrl(item);
      expect(url.startsWith('https://wa.me/917977591792?text=')).toBe(true);
      expect(decodeURIComponent(url.split('?text=')[1])).toBe(message);
    }
  });

  it('keeps catalogue/index.html in sync with renderCataloguePageHtml()', () => {
    const htmlPath = join(ROOT, 'catalogue', 'index.html');
    expect(existsSync(htmlPath)).toBe(true);

    const diskHtml = readFileSync(htmlPath, 'utf8');
    expect(diskHtml).toBe(renderCataloguePageHtml());
  });
});
