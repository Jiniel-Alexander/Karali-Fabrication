/**
 * Phase 4 Industrial Quotation Request Form Component.
 *
 * Provides:
 * - 10-digit Indian phone validation (^[6-9]\d{9}$)
 * - 12 confirmed fabrication services selection
 * - 57 MMR localities searchable combobox
 * - Project details / scope validation (min 10 chars)
 * - Drawings availability status ('yes', 'in_progress', 'none')
 * - Anti-spam honeypot protection
 * - Zero-storage WhatsApp drawing hand-off bridge
 * - Verified analytics event dispatch strictly upon confirmed write
 */

import { createCombobox } from './combobox.js';
import { CORE_SERVICES } from '../data/services.js';
import { isAllowedLocality } from '../data/localities.js';
import { trackEvent } from '../lib/analytics.js';
import { supabaseConfig } from '../lib/config.js';

const PHONE_REGEX = /^(?:\+91)?[6-9]\d{9}$/;

export function initQuoteForm(formEl) {
  if (!formEl) return null;

  const submitBtn = formEl.querySelector('#quote-submit');
  const submitLabel = submitBtn?.querySelector('[data-label]');
  const statusEl = formEl.querySelector('#quote-status');
  const successBridgeEl = formEl.querySelector('#quote-success-bridge');
  const formFieldsEl = formEl.querySelector('#quote-form-fields');
  const comboRoot = formEl.querySelector('#quote-locality-combobox');

  // Fields
  const nameInput = formEl.querySelector('#quote-name');
  const phoneInput = formEl.querySelector('#quote-phone');
  const serviceSelect = formEl.querySelector('#quote-service');
  const detailsInput = formEl.querySelector('#quote-details');
  const honeypotInput = formEl.querySelector('#quote-website');
  const consentCheckbox = formEl.querySelector('#quote-consent');

  let combobox = null;
  if (comboRoot) {
    combobox = createCombobox(comboRoot, {
      onChange(value) {
        if (value) {
          combobox.setInvalid(false);
          clearFieldError(comboRoot);
        }
      },
    });
  }

  function setStatus(state, message) {
    if (!statusEl) return;
    statusEl.dataset.state = state;
    statusEl.textContent = message;
    statusEl.hidden = !message;
  }

  function clearStatus() {
    if (!statusEl) return;
    delete statusEl.dataset.state;
    statusEl.textContent = '';
    statusEl.hidden = true;
  }

  function setFieldError(field, errorMsg) {
    if (!field) return;
    field.setAttribute('aria-invalid', 'true');
    const errSpan = field.parentElement?.querySelector('.field-error');
    if (errSpan) {
      errSpan.textContent = errorMsg;
      errSpan.hidden = false;
    }
  }

  function clearFieldError(field) {
    if (!field) return;
    field.removeAttribute('aria-invalid');
    const errSpan = field.parentElement?.querySelector('.field-error');
    if (errSpan) {
      errSpan.textContent = '';
      errSpan.hidden = true;
    }
  }

  // Clear errors on input
  [nameInput, phoneInput, serviceSelect, detailsInput].forEach((el) => {
    el?.addEventListener('input', () => {
      clearFieldError(el);
      if (statusEl?.dataset.state === 'error') clearStatus();
    });
  });

  consentCheckbox?.addEventListener('change', () => {
    clearFieldError(consentCheckbox);
    const consentErr = formEl.querySelector('#quote-consent-error');
    if (consentErr) {
      consentErr.textContent = '';
      consentErr.hidden = true;
    }
    if (statusEl?.dataset.state === 'error') clearStatus();
  });

  let isSubmitting = false;

  function setSubmitting(busy) {
    isSubmitting = busy;
    if (submitBtn) {
      submitBtn.disabled = busy;
      submitBtn.setAttribute('aria-busy', String(busy));
    }
    if (submitLabel) {
      submitLabel.textContent = busy ? 'Submitting Specification…' : 'Request Quotation';
    }
    formEl.setAttribute('aria-busy', String(busy));
    combobox?.setDisabled(busy);
    if (nameInput) nameInput.disabled = busy;
    if (phoneInput) phoneInput.disabled = busy;
    if (serviceSelect) serviceSelect.disabled = busy;
    if (detailsInput) detailsInput.disabled = busy;
  }

  async function submitPayload(payload) {
    // 1. Try serverless Cloudflare Functions /api/quote endpoint
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json().catch(() => ({ ok: true }));
        if (json.ok) return { ok: true };
      }
    } catch {
      // Endpoint unreachable or running on static preview / local Vite dev
    }

    // 2. Direct Supabase Client fallback (if configured)
    if (supabaseConfig.configured) {
      try {
        const { getSupabaseClient } = await import('../lib/supabase.js');
        const client = getSupabaseClient();
        if (client) {
          const { error } = await client.from('quote_requests').insert({
            full_name: payload.full_name,
            phone: payload.phone,
            service_slug: payload.service_slug,
            locality: payload.locality,
            project_details: payload.project_details,
            drawings_status: payload.drawings_status,
            consent: true,
          });
          if (!error) return { ok: true };
        }
      } catch {
        // Supabase import or insert failed
      }
    }

    // 3. Graceful dev / local preview fallback if in dev, mock, or local preview mode
    if (
      import.meta.env?.DEV ||
      (typeof window !== 'undefined' &&
        (window.__MOCK_QUOTE_SUCCESS__ ||
          window.location.hostname === '127.0.0.1' ||
          window.location.hostname === 'localhost'))
    ) {
      return { ok: true, mock: true };
    }

    return { ok: false, error: 'Network error or backend temporarily unavailable.' };
  }

  formEl.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    // Honeypot check
    if (honeypotInput && honeypotInput.value.trim() !== '') {
      // Silently discard spam submission
      formEl.reset();
      combobox?.reset();
      setStatus('success', 'Your request has been received.');
      return;
    }

    let hasError = false;

    // 1. Name validation
    const fullName = nameInput?.value.trim() || '';
    if (fullName.length < 2) {
      setFieldError(nameInput, 'Please enter your name or company name (min 2 characters).');
      if (!hasError) nameInput?.focus();
      hasError = true;
    } else {
      clearFieldError(nameInput);
    }

    // 2. Phone validation
    const rawPhone = phoneInput?.value.trim().replace(/[\s\-()]/g, '') || '';
    const cleanPhone = rawPhone.startsWith('+91') ? rawPhone.slice(3) : rawPhone;
    if (!PHONE_REGEX.test(rawPhone) && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setFieldError(phoneInput, 'Please enter a valid 10-digit Indian phone number (starting with 6-9).');
      if (!hasError) phoneInput?.focus();
      hasError = true;
    } else {
      clearFieldError(phoneInput);
    }

    // 3. Service selection
    const serviceSlug = serviceSelect?.value.trim() || '';
    const service = CORE_SERVICES.find((s) => s.slug === serviceSlug);
    if (!service) {
      setFieldError(serviceSelect, 'Please select the required fabrication service.');
      if (!hasError) serviceSelect?.focus();
      hasError = true;
    } else {
      clearFieldError(serviceSelect);
    }

    // 4. Locality combobox
    const locality = combobox ? combobox.value : '';
    if (!locality || !isAllowedLocality(locality)) {
      if (combobox) combobox.setInvalid(true);
      setFieldError(comboRoot, 'Please choose your project locality in Mumbai, Thane, or Navi Mumbai.');
      if (!hasError && combobox) combobox.focus();
      hasError = true;
    } else {
      if (combobox) combobox.setInvalid(false);
      clearFieldError(comboRoot);
    }

    // 5. Project details
    const details = detailsInput?.value.trim() || '';
    if (details.length < 10) {
      setFieldError(detailsInput, 'Please provide at least 10 characters describing project scope or dimensions.');
      if (!hasError) detailsInput?.focus();
      hasError = true;
    } else {
      clearFieldError(detailsInput);
    }

    // 6. Consent
    const hadInputError = hasError;
    if (!consentCheckbox || !consentCheckbox.checked) {
      const consentErr = formEl.querySelector('#quote-consent-error');
      if (consentErr) {
        consentErr.textContent = 'Please check the box to confirm consent to be contacted.';
        consentErr.hidden = false;
      }
      if (!hadInputError) {
        setStatus('error', 'Please confirm consent to proceed with your quotation request.');
      }
      hasError = true;
    }

    if (hasError) {
      if (hadInputError) {
        setStatus('error', 'Please correct the highlighted fields above.');
      }
      return;
    }

    // Drawings status radio
    const drawingsRadio = formEl.querySelector('input[name="drawings_status"]:checked');
    const drawingsStatus = drawingsRadio ? drawingsRadio.value : 'none';

    // Prepare clean payload
    const payload = {
      full_name: fullName,
      phone: cleanPhone,
      service_slug: serviceSlug,
      locality,
      project_details: details,
      drawings_status: drawingsStatus,
      consent: Boolean(consentCheckbox?.checked),
    };

    setSubmitting(true);
    setStatus('pending', 'Submitting your engineering specification…');

    const result = await submitPayload(payload);

    setSubmitting(false);

    if (result.ok) {
      // Fire analytics conversion event strictly upon confirmed write
      trackEvent('quote_form_submit', {
        service: serviceSlug,
        locality,
        drawings_status: drawingsStatus,
      });

      // Show success view with WhatsApp Drawing Bridge
      if (formFieldsEl) formFieldsEl.hidden = true;
      clearStatus();

      if (successBridgeEl) {
        successBridgeEl.hidden = false;
        const serviceTitle = service ? service.title : 'Fabrication Project';
        const waText = encodeURIComponent(
          `Hello Karali Fabrication, I just submitted a quotation request for ${serviceTitle} at ${locality}. Here are our project drawings/specifications.`
        );
        const waLink = `https://wa.me/917977591792?text=${waText}`;

        successBridgeEl.innerHTML = `
          <div class="quote-success">
            <div class="quote-success__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h3 class="quote-success__title">Quotation Request Received</h3>
            <p class="quote-success__text">
              Thank you, <strong>${escapeHtml(fullName)}</strong>. Our engineering team will review your specifications for <strong>${escapeHtml(serviceTitle)}</strong> at <strong>${escapeHtml(locality)}</strong> and call you back shortly.
            </p>
            <div class="quote-success__bridge">
              <p class="quote-success__bridge-title">
                <strong>Have architectural or CAD drawings?</strong>
              </p>
              <p class="quote-success__bridge-text">
                Send PDFs, sketches, or structural sheets directly to our workshop on WhatsApp for rapid estimation:
              </p>
              <a href="${waLink}" class="btn btn--whatsapp btn--wide" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.07l-.29-.17-3.02.79.81-2.94-.19-.3a8.21 8.21 0 0 1-1.27-4.37c0-4.54 3.7-8.24 8.24-8.24z"/></svg>
                <span>Send Drawings via WhatsApp (+91 79775 91792)</span>
              </a>
            </div>
            <div class="quote-success__actions">
              <button type="button" class="btn btn--secondary btn--sm" id="quote-reset-btn">
                Submit Another Specification
              </button>
            </div>
          </div>
        `;

        const resetBtn = successBridgeEl.querySelector('#quote-reset-btn');
        resetBtn?.addEventListener('click', () => {
          formEl.reset();
          combobox?.reset();
          successBridgeEl.hidden = true;
          if (formFieldsEl) formFieldsEl.hidden = false;
          clearStatus();
        });
      }
    } else {
      setStatus('error', result.error || 'Failed to submit quote request. Please call +91 79775 91792 or use WhatsApp.');
    }
  });

  return {
    combobox,
    reset() {
      formEl.reset();
      combobox?.reset();
      clearStatus();
      if (successBridgeEl) successBridgeEl.hidden = true;
      if (formFieldsEl) formFieldsEl.hidden = false;
    },
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
