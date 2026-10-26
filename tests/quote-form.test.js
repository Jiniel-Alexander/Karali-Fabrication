import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_LOCALITIES } from '../src/data/localities.js';
import { CORE_SERVICES } from '../src/data/services.js';
import {
  ALLOWED_DRAWING_STATUSES,
  ALLOWED_SERVICE_SLUGS,
  PHONE_REGEX,
  validateQuotePayload,
} from '../src/lib/quote-validation.js';

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

    const unapproved = ['Pune', 'Delhi', 'Ahmedabad', 'New York', 'Bandra']; // 'Bandra' is not canonical ('Bandra East' / 'Bandra West' are)
    for (const locality of unapproved) {
      const result = validateQuotePayload({ ...validBase, locality });
      expect(result.valid).toBe(false);
      expect(result.errors.locality).toBeDefined();
    }
  });

  it('enforces minimum 10 characters for project details', () => {
    const result = validateQuotePayload({ ...validBase, project_details: 'Short' });
    expect(result.valid).toBe(false);
    expect(result.errors.project_details).toBeDefined();
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
});

describe('Database Migration Safety (`supabase/migrations/20261027000000_create_quote_requests.sql`)', () => {
  const migrationPath = join(ROOT, 'supabase', 'migrations', '20261027000000_create_quote_requests.sql');
  const sql = readFileSync(migrationPath, 'utf8').toLowerCase();

  it('enables and forces Row Level Security (RLS) on public.quote_requests', () => {
    expect(sql).toContain('alter table public.quote_requests enable row level security;');
    expect(sql).toContain('alter table public.quote_requests force row level security;');
  });

  it('revokes all default privileges from public, anon, and authenticated', () => {
    expect(sql).toContain('revoke all on table public.quote_requests from public, anon, authenticated;');
  });

  it('grants anon ONLY column-level insert for user-submitted fields', () => {
    expect(sql).toContain('grant insert (');
    expect(sql).toContain('full_name,');
    expect(sql).toContain('phone,');
    expect(sql).toContain('service_slug,');
    expect(sql).toContain('locality,');
    expect(sql).toContain('project_details,');
    expect(sql).toContain('drawings_status,');
    expect(sql).toContain('consent');
    expect(sql).toContain(') on table public.quote_requests to anon;');
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
