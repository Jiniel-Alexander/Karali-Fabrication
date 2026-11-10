import { test, expect } from '@playwright/test';

const SERVICE_PAGES = [
  {
    slug: 'structural-steel-fabrication',
    path: '/services/structural-steel-fabrication/',
    canonical: 'https://karalifabrication.in/services/structural-steel-fabrication/',
    h1: 'Structural Steel Fabrication',
    titlePattern: /Structural Steel Fabrication \| Karali Fabrication/i,
    whatsappMatch: /Structural%20Steel%20Fabrication/,
  },
  {
    slug: 'lift-shaft-steelwork-crash-decks',
    path: '/services/lift-shaft-steelwork-crash-decks/',
    canonical: 'https://karalifabrication.in/services/lift-shaft-steelwork-crash-decks/',
    h1: 'Lift Shaft Steelwork, Crash Decks & Platforms',
    titlePattern: /Lift Shaft Steelwork, Crash Decks & Platforms \| Karali Fabrication/i,
    whatsappMatch: /Lift%20Shaft%20Steelwork/,
  },
  {
    slug: 'industrial-sheds-mezzanines',
    path: '/services/industrial-sheds-mezzanines/',
    canonical: 'https://karalifabrication.in/services/industrial-sheds-mezzanines/',
    h1: 'Industrial Sheds & Mezzanines',
    titlePattern: /Industrial Sheds & Mezzanine Floors \| Karali Fabrication/i,
    whatsappMatch: /Industrial%20Shed%20or%20Mezzanine/,
  },
  {
    slug: 'staircases-railings-gates',
    path: '/services/staircases-railings-gates/',
    canonical: 'https://karalifabrication.in/services/staircases-railings-gates/',
    h1: 'Staircases, Railings & Gates',
    titlePattern: /Steel Staircases, Railings & Gates Fabrication \| Karali Fabrication/i,
    whatsappMatch: /Staircases%2C%20Railings%2C%20or%20Gates/,
  },
  {
    slug: 'custom-metal-fabrication',
    path: '/services/custom-metal-fabrication/',
    canonical: 'https://karalifabrication.in/services/custom-metal-fabrication/',
    h1: 'Custom Metal Fabrication',
    titlePattern: /Custom Metal Fabrication & Site Welding \| Karali Fabrication/i,
    whatsappMatch: /Custom%20Metal%20Fabrication/,
  },
  {
    slug: 'roofing-sheets-cladding',
    path: '/services/roofing-sheets-cladding/',
    canonical: 'https://karalifabrication.in/services/roofing-sheets-cladding/',
    h1: 'Roofing Sheets & Cladding',
    titlePattern: /Roofing Sheets & Wall Cladding \| Karali Fabrication/i,
    whatsappMatch: /Roofing%20Sheets/,
  },
  {
    slug: 'industrial-racking-storage',
    path: '/services/industrial-racking-storage/',
    canonical: 'https://karalifabrication.in/services/industrial-racking-storage/',
    h1: 'Industrial Racking & Metal Furniture',
    titlePattern: /Industrial Warehouse Racking & Steel Furniture \| Karali Fabrication/i,
    whatsappMatch: /Industrial%20Racking/,
  },
  {
    slug: 'unipole-structures-hoardings',
    path: '/services/unipole-structures-hoardings/',
    canonical: 'https://karalifabrication.in/services/unipole-structures-hoardings/',
    h1: 'Unipole Structures & Advertising Hoardings',
    titlePattern: /Unipole Structures & Advertising Hoardings \| Karali Fabrication/i,
    whatsappMatch: /Unipole%20Structures/,
  },
  {
    slug: 'pergolas-gazebos',
    path: '/services/pergolas-gazebos/',
    canonical: 'https://karalifabrication.in/services/pergolas-gazebos/',
    h1: 'Pergolas & Gazebos',
    titlePattern: /Architectural Steel Pergolas & Metal Gazebos \| Karali Fabrication/i,
    whatsappMatch: /Pergola%20or%20Gazebo/,
  },
  {
    slug: 'commercial-rolling-shutters',
    path: '/services/commercial-rolling-shutters/',
    canonical: 'https://karalifabrication.in/services/commercial-rolling-shutters/',
    h1: 'Commercial Rolling Shutters',
    titlePattern: /Commercial & Industrial Rolling Shutters \| Karali Fabrication/i,
    whatsappMatch: /Commercial%20Rolling%20Shutters/,
  },
  {
    slug: 'security-window-grills',
    path: '/services/security-window-grills/',
    canonical: 'https://karalifabrication.in/services/security-window-grills/',
    h1: 'Security & Window Grills',
    titlePattern: /Security & Window Safety Grills \| Karali Fabrication/i,
    whatsappMatch: /Security%20or%20Window%20Grills/,
  },
  {
    slug: 'animal-farm-sheds',
    path: '/services/animal-farm-sheds/',
    canonical: 'https://karalifabrication.in/services/animal-farm-sheds/',
    h1: 'Animal Farm Sheds',
    titlePattern: /Ventilated Animal Farm Sheds \| Karali Fabrication/i,
    whatsappMatch: /Animal%20Farm%20Sheds/,
  },
];

