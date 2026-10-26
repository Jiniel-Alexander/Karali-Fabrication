/**
 * Reusable HTML template renderer for the Karali Fabrication Product &
 * Fabrication Catalogue page (`catalogue/index.html`).
 */
import { CATALOGUE_CATEGORIES, CATALOGUE_ITEMS, getCatalogueItemWhatsAppUrl } from '../data/catalogue.js';
import {
  BUSINESS_ADDRESS,
  CORE_SERVICES,
  getWhatsAppUrl,
  PHONE_DISPLAY,
  PHONE_E164,
  SITE_URL,
} from '../data/services.js';

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderCataloguePageHtml() {
  const canonical = `${SITE_URL}/catalogue/`;
  const metaTitle = 'Product & Fabrication Catalogue | Karali Fabrication — Mumbai, Thane & Navi Mumbai';
  const metaDescription =
    'Browse Karali Fabrication’s build-to-drawing steelwork catalogue: structural steel frames, lift shaft cages, crash decks, mezzanine floors, sheds, staircases, railings and gates across MMR.';
  const generalWhatsappUrl = getWhatsAppUrl(
    'Hello Karali Fabrication, I am browsing your Fabrication Catalogue and would like to discuss a custom project requirement.',
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Catalogue',
            item: canonical,
          },
        ],
      },
      {
        '@type': 'CollectionPage',
        name: 'Product & Fabrication Catalogue',
        description: metaDescription,
        url: canonical,
        isPartOf: {
          '@type': 'WebSite',
          name: 'Karali Fabrication',
          url: `${SITE_URL}/`,
        },
      },
    ],
  };

  const categoryChipsHtml = CATALOGUE_CATEGORIES.map((cat, idx) => {
    const isFirst = idx === 0;
    return `              <button
                type="button"
                class="filter-chip${isFirst ? ' is-active' : ''}"
                data-catalogue-category="${escapeHtml(cat.id)}"
                aria-pressed="${isFirst ? 'true' : 'false'}"
              >
                ${escapeHtml(cat.label)}
              </button>`;
  }).join('\n');

  const cardsHtml = CATALOGUE_ITEMS.map((item) => {
    const waUrl = getCatalogueItemWhatsAppUrl(item);
    const appsHtml = item.typicalApplications
      .map((app) => `                  <li>${escapeHtml(app)}</li>`)
      .join('\n');

    return `            <article
              class="catalogue-card"
              id="${escapeHtml(item.id)}"
              data-catalogue-item="${escapeHtml(item.id)}"
              data-category="${escapeHtml(item.serviceSlug)}"
            >
              <div class="gallery-card__media catalogue-card__media">
                <img
                  class="catalogue-card__img"
                  src="${escapeHtml(item.image)}"
                  width="640"
                  height="400"
                  loading="lazy"
                  decoding="async"
                  alt="${escapeHtml(item.imageAlt)}"
                />
                <span class="gallery-card__badge">${escapeHtml(item.placeholderStatus)}</span>
                <span class="gallery-card__code">${escapeHtml(item.placeholderCode)}</span>
              </div>

              <div class="catalogue-card__body">
                <div class="catalogue-card__meta">
                  <span class="catalogue-card__category">${escapeHtml(item.categoryLabel)}</span>
                  <span class="catalogue-card__basis">${escapeHtml(item.executionBasis)}</span>
                </div>

                <h2 class="catalogue-card__title">${escapeHtml(item.title)}</h2>
                <p class="catalogue-card__desc">${escapeHtml(item.summary)}</p>

                <ul class="service-card__list catalogue-card__apps" aria-label="Typical applications for ${escapeHtml(item.title)}">
${appsHtml}
                </ul>

                <div class="catalogue-card__footer">
                  <a
                    class="btn btn--primary catalogue-card__enquire"
                    href="${escapeHtml(waUrl)}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Enquire on WhatsApp</span>
                    <span class="visually-hidden"> about ${escapeHtml(item.title)} (opens in a new tab)</span>
                  </a>
                  <a class="catalogue-card__service-link" href="${escapeHtml(item.servicePath)}">
                    View ${escapeHtml(item.categoryLabel)} Service →
                  </a>
                </div>
              </div>
            </article>`;
  }).join('\n');

  const serviceLinksHtml = CORE_SERVICES.map(
    (s) => `            <article class="service-card">
              <a class="service-card__media" href="${escapeHtml(s.path)}" tabindex="-1" aria-hidden="true">
                <img
                  class="service-card__img"
                  src="${escapeHtml(s.cardImage)}"
                  width="800"
                  height="500"
                  loading="lazy"
                  decoding="async"
                  alt="${escapeHtml(s.placeholderPhoto.alt)}"
                />
                <span class="service-card__num">${escapeHtml(s.eyebrow.slice(0, 2))}</span>
              </a>
              <div class="service-card__content">
                <p class="service-card__eyebrow">${escapeHtml(s.eyebrow.slice(5))}</p>
                <h3 class="service-card__title">
                  <a class="service-card__title-link" href="${escapeHtml(s.path)}">${escapeHtml(s.title)}</a>
                </h3>
                <p class="service-card__desc">${escapeHtml(s.summary)}</p>
                <div class="service-card__footer">
                  <a class="service-card__cta" href="${escapeHtml(s.path)}">
                    <span>View ${escapeHtml(s.shortLabel)} Page</span>
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                      <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>`,
  ).join('\n');

  const footerServicesHtml = CORE_SERVICES.map(
    (s) => `            <li><a href="${escapeHtml(s.path)}">${escapeHtml(s.title)}</a></li>`,
  ).join('\n');

  return `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${escapeHtml(metaTitle)}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta name="theme-color" content="#1F3C88" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Karali Fabrication" />
    <meta property="og:title" content="${escapeHtml(metaTitle)}" />
    <meta property="og:description" content="${escapeHtml(metaDescription)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:image" content="${SITE_URL}/images/hero/industrial-steel-fabrication-hero.svg" />
    <meta name="twitter:card" content="summary_large_image" />

    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 6)}
    </script>
  </head>
  <body>
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="hazard" aria-hidden="true"></div>

    <header class="site-header" id="site-header">
      <div class="container site-header__inner">
        <a class="brand" href="/" aria-label="Karali Fabrication home">
          <svg class="brand__mark" viewBox="0 0 48 48" width="44" height="44" aria-hidden="true" focusable="false">
            <rect width="48" height="48" rx="11" fill="#1F3C88" />
            <path d="M12 11h24v6h-9v14h9v6H12v-6h9V17h-9z" fill="#F5A623" />
          </svg>
          <span class="brand__text">
            <span class="brand__name">Karali</span>
            <span class="brand__sub">Fabrication</span>
          </span>
        </a>

        <nav class="site-nav" aria-label="Primary navigation">
          <ul class="site-nav__list">
            <li><a class="site-nav__link" href="/">Home</a></li>
            <li><a class="site-nav__link" href="/#services">Services</a></li>
            <li><a class="site-nav__link" href="/catalogue/" aria-current="page">Catalogue</a></li>
            <li><a class="site-nav__link" href="/#service-areas">Service Area</a></li>
            <li><a class="site-nav__link" href="#catalogue-enquiry">Contact</a></li>
          </ul>
        </nav>

        <div class="site-header__actions">
          <a class="header-call" href="tel:${PHONE_E164}" id="header-call-link" aria-label="Call ${PHONE_DISPLAY}">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
              <path
                d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"
              />
            </svg>
            <span>${PHONE_DISPLAY}</span>
          </a>

          <a class="btn btn--header-quote" href="#catalogue-enquiry" id="header-quote-link">Request a Quote</a>

          <button
            type="button"
            class="nav-toggle"
            id="mobile-nav-toggle"
            data-nav-toggle
            aria-expanded="false"
            aria-controls="mobile-nav-panel"
            aria-label="Open navigation menu"
          >
            <svg class="nav-toggle__icon nav-toggle__icon--open" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
              <path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" />
            </svg>
            <svg class="nav-toggle__icon nav-toggle__icon--close" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
              <path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6 10.6 12 5 6.4z" />
            </svg>
          </button>
        </div>
      </div>

      <div class="mobile-nav" id="mobile-nav-panel" data-nav-panel hidden>
        <div class="container mobile-nav__inner">
          <nav aria-label="Mobile navigation">
            <ul class="mobile-nav__list">
              <li><a class="mobile-nav__link" href="/">Home</a></li>
              <li><a class="mobile-nav__link" href="/#services">Fabrication Services</a></li>
              <li><a class="mobile-nav__link" href="/catalogue/" aria-current="page">Product &amp; Fabrication Catalogue</a></li>
              <li><a class="mobile-nav__link" href="/#service-areas">MMR Locality Selector</a></li>
              <li><a class="mobile-nav__link" href="#catalogue-enquiry">Request a Quote / Contact</a></li>
            </ul>
          </nav>
          <div class="mobile-nav__ctas">
            <a class="btn btn--primary" href="#catalogue-enquiry">Request a Quote</a>
            <div class="mobile-nav__direct">
              <a class="btn btn--call" href="tel:${PHONE_E164}">Call ${PHONE_DISPLAY}</a>
              <a class="btn btn--whatsapp" href="${escapeHtml(generalWhatsappUrl)}" target="_blank" rel="noopener noreferrer">
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main id="main">
      <!-- Breadcrumb Navigation -->
      <nav class="breadcrumb-bar" aria-label="Breadcrumb">
        <div class="container">
          <ol class="breadcrumb-list">
            <li><a href="/">Home</a></li>
            <li aria-current="page">Catalogue</li>
          </ol>
        </div>
      </nav>

      <!-- Catalogue Header & Interactive Explorer -->
      <section class="section section--surface" id="catalogue-explorer" aria-labelledby="page-title">
        <div class="container">
          <div class="section__header">
            <p class="section__eyebrow">Build-to-Drawing Steelwork &amp; Assemblies</p>
            <h1 id="page-title" class="section__title">Product &amp; Fabrication Catalogue</h1>
            <p class="section__lead">
              Explore our core structural and architectural metal fabrication assemblies across Mumbai, Thane, and Navi Mumbai. Every item is fabricated to client drawings, Bill of Quantities (BoQ), or verified site measurements.
            </p>
          </div>

          <!-- Search & Category Filter Controls -->
          <div class="catalogue-controls" role="region" aria-label="Filter fabrication catalogue">
            <div class="catalogue-search">
              <label class="field-label" for="catalogue-search-input">Search fabrication items</label>
              <div class="catalogue-search__field">
                <svg class="combobox__search" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                  <path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.06l4.24 4.24-1.4 1.4-4.24-4.24A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z" />
                </svg>
                <input
                  id="catalogue-search-input"
                  class="combobox__input catalogue-search__input"
                  data-catalogue-search
                  type="search"
                  autocomplete="off"
                  spellcheck="false"
                  placeholder="Search e.g. crash deck, mezzanine, truss, gate, staircase…"
                />
                <button
                  type="button"
                  class="combobox__btn"
                  id="catalogue-clear-search"
                  data-catalogue-clear-search
                  aria-label="Clear search query"
                  hidden
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                    <path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6 10.6 12 5 6.4z" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="catalogue-categories">
              <span class="field-label" id="catalogue-category-label">Filter by category</span>
              <div class="filter-chip-row" role="group" aria-labelledby="catalogue-category-label">
${categoryChipsHtml}
              </div>
            </div>

            <div class="catalogue-toolbar">
              <p
                id="catalogue-result-count"
                class="catalogue-count"
                data-catalogue-count
                role="status"
                aria-live="polite"
              >
                Showing all ${CATALOGUE_ITEMS.length} fabrication items
              </p>
              <button type="button" class="catalogue-reset-btn" id="catalogue-reset-btn" data-catalogue-reset>
                Reset filters
              </button>
            </div>
          </div>

          <!-- Catalogue Product Grid -->
          <div class="catalogue-grid" id="catalogue-grid">
${cardsHtml}
          </div>

          <!-- Empty Filter State -->
          <div class="catalogue-empty" id="catalogue-empty" data-catalogue-empty hidden>
            <h2 class="catalogue-empty__title">No Matching Fabrication Items Found</h2>
            <p class="catalogue-empty__text" data-catalogue-empty-summary>
              No catalogue items matched your current search or category filter.
            </p>
            <div class="cta-row catalogue-empty__actions">
              <button type="button" class="btn btn--primary btn--hero-quote" id="catalogue-empty-reset" data-catalogue-reset>
                Reset All Filters
              </button>
              <a
                class="btn btn--whatsapp"
                href="${escapeHtml(generalWhatsappUrl)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Enquire About Custom Work on WhatsApp</span>
                <span class="visually-hidden">(opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Core Fabrication Service Pillars Overview -->
      <section class="section" id="catalogue-services" aria-labelledby="catalogue-services-heading">
        <div class="container">
          <div class="section__header">
            <p class="section__eyebrow">Full-Service Execution</p>
            <h2 id="catalogue-services-heading" class="section__title">Explore Our Five Fabrication Service Pillars</h2>
            <p class="section__lead">
              Need end-to-end site measurement, structural fabrication, and on-site erection? View our dedicated service pages for workflow details.
            </p>
          </div>

          <div class="services-grid">
${serviceLinksHtml}
          </div>
        </div>
      </section>

      <!-- General Catalogue Enquiry CTA -->
      <section class="section enquiry-section" id="catalogue-enquiry" aria-labelledby="enquiry-heading">
        <div class="container">
          <div class="enquiry-banner">
            <div class="enquiry-banner__copy">
              <p class="enquiry-banner__eyebrow">Custom &amp; Drawing-Based Quotations</p>
              <h2 id="enquiry-heading" class="enquiry-banner__title">
                Have a Custom Drawing or Bill of Quantities (BoQ)?
              </h2>
              <p class="enquiry-banner__lead">
                Even if your specific steel assembly is not listed above, we fabricate custom structural and architectural metalwork to your exact drawings across Mumbai, Thane, and Navi Mumbai.
              </p>
              <ul class="enquiry-checklist" aria-label="What to share for a catalogue enquiry">
                <li>Selected catalogue item or custom drawing / sketch</li>
                <li>Approximate dimensions, section sizes, and quantity</li>
                <li>Project locality in Mumbai, Thane, or Navi Mumbai</li>
              </ul>
            </div>

            <div class="enquiry-banner__actions">
              <a
                class="btn btn--whatsapp btn--full"
                href="${escapeHtml(generalWhatsappUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                id="enquiry-whatsapp-button"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06a6.7 6.7 0 0 1-3.3-2.9c-.25-.43.25-.4.71-1.33.08-.16.04-.3-.02-.43l-.76-1.83c-.2-.48-.4-.41-.56-.42h-.47a.9.9 0 0 0-.66.31 2.8 2.8 0 0 0-.86 2.07 4.8 4.8 0 0 0 1 2.56 11 11 0 0 0 4.2 3.7c1.56.67 2.17.73 2.95.62.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.17-.47-.29z" />
                </svg>
                <span>WhatsApp Drawings / Enquiry</span>
                <span class="visually-hidden">(opens in a new tab)</span>
              </a>

              <a class="btn btn--call btn--full" href="tel:${PHONE_E164}" id="enquiry-call-button">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                  <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
                </svg>
                <span>Call ${PHONE_DISPLAY}</span>
              </a>

              <a class="enquiry-banner__sublink" href="/#service-areas">
                Check MMR Service Area Localities →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container site-footer__grid">
        <div class="site-footer__brand">
          <a class="brand brand--inverse" href="/" aria-label="Karali Fabrication home">
            <svg class="brand__mark" viewBox="0 0 48 48" width="40" height="40" aria-hidden="true" focusable="false">
              <rect width="48" height="48" rx="11" fill="#183070" />
              <path d="M12 11h24v6h-9v14h9v6H12v-6h9V17h-9z" fill="#F5A623" />
            </svg>
            <span class="brand__text">
              <span class="brand__name">Karali</span>
              <span class="brand__sub">Fabrication</span>
            </span>
          </a>
          <p class="site-footer__summary">
            Metal fabrication and structural steel work across Mumbai, Thane, and Navi Mumbai (MMR).
          </p>
        </div>

        <nav class="site-footer__col" aria-label="Footer services navigation">
          <h2 class="site-footer__heading">Fabrication Services</h2>
          <ul class="site-footer__list">
${footerServicesHtml}
          </ul>
        </nav>

        <nav class="site-footer__col" aria-label="Footer quick links">
          <h2 class="site-footer__heading">Quick Links</h2>
          <ul class="site-footer__list">
            <li><a href="/">Home</a></li>
            <li><a href="/catalogue/" aria-current="page">Product Catalogue</a></li>
            <li><a href="/#services">Services Overview</a></li>
            <li><a href="/#capabilities">Capabilities &amp; Workflow</a></li>
            <li><a href="/#service-areas">MMR Locality Selector</a></li>
          </ul>
        </nav>

        <div class="site-footer__col">
          <h2 class="site-footer__heading">Direct Contact</h2>
          <ul class="site-footer__list">
            <li>
              <a href="tel:${PHONE_E164}" id="footer-call-link">Call ${PHONE_DISPLAY}</a>
            </li>
            <li>
              <a href="${escapeHtml(generalWhatsappUrl)}" target="_blank" rel="noopener noreferrer" id="footer-whatsapp-link">
                WhatsApp ${PHONE_DISPLAY}<span class="visually-hidden"> (opens in a new tab)</span>
              </a>
            </li>
            <li class="site-footer__meta">
              <strong>Workshop Address:</strong><br />
              ${escapeHtml(BUSINESS_ADDRESS.fullAddress)}
            </li>
            <li class="site-footer__meta">Service Area: Mumbai, Thane &amp; Navi Mumbai</li>
          </ul>
        </div>
      </div>

      <div class="container site-footer__bottom">
        <p>© <span id="year">2026</span> Karali Fabrication. All rights reserved.</p>
        <p class="site-footer__privacy-note">
          <a href="/#service-areas">Privacy Notice:</a> Locality submissions record only the selected MMR locality and timestamp.
        </p>
      </div>
    </footer>

    <script type="module" src="/src/main.js"></script>
  </body>
</html>
`;
}
