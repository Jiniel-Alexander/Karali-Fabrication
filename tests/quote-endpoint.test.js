import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  detectEnv,
  getAllowedOrigins,
  handleQuotePost,
  isValidPreviewHostname,
  onRequest,
  verifyTurnstileToken,
} from '../functions/api/quote.js';

function createMockRequest({
  method = 'POST',
  headers = {},
  body = null,
} = {}) {
  const headerMap = new Map();
  if (method === 'POST' && !Object.keys(headers).some((k) => k.toLowerCase() === 'content-type')) {
    headerMap.set('content-type', 'application/json');
  }
  for (const [k, v] of Object.entries(headers)) {
    headerMap.set(k.toLowerCase(), v);
  }

  const req = {
    method,
    headers: {
      get: (name) => headerMap.get(name.toLowerCase()) || null,
    },
    body: null,
  };

  if (body !== null) {
    const raw = typeof body === 'string' ? body : JSON.stringify(body);
    const encoder = new TextEncoder();
    const encoded = encoder.encode(raw);
    if (!headerMap.has('content-length')) {
      headerMap.set('content-length', String(encoded.byteLength));
    }

    let readDone = false;
    req.body = {
      getReader: () => ({
        read: async () => {
          if (readDone) return { done: true, value: undefined };
          readDone = true;
          return { done: false, value: encoded };
        },
        cancel: async () => {},
      }),
    };
  }

  return req;
}

const VALID_PAYLOAD = {
  full_name: 'Apex Structural Contractors',
  phone: '9876543210',
  service_slug: 'structural-steel-fabrication',
  locality: 'Powai',
  project_details: 'Fabrication of heavy warehouse portal frames, 35 tons total scope',
  drawings_status: 'yes',
  consent: true,
};

const PROD_ENV = Object.freeze({
  ENVIRONMENT: 'production',
  TURNSTILE_SECRET_KEY: 'test-only-turnstile-secret',
  SUPABASE_URL: 'https://test-project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-only-service-role-key',
});

const PREVIEW_ENV = Object.freeze({
  ENVIRONMENT: 'preview',
  PREVIEW_HOSTNAME: 'feature-coming-soon.karali-fabrication.pages.dev',
  TURNSTILE_SECRET_KEY: 'test-only-preview-turnstile-secret',
  SUPABASE_URL: 'https://test-preview-project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-only-preview-service-role-key',
});

const DEV_ENV = Object.freeze({
  ENVIRONMENT: 'development',
});

