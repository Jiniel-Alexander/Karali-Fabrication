import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { ALL_LOCALITIES } from '../src/data/localities.js';
import { CORE_SERVICES } from '../src/data/services.js';
import {
  ALLOWED_DRAWING_STATUSES,
  ALLOWED_SERVICE_SLUGS,
  validateQuotePayload,
} from '../src/lib/quote-validation.js';
import { initQuoteForm } from '../src/components/quote-form.js';

const ROOT = join(import.meta.dirname, '..');

describe('Quotation Payload Validation (`src/lib/quote-validation.js`)', () => {
  const validBase = {
    full_name: 'Apex Structural Contractors',
    phone: '9876543210',
    service_slug: 'structural-steel-fabrication',
    locality: 'Powai',
    project_details: 'Fabrication of heavy warehouse portal frames, 35 tons total scope',
    drawings_status: 'yes',
    consent: true,
  };

  it('accepts a fully valid quote request payload', () => {
    const result = validateQuotePayload(validBase);
    expect(result.valid).toBe(true);
    expect(result.cleanPayload).toBeDefined();
    expect(result.cleanPayload.phone).toBe('9876543210');
    expect(result.cleanPayload.full_name).toBe('Apex Structural Contractors');
  });

  it('normalizes Indian +91 phone numbers into clean 10-digit format', () => {
    const result = validateQuotePayload({
      ...validBase,
      phone: '+919876543210',
    });
    expect(result.valid).toBe(true);
    expect(result.cleanPayload.phone).toBe('9876543210');
  });

  it('rejects invalid phone numbers', () => {
    const invalidPhones = ['12345', '5876543210', '987654321', '98765432100', 'abcdefghij'];
    for (const phone of invalidPhones) {
      const result = validateQuotePayload({ ...validBase, phone });
      expect(result.valid).toBe(false);
      expect(result.errors.phone).toBeDefined();
    }
  });

  it('accepts all 12 confirmed service slugs and rejects unknown ones', () => {
    expect(ALLOWED_SERVICE_SLUGS.size).toBe(12);
    for (const service of CORE_SERVICES) {
      const result = validateQuotePayload({ ...validBase, service_slug: service.slug });
      expect(result.valid).toBe(true);
    }

    const invalidResult = validateQuotePayload({ ...validBase, service_slug: 'underwater-welding' });
    expect(invalidResult.valid).toBe(false);
    expect(invalidResult.errors.service_slug).toBeDefined();
  });

  it('accepts all 57 curated MMR localities and rejects non-MMR areas', () => {
    for (const locality of ALL_LOCALITIES) {
      const result = validateQuotePayload({ ...validBase, locality });
      expect(result.valid).toBe(true);
    }

    const unapproved = ['Pune', 'Delhi', 'Ahmedabad', 'New York', 'Bandra'];
    for (const locality of unapproved) {
      const result = validateQuotePayload({ ...validBase, locality });
      expect(result.valid).toBe(false);
      expect(result.errors.locality).toBeDefined();
    }
  });

  it('enforces minimum 10 and maximum 2000 characters for project details', () => {
    expect(validateQuotePayload({ ...validBase, project_details: 'A'.repeat(9) }).valid).toBe(false);
    expect(validateQuotePayload({ ...validBase, project_details: 'A'.repeat(10) }).valid).toBe(true);
    expect(validateQuotePayload({ ...validBase, project_details: 'A'.repeat(2000) }).valid).toBe(true);
    expect(validateQuotePayload({ ...validBase, project_details: 'A'.repeat(2001) }).valid).toBe(false);
  });

  it('enforces full_name boundaries (2, 120, 121 characters)', () => {
    expect(validateQuotePayload({ ...validBase, full_name: 'A' }).valid).toBe(false);
    expect(validateQuotePayload({ ...validBase, full_name: 'AB' }).valid).toBe(true);
    expect(validateQuotePayload({ ...validBase, full_name: 'A'.repeat(120) }).valid).toBe(true);
    expect(validateQuotePayload({ ...validBase, full_name: 'A'.repeat(121) }).valid).toBe(false);
  });

  it('detects and flags honeypot spam', () => {
    const result = validateQuotePayload({ ...validBase, website: 'https://spamlink.top' });
    expect(result.valid).toBe(false);
    expect(result.isSpam).toBe(true);
  });

  it('requires explicit consent checkbox', () => {
    const result = validateQuotePayload({ ...validBase, consent: false });
    expect(result.valid).toBe(false);
    expect(result.errors.consent).toBeDefined();
  });

  it('recognizes all 3 drawing status values', () => {
    expect([...ALLOWED_DRAWING_STATUSES]).toEqual(['yes', 'in_progress', 'none']);
  });
});

