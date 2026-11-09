import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { ALL_LOCALITIES } from '../src/data/localities.js';
import { submitLocality, SUBMISSIONS_TABLE } from '../src/lib/submit-locality.js';
import { resolveSupabaseConfig } from '../src/lib/config.js';

/** Minimal fake of the supabase-js query chain: from().insert().abortSignal() */
function fakeClient(impl) {
  const calls = { table: null, payload: null, signal: null };
  const client = {
    from(table) {
      calls.table = table;
      return {
        insert(payload) {
          calls.payload = payload;
          return {
            abortSignal(signal) {
              calls.signal = signal;
              return impl(signal);
            },
          };
        },
      };
    },
  };
  return { client, calls };
}

describe('submitLocality', () => {
  it('rejects invalid localities without touching the network', async () => {
    const impl = vi.fn();
    const { client } = fakeClient(impl);
    expect(await submitLocality({ client, locality: '' })).toEqual({ ok: false, reason: 'invalid' });
    expect(await submitLocality({ client, locality: 'Pune' })).toEqual({ ok: false, reason: 'invalid' });
    expect(await submitLocality({ client, locality: 'andheri east' })).toEqual({ ok: false, reason: 'invalid' });
    expect(impl).not.toHaveBeenCalled();
  });

  it('reports unavailable when no client is configured (no fake success)', async () => {
    expect(await submitLocality({ client: null, locality: 'Powai' })).toEqual({ ok: false, reason: 'unavailable' });
  });

  it('succeeds only when the insert returns no error, sending only { locality }', async () => {
    const { client, calls } = fakeClient(async () => ({ error: null, data: null, status: 201 }));
    expect(await submitLocality({ client, locality: 'Powai' })).toEqual({ ok: true });
    expect(calls.table).toBe(SUBMISSIONS_TABLE);
    expect(calls.payload).toEqual({ locality: 'Powai' });
  });

  it('accepts all 57 curated localities when the database confirms insert', async () => {
    const { client } = fakeClient(async () => ({ error: null, data: null, status: 201 }));
    expect(ALL_LOCALITIES).toHaveLength(57);
    for (const locality of ALL_LOCALITIES) {
      expect(await submitLocality({ client, locality })).toEqual({ ok: true });
    }
  });

  it('maps a database error to a generic failure', async () => {
    const { client } = fakeClient(async () => ({
      error: { code: '42501', message: 'new row violates row-level security policy' },
      data: null,
    }));
    const result = await submitLocality({ client, locality: 'Powai' });
    expect(result).toEqual({ ok: false, reason: 'failed' });
    expect(JSON.stringify(result)).not.toMatch(/row-level|42501/);
  });

  it('maps a thrown network error to a generic failure', async () => {
    const { client } = fakeClient(async () => {
      throw new TypeError('Failed to fetch');
    });
    expect(await submitLocality({ client, locality: 'Powai' })).toEqual({ ok: false, reason: 'failed' });
  });

  it('times out a hanging request', async () => {
    const { client } = fakeClient(
      (signal) =>
        new Promise((resolve) => {
          signal.addEventListener('abort', () => resolve({ error: { message: 'AbortError' }, data: null }));
        }),
    );
    expect(await submitLocality({ client, locality: 'Powai', timeoutMs: 20 })).toEqual({ ok: false, reason: 'timeout' });
  });
});

