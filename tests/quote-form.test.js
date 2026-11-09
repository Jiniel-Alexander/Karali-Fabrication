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
