import { describe, expect, it, vi } from 'vitest';
import { handleQuotePost, onRequest } from '../functions/api/quote.js';

function createMockRequest({
  method = 'POST',
  headers = {},
  body = null,
} = {}) {
  const headerMap = new Map();
  // Default to application/json for POST if not specified
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

    // Mock ReadableStream reader
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

describe('Cloudflare Pages Quote Endpoint (`functions/api/quote.js`)', () => {
  it('rejects unsupported HTTP methods with 405 and Allow header', async () => {
    const methods = ['GET', 'PUT', 'DELETE', 'PATCH'];
    for (const method of methods) {
      const request = createMockRequest({ method });
      const res = await onRequest({ request, env: {} });
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
      const res = await handleQuotePost({ request, env: {} });
      expect(res.status).toBe(415);
      const json = await res.json();
      expect(json.error).toMatch(/Unsupported Media Type/i);
    }
  });

  it('rejects requests from untrusted origins with 403', async () => {
    const request = createMockRequest({
      method: 'POST',
      headers: { Origin: 'https://malicious-scam-site.com' },
      body: JSON.stringify(VALID_PAYLOAD),
    });
    const res = await handleQuotePost({ request, env: {} });
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toMatch(/unauthorized origin/i);
  });

  it('allows requests from approved production and local origins', async () => {
    const allowed = [
      'https://karalifabrication.in',
      'https://www.karalifabrication.in',
      'http://localhost:4173',
      'http://127.0.0.1:4173',
    ];
    for (const origin of allowed) {
      const request = createMockRequest({
        method: 'POST',
        headers: { Origin: origin },
        body: JSON.stringify(VALID_PAYLOAD),
      });
      const res = await handleQuotePost({ request, env: {} });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.ok).toBe(true);
    }
  });

  it('rejects oversized requests with 413 based on Content-Length header', async () => {
    const request = createMockRequest({
      method: 'POST',
      headers: { 'Content-Length': '70000' }, // > 64 KB
      body: JSON.stringify(VALID_PAYLOAD),
    });
    const res = await handleQuotePost({ request, env: {} });
    expect(res.status).toBe(413);
    const json = await res.json();
    expect(json.error).toMatch(/Payload Too Large/i);
  });

  it('enforces streaming body size limit when reading chunks', async () => {
    // Construct request with chunks exceeding 64 KB
    const bigChunk = new Uint8Array(65 * 1024);
    let readDone = false;
    let readerCancelled = false;
    const request = {
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

    const res = await handleQuotePost({ request, env: {} });
    expect(res.status).toBe(413);
    expect(readerCancelled).toBe(true);
  });

  it('rejects malformed JSON syntax with 400', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: '{ "full_name": "Broken JSON, missing brace',
    });
    const res = await handleQuotePost({ request, env: {} });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Malformed JSON/i);
  });

  it('silently drops honeypot spam with 200 OK without recording', async () => {
    const spamPayload = { ...VALID_PAYLOAD, website: 'https://spambot.net' };
    const request = createMockRequest({
      method: 'POST',
      body: JSON.stringify(spamPayload),
    });
    const res = await handleQuotePost({ request, env: {} });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.dropped).toBe(true);
  });

  it('validates required fields strictly on the server', async () => {
    const invalidCases = [
      { change: { full_name: 'A' }, err: /full name/i },
      { change: { phone: '12345' }, err: /mobile|phone/i },
      { change: { phone: '5977591792' }, err: /mobile|phone/i }, // doesn't start with 6-9
      { change: { service_slug: 'underwater-drilling' }, err: /service/i },
      { change: { locality: 'Delhi' }, err: /locality/i },
      { change: { project_details: 'Too short' }, err: /project scope/i },
      { change: { consent: false }, err: /consent/i },
    ];

    for (const { change, err } of invalidCases) {
      const request = createMockRequest({
        method: 'POST',
        body: JSON.stringify({ ...VALID_PAYLOAD, ...change }),
      });
      const res = await handleQuotePost({ request, env: {} });
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(err);
    }
  });

  it('normalizes +91 Indian phone numbers and accepts valid input', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: JSON.stringify({ ...VALID_PAYLOAD, phone: '+919876543210' }),
    });
    const res = await handleQuotePost({ request, env: {} });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it('handles database 502 failures safely without leaking credentials or stack traces', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'DB internal connection timeout',
    });

    const request = createMockRequest({
      method: 'POST',
      body: JSON.stringify(VALID_PAYLOAD),
    });

    const res = await handleQuotePost({
      request,
      env: {
        SUPABASE_URL: 'https://fake-project.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'secret-service-role-key-never-leaked',
      },
    });

    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toContain('Unable to save request');
    // Ensure no secret or DB error text leaked
    expect(JSON.stringify(json)).not.toContain('secret-service-role-key');
    expect(JSON.stringify(json)).not.toContain('DB internal connection timeout');

    globalThis.fetch = originalFetch;
  });

  it('verifies Cloudflare Turnstile token when TURNSTILE_SECRET_KEY is provisioned', async () => {
    const originalFetch = globalThis.fetch;

    // 1. Missing turnstile token -> 403
    const reqMissing = createMockRequest({
      method: 'POST',
      body: JSON.stringify(VALID_PAYLOAD),
    });
    const resMissing = await handleQuotePost({
      request: reqMissing,
      env: { TURNSTILE_SECRET_KEY: 'mock-secret' },
    });
    expect(resMissing.status).toBe(403);
    const jsonMissing = await resMissing.json();
    expect(jsonMissing.error).toMatch(/Human verification/i);

    // 2. Failed verification -> 403
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    });

    const reqFailed = createMockRequest({
      method: 'POST',
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'invalid-token' }),
    });
    const resFailed = await handleQuotePost({
      request: reqFailed,
      env: { TURNSTILE_SECRET_KEY: 'mock-secret' },
    });
    expect(resFailed.status).toBe(403);

    // 3. Successful verification -> 200
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const reqSuccess = createMockRequest({
      method: 'POST',
      body: JSON.stringify({ ...VALID_PAYLOAD, turnstile_token: 'valid-token' }),
    });
    const resSuccess = await handleQuotePost({
      request: reqSuccess,
      env: { TURNSTILE_SECRET_KEY: 'mock-secret' },
    });
    expect(resSuccess.status).toBe(200);

    globalThis.fetch = originalFetch;
  });
});
