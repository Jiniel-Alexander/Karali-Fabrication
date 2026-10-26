/**
 * Analytics and conversion event tracker for Karali Fabrication.
 *
 * Golden Rules:
 * 1. Fire form conversion events ONLY after confirmed database/server success.
 * 2. Never include PII (names, phone numbers, emails, scopes) in event payloads.
 * 3. Safely integrate with dataLayer if present, while always dispatching a DOM CustomEvent
 *    `karali:analytics` for local listener testing and zero-external-dependency observability.
 */

/**
 * Dispatches an analytics event cleanly and safely without PII.
 *
 * @param {string} eventName - Standardized event name (e.g., 'quote_form_submit', 'contact_call_click', 'contact_whatsapp_click')
 * @param {Record<string, string | number | boolean>} [params={}] - Clean, sanitized parameters (no PII)
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined' || !eventName) return;

  // Filter out any potential sensitive keys just in case
  const safeParams = {};
  const forbiddenKeys = ['name', 'phone', 'email', 'details', 'scope', 'notes', 'drawing'];

  for (const [key, value] of Object.entries(params)) {
    if (!forbiddenKeys.some((f) => key.toLowerCase().includes(f))) {
      safeParams[key] = value;
    }
  }

  const payload = {
    event: eventName,
    timestamp: Date.now(),
    path: window.location.pathname,
    ...safeParams
  };

  // 1. Dispatch custom DOM event for testing / local monitoring
  try {
    window.dispatchEvent(new CustomEvent('karali:analytics', { detail: payload }));
  } catch {
    // Ignore DOM dispatch errors
  }

  // 2. Dispatch to window.dataLayer if configured (e.g. GTM / Cloudflare Web Analytics bridge)
  try {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }
  } catch {
    // Ignore dataLayer errors
  }
}

/**
 * Wires automatic click listener tracking for direct call and WhatsApp CTA links.
 */
export function initContactClickTracking() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  document.addEventListener('click', (event) => {
    const target = event?.target && typeof event.target.closest === 'function' ? event.target.closest('a') : null;
    if (!target) return;

    const href = target.getAttribute('href') || '';
    const id = target.id || '';
    const ariaLabel = target.getAttribute('aria-label') || '';

    if (href.startsWith('tel:') || id.includes('call') || ariaLabel.toLowerCase().includes('call')) {
      trackEvent('contact_call_click', {
        cta_id: id || 'call_link',
        destination: 'tel'
      });
    } else if (href.includes('wa.me') || href.includes('whatsapp') || id.includes('whatsapp') || ariaLabel.toLowerCase().includes('whatsapp')) {
      trackEvent('contact_whatsapp_click', {
        cta_id: id || 'whatsapp_link',
        destination: 'whatsapp'
      });
    }
  });
}
