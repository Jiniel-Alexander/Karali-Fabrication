import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BUSINESS_ADDRESS,
  CORE_SERVICES,
  GALLERY_SLOTS,
  getServiceBySlug,
  getWhatsAppUrl,
  HOMEPAGE_HERO_IMAGE,
  PROCESS_WORKFLOW_IMAGE,
} from '../src/data/services.js';
import { renderServicePageHtml } from '../src/templates/service-page.js';

const ROOT = join(import.meta.dirname, '..');

describe('CORE_SERVICES, GALLERY_SLOTS & dedicated service page templates', () => {
  it('defines all 12 core fabrication services with required metadata, URLs, and WhatsApp CTAs', () => {
    expect(CORE_SERVICES).toHaveLength(12);

    const expectedSlugs = [
      'structural-steel-fabrication',
      'lift-shaft-steelwork-crash-decks',
      'industrial-sheds-mezzanines',
      'staircases-railings-gates',
      'custom-metal-fabrication',
      'roofing-sheets-cladding',
      'industrial-racking-storage',
      'unipole-structures-hoardings',
      'pergolas-gazebos',
      'commercial-rolling-shutters',
      'security-window-grills',
      'animal-farm-sheds',
    ];
    expect(CORE_SERVICES.map((s) => s.slug)).toEqual(expectedSlugs);

    for (const service of CORE_SERVICES) {
      expect(service.path).toBe(`/services/${service.slug}/`);
      expect(service.canonical).toBe(`https://karalifabrication.in/services/${service.slug}/`);
      expect(service.metaTitle.length).toBeGreaterThan(25);
      expect(service.metaDescription.length).toBeGreaterThan(70);
      expect(service.deliverables.length).toBeGreaterThanOrEqual(4);
      expect(service.sectorsServed.length).toBe(3);
      expect(service.workflowSteps.length).toBe(3);
      expect(service.relatedSlugs.length).toBe(3);
      expect(getServiceBySlug(service.slug)).toBe(service);
      expect(getWhatsAppUrl(service.whatsappText)).toContain('https://wa.me/917977591792?text=');
    }
  });

  it('exports owner-approved business address for Schema.org and footer publication', () => {
    expect(BUSINESS_ADDRESS).toBeDefined();
    expect(BUSINESS_ADDRESS.streetAddress).toContain('Radha Park Building');
    expect(BUSINESS_ADDRESS.addressLocality).toBe('Bhayandar West, Mumbai');
    expect(BUSINESS_ADDRESS.postalCode).toBe('401101');
    expect(BUSINESS_ADDRESS.addressCountry).toBe('IN');
  });

  it('keeps every generated services/<slug>/index.html in sync with renderServicePageHtml(slug)', () => {
    for (const service of CORE_SERVICES) {
      const htmlPath = join(ROOT, 'services', service.slug, 'index.html');
      expect(existsSync(htmlPath), `Missing service page file: ${htmlPath}`).toBe(true);

      const diskHtml = readFileSync(htmlPath, 'utf8');
      const expectedHtml = renderServicePageHtml(service.slug);
      expect(diskHtml).toBe(expectedHtml);
    }
  });

  it('defines honest gallery placeholder slots without fabricated project claims', () => {
    expect(GALLERY_SLOTS).toHaveLength(3);
    for (const slot of GALLERY_SLOTS) {
      expect(slot.statusBadge).toMatch(/Awaiting Owner Site Photo/i);
      expect(slot.caption).toMatch(/Reserved slot for verified Karali Fabrication/i);
      expect(slot.image).toMatch(/^\/images\/gallery\/.+\.svg$/);
      expect(slot.imageAlt.length).toBeGreaterThan(20);
      expect(existsSync(join(ROOT, 'public', slot.image))).toBe(true);
    }
  });

  it('references existing local image files in public/images/ for hero, process workflow, and all 12 services', () => {
    expect(existsSync(join(ROOT, 'public', HOMEPAGE_HERO_IMAGE))).toBe(true);
    expect(existsSync(join(ROOT, 'public', PROCESS_WORKFLOW_IMAGE))).toBe(true);

    for (const service of CORE_SERVICES) {
      expect(service.heroImage).toMatch(/^\/images\/services\/.+\.svg$/);
      expect(service.cardImage).toBe(service.heroImage);
      expect(existsSync(join(ROOT, 'public', service.heroImage))).toBe(true);
    }
  });
});