test.describe('Karali Fabrication — Homepage, Dedicated Service Pages & Core Regression Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept Turnstile challenge requests in local test harness to prevent external network flakiness and edge rate-limits
    await page.route('**/challenges.cloudflare.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.turnstile = {
            ready: function() {
              throw new Error('[Cloudflare Turnstile] Remove async/defer from the Turnstile api.js script tag before using turnstile.ready().');
            },
            render: function(container, options) {
              if (options && typeof options.callback === 'function') {
                setTimeout(() => options.callback('e2e-turnstile-token'), 50);
              }
              return 'e2e-widget-id';
            },
            reset: function() {}
          };
        `,
      });
    });
  });
  test('renders branding, headline, navigation, and all homepage sections without console or page errors', async ({
    page,
  }) => {
    test.slow();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('font-size:0;color:transparent')) return;
        consoleErrors.push(text);
      }
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');

    // 1. Landmarks & branding
    await expect(page.locator('header.site-header')).toBeVisible();
    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.locator('footer.site-footer')).toBeVisible();
    await expect(page.locator('.badge')).toContainText('Mumbai · Thane · Navi Mumbai');
    await expect(page.locator('h1#page-title')).toContainText('Building Strength.');
    await expect(page.locator('h1#page-title')).toContainText('Shaping the Future.');

    // 2. Hero service pills (5 core pillars)
    const heroServicePills = page.locator('.services li');
    await expect(heroServicePills).toHaveCount(5);

    // 3. Core Services Overview section (5 primary + 7 secondary cards = 12 services)
    const serviceCards = page.locator('#services .service-card');
    await expect(serviceCards).toHaveCount(5);
    await expect(page.locator('#service-structural-steel h3')).toHaveText('Structural Steel Fabrication');
    await expect(page.locator('#service-lift-shafts h3')).toHaveText(
      'Lift Shaft Steelwork, Crash Decks & Platforms',
    );
    await expect(page.locator('#service-industrial-sheds h3')).toHaveText('Industrial Sheds & Mezzanines');
    await expect(page.locator('#service-staircases-railings-gates h3')).toHaveText('Staircases, Railings & Gates');
    await expect(page.locator('#service-custom-fabrication h3')).toHaveText('Custom Metal Fabrication');

    const secondaryCards = page.locator('#services-extended .secondary-card');
    await expect(secondaryCards).toHaveCount(7);

    // 4. Capabilities & Project Gallery Preview sections
    await expect(page.locator('section#capabilities')).toBeVisible();
    await expect(page.locator('section#projects')).toBeVisible();
    const gallerySlots = page.locator('#projects .gallery-card');
    await expect(gallerySlots).toHaveCount(3);

    // 5. Enquiry CTA section & Explore Services CTA
    await expect(page.locator('section#enquiry')).toBeVisible();
    await expect(page.locator('#quote-form')).toBeVisible();
    const heroServicesBtn = page.locator('#hero-services-button');
    await expect(heroServicesBtn).toBeVisible();
    await expect(heroServicesBtn).toHaveAttribute('href', '#services');

    // 6. Verify all homepage images load and render with non-zero dimensions
    const brokenImages = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        imgs.map(async (img) => {
          img.loading = 'eager';
          try {
            await img.decode();
          } catch {
            // Handled by naturalWidth assertion below
          }
        }),
      );
      return imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute('src'));
    });
    expect(brokenImages).toEqual([]);
    await expect(page.locator('#services .service-card__img')).toHaveCount(5);
    await expect(page.locator('#services-extended .secondary-card__img')).toHaveCount(7);
    await expect(page.locator('#capabilities .process-visual__img')).toHaveCount(1);
    await expect(page.locator('#projects .gallery-card__img')).toHaveCount(3);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('verifies SEO metadata, canonical URL, OpenGraph tags, and truthful JSON-LD schema', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Karali Fabrication.*Metal Fabrication & Structural Steel/i);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toMatch(/Karali Fabrication/i);
    expect(description).toMatch(/Mumbai, Thane and Navi Mumbai/i);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe('https://karalifabrication.in/');

    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    expect(ogUrl).toBe('https://karalifabrication.in/');

    // Verify Schema.org JSON-LD exists and contains verified address
    const jsonLdRaw = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLdRaw).toBeTruthy();
    const schema = JSON.parse(jsonLdRaw);
    expect(schema.name).toBe('Karali Fabrication');
    expect(schema.telephone).toBe('+91-7977591792');
    expect(schema.address).toBeDefined();
    expect(schema.address.streetAddress).toContain('Radha Park Building');
    expect(schema.address.postalCode).toBe('401101');
    expect(schema.aggregateRating).toBeUndefined();
  });

  test('verifies click-to-call, WhatsApp, and quote anchor links work independently of database state', async ({
    page,
  }) => {
    await page.goto('/');

    const callBtn = page.locator('#call-button');
    await expect(callBtn).toBeVisible();
    await expect(callBtn).toHaveAttribute('href', 'tel:+917977591792');

    const headerCall = page.locator('#header-call-link');
    await expect(headerCall).toHaveAttribute('href', 'tel:+917977591792');

    const whatsappBtn = page.locator('#whatsapp-button');
    await expect(whatsappBtn).toBeVisible();
    await expect(whatsappBtn).toHaveAttribute('href', 'https://wa.me/917977591792');
    await expect(whatsappBtn).toHaveAttribute('target', '_blank');
    await expect(whatsappBtn).toHaveAttribute('rel', /noopener/);

    const heroQuoteBtn = page.locator('#hero-quote-button');
    await expect(heroQuoteBtn).toBeVisible();
    await expect(heroQuoteBtn).toHaveAttribute('href', '#enquiry');

    const headerQuoteLink = page.locator('#header-quote-link');
    await expect(headerQuoteLink).toHaveAttribute('href', '#quote-request-card');

    const mobileQuoteLink = page.locator('#mobile-quote-link');
    await expect(mobileQuoteLink).toHaveAttribute('href', '#quote-request-card');

    const enquiryCallBtn = page.locator('#enquiry-call-button');
    await expect(enquiryCallBtn).toHaveAttribute('href', 'tel:+917977591792');

    const enquiryWhatsappBtn = page.locator('#enquiry-whatsapp-button');
    await expect(enquiryWhatsappBtn).toHaveAttribute('href', /https:\/\/wa\.me\/917977591792/);

    // Verify no duplicate element IDs exist in the DOM
    const duplicateIds = await page.evaluate(() => {
      const seen = new Set();
      const duplicates = [];
      for (const el of document.querySelectorAll('[id]')) {
        if (seen.has(el.id)) duplicates.push(el.id);
        seen.add(el.id);
      }
      return duplicates;
    });
    expect(duplicateIds).toEqual([]);
  });

  test('supports responsive navigation (desktop nav bar on wide screens, toggle drawer on mobile)', async ({
    page,
  }) => {
    await page.goto('/');

    const viewport = page.viewportSize();
    const mobileToggle = page.locator('#mobile-nav-toggle');
    const mobilePanel = page.locator('#mobile-nav-panel');
    const desktopNav = page.locator('nav.site-nav');

    if (viewport && viewport.width < 960) {
      await expect(mobileToggle).toBeVisible();
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(mobilePanel).toBeHidden();

      // Open mobile drawer
      await mobileToggle.click();
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'true');
      await expect(mobilePanel).toBeVisible();

      // Escape closes mobile drawer and restores focus
      await page.keyboard.press('Escape');
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
      await expect(mobilePanel).toBeHidden();

      // Open mobile drawer and click "Request a Quote" CTA
      await mobileToggle.click();
      await expect(mobilePanel).toBeVisible();
      await page.locator('#mobile-quote-link').click();
      await expect(mobilePanel).toBeHidden();
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');
    } else {
      await expect(desktopNav).toBeVisible();
      await expect(mobileToggle).toBeHidden();

      // Click header "Request a Quote" CTA
      await page.locator('#header-quote-link').click();
    }

    // Verify navigation landed on #quote-request-card with heading visible below sticky header
    await expect(page).toHaveURL(/#quote-request-card$/);
    await expect
      .poll(async () => {
        return page.evaluate(() => {
          const headerRect = document.getElementById('site-header').getBoundingClientRect();
          const cardRect = document.getElementById('quote-request-card').getBoundingClientRect();
          const headingRect = document
            .querySelector('#quote-request-card .section__title')
            .getBoundingClientRect();
          const bannerRect = document.querySelector('.enquiry-banner').getBoundingClientRect();
          return (
            cardRect.top >= headerRect.bottom &&
            headingRect.top >= headerRect.bottom &&
            headingRect.bottom <= window.innerHeight &&
            bannerRect.top < headerRect.bottom
          );
        });
      })
      .toBe(true);
  });

  test('maintains responsive layout with zero horizontal overflow on current viewport', async ({ page }) => {
    await page.goto('/');

    const overflowDetails = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      const scrollWidth = document.documentElement.scrollWidth;
      const offenders = [];
      if (scrollWidth > docWidth) {
        for (const el of document.querySelectorAll('*')) {
          const rect = el.getBoundingClientRect();
          if (rect.right > docWidth + 0.5 || rect.left < -0.5) {
            offenders.push({
              tag: el.tagName,
              id: el.id,
              className: String(el.className),
              right: Math.round(rect.right),
              docWidth,
            });
          }
        }
      }
      return { scrollWidth, docWidth, offenders: offenders.slice(0, 10) };
    });
    expect(overflowDetails.offenders).toEqual([]);
    expect(overflowDetails.scrollWidth).toBeLessThanOrEqual(overflowDetails.docWidth);
  });

  test('enforces basic accessibility semantics on skip link, heading hierarchy, combobox, and status region', async ({
    page,
  }) => {
    await page.goto('/');

    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main');

    // Single H1 on the page
    await expect(page.locator('h1')).toHaveCount(1);

    const input = page.locator('#locality-input');
    await expect(input).toHaveAttribute('role', 'combobox');
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveAttribute('aria-controls', 'locality-listbox');

    const status = page.locator('#form-status');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveAttribute('aria-live', 'polite');
  });

  test('searchable locality combobox filters options, supports keyboard selection, and rejects arbitrary text', async ({
    page,
  }) => {
    await page.goto('/');

    const input = page.locator('#locality-input');
    const listbox = page.locator('#locality-listbox');
    const submitBtn = page.locator('#locality-submit');
    const status = page.locator('#form-status');

    // 1. Submitting empty or arbitrary unlisted text is rejected
    await input.fill('NotALocality');
    await expect(listbox.locator('.combobox__empty')).toBeVisible();
    await input.press('Escape');
    await expect(listbox).toBeHidden();
    await submitBtn.click();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(status).toHaveAttribute('data-state', 'error');
    await expect(status).toContainText('Please choose your locality from the list.');

    // 2. Typing a valid prefix filters the listbox case-insensitively
    await input.fill('andheri');
    await expect(listbox).toBeVisible();
    const options = listbox.locator('[role="option"]');
    await expect(options).toHaveCount(2);
    await expect(options.nth(0)).toHaveText('Andheri East');
    await expect(options.nth(1)).toHaveText('Andheri West');

    // 3. Keyboard Enter selects the active option
    await input.press('Enter');
    await expect(input).toHaveValue('Andheri East');
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    await expect(listbox).toBeHidden();
  });

  // ---------------------------------------------------------------------------
  // Phase 3A: Dedicated Service Pages Navigation & SEO Verification
  // ---------------------------------------------------------------------------
  test('navigates across all 12 dedicated service pages without console errors or broken images', async ({
    page,
  }) => {
    test.slow();
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('font-size:0;color:transparent')) return;
        consoleErrors.push(text);
      }
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    // 1. Navigate from Homepage service card to Structural Steel page
    await page.goto('/');
    const structuralLink = page.locator('#service-structural-steel a.service-card__cta');
    await expect(structuralLink).toHaveAttribute('href', '/services/structural-steel-fabrication/');
    await structuralLink.click();
    await expect(page).toHaveURL(/\/services\/structural-steel-fabrication\/$/);
    await expect(page.locator('h1#page-title')).toHaveText('Structural Steel Fabrication');

    // 2. Directly visit and verify all 12 dedicated service pages
    for (const svc of SERVICE_PAGES) {
      await page.goto(svc.path);

      // Unique title, single H1, meta description, canonical URL & OG URL
      await expect(page).toHaveTitle(svc.titlePattern);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1#page-title')).toHaveText(svc.h1);

      const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
      expect(metaDesc.length).toBeGreaterThan(70);
      expect(metaDesc).toMatch(/Mumbai|MMR|Thane/i);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBe(svc.canonical);

      const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
      expect(ogUrl).toBe(svc.canonical);

      // Breadcrumb navigation
      const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
      await expect(breadcrumb).toBeVisible();
      await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText(svc.h1);

      // Deliverables, Applications & Related Services (3 related cards)
      await expect(page.locator('#scope .service-deliverables-list li')).toHaveCount(4);
      await expect(page.locator('#applications .capability-block')).toHaveCount(3);
      await expect(page.locator('#related-services .service-card')).toHaveCount(3);

      // Pre-filled WhatsApp & Direct Call CTAs
      const heroWa = page.locator('#whatsapp-button');
      await expect(heroWa).toHaveAttribute('href', svc.whatsappMatch);
      await expect(page.locator('#call-button')).toHaveAttribute('href', 'tel:+917977591792');
      await expect(page.locator('#enquiry-whatsapp-button')).toHaveAttribute('href', svc.whatsappMatch);
      await expect(page.locator('#enquiry-call-button')).toHaveAttribute('href', 'tel:+917977591792');
      await expect(page.locator('.hero__copy a[href^="/catalogue/"]')).toHaveAttribute(
        'href',
        `/catalogue/?category=${svc.slug}`,
      );

      // Verify all images on the service page load with non-zero naturalWidth
      const brokenServiceImgs = await page.evaluate(async () => {
        const imgs = Array.from(document.querySelectorAll('img'));
        await Promise.all(
          imgs.map(async (img) => {
            img.loading = 'eager';
            try {
              await img.decode();
            } catch {
              // Handled by naturalWidth assertion below
            }
          }),
        );
        return imgs
          .filter((img) => !img.complete || img.naturalWidth === 0)
          .map((img) => img.getAttribute('src'));
      });
      expect(brokenServiceImgs, `Broken images on ${svc.path}`).toEqual([]);

      // Responsive layout check (zero horizontal overflow)
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasOverflow, `Horizontal overflow on ${svc.path}`).toBe(false);
    }

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // Phase 3B: Searchable Product & Fabrication Catalogue (/catalogue/)
  // ---------------------------------------------------------------------------
  test('filters product catalogue across all 19 items by category and search query', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (text.includes('font-size:0;color:transparent')) return;
        consoleErrors.push(text);
      }
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/catalogue/');

    // 1. Metadata, canonical URL, breadcrumb & initial 19-item state
    await expect(page).toHaveTitle(/Product & Fabrication Catalogue \| Karali Fabrication/i);
    await expect(page.locator('h1#page-title')).toHaveText('Product & Fabrication Catalogue');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe('https://karalifabrication.in/catalogue/');

    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.locator('[aria-current="page"]')).toHaveText('Catalogue');

    const visibleCards = page.locator('[data-catalogue-item]:not([hidden])');
    const countStatus = page.locator('#catalogue-result-count');
    await expect(visibleCards).toHaveCount(19);
    await expect(countStatus).toHaveText('Showing all 19 fabrication items');
    await expect(page.locator('.catalogue-card__img')).toHaveCount(19);

    // Verify all 19 catalogue item images load with non-zero naturalWidth
    const brokenCatalogueImgs = await page.evaluate(async () => {
      const imgs = Array.from(document.querySelectorAll('img'));
      await Promise.all(
        imgs.map(async (img) => {
          img.loading = 'eager';
          try {
            await img.decode();
          } catch {
            // Handled by naturalWidth assertion below
          }
        }),
      );
      return imgs
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.getAttribute('src'));
    });
    expect(brokenCatalogueImgs).toEqual([]);

    // 2. Category chip filtering
    const liftChip = page.locator('[data-catalogue-category="lift-shaft-steelwork-crash-decks"]');
    await expect(liftChip).toHaveAttribute('aria-pressed', 'false');
    await liftChip.click();
    await expect(liftChip).toHaveAttribute('aria-pressed', 'true');
    await expect(visibleCards).toHaveCount(2);
    await expect(countStatus).toHaveText('Showing 2 of 19 items');

    // Verify WhatsApp enquiry link on visible card contains encoded item title
    const crashDeckWa = page.locator('#cat-lift-crash-deck-platform a.catalogue-card__enquire');
    await expect(crashDeckWa).toHaveAttribute(
      'href',
      /Heavy-Duty%20Elevator%20Shaft%20Crash%20Deck%20%26%20Working%20Platform/,
    );

    // 3. Combined category + keyword search filtering
    const searchInput = page.locator('#catalogue-search-input');
    await searchInput.fill('working platform');
    await expect(visibleCards).toHaveCount(1);
    await expect(countStatus).toHaveText('Showing 1 of 19 items');

    // 4. Empty state when search query matches nothing in active category
    await searchInput.fill('mezzanine');
    await expect(visibleCards).toHaveCount(0);
    await expect(countStatus).toHaveText('Showing 0 of 19 items');
    const emptyState = page.locator('#catalogue-empty');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No catalogue items matched “mezzanine”');

    // 5. Reset button restores all 19 items and resets category chip to All
    await page.locator('#catalogue-empty-reset').click();
    await expect(visibleCards).toHaveCount(19);
    await expect(emptyState).toBeHidden();
    await expect(page.locator('[data-catalogue-category="all"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(countStatus).toHaveText('Showing all 19 fabrication items');

    // 6. Responsive layout check (zero horizontal overflow)
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // Phase 4: Industrial Quotation Form & Drawing Hand-off Bridge
  // NOTE: This E2E test runs with mocked Turnstile (challenges.cloudflare.com)
  // and mocked backend (/api/quote) routes. It validates browser form state,
  // user interactions, client-side validation, and payload formatting.
  // It DOES NOT test live Cloudflare Turnstile Siteverify communication.
  // ---------------------------------------------------------------------------
  test('[MOCKED HARNESS] validates and completes quotation request form with WhatsApp drawing hand-off bridge', async ({ page }) => {
    let requestPayload = null;
    await page.route('**/api/quote**', async (route) => {
      requestPayload = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.route('**/challenges.cloudflare.com/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.turnstile = {
            ready: function() {
              throw new Error('[Cloudflare Turnstile] Remove async/defer from the Turnstile api.js script tag before using turnstile.ready().');
            },
            render: function(container, options) {
              if (options && typeof options.callback === 'function') {
                setTimeout(() => options.callback('e2e-turnstile-token'), 50);
              }
              return 'e2e-widget-id';
            },
            reset: function() {}
          };
        `,
      });
    });

    await page.goto('/');

    const quoteForm = page.locator('#quote-form');
    await expect(quoteForm).toBeVisible();

    // Verify honeypot is completely invisible to customers and not keyboard-focusable
    const honeypotWrapper = page.locator('#quote-form .form__honeypot');
    const honeypotInput = page.locator('#quote-website');
    await expect(honeypotWrapper).toBeHidden();
    await expect(honeypotInput).toBeHidden();
    await expect(honeypotInput).toHaveAttribute('tabindex', '-1');

    const nameInput = page.locator('#quote-name');
    const phoneInput = page.locator('#quote-phone');
    const serviceSelect = page.locator('#quote-service');
    const localityInput = page.locator('#quote-locality-input');
    const detailsInput = page.locator('#quote-details');
    const submitBtn = page.locator('#quote-submit');

    // 1. Submit empty form - verifies required field validation
    await submitBtn.click();
    const statusEl = page.locator('#quote-status');
    await expect(statusEl).toBeVisible();
    await expect(statusEl).toHaveText(/Please correct the highlighted fields/i);

    // 2. Fill valid form details
    await nameInput.fill('Godrej Industrial Logistics');
    await phoneInput.fill('9876543210');
    await serviceSelect.selectOption('industrial-sheds-mezzanines');

    // Select locality via combobox
    await localityInput.fill('Taloja');
    await localityInput.press('Enter');
    await expect(localityInput).toHaveValue('Taloja');

    await detailsInput.fill('Requirement for 45-ton heavy structural mezzanine floor with 4.5m clear height');

    // Choose drawings status and explicitly check consent
    await page.locator('input[name="drawings_status"][value="yes"]').check();
    await page.locator('#quote-consent').check();

    // 3. Submit form
    await submitBtn.click();

    // 4. Verify confirmation view with WhatsApp Drawing Bridge appears
    const successBridge = page.locator('#quote-success-bridge');
    await expect(successBridge).toBeVisible();
    await expect(successBridge.locator('.quote-success__title')).toHaveText('Quotation Request Received');
    await expect(successBridge).toContainText('Godrej Industrial Logistics');
    await expect(successBridge).toContainText('Industrial Sheds & Mezzanines');
    await expect(successBridge).toContainText('Taloja');

    const waBridgeLink = successBridge.locator('a.btn--whatsapp');
    await expect(waBridgeLink).toBeVisible();
    await expect(waBridgeLink).toHaveAttribute('href', /wa\.me\/917977591792/);
    await expect(waBridgeLink).toHaveAttribute('href', /Taloja/);

    if (requestPayload) {
      expect(requestPayload.full_name).toBe('Godrej Industrial Logistics');
      expect(requestPayload.phone).toBe('9876543210');
      expect(requestPayload.service_slug).toBe('industrial-sheds-mezzanines');
      expect(requestPayload.locality).toBe('Taloja');
      expect(requestPayload.website).toBe('');
      expect(requestPayload.turnstile_token).toBe('e2e-turnstile-token');
    }
  });
});