describe('Frontend Quotation Form Gateway & Mock Protection (`src/components/quote-form.js`)', () => {
  it('submits quote requests strictly via /api/quote and never writes directly to public.quote_requests from browser code', () => {
    const quoteFormPath = join(ROOT, 'src', 'components', 'quote-form.js');
    const quoteFormSource = readFileSync(quoteFormPath, 'utf8');
    expect(quoteFormSource).toContain("fetch('/api/quote'");
    expect(quoteFormSource).not.toContain("from('quote_requests')");
    expect(quoteFormSource).not.toContain('../lib/supabase.js');
  });

  it('never displays the normal customer submission-success message when /api/quote returns { ok: true, mock: true }', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true, mock: true }),
    });

    const submitHandlers = [];
    const statusEl = { dataset: {}, textContent: '', hidden: true };
    const successBridgeEl = { hidden: true, innerHTML: '', querySelector: () => null };
    const formFieldsEl = { hidden: false };

    const makeField = (value) => ({
      value,
      disabled: false,
      parentElement: { querySelector: () => null },
      addEventListener: () => {},
      setAttribute: () => {},
      removeAttribute: () => {},
      focus: () => {},
    });

    const comboInputListeners = {};
    const comboInput = {
      value: 'Powai',
      disabled: false,
      addEventListener: (type, fn) => {
        comboInputListeners[type] = fn;
      },
      setAttribute: () => {},
      removeAttribute: () => {},
      focus: () => {},
    };

    const comboRoot = {
      id: 'quote-locality-combobox',
      classList: { toggle: () => {} },
      contains: () => false,
      addEventListener: (type, fn) => {
        if (type === 'focusout') comboInputListeners.focusout = fn;
      },
      querySelector: (sel) => {
        if (sel === '[data-combobox-input]') return comboInput;
        if (sel === '[data-combobox-listbox]') {
          return {
            id: 'quote-locality-listbox',
            hidden: true,
            replaceChildren: () => {},
            append: () => {},
            addEventListener: () => {},
          };
        }
        if (sel === '[data-combobox-live]') return { textContent: '' };
        return null;
      },
      parentElement: { querySelector: () => null },
      setAttribute: () => {},
      removeAttribute: () => {},
    };

    const fields = {
      '#quote-submit': {
        disabled: false,
        setAttribute: () => {},
        querySelector: () => ({ textContent: '' }),
        parentNode: { insertBefore: () => {} },
      },
      '#quote-status': statusEl,
      '#quote-success-bridge': successBridgeEl,
      '#quote-form-fields': formFieldsEl,
      '#quote-locality-combobox': comboRoot,
      '#quote-name': makeField('Apex Structural Contractors'),
      '#quote-phone': makeField('9876543210'),
      '#quote-service': makeField('structural-steel-fabrication'),
      '#quote-details': makeField('Fabrication of heavy warehouse portal frames, 35 tons total scope'),
      '#quote-website': makeField(''),
      '#quote-consent': {
        checked: true,
        addEventListener: () => {},
        removeAttribute: () => {},
        parentElement: { querySelector: () => null },
      },
      'input[name="drawings_status"]:checked': { value: 'yes' },
    };

    const fakeForm = {
      querySelector: (sel) => fields[sel] ?? null,
      addEventListener: (type, fn) => {
        if (type === 'submit') submitHandlers.push(fn);
      },
      setAttribute: () => {},
      reset: () => {},
    };

    initQuoteForm(fakeForm);
    // Select canonical locality 'Powai' via focusout auto-resolve
    comboInputListeners.focusout?.({ relatedTarget: null });

    expect(submitHandlers).toHaveLength(1);
    await submitHandlers[0]({ preventDefault: () => {} });

    // Verify customer success bridge is NOT shown and mock warning status IS shown
    expect(successBridgeEl.hidden).toBe(true);
    expect(successBridgeEl.innerHTML).toBe('');
    expect(formFieldsEl.hidden).toBe(false);
    expect(statusEl.dataset.state).toBe('error');
    expect(statusEl.textContent).toMatch(/mock mode active/i);

    globalThis.fetch = originalFetch;
  });

  it('enforces full_name (2..120), project_details (10..2000), and phone || validation in initQuoteForm', async () => {
    const originalFetch = globalThis.fetch;
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    globalThis.fetch = fetchSpy;

    const makeFieldWithError = (initialValue) => {
      const errSpan = { textContent: '', hidden: true };
      const attrs = new Map();
      return {
        value: initialValue,
        disabled: false,
        errSpan,
        attrs,
        parentElement: {
          querySelector: (sel) => (sel === '.field-error' ? errSpan : null),
        },
        addEventListener: () => {},
        setAttribute: (k, v) => attrs.set(k, v),
        removeAttribute: (k) => attrs.delete(k),
        focus: () => {},
      };
    };

    const submitHandlers = [];
    const statusEl = { dataset: {}, textContent: '', hidden: true };
    const successBridgeEl = { hidden: true, innerHTML: '', querySelector: () => null };
    const formFieldsEl = { hidden: false };
    const comboInputListeners = {};
    const comboInput = {
      value: 'Powai',
      disabled: false,
      addEventListener: (type, fn) => {
        comboInputListeners[type] = fn;
      },
      setAttribute: () => {},
      removeAttribute: () => {},
      focus: () => {},
    };

    const comboRoot = {
      id: 'quote-locality-combobox',
      classList: { toggle: () => {} },
      contains: () => false,
      addEventListener: (type, fn) => {
        if (type === 'focusout') comboInputListeners.focusout = fn;
      },
      querySelector: (sel) => {
        if (sel === '[data-combobox-input]') return comboInput;
        if (sel === '[data-combobox-listbox]') {
          return {
            id: 'quote-locality-listbox',
            hidden: true,
            replaceChildren: () => {},
            append: () => {},
            addEventListener: () => {},
          };
        }
        if (sel === '[data-combobox-live]') return { textContent: '' };
        return null;
      },
      parentElement: { querySelector: () => null },
      setAttribute: () => {},
      removeAttribute: () => {},
    };

    const nameField = makeFieldWithError('Apex Structural Contractors');
    const phoneField = makeFieldWithError('9876543210');
    const serviceField = makeFieldWithError('structural-steel-fabrication');
    const detailsField = makeFieldWithError('Fabrication of heavy warehouse portal frames, 35 tons total scope');

    const fields = {
      '#quote-submit': {
        disabled: false,
        setAttribute: () => {},
        querySelector: () => ({ textContent: '' }),
        parentNode: { insertBefore: () => {} },
      },
      '#quote-status': statusEl,
      '#quote-success-bridge': successBridgeEl,
      '#quote-form-fields': formFieldsEl,
      '#quote-locality-combobox': comboRoot,
      '#quote-name': nameField,
      '#quote-phone': phoneField,
      '#quote-service': serviceField,
      '#quote-details': detailsField,
      '#quote-website': makeFieldWithError(''),
      '#quote-consent': {
        checked: true,
        addEventListener: () => {},
        removeAttribute: () => {},
        parentElement: { querySelector: () => null },
      },
      'input[name="drawings_status"]:checked': { value: 'yes' },
    };

    const fakeForm = {
      querySelector: (sel) => fields[sel] ?? null,
      addEventListener: (type, fn) => {
        if (type === 'submit') submitHandlers.push(fn);
      },
      setAttribute: () => {},
      reset: () => {},
    };

    initQuoteForm(fakeForm);
    comboInputListeners.focusout?.({ relatedTarget: null });

    // 1. Reject full_name of 121 chars
    nameField.value = 'A'.repeat(121);
    await submitHandlers[0]({ preventDefault: () => {} });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(nameField.attrs.get('aria-invalid')).toBe('true');
    expect(nameField.errSpan.textContent).toMatch(/2 to 120 characters/i);

    // 2. Reject project_details of 9 chars and 2001 chars
    nameField.value = 'A'.repeat(120);
    detailsField.value = 'A'.repeat(9);
    await submitHandlers[0]({ preventDefault: () => {} });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(detailsField.attrs.get('aria-invalid')).toBe('true');
    expect(detailsField.errSpan.textContent).toMatch(/10 and 2000 characters/i);

    detailsField.value = 'A'.repeat(2001);
    await submitHandlers[0]({ preventDefault: () => {} });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(detailsField.attrs.get('aria-invalid')).toBe('true');
    expect(detailsField.errSpan.textContent).toMatch(/10 and 2000 characters/i);

    // 3. Reject invalid phone numbers
    detailsField.value = 'A'.repeat(2000);
    for (const badPhone of ['5876543210', '987654321', '+911234567890']) {
      phoneField.value = badPhone;
      await submitHandlers[0]({ preventDefault: () => {} });
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(phoneField.attrs.get('aria-invalid')).toBe('true');
    }

    // 4. Accept exact boundary values (full_name = 2 & 120, project_details = 10 & 2000, phone = +91 98765-43210)
    nameField.value = 'AB';
    detailsField.value = 'A'.repeat(10);
    phoneField.value = '+91 98765-43210';
    await submitHandlers[0]({ preventDefault: () => {} });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const submittedBody = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(submittedBody.full_name).toBe('AB');
    expect(submittedBody.phone).toBe('9876543210');
    expect(submittedBody.project_details).toBe('A'.repeat(10));

    nameField.value = 'A'.repeat(120);
    detailsField.value = 'B'.repeat(2000);
    phoneField.value = '6789012345';
    await submitHandlers[0]({ preventDefault: () => {} });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    const submittedUpperBody = JSON.parse(fetchSpy.mock.calls[1][1].body);
    expect(submittedUpperBody.full_name).toBe('A'.repeat(120));
    expect(submittedUpperBody.phone).toBe('6789012345');
    expect(submittedUpperBody.project_details).toBe('B'.repeat(2000));

    globalThis.fetch = originalFetch;
  });

  it('manages Cloudflare Turnstile widget lifecycle: renders with site key, blocks submission without token, sends token on success, and resets on error', async () => {
    const originalFetch = globalThis.fetch;
    const originalTurnstile = globalThis.window?.turnstile;

    let renderedSiteKey = null;
    let renderCallbacks = {};
    let resetCount = 0;

    const mockTurnstile = {
      render: vi.fn((container, options) => {
        renderedSiteKey = options.sitekey;
        renderCallbacks = options;
        return 'widget-id-123';
      }),
      reset: vi.fn(() => {
        resetCount++;
      }),
    };

    globalThis.window = globalThis.window || {};
    globalThis.window.location = { pathname: '/', hostname: 'localhost' };
    globalThis.window.turnstile = mockTurnstile;

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    globalThis.fetch = fetchSpy;

    const submitHandlers = [];
    const statusEl = { dataset: {}, textContent: '', hidden: true };
    const successBridgeEl = { hidden: true, innerHTML: '', querySelector: () => null };
    const formFieldsEl = { hidden: false };

    const makeField = (value) => ({
      value,
      disabled: false,
      parentElement: { querySelector: () => null },
      addEventListener: () => {},
      setAttribute: () => {},
      removeAttribute: () => {},
      focus: () => {},
    });

    const comboInputListeners = {};
    const comboInput = {
      value: 'Powai',
      disabled: false,
      addEventListener: (type, fn) => {
        comboInputListeners[type] = fn;
      },
      setAttribute: () => {},
      removeAttribute: () => {},
      focus: () => {},
    };

    const turnstileDiv = {
      id: 'turnstile-widget',
      parentNode: { insertBefore: () => {} },
    };

    const fields = {
      '#quote-submit': {
        disabled: false,
        setAttribute: () => {},
        querySelector: () => ({ textContent: '' }),
        parentNode: { insertBefore: () => {} },
      },
      '#quote-status': statusEl,
      '#quote-success-bridge': successBridgeEl,
      '#quote-form-fields': formFieldsEl,
      '#quote-locality-combobox': {
        id: 'quote-locality-combobox',
        classList: { toggle: () => {} },
        contains: () => false,
        addEventListener: (type, fn) => {
          if (type === 'focusout') comboInputListeners.focusout = fn;
        },
        setAttribute: () => {},
        removeAttribute: () => {},
        parentElement: { querySelector: () => null },
        querySelector: (sel) => {
          if (sel === '[data-combobox-input]') {
            return comboInput;
          }
          return { id: 'list', hidden: true, replaceChildren: () => {}, append: () => {}, addEventListener: () => {} };
        },
      },
      '#quote-name': makeField('Ramesh Patel'),
      '#quote-phone': makeField('9876543210'),
      '#quote-service': makeField('structural-steel-fabrication'),
      '#quote-details': makeField('Need 50 tons steel fabrication for industrial warehouse in Powai.'),
      '#quote-website': makeField(''),
      '#quote-consent': {
        checked: true,
        addEventListener: () => {},
        removeAttribute: () => {},
        parentElement: { querySelector: () => null },
      },
      'input[name="drawings_status"]:checked': { value: 'yes' },
      '#turnstile-widget': turnstileDiv,
    };

    const fakeForm = {
      dataset: { sitekey: '0x4AAAAAAF6FHuSM5ZiycyyY' },
      querySelector: (sel) => fields[sel] ?? null,
      addEventListener: (type, fn) => {
        if (type === 'submit') submitHandlers.push(fn);
      },
      setAttribute: () => {},
      reset: () => {},
    };

    const instance = initQuoteForm(fakeForm);
    comboInputListeners.focusout?.({ relatedTarget: null });

    // 1. Renders Turnstile widget using the supplied site key
    expect(mockTurnstile.render).toHaveBeenCalled();
    expect(renderedSiteKey).toBe('0x4AAAAAAF6FHuSM5ZiycyyY');

    // 2. Submission blocked when token is missing
    await submitHandlers[0]({ preventDefault: () => {} });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(statusEl.dataset.state).toBe('error');
    expect(statusEl.textContent).toMatch(/human verification/i);

    // 3. Callback sets token -> submission succeeds and passes turnstile_token in payload
    renderCallbacks.callback('test-turnstile-token-xyz');
    await submitHandlers[0]({ preventDefault: () => {} });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(body.turnstile_token).toBe('test-turnstile-token-xyz');

    // 4. Form reset invokes widget reset
    instance.reset();
    expect(mockTurnstile.reset).toHaveBeenCalledWith('widget-id-123');

    globalThis.fetch = originalFetch;
    if (originalTurnstile) {
      globalThis.window.turnstile = originalTurnstile;
    } else {
      delete globalThis.window.turnstile;
    }
  });

  function createMockQuoteFormElements(siteKey = '0x4AAAAAAF6FHuSM5ZiycyyY') {
    const submitHandlers = [];
    const statusEl = { dataset: {}, textContent: '', hidden: true };
    const successBridgeEl = { hidden: true, innerHTML: '', querySelector: () => null };
    const formFieldsEl = { hidden: false };

    const makeField = (value) => ({
      value,
      disabled: false,
      parentElement: { querySelector: () => null },
      addEventListener: () => {},
      setAttribute: () => {},
      removeAttribute: () => {},
      focus: () => {},
    });

    const comboInputListeners = {};
    const comboInput = {
      value: 'Powai',
      disabled: false,
      addEventListener: (type, fn) => {
        comboInputListeners[type] = fn;
      },
      setAttribute: () => {},
      removeAttribute: () => {},
      focus: () => {},
    };

    const turnstileDiv = {
      id: 'turnstile-widget',
      parentNode: { insertBefore: () => {} },
    };

    const fields = {
      '#quote-submit': {
        disabled: false,
        setAttribute: () => {},
        querySelector: () => ({ textContent: '' }),
        parentNode: { insertBefore: () => {} },
      },
      '#quote-status': statusEl,
      '#quote-success-bridge': successBridgeEl,
      '#quote-form-fields': formFieldsEl,
      '#quote-locality-combobox': {
        id: 'quote-locality-combobox',
        classList: { toggle: () => {} },
        contains: () => false,
        addEventListener: (type, fn) => {
          if (type === 'focusout') comboInputListeners.focusout = fn;
        },
        setAttribute: () => {},
        removeAttribute: () => {},
        parentElement: { querySelector: () => null },
        querySelector: (sel) => {
          if (sel === '[data-combobox-input]') return comboInput;
          return { id: 'list', hidden: true, replaceChildren: () => {}, append: () => {}, addEventListener: () => {} };
        },
      },
      '#quote-name': makeField('Apex Structural Contractors'),
      '#quote-phone': makeField('9876543210'),
      '#quote-service': makeField('structural-steel-fabrication'),
      '#quote-details': makeField('Heavy portal frames industrial fabrication in Powai.'),
      '#quote-website': makeField(''),
      '#quote-consent': {
        checked: true,
        addEventListener: () => {},
        removeAttribute: () => {},
        parentElement: { querySelector: () => null },
      },
      'input[name="drawings_status"]:checked': { value: 'yes' },
      '#turnstile-widget': turnstileDiv,
    };

    const fakeForm = {
      dataset: siteKey ? { sitekey: siteKey } : {},
      querySelector: (sel) => fields[sel] ?? null,
      addEventListener: (type, fn) => {
        if (type === 'submit') submitHandlers.push(fn);
      },
      setAttribute: () => {},
      reset: () => {},
    };

    return {
      fakeForm,
      fields,
      statusEl,
      successBridgeEl,
      formFieldsEl,
      comboInputListeners,
      submitHandlers,
    };
  }

  it('initializes Turnstile directly via window.turnstile.render() without calling window.turnstile.ready() or triggering the async/defer TurnstileError', async () => {
    const originalTurnstile = globalThis.window?.turnstile;
    const originalDoc = globalThis.document;
    let renderCalled = false;
    let createdScript = null;

    // Simulate real Cloudflare Turnstile api.js loaded with async/defer:
    // calling turnstile.ready() throws TurnstileError!
    const mockTurnstile = {
      ready: vi.fn(() => {
        throw new Error(
          '[Cloudflare Turnstile] Remove async/defer from the Turnstile api.js script tag before using turnstile.ready().'
        );
      }),
      render: vi.fn(() => {
        renderCalled = true;
        return 'mock-widget-id';
      }),
      reset: vi.fn(),
    };

    globalThis.window = globalThis.window || {};
    globalThis.window.location = { pathname: '/', hostname: 'localhost' };
    delete globalThis.window.turnstile;

    globalThis.document = {
      querySelector: () => null,
      createElement: (tag) => {
        if (tag === 'script') {
          createdScript = {
            src: '',
            async: false,
            onload: null,
            onerror: null,
          };
          return createdScript;
        }
        return { id: '', className: '', parentNode: { insertBefore: () => {} } };
      },
      head: {
        appendChild: () => {},
      },
    };

    const { fakeForm } = createMockQuoteFormElements();
    initQuoteForm(fakeForm);

    expect(createdScript).not.toBeNull();
    expect(createdScript.async).toBe(true);
    expect(renderCalled).toBe(false);

    // Simulate async script load completion
    globalThis.window.turnstile = mockTurnstile;
    expect(() => createdScript.onload()).not.toThrow();

    expect(mockTurnstile.ready).not.toHaveBeenCalled();
    expect(renderCalled).toBe(true);
    expect(mockTurnstile.render).toHaveBeenCalledTimes(1);

    globalThis.document = originalDoc;
    if (originalTurnstile) {
      globalThis.window.turnstile = originalTurnstile;
    } else {
      delete globalThis.window.turnstile;
    }
  });

  it('renders Turnstile widget exactly once even under repeated render triggers', async () => {
    const originalTurnstile = globalThis.window?.turnstile;
    const originalDoc = globalThis.document;
    const loadListeners = [];

    const existingScript = {
      addEventListener: (type, fn) => {
        if (type === 'load') loadListeners.push(fn);
      },
    };

    const mockTurnstile = {
      ready: vi.fn(() => {
        throw new Error(
          '[Cloudflare Turnstile] Remove async/defer from the Turnstile api.js script tag before using turnstile.ready().'
        );
      }),
      render: vi.fn(() => 'single-widget-id'),
      reset: vi.fn(),
    };

    globalThis.window = globalThis.window || {};
    globalThis.window.location = { pathname: '/', hostname: 'localhost' };
    delete globalThis.window.turnstile;
    globalThis.document = {
      querySelector: () => existingScript,
    };

    const { fakeForm } = createMockQuoteFormElements();
    initQuoteForm(fakeForm);

    globalThis.window.turnstile = mockTurnstile;
    loadListeners.forEach((cb) => cb());
    loadListeners.forEach((cb) => cb());

    expect(mockTurnstile.ready).not.toHaveBeenCalled();
    expect(mockTurnstile.render).toHaveBeenCalledTimes(1);

    globalThis.document = originalDoc;
    if (originalTurnstile) {
      globalThis.window.turnstile = originalTurnstile;
    } else {
      delete globalThis.window.turnstile;
    }
  });

  it('rejects filled honeypot on the frontend without calling /api/quote or displaying a success message', async () => {
    const originalFetch = globalThis.fetch;
    const originalTurnstile = globalThis.window?.turnstile;
    let capturedOptions = null;

    const mockTurnstile = {
      render: vi.fn((container, options) => {
        capturedOptions = options;
        return 'widget-hp-id';
      }),
      reset: vi.fn(),
    };

    globalThis.window = globalThis.window || {};
    globalThis.window.location = { pathname: '/', hostname: 'localhost' };
    globalThis.window.turnstile = mockTurnstile;

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    globalThis.fetch = fetchSpy;

    const { fakeForm, fields, statusEl, successBridgeEl, formFieldsEl, comboInputListeners, submitHandlers } =
      createMockQuoteFormElements();
    initQuoteForm(fakeForm);
    comboInputListeners.focusout?.({ relatedTarget: null });
    capturedOptions.callback('valid-turnstile-token');

    // Fill the honeypot field with an arbitrary value
    fields['#quote-website'].value = 'arbitrary-bot-input';

    await submitHandlers[0]({ preventDefault: () => {} });

    // Must be rejected: never calls fetch, never displays success status or success bridge
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(statusEl.dataset.state).toBe('error');
    expect(statusEl.textContent).not.toMatch(/received/i);
    expect(statusEl.textContent).toMatch(/rejected/i);
    expect(successBridgeEl.hidden).toBe(true);
    expect(successBridgeEl.innerHTML).toBe('');
    expect(formFieldsEl.hidden).toBe(false);
    expect(mockTurnstile.reset).toHaveBeenCalledWith('widget-hp-id');

    globalThis.fetch = originalFetch;
    if (originalTurnstile) {
      globalThis.window.turnstile = originalTurnstile;
    } else {
      delete globalThis.window.turnstile;
    }
  });

  it('proves empty honeypot + valid Turnstile token proceeds, invalid Turnstile token is rejected, and success message displays ONLY after server confirmation', async () => {
    const originalFetch = globalThis.fetch;
    const originalTurnstile = globalThis.window?.turnstile;
    let capturedOptions = null;

    const mockTurnstile = {
      render: vi.fn((container, options) => {
        capturedOptions = options;
        return 'widget-flow-id';
      }),
      reset: vi.fn(),
    };

    globalThis.window = globalThis.window || {};
    globalThis.window.location = { pathname: '/', hostname: 'localhost' };
    globalThis.window.turnstile = mockTurnstile;

    const { fakeForm, fields, statusEl, successBridgeEl, formFieldsEl, comboInputListeners, submitHandlers } =
      createMockQuoteFormElements();
    initQuoteForm(fakeForm);
    comboInputListeners.focusout?.({ relatedTarget: null });

    // Ensure honeypot is empty
    expect(fields['#quote-website'].value).toBe('');

    // 1. Server rejects invalid Turnstile token (403) -> frontend shows error, resets Turnstile, never shows success
    capturedOptions.callback('invalid-turnstile-token');
    globalThis.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ ok: false, error: 'Human verification failed. Please refresh and try again.' }),
    });

    await submitHandlers[0]({ preventDefault: () => {} });
    expect(statusEl.dataset.state).toBe('error');
    expect(statusEl.textContent).toMatch(/Human verification failed/i);
    expect(successBridgeEl.hidden).toBe(true);
    expect(successBridgeEl.innerHTML).toBe('');
    expect(formFieldsEl.hidden).toBe(false);
    expect(mockTurnstile.reset).toHaveBeenCalledWith('widget-flow-id');

    // 2. Valid Turnstile token + empty honeypot -> verify success is NOT shown before server resolves
    capturedOptions.callback('valid-turnstile-token-confirmed');
    let resolveServerResponse;
    const pendingFetchPromise = new Promise((resolve) => {
      resolveServerResponse = resolve;
    });
    const fetchSpy = vi.fn().mockReturnValueOnce(pendingFetchPromise);
    globalThis.fetch = fetchSpy;

    const submitPromise = submitHandlers[0]({ preventDefault: () => {} });

    // While server request is in-flight, status is pending and success bridge MUST still be hidden
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const sentPayload = JSON.parse(fetchSpy.mock.calls[0][1].body);
    expect(sentPayload.website).toBe('');
    expect(sentPayload.turnstile_token).toBe('valid-turnstile-token-confirmed');
    expect(statusEl.dataset.state).toBe('pending');
    expect(successBridgeEl.hidden).toBe(true);
    expect(successBridgeEl.innerHTML).toBe('');
    expect(formFieldsEl.hidden).toBe(false);

    // Resolve server response with confirmed database write
    resolveServerResponse({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    await submitPromise;

    // Only NOW after server confirmation is the success view displayed
    expect(successBridgeEl.hidden).toBe(false);
    expect(successBridgeEl.innerHTML).toContain('Quotation Request Received');
    expect(formFieldsEl.hidden).toBe(true);

    globalThis.fetch = originalFetch;
    if (originalTurnstile) {
      globalThis.window.turnstile = originalTurnstile;
    } else {
      delete globalThis.window.turnstile;
    }
  });

  it('keeps the honeypot field invisible and non-focusable in index.html without CSP-blocked inline styles', () => {
    const indexHtml = readFileSync(join(ROOT, 'index.html'), 'utf8');
    const styleCss = readFileSync(join(ROOT, 'src', 'style.css'), 'utf8');

    expect(indexHtml).toContain('class="form__honeypot"');
    expect(indexHtml).toContain('aria-hidden="true"');
    expect(indexHtml).toContain('hidden inert');
    expect(indexHtml).toContain('id="quote-website" name="website" tabindex="-1" autocomplete="off"');
    expect(indexHtml).not.toContain('style="display:none;"');
    expect(styleCss).toContain('.form__honeypot');
    expect(styleCss).toContain('display: none !important;');
  });

  it('handles expired-callback by clearing token, updating status, and invoking reset', async () => {
    const originalFetch = globalThis.fetch;
    const originalTurnstile = globalThis.window?.turnstile;
    let capturedOptions = null;

    const mockTurnstile = {
      ready: vi.fn((fn) => fn()),
      render: vi.fn((container, options) => {
        capturedOptions = options;
        return 'widget-exp-id';
      }),
      reset: vi.fn(),
    };

    globalThis.window = globalThis.window || {};
    globalThis.window.location = { pathname: '/', hostname: 'localhost' };
    globalThis.window.turnstile = mockTurnstile;

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    globalThis.fetch = fetchSpy;

    const { fakeForm, statusEl, comboInputListeners, submitHandlers } = createMockQuoteFormElements();
    initQuoteForm(fakeForm);
    comboInputListeners.focusout?.({ relatedTarget: null });

    // Store token via callback
    capturedOptions.callback('valid-initial-token');

    // Trigger expiration
    capturedOptions['expired-callback']();
    expect(statusEl.dataset.state).toBe('error');
    expect(statusEl.textContent).toMatch(/expired/i);
    expect(mockTurnstile.reset).toHaveBeenCalledWith('widget-exp-id');

    // Subsequent submit must be blocked
    await submitHandlers[0]({ preventDefault: () => {} });
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(statusEl.textContent).toMatch(/human verification challenge/i);

    globalThis.fetch = originalFetch;
    if (originalTurnstile) {
      globalThis.window.turnstile = originalTurnstile;
    } else {
      delete globalThis.window.turnstile;
    }
  });

  it('handles error-callback and timeout-callback by invalidating token and preventing submission', async () => {
    const originalFetch = globalThis.fetch;
    const originalTurnstile = globalThis.window?.turnstile;
    let capturedOptions = null;

    const mockTurnstile = {
      ready: vi.fn((fn) => fn()),
      render: vi.fn((container, options) => {
        capturedOptions = options;
        return 'widget-cb-id';
      }),
      reset: vi.fn(),
    };

    globalThis.window = globalThis.window || {};
    globalThis.window.location = { pathname: '/', hostname: 'localhost' };
    globalThis.window.turnstile = mockTurnstile;

    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const { fakeForm, comboInputListeners, submitHandlers } = createMockQuoteFormElements();
    initQuoteForm(fakeForm);
    comboInputListeners.focusout?.({ relatedTarget: null });

    // 1. Success callback stores token
    capturedOptions.callback('temporary-token');

    // 2. Timeout callback clears token
    capturedOptions['timeout-callback']();
    await submitHandlers[0]({ preventDefault: () => {} });
    expect(fetchSpy).not.toHaveBeenCalled();

    // 3. Success callback stores token again
    capturedOptions.callback('temporary-token-2');

    // 4. Error callback clears token
    capturedOptions['error-callback']('mock-error-code');
    await submitHandlers[0]({ preventDefault: () => {} });
    expect(fetchSpy).not.toHaveBeenCalled();

    globalThis.fetch = originalFetch;
    if (originalTurnstile) {
      globalThis.window.turnstile = originalTurnstile;
    } else {
      delete globalThis.window.turnstile;
    }
  });

  it('handles script load failure (onerror) by displaying error and blocking submission', async () => {
    const originalDoc = globalThis.document;
    const originalTurnstile = globalThis.window?.turnstile;
    let createdScript = null;

    globalThis.window = globalThis.window || {};
    delete globalThis.window.turnstile;
    globalThis.window.location = { pathname: '/', hostname: 'localhost' };

    globalThis.document = {
      querySelector: () => null,
      createElement: (tag) => {
        if (tag === 'script') {
          createdScript = {
            src: '',
            async: false,
            onload: null,
            onerror: null,
          };
          return createdScript;
        }
        return { id: '', className: '', parentNode: { insertBefore: () => {} } };
      },
      head: {
        appendChild: () => {},
      },
    };

    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const { fakeForm, statusEl, comboInputListeners, submitHandlers } = createMockQuoteFormElements();
    initQuoteForm(fakeForm);
    comboInputListeners.focusout?.({ relatedTarget: null });

    expect(createdScript).not.toBeNull();
    expect(typeof createdScript.onerror).toBe('function');

    // Fire script.onerror
    createdScript.onerror(new Error('Network error loading script'));
    expect(statusEl.dataset.state).toBe('error');
    expect(statusEl.textContent).toMatch(/could not be loaded/i);

    // Attempt submission -> strictly blocked
    await submitHandlers[0]({ preventDefault: () => {} });
    expect(fetchSpy).not.toHaveBeenCalled();

    globalThis.document = originalDoc;
    if (originalTurnstile) {
      globalThis.window.turnstile = originalTurnstile;
    } else {
      delete globalThis.window.turnstile;
    }
  });
});

