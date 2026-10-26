/**
 * Pure validation logic for Karali Fabrication quote requests.
 * Shared across frontend form, serverless API endpoint, and unit tests.
 */

import { isAllowedLocality } from '../data/localities.js';
import { CORE_SERVICES } from '../data/services.js';

export const PHONE_REGEX = /^(?:\+91)?[6-9]\d{9}$/;

export const ALLOWED_SERVICE_SLUGS = new Set(CORE_SERVICES.map((s) => s.slug));

export const ALLOWED_DRAWING_STATUSES = new Set(['yes', 'in_progress', 'none']);

/**
 * Validates a quote request payload.
 *
 * @param {Record<string, any>} payload
 * @returns {{valid: boolean, errors: Record<string, string>, cleanPayload?: Record<string, any>}}
 */
export function validateQuotePayload(payload = {}) {
  const errors = {};

  // 1. Anti-spam honeypot
  if (payload.website || payload.hp_field) {
    return {
      valid: false,
      isSpam: true,
      errors: { honeypot: 'Spam submission detected.' },
    };
  }

  // 2. Full Name
  const fullName = typeof payload.full_name === 'string' ? payload.full_name.trim() : '';
  if (fullName.length < 2 || fullName.length > 120) {
    errors.full_name = 'Please enter your name or company name (min 2, max 120 characters).';
  }

  // 3. Phone
  const rawPhone = typeof payload.phone === 'string' ? payload.phone.trim().replace(/[\s\-()]/g, '') : '';
  const standardPhone = rawPhone.startsWith('+91') ? rawPhone.slice(3) : rawPhone;
  if (!PHONE_REGEX.test(rawPhone) || !/^[6-9]\d{9}$/.test(standardPhone)) {
    errors.phone = 'Please provide a valid 10-digit Indian phone number (starting with 6-9).';
  }

  // 4. Service Slug
  const serviceSlug = typeof payload.service_slug === 'string' ? payload.service_slug.trim() : '';
  if (!ALLOWED_SERVICE_SLUGS.has(serviceSlug)) {
    errors.service_slug = 'Please select a valid fabrication service from the list.';
  }

  // 5. Locality
  const locality = typeof payload.locality === 'string' ? payload.locality.trim() : '';
  if (!isAllowedLocality(locality)) {
    errors.locality = 'Please select an approved locality in Mumbai, Thane, or Navi Mumbai.';
  }

  // 6. Project Details / Scope
  const details = typeof payload.project_details === 'string' ? payload.project_details.trim() : '';
  if (details.length < 10 || details.length > 2000) {
    errors.project_details = 'Please provide at least 10 characters describing project scope or specifications.';
  }

  // 7. Drawings Status
  const drawingsStatus = ALLOWED_DRAWING_STATUSES.has(payload.drawings_status)
    ? payload.drawings_status
    : 'none';

  // 8. Consent
  const consent = payload.consent === true || payload.consent === 'true';
  if (!consent) {
    errors.consent = 'Please confirm consent to be contacted regarding this quotation.';
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    errors,
    cleanPayload: valid
      ? {
          full_name: fullName,
          phone: standardPhone,
          service_slug: serviceSlug,
          locality,
          project_details: details,
          drawings_status: drawingsStatus,
          consent: true,
        }
      : undefined,
  };
}