describe('Cloudflare Pages Quote Endpoint (`functions/api/quote.js`)', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = originalFetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('classifies environments strictly and resolves missing, invalid, or conflicting configs to unknown', () => {
    // Missing or unrelated env vars -> unknown
    expect(detectEnv(undefined)).toBe('unknown');
    expect(detectEnv(null)).toBe('unknown');
    expect(detectEnv({})).toBe('unknown');
    expect(detectEnv({ SUPABASE_URL: 'https://test.supabase.co' })).toBe('unknown');

    // Invalid ENVIRONMENT values -> unknown (even when a legacy boolean flag is set)
    expect(detectEnv({ ENVIRONMENT: '' })).toBe('unknown');
    expect(detectEnv({ ENVIRONMENT: 'staging' })).toBe('unknown');
    expect(detectEnv({ ENVIRONMENT: 'prod' })).toBe('unknown');
    expect(detectEnv({ ENVIRONMENT: 'local' })).toBe('unknown');
    expect(detectEnv({ ENVIRONMENT: 'staging', DEV: 'true' })).toBe('unknown');
    expect(detectEnv({ ENVIRONMENT: 'unknown', PRODUCTION: 'true' })).toBe('unknown');

    // Contradictory flags or ENVIRONMENT + mismatched flag -> unknown
    expect(detectEnv({ ENVIRONMENT: 'production', DEV: 'true' })).toBe('unknown');
    expect(detectEnv({ ENVIRONMENT: 'development', PRODUCTION: 'true' })).toBe('unknown');
    expect(detectEnv({ ENVIRONMENT: 'preview', TEST_MODE: 'true' })).toBe('unknown');
    expect(detectEnv({ PRODUCTION: 'true', DEV: 'true' })).toBe('unknown');
    expect(detectEnv({ PREVIEW: 'true', DEV: 'true' })).toBe('unknown');
    expect(detectEnv({ ENVIRONMENT: 'production', PRODUCTION: 'false' })).toBe('unknown');
    expect(detectEnv({ PRODUCTION: 'false' })).toBe('unknown');

    // Valid single-mode configurations & matching ENVIRONMENT + flag
    expect(detectEnv({ ENVIRONMENT: 'production' })).toBe('production');
    expect(detectEnv({ PRODUCTION: 'true' })).toBe('production');
    expect(detectEnv({ ENVIRONMENT: 'production', PRODUCTION: 'true' })).toBe('production');

    expect(detectEnv({ ENVIRONMENT: 'preview' })).toBe('preview');
    expect(detectEnv({ PREVIEW: 'true' })).toBe('preview');
    expect(detectEnv({ ENVIRONMENT: 'preview', PREVIEW: 'true' })).toBe('preview');

    expect(detectEnv({ ENVIRONMENT: 'development' })).toBe('development');
    expect(detectEnv({ DEV: 'true' })).toBe('development');
    expect(detectEnv({ ENVIRONMENT: 'development', DEV: 'true' })).toBe('development');

    expect(detectEnv({ ENVIRONMENT: 'test' })).toBe('test');
    expect(detectEnv({ TEST_MODE: 'true' })).toBe('test');
    expect(detectEnv({ ENVIRONMENT: 'test', TEST_MODE: 'true' })).toBe('test');

    expect(getAllowedOrigins({}).size).toBe(0);
  });

  it('validates PREVIEW_HOSTNAME strictly and rejects malformed values', () => {
    expect(isValidPreviewHostname('feature-coming-soon.karali-fabrication.pages.dev')).toBe(true);
    expect(isValidPreviewHostname('staging-preview.example.com')).toBe(true);

    // Rejects protocols, paths, ports, wildcards, spaces, production hostnames, localhost, bare pages.dev
    expect(isValidPreviewHostname('')).toBe(false);
    expect(isValidPreviewHostname('https://feature.pages.dev')).toBe(false);
    expect(isValidPreviewHostname('feature.pages.dev:8443')).toBe(false);
    expect(isValidPreviewHostname('feature.pages.dev/path')).toBe(false);
    expect(isValidPreviewHostname('*.pages.dev')).toBe(false);
    expect(isValidPreviewHostname('bad host.pages.dev')).toBe(false);
    expect(isValidPreviewHostname('karalifabrication.in')).toBe(false);
    expect(isValidPreviewHostname('www.karalifabrication.in')).toBe(false);
    expect(isValidPreviewHostname('localhost')).toBe(false);
    expect(isValidPreviewHostname('127.0.0.1')).toBe(false);
    expect(isValidPreviewHostname('pages.dev')).toBe(false);

    // Malformed PREVIEW_HOSTNAME causes detectEnv to fail closed ('unknown')
    expect(
      detectEnv({ ENVIRONMENT: 'preview', PREVIEW_HOSTNAME: 'https://bad-url.pages.dev' })
    ).toBe('unknown');
    expect(
      detectEnv({ ENVIRONMENT: 'preview', PREVIEW_HOSTNAME: 'karalifabrication.in' })
    ).toBe('unknown');
  });

  it('rejects requests when environment mode is unknown (403) before any mock or DB call', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const request = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'tok' }),
    });

    const res = await handleQuotePost({
      request,
      env: { SUPABASE_URL: 'https://test-project.supabase.co' },
    });

    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toMatch(/environment configuration/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('rejects unsupported HTTP methods with 405 and Allow header', async () => {
    const methods = ['GET', 'PUT', 'DELETE', 'PATCH'];
    for (const method of methods) {
      const request = createMockRequest({ method });
      const res = await onRequest({ request, env: DEV_ENV });
      expect(res.status).toBe(405);
      expect(res.headers.get('Allow')).toBe('POST');
      const json = await res.json();
      expect(json.ok).toBe(false);
      expect(json.error).toMatch(/Method Not Allowed/i);
    }
  });

  it('rejects non-JSON content types with 415', async () => {
    const badTypes = ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data'];
    for (const contentType of badTypes) {
      const request = createMockRequest({
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: JSON.stringify(VALID_PAYLOAD),
      });
      const res = await handleQuotePost({ request, env: DEV_ENV });
      expect(res.status).toBe(415);
      const json = await res.json();
      expect(json.error).toMatch(/Unsupported Media Type/i);
    }
  });

  it('enforces strict origin separation: development and test do NOT accept production origins', async () => {
    // 1. Production mode rejects localhost, preview, and untrusted origins
    for (const badOrigin of [
      'http://localhost:5173',
      'http://127.0.0.1:4173',
      'https://feature-coming-soon.karali-fabrication.pages.dev',
      'https://malicious-scam-site.com',
    ]) {
      const req = createMockRequest({
        method: 'POST',
        headers: { Origin: badOrigin },
        body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'tok' }),
      });
      const res = await handleQuotePost({ request: req, env: PROD_ENV });
      expect(res.status).toBe(403);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
    }

    // 2. Development and test modes reject production origins (https://karalifabrication.in & www)
    for (const env of [{ ENVIRONMENT: 'development' }, { ENVIRONMENT: 'test' }]) {
      expect(getAllowedOrigins(env).has('https://karalifabrication.in')).toBe(false);
      expect(getAllowedOrigins(env).has('https://www.karalifabrication.in')).toBe(false);

      for (const prodOrigin of ['https://karalifabrication.in', 'https://www.karalifabrication.in']) {
        const req = createMockRequest({
          method: 'POST',
          headers: { Origin: prodOrigin },
          body: JSON.stringify(VALID_PAYLOAD),
        });
        const res = await handleQuotePost({ request: req, env });
        expect(res.status).toBe(403);
        expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
        const json = await res.json();
        expect(json.error).toMatch(/unauthorized origin/i);
      }
    }

    // 3. Preview mode rejects production origins, localhost origins, and unconfigured preview origins
    for (const disallowedOrigin of [
      'https://karalifabrication.in',
      'https://www.karalifabrication.in',
      'http://localhost:5173',
      'https://other-branch.karali-fabrication.pages.dev',
    ]) {
      const req = createMockRequest({
        method: 'POST',
        headers: { Origin: disallowedOrigin },
        body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'tok' }),
      });
      const res = await handleQuotePost({ request: req, env: PREVIEW_ENV });
      expect(res.status).toBe(403);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull();
    }
  });

  it('allows approved production origins in production and local origins in development', async () => {
    for (const origin of ['https://karalifabrication.in', 'https://www.karalifabrication.in']) {
      const host = new URL(origin).hostname;
      globalThis.fetch = vi.fn(async (url) => {
        if (String(url).includes('turnstile')) {
          return {
            ok: true,
            json: async () => ({ success: true, hostname: host }),
          };
        }
        return { ok: true, status: 201, text: async () => '' };
      });

      const request = createMockRequest({
        method: 'POST',
        headers: { Origin: origin },
        body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'cf-token' }),
      });
      const res = await handleQuotePost({ request, env: PROD_ENV });
      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe(origin);
      const json = await res.json();
      expect(json).toEqual({ ok: true });
    }

    for (const origin of ['http://localhost:4173', 'http://127.0.0.1:4173']) {
      const request = createMockRequest({
        method: 'POST',
        headers: { Origin: origin },
        body: JSON.stringify(VALID_PAYLOAD),
      });
      const res = await handleQuotePost({ request, env: DEV_ENV });
      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe(origin);
      const json = await res.json();
      expect(json).toEqual({ ok: true, mock: true });
    }
  });

  it('requires exact match between Preview Origin hostname and Turnstile-verified hostname', async () => {
    // 1. Mismatch between valid preview Origin and Turnstile-verified hostname -> 403
    globalThis.fetch = vi.fn(async (url) => {
      if (String(url).includes('turnstile')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            hostname: 'different-preview.karali-fabrication.pages.dev',
          }),
        };
      }
      return { ok: true, status: 201, text: async () => '' };
    });

    const reqMismatch = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://feature-coming-soon.karali-fabrication.pages.dev' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'preview-tok' }),
    });
    const resMismatch = await handleQuotePost({
      request: reqMismatch,
      env: {
        ...PREVIEW_ENV,
        PREVIEW_HOSTNAME: undefined, // allow any *.pages.dev, but Origin and Turnstile hostnames must still match!
      },
    });
    expect(resMismatch.status).toBe(403);
    const jsonMismatch = await resMismatch.json();
    expect(jsonMismatch.error).toMatch(/preview hostname mismatch/i);

    // 2. Exact match between Preview Origin hostname and Turnstile-verified hostname -> 200
    globalThis.fetch = vi.fn(async (url) => {
      if (String(url).includes('turnstile')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            hostname: 'feature-coming-soon.karali-fabrication.pages.dev',
          }),
        };
      }
      return { ok: true, status: 201, text: async () => '' };
    });

    const reqMatch = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://feature-coming-soon.karali-fabrication.pages.dev' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'preview-tok' }),
    });
    const resMatch = await handleQuotePost({ request: reqMatch, env: PREVIEW_ENV });
    expect(resMatch.status).toBe(200);
    const jsonMatch = await resMatch.json();
    expect(jsonMatch).toEqual({ ok: true });
  });

  it('rejects oversized requests with 413 based on Content-Length and streaming limit', async () => {
    const reqHeader = createMockRequest({
      method: 'POST',
      headers: { 'Content-Length': '70000' },
      body: JSON.stringify(VALID_PAYLOAD),
    });
    const resHeader = await handleQuotePost({ request: reqHeader, env: DEV_ENV });
    expect(resHeader.status).toBe(413);

    const bigChunk = new Uint8Array(65 * 1024);
    let readDone = false;
    let readerCancelled = false;
    const reqStream = {
      method: 'POST',
      headers: {
        get: (h) => (h.toLowerCase() === 'content-type' ? 'application/json' : null),
      },
      body: {
        getReader: () => ({
          read: async () => {
            if (readDone) return { done: true, value: undefined };
            readDone = true;
            return { done: false, value: bigChunk };
          },
          cancel: async () => {
            readerCancelled = true;
          },
        }),
      },
    };

    const resStream = await handleQuotePost({ request: reqStream, env: DEV_ENV });
    expect(resStream.status).toBe(413);
    expect(readerCancelled).toBe(true);
  });

  it('rejects malformed JSON syntax with 400', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: '{ "full_name": "Broken JSON, missing brace',
    });
    const res = await handleQuotePost({ request, env: DEV_ENV });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Malformed JSON/i);
  });

  it('rejects filled honeypot submissions with 400 and never touches Turnstile or inserts into Supabase, while allowing empty honeypot to proceed', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    // 1. Filled website honeypot -> rejected with 400, ok: false, zero external/DB calls
    const spamPayload = { ...VALID_PAYLOAD, website: 'https://spambot.net', turnstile_token: 'tok' };
    const request = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify(spamPayload),
    });
    const res = await handleQuotePost({ request, env: PROD_ENV });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toMatch(/Spam submission rejected/i);
    expect(fetchSpy).not.toHaveBeenCalled();

    // 2. Filled hp_field honeypot -> rejected with 400, ok: false, zero external/DB calls
    const hpPayload = { ...VALID_PAYLOAD, hp_field: 'bot-value', turnstile_token: 'tok' };
    const reqHp = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify(hpPayload),
    });
    const resHp = await handleQuotePost({ request: reqHp, env: PROD_ENV });
    expect(resHp.status).toBe(400);
    const jsonHp = await resHp.json();
    expect(jsonHp.ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();

    // 3. Empty honeypot (website: '') + valid Turnstile token -> proceeds and inserts into Supabase
    const dbCalls = [];
    globalThis.fetch = vi.fn(async (url, init) => {
      if (String(url).includes('turnstile')) {
        return {
          ok: true,
          json: async () => ({ success: true, hostname: 'karalifabrication.in' }),
        };
      }
      dbCalls.push({ url: String(url), body: JSON.parse(init.body) });
      return { ok: true, status: 201, text: async () => '' };
    });

    const cleanRequest = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, website: '', turnstile_token: 'valid-tok' }),
    });
    const cleanRes = await handleQuotePost({ request: cleanRequest, env: PROD_ENV });
    expect(cleanRes.status).toBe(200);
    const cleanJson = await cleanRes.json();
    expect(cleanJson).toEqual({ ok: true });
    expect(dbCalls).toHaveLength(1);
    expect(dbCalls[0].url).toBe('https://test-project.supabase.co/rest/v1/quote_requests');
    expect(dbCalls[0].body.website).toBeUndefined();
  });

  it('validates required fields strictly on the server', async () => {
    const invalidCases = [
      { change: { full_name: 'A' }, err: /full name/i },
      { change: { full_name: 'A'.repeat(121) }, err: /2 to 120 characters/i },
      { change: { phone: '12345' }, err: /mobile|phone/i },
      { change: { phone: '5977591792' }, err: /mobile|phone/i },
      { change: { phone: '987654321' }, err: /mobile|phone/i },
      { change: { phone: '98765432100' }, err: /mobile|phone/i },
      { change: { phone: '+915876543210' }, err: /mobile|phone/i },
      { change: { service_slug: 'underwater-drilling' }, err: /service/i },
      { change: { locality: 'Delhi' }, err: /locality/i },
      { change: { project_details: 'A'.repeat(9) }, err: /10 and 2000 characters.*project scope/i },
      { change: { project_details: 'A'.repeat(2001) }, err: /10 and 2000 characters.*project scope/i },
      { change: { drawings_status: 'available' }, err: /drawings availability status/i },
      { change: { drawings_status: 'rough-sketch' }, err: /drawings availability status/i },
      { change: { drawings_status: 'need-assistance' }, err: /drawings availability status/i },
      { change: { drawings_status: 123 }, err: /drawings availability status/i },
      { change: { consent: false }, err: /consent/i },
    ];

    for (const { change, err } of invalidCases) {
      const request = createMockRequest({
        method: 'POST',
        body: JSON.stringify({ ...VALID_PAYLOAD, ...change }),
      });
      const res = await handleQuotePost({ request, env: DEV_ENV });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(err);
    }
  });

  it('accepts exact boundary lengths for full_name (2, 120), project_details (10, 2000), and valid phone formats', async () => {
    const validBoundaryPayloads = [
      { ...VALID_PAYLOAD, full_name: 'AB', project_details: 'A'.repeat(10), phone: '6000000000' },
      { ...VALID_PAYLOAD, full_name: 'A'.repeat(120), project_details: 'A'.repeat(2000), phone: '+91 98765-43210' },
    ];

    for (const payload of validBoundaryPayloads) {
      const request = createMockRequest({
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const res = await handleQuotePost({ request, env: DEV_ENV });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
    }
  });

  it('defaults missing, null, or empty drawings_status to none and accepts only yes, in_progress, and none', async () => {
    const insertedRecords = [];
    globalThis.fetch = vi.fn(async (url, init) => {
      if (String(url).includes('turnstile')) {
        return {
          ok: true,
          json: async () => ({ success: true, hostname: 'karalifabrication.in' }),
        };
      }
      insertedRecords.push(JSON.parse(init.body));
      return { ok: true, status: 201, text: async () => '' };
    });

    const defaultToNoneCases = [
      (() => {
        const copy = { ...VALID_PAYLOAD };
        delete copy.drawings_status;
        return copy;
      })(),
      { ...VALID_PAYLOAD, drawings_status: null },
      { ...VALID_PAYLOAD, drawings_status: '' },
      { ...VALID_PAYLOAD, drawings_status: '   ' },
    ];

    for (const payload of defaultToNoneCases) {
      const req = createMockRequest({
        method: 'POST',
        headers: { Origin: 'https://karalifabrication.in' },
        body: JSON.stringify({ ...payload, turnstile_token: 'tok' }),
      });
      const res = await handleQuotePost({ request: req, env: PROD_ENV });
      expect(res.status).toBe(200);
    }

    expect(insertedRecords).toHaveLength(4);
    for (const rec of insertedRecords) {
      expect(rec.drawings_status).toBe('none');
    }

    insertedRecords.length = 0;
    for (const allowed of ['yes', 'in_progress', 'none']) {
      const req = createMockRequest({
        method: 'POST',
        headers: { Origin: 'https://karalifabrication.in' },
        body: JSON.stringify({ ...VALID_PAYLOAD, drawings_status: allowed, turnstile_token: 'tok' }),
      });
      const res = await handleQuotePost({ request: req, env: PROD_ENV });
      expect(res.status).toBe(200);
    }
    expect(insertedRecords.map((r) => r.drawings_status)).toEqual(['yes', 'in_progress', 'none']);
  });

  it('enforces Turnstile secret, token, verification success, and hostname in production before any DB write', async () => {
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    // 1. Missing TURNSTILE_SECRET_KEY in production -> 403
    const reqNoSecret = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'tok' }),
    });
    const resNoSecret = await handleQuotePost({
      request: reqNoSecret,
      env: { ...PROD_ENV, TURNSTILE_SECRET_KEY: '' },
    });
    expect(resNoSecret.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();

    // 2. Missing turnstile_token in request -> 403
    const reqNoToken = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify(VALID_PAYLOAD),
    });
    const resNoToken = await handleQuotePost({ request: reqNoToken, env: PROD_ENV });
    expect(resNoToken.status).toBe(403);
    expect(fetchSpy).not.toHaveBeenCalled();

    // 3. Siteverify returns success: false -> 403, no Supabase call
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    });
    const reqInvalidToken = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'bad-token' }),
    });
    const resInvalidToken = await handleQuotePost({ request: reqInvalidToken, env: PROD_ENV });
    expect(resInvalidToken.status).toBe(403);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // 3b. Siteverify returns timeout-or-duplicate (expired or replayed token) -> 403, no Supabase call
    fetchSpy.mockClear();
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, 'error-codes': ['timeout-or-duplicate'] }),
    });
    const reqReplayedToken = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'replayed-token' }),
    });
    const resReplayedToken = await handleQuotePost({ request: reqReplayedToken, env: PROD_ENV });
    expect(resReplayedToken.status).toBe(403);
    const jsonReplayed = await resReplayedToken.json();
    expect(jsonReplayed.ok).toBe(false);
    expect(jsonReplayed.error).toMatch(/Human verification failed/i);
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // 4. Siteverify returns wrong hostname -> 403, no Supabase call
    fetchSpy.mockClear();
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, hostname: 'attacker-domain.com' }),
    });
    const reqBadHost = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'wrong-host-token' }),
    });
    const resBadHost = await handleQuotePost({ request: reqBadHost, env: PROD_ENV });
    expect(resBadHost.status).toBe(403);
    const jsonBadHost = await resBadHost.json();
    expect(jsonBadHost.error).toMatch(/hostname mismatch/i);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('inserts only the 7 validated columns with Prefer: return=minimal and never stores turnstile_token', async () => {
    const fetchCalls = [];
    globalThis.fetch = vi.fn(async (url, init) => {
      fetchCalls.push({ url: String(url), init });
      if (String(url).includes('turnstile')) {
        return {
          ok: true,
          json: async () => ({ success: true, hostname: 'www.karalifabrication.in' }),
        };
      }
      return { ok: true, status: 201, text: async () => '' };
    });

    const request = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://www.karalifabrication.in' },
      body: JSON.stringify({
        ...VALID_PAYLOAD,
        phone: '+919876543210',
        turnstile_token: 'ephemeral-turnstile-token',
      }),
    });

    const res = await handleQuotePost({ request, env: PROD_ENV });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ ok: true });
    expect(json.mock).toBeUndefined();

    expect(fetchCalls).toHaveLength(2);
    const dbCall = fetchCalls[1];
    expect(dbCall.url).toBe('https://test-project.supabase.co/rest/v1/quote_requests');
    expect(dbCall.init.method).toBe('POST');
    expect(dbCall.init.headers.Prefer).toBe('return=minimal');
    expect(dbCall.init.headers.apikey).toBe('test-only-service-role-key');
    expect(dbCall.init.headers.Authorization).toBe('Bearer test-only-service-role-key');

    const insertedBody = JSON.parse(dbCall.init.body);
    expect(insertedBody).toEqual({
      full_name: 'Apex Structural Contractors',
      phone: '9876543210',
      service_slug: 'structural-steel-fabrication',
      locality: 'Powai',
      project_details: 'Fabrication of heavy warehouse portal frames, 35 tons total scope',
      drawings_status: 'yes',
      consent: true,
    });
    expect(insertedBody.turnstile_token).toBeUndefined();
  });

  it('supports SUPABASE_SECRET_KEY (sb_secret_...) without Authorization: Bearer, prefers it over SUPABASE_SERVICE_ROLE_KEY, and rejects public keys on backend', async () => {
    const fetchCalls = [];
    globalThis.fetch = vi.fn(async (url, init) => {
      fetchCalls.push({ url: String(url), init });
      if (String(url).includes('turnstile')) {
        return {
          ok: true,
          json: async () => ({ success: true, hostname: 'karalifabrication.in' }),
        };
      }
      return { ok: true, status: 201, text: async () => '' };
    });

    // 1. SUPABASE_SECRET_KEY with sb_secret_... sends apikey ONLY (no Authorization header)
    const reqNewSecret = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'tok' }),
    });
    const resNewSecret = await handleQuotePost({
      request: reqNewSecret,
      env: {
        ENVIRONMENT: 'production',
        TURNSTILE_SECRET_KEY: 'test-only-turnstile-secret',
        SUPABASE_URL: 'https://test-project.supabase.co',
        SUPABASE_SECRET_KEY: 'sb_secret_test_only_opaque_key',
      },
    });
    expect(resNewSecret.status).toBe(200);
    expect(fetchCalls).toHaveLength(2);
    expect(fetchCalls[1].init.headers).toEqual({
      apikey: 'sb_secret_test_only_opaque_key',
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    });
    expect(fetchCalls[1].init.headers.Authorization).toBeUndefined();

    // 2. SUPABASE_SECRET_KEY takes precedence when both SUPABASE_SECRET_KEY and SUPABASE_SERVICE_ROLE_KEY are present
    fetchCalls.length = 0;
    const reqBothKeys = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'tok' }),
    });
    const resBothKeys = await handleQuotePost({
      request: reqBothKeys,
      env: {
        ...PROD_ENV,
        SUPABASE_SECRET_KEY: 'sb_secret_primary_key_wins',
        SUPABASE_SERVICE_ROLE_KEY: 'legacy-jwt-service-role-fallback',
      },
    });
    expect(resBothKeys.status).toBe(200);
    expect(fetchCalls[1].init.headers.apikey).toBe('sb_secret_primary_key_wins');
    expect(fetchCalls[1].init.headers.Authorization).toBeUndefined();

    // 3. Rejects public keys (sb_publishable_... and anon JWT) with 502 BEFORE any PostgREST call
    const anonJwt = `${btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${btoa(JSON.stringify({ role: 'anon' })).replace(/=+$/, '')}.sig`;
    for (const badEnv of [
      { ...PROD_ENV, SUPABASE_SECRET_KEY: 'sb_publishable_accidental_public_key', SUPABASE_SERVICE_ROLE_KEY: '' },
      { ...PROD_ENV, SUPABASE_SECRET_KEY: anonJwt, SUPABASE_SERVICE_ROLE_KEY: '' },
      { ...PROD_ENV, SUPABASE_SERVICE_ROLE_KEY: 'sb_publishable_accidental_public_key' },
      { ...PROD_ENV, SUPABASE_SERVICE_ROLE_KEY: anonJwt },
      { ...PROD_ENV, SUPABASE_SECRET_KEY: 'sb_secret_valid', SUPABASE_SERVICE_ROLE_KEY: 'sb_publishable_leak' },
    ]) {
      fetchCalls.length = 0;
      const reqBadKey = createMockRequest({
        method: 'POST',
        headers: { Origin: 'https://karalifabrication.in' },
        body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'tok' }),
      });
      const resBadKey = await handleQuotePost({ request: reqBadKey, env: badEnv });
      expect(resBadKey.status).toBe(502);
      const jsonBadKey = await resBadKey.json();
      expect(jsonBadKey.ok).toBe(false);
      expect(jsonBadKey.error).toMatch(/public Supabase key/i);
      // Only Turnstile was called; PostgREST was NEVER called
      expect(fetchCalls).toHaveLength(1);
      expect(fetchCalls[0].url).toContain('turnstile');
    }
  });

  it('never returns mock success in production or preview when Supabase credentials are missing or database writes fail', async () => {
    globalThis.fetch = vi.fn(async (url) => {
      if (String(url).includes('turnstile')) {
        return {
          ok: true,
          json: async () => ({ success: true, hostname: 'karalifabrication.in' }),
        };
      }
      return {
        ok: false,
        status: 500,
        text: async () => 'DB internal connection timeout',
      };
    });

    // 1. Missing SUPABASE_SERVICE_ROLE_KEY in production -> 502 (never mock success)
    const reqMissingProdDb = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'ok-token' }),
    });
    const resMissingProdDb = await handleQuotePost({
      request: reqMissingProdDb,
      env: { ...PROD_ENV, SUPABASE_SERVICE_ROLE_KEY: '' },
    });
    expect(resMissingProdDb.status).toBe(502);
    const jsonMissingProdDb = await resMissingProdDb.json();
    expect(jsonMissingProdDb.ok).toBe(false);
    expect(jsonMissingProdDb.mock).toBeUndefined();

    // 2. Missing SUPABASE_SERVICE_ROLE_KEY in preview -> 502 (never mock success)
    globalThis.fetch = vi.fn(async (url) => {
      if (String(url).includes('turnstile')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            hostname: 'feature-coming-soon.karali-fabrication.pages.dev',
          }),
        };
      }
      return { ok: true, status: 201, text: async () => '' };
    });
    const reqMissingPreviewDb = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://feature-coming-soon.karali-fabrication.pages.dev' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'ok-token' }),
    });
    const resMissingPreviewDb = await handleQuotePost({
      request: reqMissingPreviewDb,
      env: { ...PREVIEW_ENV, SUPABASE_SERVICE_ROLE_KEY: '' },
    });
    expect(resMissingPreviewDb.status).toBe(502);
    const jsonMissingPreviewDb = await resMissingPreviewDb.json();
    expect(jsonMissingPreviewDb.ok).toBe(false);
    expect(jsonMissingPreviewDb.mock).toBeUndefined();

    // 3. Database 500 failure -> 502 without leaking credentials or internal error text
    globalThis.fetch = vi.fn(async (url) => {
      if (String(url).includes('turnstile')) {
        return {
          ok: true,
          json: async () => ({ success: true, hostname: 'karalifabrication.in' }),
        };
      }
      return {
        ok: false,
        status: 500,
        text: async () => 'DB internal connection timeout',
      };
    });
    const reqDbFail = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'ok-token' }),
    });
    const resDbFail = await handleQuotePost({ request: reqDbFail, env: PROD_ENV });
    expect(resDbFail.status).toBe(502);
    const jsonDbFail = await resDbFail.json();
    expect(jsonDbFail.ok).toBe(false);
    expect(jsonDbFail.error).toContain('Unable to save request');
    expect(JSON.stringify(jsonDbFail)).not.toContain('test-only-service-role-key');
    expect(JSON.stringify(jsonDbFail)).not.toContain('DB internal connection timeout');
  });

  it('verifyTurnstileToken returns null on non-200 HTTP responses or network errors', async () => {
    globalThis.fetch = vi.fn().mockResolvedValueOnce({ ok: false, status: 500 });
    expect(await verifyTurnstileToken('tok', 'sec')).toBeNull();

    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error('network down'));
    expect(await verifyTurnstileToken('tok', 'sec')).toBeNull();
  });

  it('explicitly rejects invalid, expired, and replayed Turnstile tokens with HTTP 403', async () => {
    const fetchCalls = [];
    globalThis.fetch = vi.fn(async (url, init) => {
      fetchCalls.push({ url: String(url), init });
      if (String(url).includes('turnstile')) {
        const bodyStr = String(init?.body || '');
        if (bodyStr.includes('response=expired-tok') || bodyStr.includes('response=replayed-tok')) {
          return {
            ok: true,
            json: async () => ({
              success: false,
              'error-codes': ['timeout-or-duplicate'],
            }),
          };
        }
        if (bodyStr.includes('response=invalid-tok')) {
          return {
            ok: true,
            json: async () => ({
              success: false,
              'error-codes': ['invalid-input-response'],
            }),
          };
        }
      }
      return { ok: true, status: 201, text: async () => '' };
    });

    // 1. Expired token -> 403
    const reqExpired = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'expired-tok' }),
    });
    const resExpired = await handleQuotePost({ request: reqExpired, env: PROD_ENV });
    expect(resExpired.status).toBe(403);
    const jsonExpired = await resExpired.json();
    expect(jsonExpired.ok).toBe(false);
    expect(jsonExpired.error).toMatch(/Human verification failed/i);

    // 2. Replayed token -> 403
    const reqReplayed = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'replayed-tok' }),
    });
    const resReplayed = await handleQuotePost({ request: reqReplayed, env: PROD_ENV });
    expect(resReplayed.status).toBe(403);
    const jsonReplayed = await resReplayed.json();
    expect(jsonReplayed.ok).toBe(false);
    expect(jsonReplayed.error).toMatch(/Human verification failed/i);

    // 3. Invalid token -> 403
    const reqInvalid = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'invalid-tok' }),
    });
    const resInvalid = await handleQuotePost({ request: reqInvalid, env: PROD_ENV });
    expect(resInvalid.status).toBe(403);
    const jsonInvalid = await resInvalid.json();
    expect(jsonInvalid.ok).toBe(false);
    expect(jsonInvalid.error).toMatch(/Human verification failed/i);

    // 4. Missing token -> 403 (does not touch Siteverify)
    fetchCalls.length = 0;
    const reqMissing = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://karalifabrication.in' },
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: '' }),
    });
    const resMissing = await handleQuotePost({ request: reqMissing, env: PROD_ENV });
    expect(resMissing.status).toBe(403);
    const jsonMissing = await resMissing.json();
    expect(jsonMissing.ok).toBe(false);
    expect(jsonMissing.error).toMatch(/Human verification token missing/i);
    expect(fetchCalls).toHaveLength(0);
  });
});
