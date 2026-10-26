import '@fontsource-variable/inter';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import './style.css';

import { createCombobox } from './components/combobox.js';
import { initCatalogueFilter } from './components/catalogue-filter.js';
import { initMobileNav } from './components/mobile-nav.js';
import { initQuoteForm } from './components/quote-form.js';
import { initContactClickTracking } from './lib/analytics.js';
import { supabaseConfig } from './lib/config.js';
import { submitLocality } from './lib/submit-locality.js';

// --- Header & Mobile Navigation --------------------------------------------
initMobileNav(document.getElementById('site-header'));

// --- Analytics: High-Intent Direct Contact Clicks ---------------------------
initContactClickTracking();

// --- Product & Fabrication Catalogue Filter (present on /catalogue/) -------
initCatalogueFilter(document.getElementById('catalogue-explorer'));

// --- Phase 4 Industrial Quotation Form (present on #enquiry) ---------------
initQuoteForm(document.getElementById('quote-form'));

const MESSAGES = {
  invalid: 'Please choose your locality from the list.',
  unavailable: 'Submissions are temporarily unavailable. Please call or WhatsApp us instead.',
  offline: 'You appear to be offline. Please check your connection and try again.',
  timeout: 'The request took too long. Please try again in a moment.',
  failed: 'We couldn’t save your selection right now. Please try again shortly, or reach us by phone or WhatsApp.',
};

// --- Lazy Supabase client --------------------------------------------------
let clientPromise;
function loadClient() {
  if (!supabaseConfig.configured) return Promise.resolve(null);
  clientPromise ??= import('./lib/supabase.js')
    .then((mod) => mod.getSupabaseClient())
    .catch(() => {
      clientPromise = undefined; // allow retry if the chunk failed to load
      return null;
    });
  return clientPromise;
}

// --- Form (present on pages with the locality selector) --------------------
const form = document.getElementById('locality-form');
const submitBtn = document.getElementById('locality-submit');
const statusEl = document.getElementById('form-status');
const comboRoot = document.getElementById('locality-combobox');

if (form && submitBtn && statusEl && comboRoot) {
  const submitLabel = submitBtn.querySelector('[data-label]');

  function setStatus(state, message) {
    statusEl.dataset.state = state;
    statusEl.textContent = message;
  }

  function clearStatus() {
    delete statusEl.dataset.state;
    statusEl.textContent = '';
  }

  const combobox = createCombobox(comboRoot, {
    onChange(value) {
      if (value) {
        combobox.setInvalid(false);
        if (statusEl.dataset.state === 'error') clearStatus();
      }
    },
  });

  // Warm up the client when the visitor starts interacting with the form.
  comboRoot.addEventListener('focusin', () => loadClient(), { once: true });

  let submitting = false;

  function setSubmitting(value) {
    submitting = value;
    combobox.setDisabled(value);
    submitBtn.disabled = value;
    submitBtn.setAttribute('aria-busy', String(value));
    if (submitLabel) {
      submitLabel.textContent = value ? 'Submitting…' : 'Submit locality';
    }
    form.setAttribute('aria-busy', String(value));
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    const locality = combobox.value;

    if (!locality) {
      combobox.setInvalid(true);
      setStatus('error', MESSAGES.invalid);
      combobox.focus();
      return;
    }

    if (!supabaseConfig.configured) {
      setStatus('info', MESSAGES.unavailable);
      return;
    }

    if (!navigator.onLine) {
      setStatus('error', MESSAGES.offline);
      return;
    }

    setSubmitting(true);
    setStatus('pending', 'Saving your selection…');

    const client = await loadClient();
    const result = client
      ? await submitLocality({ client, locality })
      : { ok: false, reason: 'failed' };

    setSubmitting(false);

    if (result.ok) {
      combobox.reset();
      setStatus('success', `Thank you! “${locality}” has been recorded.`);
    } else {
      setStatus('error', MESSAGES[result.reason] ?? MESSAGES.failed);
    }
  });
}

// --- Misc ------------------------------------------------------------------
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}
document.documentElement.classList.add('js');