describe('Database Migration Safety (`supabase/migrations/20261027000000_create_quote_requests.sql`)', () => {
  const migrationPath = join(ROOT, 'supabase', 'migrations', '20261027000000_create_quote_requests.sql');
  const sql = readFileSync(migrationPath, 'utf8').toLowerCase();

  it('enables and forces Row Level Security (RLS) on public.quote_requests', () => {
    expect(sql).toContain('alter table public.quote_requests enable row level security;');
    expect(sql).toContain('alter table public.quote_requests force row level security;');
  });

  it('revokes all default privileges from public, anon, and authenticated', () => {
    expect(sql).toContain('revoke all on table public.quote_requests from public, anon, authenticated');
  });

  it('grants ONLY column-level insert for the 7 user-submitted fields', () => {
    expect(sql).toContain('grant insert (');
    expect(sql).toContain('full_name,');
    expect(sql).toContain('phone,');
    expect(sql).toContain('service_slug,');
    expect(sql).toContain('locality,');
    expect(sql).toContain('project_details,');
    expect(sql).toContain('drawings_status,');
    expect(sql).toContain('consent');
  });

  it('never grants anon select, update, or delete privileges', () => {
    expect(sql).not.toMatch(/grant[^;]*\b(select|update|delete|all)\b[^;]*quote_requests[^;]*to[^;]*anon/);
  });

  it('enforces all 12 approved service slugs in private.is_allowed_service_slug', () => {
    for (const service of CORE_SERVICES) {
      expect(sql).toContain(`'${service.slug}'`);
    }
  });
});
