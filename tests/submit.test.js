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
  });

  it('rejects non-https URLs', () => {
    expect(resolveSupabaseConfig({ VITE_SUPABASE_URL: 'ftp://x', VITE_SUPABASE_ANON_KEY: 'k' }).problem).toBe('invalid-url');
  });

  it('refuses privileged keys', () => {
    expect(
      resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_ANON_KEY: jwt({ role: 'service_role' }) }).problem,
    ).toBe('privileged-key');
    expect(
      resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_ANON_KEY: 'sb_secret_abc123' }).problem,
    ).toBe('privileged-key');
  });

  it('accepts anon JWT and publishable keys', () => {
    expect(resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_ANON_KEY: jwt({ role: 'anon' }) }).configured).toBe(true);
    expect(
      resolveSupabaseConfig({ VITE_SUPABASE_URL: URL_OK, VITE_SUPABASE_ANON_KEY: 'sb_publishable_abc123' }).configured,
    ).toBe(true);
  });
});

describe('migration safety', () => {
  const dir = join(import.meta.dirname, '..', 'supabase', 'migrations');
  const sql = readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n')
    .replace(/--.*$/gm, '')
    .toLowerCase();

  it('enables and forces RLS and grants anon only column-level insert', () => {
    expect(sql).toMatch(/alter table public\.location_test_submissions enable row level security/);
    expect(sql).toMatch(/alter table public\.location_test_submissions force row level security/);
    expect(sql).toMatch(/revoke all on table public\.location_test_submissions from public, anon, authenticated/);
    expect(sql).toMatch(/grant insert \(locality\) on table public\.location_test_submissions to anon/);
  });

  it('never grants anon select/update/delete or creates non-insert policies', () => {
    expect(sql).not.toMatch(/grant[^;]*\b(select|update|delete|all)\b[^;]*location_test_submissions[^;]*to[^;]*anon/);
    expect(sql).not.toMatch(/for\s+(select|update|delete|all)/);
  });
});