describe('resolveSupabaseConfig', () => {
  const URL_OK = 'https://smdxbjkeruhjerbrdply.supabase.co';
  const jwt = (payload) =>
    `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.sig`;

  it('is unconfigured when values are missing or placeholders', () => {
    expect(resolveSupabaseConfig({}).configured).toBe(false);
    expect(resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK }).problem).toBe('missing');
    expect(
      resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_ANON_KEY: 'your-anon-or-publishable-key' }).problem,
    ).toBe('missing');
    expect(
      resolveSupabaseConfig({
        VITE_SUPABASE_URL: URL_OK,
        VITE_SUPABASE_ANON_KEY: 'YOUR_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY',
      }).problem,
    ).toBe('missing');
    expect(
      resolveSupabaseConfig({
        VITE_SUPABASE_URL: URL_OK,
        VITE_SUPABASE_PUBLISHABLE_KEY: 'YOUR_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      }).problem,
    ).toBe('missing');
  });

  it('rejects non-https URLs', () => {
    expect(resolveSupabaseConfig({ VITE_SUPABASE_URL: 'ftp://x', VITE_SUPABASE_ANON_KEY: 'k' }).problem).toBe('invalid-url');
    expect(resolveSupabaseConfig({ VITE_SUPABASE_URL: 'ftp://x', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_k' }).problem).toBe('invalid-url');
  });

  it('refuses privileged keys in either VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY', () => {
    expect(
      resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_ANON_KEY: jwt({ role: 'service_role' }) }).problem,
    ).toBe('privileged-key');
    expect(
      resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_ANON_KEY: 'sb_secret_abc123' }).problem,
    ).toBe('privileged-key');
    expect(
      resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_PUBLISHABLE_KEY: jwt({ role: 'service_role' }) }).problem,
    ).toBe('privileged-key');
    expect(
      resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_abc123' }).problem,
    ).toBe('privileged-key');

    // Fails closed if EITHER variable contains a privileged key, even when the other holds a valid publishable key
    expect(
      resolveSupabaseConfig({
        VITE_SUPABASE_URL: URL_OK,
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_valid123',
        VITE_SUPABASE_ANON_KEY: 'sb_secret_leak456',
      }).problem,
    ).toBe('privileged-key');
    expect(
      resolveSupabaseConfig({
        VITE_SUPABASE_URL: URL_OK,
        VITE_SUPABASE_PUBLISHABLE_KEY: jwt({ role: 'service_role' }),
        VITE_SUPABASE_ANON_KEY: 'sb_publishable_valid123',
      }).problem,
    ).toBe('privileged-key');
  });

  it('accepts VITE_SUPABASE_PUBLISHABLE_KEY first and falls back to legacy VITE_SUPABASE_ANON_KEY', () => {
    // Legacy fallback when VITE_SUPABASE_PUBLISHABLE_KEY is absent or empty
    expect(resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_ANON_KEY: jwt({ role: 'anon' }) }).configured).toBe(true);
    expect(
      resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_ANON_KEY: 'sb_publishable_abc123' }).configured,
    ).toBe(true);
    expect(
      resolveSupabaseConfig({
        VITE_SUPABASE_URL: URL_OK,
        VITE_SUPABASE_PUBLISHABLE_KEY: '   ',
        VITE_SUPABASE_ANON_KEY: 'sb_publishable_fallback',
      }),
    ).toEqual({
      configured: true,
      url: URL_OK,
      anonKey: 'sb_publishable_fallback',
      problem: null,
    });

    // Primary VITE_SUPABASE_PUBLISHABLE_KEY acceptance and precedence when both are present
    expect(
      resolveSupabaseConfig({
        VITE_SUPABASE_URL: URL_OK,
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_new_primary',
      }),
    ).toEqual({
      configured: true,
      url: URL_OK,
      anonKey: 'sb_publishable_new_primary',
      problem: null,
    });
    expect(
      resolveSupabaseConfig({
        VITE_SUPABASE_URL: URL_OK,
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_new_primary',
        VITE_SUPABASE_ANON_KEY: jwt({ role: 'anon' }),
      }),
    ).toEqual({
      configured: true,
      url: URL_OK,
      anonKey: 'sb_publishable_new_primary',
      problem: null,
    });
  });
});

describe('migration safety & locality preservation', () => {
  const dir = join(import.meta.dirname, '..', 'supabase', 'migrations');
  const localityMigration = readFileSync(
    join(dir, '20261020000000_create_location_test_submissions.sql'),
    'utf8',
  );
  const quoteMigration = readFileSync(
    join(dir, '20261027000000_create_quote_requests.sql'),
    'utf8',
  );
  const localitySql = localityMigration.replace(/--.*$/gm, '').toLowerCase();
  const quoteSql = quoteMigration.replace(/--.*$/gm, '').toLowerCase();
  const allSql = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n')
    .replace(/--.*$/gm, '')
    .toLowerCase();

  it('keeps public.location_test_submissions columns (id, locality, created_at) unchanged', () => {
    expect(localitySql).toMatch(
      /create table if not exists public\.location_test_submissions\s*\(\s*id\s+uuid\s+primary key default gen_random_uuid\(\),\s*locality\s+text\s+not null[\s\S]*?created_at\s+timestamptz\s+not null default now\(\)\s*\)/
    );
    expect(quoteSql).not.toContain('location_test_submissions');
  });

  it('enables and forces RLS and grants anon only column-level insert on location_test_submissions', () => {
    expect(localitySql).toMatch(/alter table public\.location_test_submissions enable row level security/);
    expect(localitySql).toMatch(/alter table public\.location_test_submissions force row level security/);
    expect(localitySql).toMatch(/revoke all on table public\.location_test_submissions from public, anon, authenticated/);
    expect(localitySql).toMatch(/grant insert \(locality\) on table public\.location_test_submissions to anon/);
    expect(localitySql).toMatch(
      /create policy "anon can insert allowed localities"\s+on public\.location_test_submissions\s+for insert\s+to anon\s+with check \(private\.is_allowed_locality\(locality\)\)/
    );
  });

  it('preserves private.is_allowed_locality(text) and anon execute permission without redefining or dropping it in quote migration', () => {
    expect(localitySql).toContain('create or replace function private.is_allowed_locality(value text)');
    expect(localitySql).toContain('grant usage on schema private to anon, authenticated, service_role');
    expect(localitySql).toContain('grant execute on function private.is_allowed_locality(text) to anon, authenticated, service_role');

    expect(quoteSql).not.toMatch(/create[^;]*function\s+private\.is_allowed_locality/);
    expect(quoteSql).not.toMatch(/drop[^;]*function[^;]*private\.is_allowed_locality/);
    expect(quoteSql).not.toMatch(/revoke[^;]*private\.is_allowed_locality/);
    expect(quoteSql).toContain('check (private.is_allowed_locality(locality))');
  });

  it('never grants anon select/update/delete or creates non-insert policies', () => {
    expect(allSql).not.toMatch(/grant[^;]*\b(select|update|delete|all)\b[^;]*location_test_submissions[^;]*to[^;]*anon/);
    expect(allSql).not.toMatch(/for\s+(select|update|delete|all)/);
  });
});
