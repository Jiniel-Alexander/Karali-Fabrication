/**
 * Reusable HTML template renderer for the 5 dedicated Karali Fabrication
 * service pages (`services/<slug>/index.html`).
 *
 * Uses `CORE_SERVICES` from `src/data/services.js` as the single source of
 * truth so metadata, breadcrumbs, JSON-LD, deliverables, related services,
 * navigation, and footer never drift across pages.
 */
import {
  BUSINESS_ADDRESS,
  CORE_SERVICES,
  getServiceBySlug,
  getWhatsAppUrl,
  PHONE_DISPLAY,
  PHONE_E164,
  PROCESS_WORKFLOW_IMAGE,
  SITE_URL,
} from '../data/services.js';

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @param {string} slug
 * @returns {string} Full HTML document for `services/<slug>/index.html`
 */
export function renderServicePageHtml(slug) {
  const service = getServiceBySlug(slug);
  if (!service) {
    throw new Error(`Unknown service slug: ${slug}`);
  }

  const whatsappUrl = getWhatsAppUrl(service.whatsappText);
  const catalogueCategoryUrl = `/catalogue/?category=${encodeURIComponent(service.slug)}`;
  const relatedServices = service.relatedSlugs
    .map((relSlug) => getServiceBySlug(relSlug))
    .filter(Boolean);

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
            name: 'Services',
            item: `${SITE_URL}/#services`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: service.title,
            item: service.canonical,
          },
        ],
      },
      {
        '@type': 'Service',
        name: service.title,
        serviceType: service.title,
        description: service.summary,
        url: service.canonical,
        provider: {
          '@type': 'HomeAndConstructionBusiness',
          name: BUSINESS_ADDRESS.companyName,
          url: `${SITE_URL}/`,
          telephone: '+91-7977591792',
          address: {
            '@type': 'PostalAddress',
            streetAddress: BUSINESS_ADDRESS.streetAddress,
            addressLocality: BUSINESS_ADDRESS.addressLocality,
            addressRegion: BUSINESS_ADDRESS.addressRegion,
            postalCode: BUSINESS_ADDRESS.postalCode,
            addressCountry: BUSINESS_ADDRESS.addressCountry,
          },
        },
        areaServed: [
          { '@type': 'City', name: 'Mumbai' },
          { '@type': 'City', name: 'Thane' },
          { '@type': 'City', name: 'Navi Mumbai' },
        ],
      },
    ],
  };

  const deliverablesHtml = service.deliverables
    .map((item) => `              <li>${escapeHtml(item)}</li>`)
    .join('\n');

  const sectorsHtml = service.sectorsServed
    .map(
      (sector) => `            <div class="capability-block">
              <h3 class="capability-block__title">${escapeHtml(sector.title)}</h3>
              <p class="service-sector__text">${escapeHtml(sector.detail)}</p>
            </div>`,
    )
    .join('\n');

  const workflowHtml = service.workflowSteps
    .map(
      (step, index) => `                <li>
                  <span class="workflow-list__step">Step 0${index + 1}</span>
                  <div>
                    <p>${escapeHtml(step)}</p>
                  </div>
                </li>`,
    )
    .join('\n');

  const relatedHtml = relatedServices
    .map(
      (rel) => `            <article class="service-card">
              <a class="service-card__media" href="${escapeHtml(rel.path)}" tabindex="-1" aria-hidden="true">
                <img
                  class="service-card__img"
                  src="${escapeHtml(rel.cardImage)}"
                  width="800"
                  height="500"
                  loading="lazy"
                  decoding="async"
                  alt="${escapeHtml(rel.placeholderPhoto.alt)}"
                />
                <span class="service-card__num">${escapeHtml(rel.eyebrow.slice(0, 2))}</span>
              </a>
              <div class="service-card__content">
                <p class="service-card__eyebrow">${escapeHtml(rel.eyebrow.slice(5))}</p>
                <h3 class="service-card__title">
                  <a class="service-card__title-link" href="${escapeHtml(rel.path)}">${escapeHtml(rel.title)}</a>
                </h3>
                <p class="service-card__desc">${escapeHtml(rel.summary)}</p>
                <div class="service-card__footer">
                  <a class="service-card__cta" href="${escapeHtml(rel.path)}">
                    <span>View ${escapeHtml(rel.shortLabel)} Details</span>
                    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                      <path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                  </a>
                </div>
              </div>
            </article>`,
    )
    .join('\n');

  const footerServicesHtml = CORE_SERVICES.map(
    (s) =>
      `            <li><a href="${escapeHtml(s.path)}"${s.slug === service.slug ? ' aria-current="page"' : ''}>${escapeHtml(s.title)}</a></li>`,
  ).join('\n');

  return `<!doctype html>
<html lang="en-IN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>${escapeHtml(service.metaTitle)}</title>
    <meta name="description" content="${escapeHtml(service.metaDescription)}" />
    <link rel="canonical" href="${escapeHtml(service.canonical)}" />
    <meta name="theme-color" content="#1F3C88" />
    <meta name="format-detection" content="telephone=no" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Karali Fabrication" />
    <meta property="og:title" content="${escapeHtml(service.metaTitle)}" />
    <meta property="og:description" content="${escapeHtml(service.metaDescription)}" />
    <meta property="og:url" content="${escapeHtml(service.canonical)}" />
    <meta property="og:locale" content="en_IN" />
    <meta property="og:image" content="${SITE_URL}${escapeHtml(service.heroImage)}" />
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
            <li><a class="site-nav__link" href="/#services">All Services</a></li>
            <li><a class="site-nav__link" href="/catalogue/">Catalogue</a></li>
            <li><a class="site-nav__link" href="#scope">Work Scope</a></li>
            <li><a class="site-nav__link" href="#applications">Applications</a></li>
            <li><a class="site-nav__link" href="#service-enquiry">Contact</a></li>
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

          <a class="btn btn--header-quote" href="#service-enquiry" id="header-quote-link">Request a Quote</a>

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
              <li><a class="mobile-nav__link" href="/#services">All Fabrication Services</a></li>
              <li><a class="mobile-nav__link" href="/catalogue/">Product &amp; Fabrication Catalogue</a></li>
              <li><a class="mobile-nav__link" href="#scope">Scope &amp; Deliverables</a></li>
              <li><a class="mobile-nav__link" href="#applications">Applications &amp; Workflow</a></li>
              <li><a class="mobile-nav__link" href="/#service-areas">MMR Locality Selector</a></li>
            </ul>
          </nav>
          <div class="mobile-nav__ctas">
            <a class="btn btn--primary" href="#service-enquiry">Request a Quote</a>
            <div class="mobile-nav__direct">
              <a class="btn btn--call" href="tel:${PHONE_E164}">Call ${PHONE_DISPLAY}</a>
              <a class="btn btn--whatsapp" href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer">
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
            <li><a href="/#services">Services</a></li>
            <li aria-current="page">${escapeHtml(service.title)}</li>
          </ol>
        </div>
      </nav>

      <!-- Image-Led Service Hero Section -->
      <section class="hero hero--image-led service-hero" aria-labelledby="page-title">
        <div class="hero__backdrop" aria-hidden="true">
          <img
            class="hero__backdrop-img"
            src="${escapeHtml(service.heroImage)}"
            width="800"
            height="500"
            fetchpriority="high"
            decoding="async"
            alt=""
          />
          <div class="hero__backdrop-overlay"></div>
        </div>

        <div class="container hero__grid">
          <div class="hero__copy">
            <p class="badge">
              <span class="badge__dot" aria-hidden="true"></span>
              <span>${escapeHtml(service.eyebrow)} · MMR</span>
            </p>

            <h1 id="page-title" class="hero__title">
              <span>${escapeHtml(service.title)}</span>
            </h1>

            <p class="hero__subtitle">${escapeHtml(service.summary)}</p>

            <p class="hero__lead">${escapeHtml(service.heroIntro)}</p>

            <div class="cta-row">
              <a
                class="btn btn--call btn--hero-quote"
                href="${escapeHtml(whatsappUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                id="whatsapp-button"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06a6.7 6.7 0 0 1-3.3-2.9c-.25-.43.25-.4.71-1.33.08-.16.04-.3-.02-.43l-.76-1.83c-.2-.48-.4-.41-.56-.42h-.47a.9.9 0 0 0-.66.31 2.8 2.8 0 0 0-.86 2.07 4.8 4.8 0 0 0 1 2.56 11 11 0 0 0 4.2 3.7c1.56.67 2.17.73 2.95.62.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.17-.47-.29z" />
                </svg>
                <span>${escapeHtml(service.ctaLabel)} on WhatsApp</span>
                <span class="visually-hidden">(opens in a new tab)</span>
              </a>

              <a class="btn btn--outline-light" href="tel:${PHONE_E164}" id="call-button">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                  <path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" />
                </svg>
                <span>Call ${PHONE_DISPLAY}</span>
              </a>

              <a class="btn btn--secondary-light" href="${escapeHtml(catalogueCategoryUrl)}">
                <span>View ${escapeHtml(service.shortLabel)} Catalogue</span>
              </a>
            </div>
          </div>

          <!-- Service Hero Visual Card -->
          <figure class="gallery-card service-hero__figure">
            <div class="gallery-card__media">
              <img
                class="gallery-card__img"
                src="${escapeHtml(service.heroImage)}"
                width="800"
                height="500"
                fetchpriority="high"
                decoding="async"
                alt="${escapeHtml(service.placeholderPhoto.alt)}"
              />
              <span class="gallery-card__badge">${escapeHtml(service.placeholderPhoto.badge)}</span>
              <span class="gallery-card__code">${escapeHtml(service.placeholderPhoto.code)}</span>
            </div>
            <figcaption class="gallery-card__body">
              <p class="gallery-card__category">Technical Scope Visual</p>
              <h2 class="gallery-card__title">${escapeHtml(service.placeholderPhoto.title)}</h2>
              <p class="gallery-card__caption">${escapeHtml(service.placeholderPhoto.caption)}</p>
            </figcaption>
          </figure>
        </div>
      </section>

      <!-- Work Scope, Deliverables & Process Section -->
      <section class="section section--surface" id="scope" aria-labelledby="scope-heading">
        <div class="container">
          <div class="section__header">
            <p class="section__eyebrow">Scope of Work &amp; Deliverables</p>
            <h2 id="scope-heading" class="section__title">What We Fabricate &amp; Install</h2>
            <p class="section__lead">
              Every project is executed to client-supplied structural drawings, architectural layouts, or agreed site measurements across Mumbai, Thane, and Navi Mumbai.
            </p>
          </div>

          <div class="capabilities-grid">
            <div class="capability-block">
              <h3 class="capability-block__title">Typical Deliverables</h3>
              <ul class="service-card__list service-deliverables-list">
${deliverablesHtml}
              </ul>
            </div>

            <div class="capability-block">
              <h3 class="capability-block__title">How to Request an Estimate</h3>
              <ol class="workflow-list">
${workflowHtml}
              </ol>
            </div>
          </div>

          <!-- Supporting Process Illustration -->
          <figure class="process-visual process-visual--spaced">
            <img
              class="process-visual__img"
              src="${PROCESS_WORKFLOW_IMAGE}"
              width="960"
              height="280"
              loading="lazy"
              decoding="async"
              alt="Three-stage fabrication workflow from structural drawing review to shop welding and MMR site erection"
            />
          </figure>
        </div>
      </section>

      <!-- Applications & Sectors Served -->
      <section class="section" id="applications" aria-labelledby="applications-heading">
        <div class="container">
          <div class="section__header">
            <p class="section__eyebrow">Applications Across MMR</p>
            <h2 id="applications-heading" class="section__title">Projects &amp; Sectors We Serve</h2>
            <p class="section__lead">
              Serving civil contractors, industrial units, commercial developments, and housing societies across 57 localities in Mumbai, Thane, and Navi Mumbai.
            </p>
          </div>

          <div class="services-grid">
${sectorsHtml}
          </div>
        </div>
      </section>

      <!-- Related Fabrication Services -->
      <section class="section section--surface" id="related-services" aria-labelledby="related-heading">
        <div class="container">
          <div class="section__header section__header--split">
            <div>
              <p class="section__eyebrow">Explore Other Capabilities</p>
              <h2 id="related-heading" class="section__title">Related Fabrication Services</h2>
              <p class="section__lead">
                Many projects combine ${escapeHtml(service.title.toLowerCase())} with complementary structural and architectural steelwork.
              </p>
            </div>
            <a class="btn btn--primary btn--hero-quote" href="${escapeHtml(catalogueCategoryUrl)}">
              <span>Browse ${escapeHtml(service.shortLabel)} Catalogue Items →</span>
            </a>
          </div>

          <div class="services-grid">
${relatedHtml}
          </div>
        </div>
      </section>

      <!-- Service Enquiry CTA -->
      <section class="section enquiry-section" id="service-enquiry" aria-labelledby="enquiry-heading">
        <div class="container">
          <div class="enquiry-banner">
            <div class="enquiry-banner__copy">
              <p class="enquiry-banner__eyebrow">Direct Project Quotation</p>
              <h2 id="enquiry-heading" class="enquiry-banner__title">
                Discuss Your ${escapeHtml(service.title)} Requirement
              </h2>
              <p class="enquiry-banner__lead">
                Call us directly or send your structural drawings, Bill of Quantities (BoQ), sketches, and site location on WhatsApp.
              </p>
              <ul class="enquiry-checklist" aria-label="Details to share for a quotation">
                <li>Drawings, section schedule, or approximate dimensions</li>
                <li>Site locality in Mumbai, Thane, or Navi Mumbai</li>
                <li>Whether scope includes fabrication only or fabrication + on-site erection</li>
              </ul>
            </div>

            <div class="enquiry-banner__actions">
              <a
                class="btn btn--whatsapp btn--full"
                href="${escapeHtml(whatsappUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                id="enquiry-whatsapp-button"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                  <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.25-.12-1.47-.72-1.7-.8-.23-.09-.4-.13-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06a6.7 6.7 0 0 1-3.3-2.9c-.25-.43.25-.4.71-1.33.08-.16.04-.3-.02-.43l-.76-1.83c-.2-.48-.4-.41-.56-.42h-.47a.9.9 0 0 0-.66.31 2.8 2.8 0 0 0-.86 2.07 4.8 4.8 0 0 0 1 2.56 11 11 0 0 0 4.2 3.7c1.56.67 2.17.73 2.95.62.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.14-1.18-.06-.1-.22-.17-.47-.29z" />
                </svg>
                <span>${escapeHtml(service.ctaLabel)}</span>
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
            <li><a href="/catalogue/">Product Catalogue</a></li>
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
              <a href="${escapeHtml(whatsappUrl)}" target="_blank" rel="noopener noreferrer" id="footer-whatsapp-link">
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
