/**
 * Cloudflare Pages Function: /api/quote
 *
 * Handles industrial quote requests serverlessly with multi-layer hardening:
 * 1. Strict HTTP Method & Content-Type enforcement (405 / 415)
 * 2. Fail-closed environment classification ('production' | 'preview' | 'development' | 'test' | 'unknown')
 * 3. Origin validation & per-request CORS headers (403 for untrusted origins)
 * 4. Enforced body size limits (max 64 KB streaming limit, 413)
 * 5. Safe JSON parsing with malformed syntax protection (400)
 * 6. Anti-spam honeypot (silent 200 drop)
 * 7. Authoritative server-side field validation (name, phone, service, locality, details, consent)
 * 8. Cloudflare Turnstile bot verification & exact hostname validation before any DB write
 * 9. Server-side Supabase write using SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) with Prefer: return=minimal
 * 10. Safe error handling with zero PII logging and no leaked credentials or stack traces
 */

const MAX_BODY_BYTES = 64 * 1024; // 64 KB hard limit
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TURNSTILE_TIMEOUT_MS = 8000;

const VALID_ENV_MODES = new Set(['production', 'preview', 'development', 'test']);

const LEGACY_FLAG_TO_MODE = Object.freeze({
  PRODUCTION: 'production',
  PREVIEW: 'preview',
  DEV: 'development',
  TEST_MODE: 'test',
});

const PROD_ORIGINS = new Set([
  'https://karalifabrication.in',
  'https://www.karalifabrication.in',
]);

const DEV_ORIGINS = new Set([
  'http://localhost:4173',
  'http://localhost:5173',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173',
]);

const ALLOWED_PROD_HOSTNAMES = new Set([
  'karalifabrication.in',
  'www.karalifabrication.in',
]);

// Strict RFC-1123 hostname validation (labels 1-63 chars, total <= 253, no protocol/port/path/slashes/spaces)
const HOSTNAME_REGEX =
  /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

const PAGES_DEV_HOSTNAME_REGEX =
  /^(?=.{1,253}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.pages\.dev$/;

const ALLOWED_SERVICES = new Set([
  'structural-steel-fabrication',
  'lift-shaft-steelwork-crash-decks',
  'industrial-sheds-mezzanines',
  'staircases-railings-gates',
  'custom-metal-fabrication',
  'roofing-sheets-cladding',
  'industrial-racking-storage',
  'unipole-structures-hoardings',
  'pergolas-gazebos',
  'commercial-rolling-shutters',
  'security-window-grills',
  'animal-farm-sheds',
]);

const ALLOWED_LOCALITIES = new Set([
  // Mumbai
  'Andheri East', 'Andheri West', 'Bandra East', 'Bandra West', 'Bhandup',
  'Borivali East', 'Borivali West', 'Byculla', 'Chembur', 'Colaba',
  'Dadar', 'Dahisar', 'Fort', 'Ghatkopar', 'Goregaon East',
  'Goregaon West', 'Jogeshwari', 'Kandivali East', 'Kandivali West', 'Kurla',
  'Lower Parel', 'Malad East', 'Malad West', 'Mulund', 'Parel',
  'Powai', 'Santacruz', 'Vikhroli', 'Vile Parle', 'Wadala', 'Worli',
  // Thane
  'Ambernath', 'Badlapur', 'Bhayandar East', 'Bhayandar West', 'Dombivli East',
  'Dombivli West', 'Kalwa', 'Kalyan East', 'Kalyan West', 'Mira Road',
  'Mumbra', 'Thane East', 'Thane West', 'Ulhasnagar',
  // Navi Mumbai
  'Airoli', 'Belapur', 'Ghansoli', 'Kamothe', 'Kharghar',
  'Koparkhairane', 'Nerul', 'Panvel', 'Sanpada', 'Seawoods',
  'Taloja', 'Vashi',
]);

const ALLOWED_DRAWING_STATUSES = new Set(['yes', 'in_progress', 'none']);

const PHONE_REGEX = /^(?:\+91)?[6-9]\d{9}$/;

const BASE_JSON_HEADERS = Object.freeze({
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
});

function decodeJwtPayload(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/**
 * Detects public/non-privileged Supabase API keys (`sb_publishable_...` or `anon`-role JWTs)
 * so they are refused if mistakenly supplied as a backend secret.
 *
 * @param {unknown} key
 * @returns {boolean}
 */
export function isPublicSupabaseKey(key) {
  if (typeof key !== 'string') return false;
  const trimmed = key.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('sb_publishable_')) return true;
  const payload = decodeJwtPayload(trimmed);
  return payload?.role === 'anon';
}

/**
 * Validates whether a candidate string is a well-formed, non-production hostname.
 * Rejects protocols, ports, paths, query strings, wildcards, IP literals, and production hostnames.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isValidPreviewHostname(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed !== trimmed.toLowerCase() && !HOSTNAME_REGEX.test(trimmed.toLowerCase())) {
    // We normalize to lowercase for check, but reject any whitespace or URL characters inside
  }
  const host = trimmed.toLowerCase();
  if (!HOSTNAME_REGEX.test(host)) return false;
  if (ALLOWED_PROD_HOSTNAMES.has(host)) return false;
  if (host === 'localhost' || host === '127.0.0.1' || host === 'pages.dev') return false;
  return true;
}

/**
 * Determines the running environment strictly from Cloudflare `context.env` bindings.
 *
 * Rules:
 * - Accepts only 'production', 'preview', 'development', and 'test'.
 * - If `env.ENVIRONMENT` is present, its trimmed lowercase value MUST be one of the 4 valid modes.
 * - If any boolean flag (`PRODUCTION`, `PREVIEW`, `DEV`, `TEST_MODE`) is present, its value MUST
 *   be `'true'` (or `true`), and its mapped mode MUST agree with `ENVIRONMENT` and any other flag.
 * - If the resolved mode is `'preview'` and `PREVIEW_HOSTNAME` is provided, `PREVIEW_HOSTNAME`
 *   must be a valid hostname; malformed values resolve the environment to `'unknown'`.
 * - Missing, invalid, or contradictory configuration always resolves to `'unknown'`.
 *
 * @param {Record<string, any> | undefined} env
 * @returns {'production' | 'preview' | 'development' | 'test' | 'unknown'}
 */
export function detectEnv(env) {
  if (!env || typeof env !== 'object') {
    return 'unknown';
  }

  const resolvedModes = new Set();

  if (env.ENVIRONMENT !== undefined) {
    if (typeof env.ENVIRONMENT !== 'string') {
      return 'unknown';
    }
    const normalized = env.ENVIRONMENT.trim().toLowerCase();
    if (!VALID_ENV_MODES.has(normalized)) {
      return 'unknown';
    }
    resolvedModes.add(normalized);
  }

  for (const [flagKey, targetMode] of Object.entries(LEGACY_FLAG_TO_MODE)) {
    if (env[flagKey] !== undefined) {
      if (env[flagKey] !== 'true' && env[flagKey] !== true) {
        return 'unknown';
      }
      resolvedModes.add(targetMode);
    }
  }

  if (resolvedModes.size !== 1) {
    return 'unknown';
  }

  const mode = [...resolvedModes][0];

  if (mode === 'preview' && env.PREVIEW_HOSTNAME !== undefined) {
    if (!isValidPreviewHostname(env.PREVIEW_HOSTNAME)) {
      return 'unknown';
    }
  }

  return mode;
}

/**
 * Validates whether a hostname is an allowed Cloudflare Pages preview hostname.
 *
 * @param {string} hostname
 * @param {Record<string, any> | undefined} env
 * @returns {boolean}
 */
function isAllowedPreviewHostname(hostname, env) {
  if (!isValidPreviewHostname(hostname)) return false;
  const cleanHost = hostname.trim().toLowerCase();

  if (env?.PREVIEW_HOSTNAME !== undefined) {
    if (!isValidPreviewHostname(env.PREVIEW_HOSTNAME)) return false;
    return cleanHost === env.PREVIEW_HOSTNAME.trim().toLowerCase();
  }

  return PAGES_DEV_HOSTNAME_REGEX.test(cleanHost);
}

/**
 * Returns the set of allowed Origin header values for the resolved environment mode.
 *
 * - Production: only https://karalifabrication.in and https://www.karalifabrication.in
 * - Preview: only https://<PREVIEW_HOSTNAME> (when PREVIEW_HOSTNAME is configured and valid)
 * - Development / Test: only localhost and 127.0.0.1 dev origins (never production origins)
 * - Unknown: empty set
 *
 * @param {Record<string, any> | undefined} env
 * @returns {Set<string>}
 */
export function getAllowedOrigins(env) {
  const mode = detectEnv(env);
  if (mode === 'production') {
    return new Set(PROD_ORIGINS);
  }
  if (mode === 'preview') {
    if (env?.PREVIEW_HOSTNAME !== undefined && isValidPreviewHostname(env.PREVIEW_HOSTNAME)) {
      return new Set([`https://${env.PREVIEW_HOSTNAME.trim().toLowerCase()}`]);
    }
    return new Set();
  }
  if (mode === 'development' || mode === 'test') {
    return new Set(DEV_ORIGINS);
  }
  return new Set();
}

/**
 * Extracts and validates the Origin header for the current environment.
 * Returns the canonical origin and hostname when allowed, or null when rejected.
 *
 * @param {string | null} originHeader
 * @param {Record<string, any> | undefined} env
 * @returns {{ origin: string, hostname: string } | null}
 */
function resolveValidatedOrigin(originHeader, env) {
  if (!originHeader || typeof originHeader !== 'string') return null;
  const trimmedOrigin = originHeader.trim();

  let parsed;
  try {
    parsed = new URL(trimmedOrigin);
  } catch {
    return null;
  }

  // Ensure Origin has no path/query/hash beyond root
  if (parsed.origin !== trimmedOrigin) {
    return null;
  }

  const mode = detectEnv(env);
  if (mode === 'preview') {
    if (parsed.protocol !== 'https:' || parsed.port !== '') return null;
    if (!isAllowedPreviewHostname(parsed.hostname, env)) return null;
    return { origin: parsed.origin, hostname: parsed.hostname.toLowerCase() };
  }

  const allowedOrigins = getAllowedOrigins(env);
  if (!allowedOrigins.has(trimmedOrigin)) {
    return null;
  }

  return { origin: trimmedOrigin, hostname: parsed.hostname.toLowerCase() };
}

/**
 * Safely streams the request body enforcing a hard byte limit.
 *
 * @param {Request} request
 * @param {number} maxBytes
 * @returns {Promise<string>}
 */
async function readBodyWithLimit(request, maxBytes) {
  if (!request.body) return '';
  const reader = request.body.getReader();
  let bytesRead = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytesRead += value.byteLength;
    if (bytesRead > maxBytes) {
      await reader.cancel();
      const err = new Error('PAYLOAD_TOO_LARGE');
      err.code = 'PAYLOAD_TOO_LARGE';
      throw err;
    }
    chunks.push(value);
  }
  const allChunks = new Uint8Array(bytesRead);
  let offset = 0;
  for (const chunk of chunks) {
    allChunks.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(allChunks);
}

/**
 * Verifies a Cloudflare Turnstile token against Siteverify.
 * Returns the parsed JSON outcome object on HTTP 200, or null on any error/timeout.
 * Never logs the secret key or token.
 *
 * @param {string} token
 * @param {string} secretKey
 * @param {string} [remoteIp]
 * @returns {Promise<Record<string, any> | null>}
 */
export async function verifyTurnstileToken(token, secretKey, remoteIp) {
  if (typeof token !== 'string' || !token.trim() || typeof secretKey !== 'string' || !secretKey.trim()) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TURNSTILE_TIMEOUT_MS);

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token.trim());
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });

    if (!res.ok) return null;
    const outcome = await res.json();
    if (!outcome || typeof outcome !== 'object' || Array.isArray(outcome)) {
      return null;
    }
    return outcome;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Main quote request handler.
 */
export async function handleQuotePost(context) {
  const { request, env } = context;
  const responseHeaders = { ...BASE_JSON_HEADERS };

  // 1. Enforce POST method
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...responseHeaders, Allow: 'POST' },
    });
  }

  // 2. Enforce JSON Content-Type
  const contentType = (request.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    return new Response(JSON.stringify({ ok: false, error: 'Unsupported Media Type: application/json required' }), {
      status: 415,
      headers: responseHeaders,
    });
  }

  // 3. Explicit fail-closed environment detection
  const envMode = detectEnv(env);
  if (envMode === 'unknown') {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden: environment configuration missing or invalid' }), {
      status: 403,
      headers: responseHeaders,
    });
  }

  // 4. Origin validation (set CORS header only after origin validation succeeds)
  const originHeader = request.headers.get('Origin');
  if ((envMode === 'production' || envMode === 'preview') && !originHeader) {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden: missing Origin header' }), {
      status: 403,
      headers: responseHeaders,
    });
  }

  let validatedOrigin = null;
  if (originHeader) {
    validatedOrigin = resolveValidatedOrigin(originHeader, env);
    if (!validatedOrigin) {
      return new Response(JSON.stringify({ ok: false, error: 'Forbidden: unauthorized origin' }), {
        status: 403,
        headers: responseHeaders,
      });
    }
    responseHeaders['Access-Control-Allow-Origin'] = validatedOrigin.origin;
    responseHeaders['Vary'] = 'Origin';
  }

  // 5. Fail closed in production or preview if Turnstile secret is missing
  const turnstileSecret = typeof env?.TURNSTILE_SECRET_KEY === 'string' ? env.TURNSTILE_SECRET_KEY.trim() : '';
  if ((envMode === 'production' || envMode === 'preview') && !turnstileSecret) {
    return new Response(JSON.stringify({ ok: false, error: 'Forbidden: Turnstile secret missing in production' }), {
      status: 403,
      headers: responseHeaders,
    });
  }

  // 6. Payload size pre-check
  const contentLengthHeader = parseInt(request.headers.get('content-length') || '0', 10);
  if (contentLengthHeader > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ ok: false, error: 'Payload Too Large: maximum allowed size is 64 KB' }), {
      status: 413,
      headers: responseHeaders,
    });
  }

  // 7. Read body with streaming limit
  let rawBody = '';
  try {
    rawBody = await readBodyWithLimit(request, MAX_BODY_BYTES);
  } catch (err) {
    if (err?.code === 'PAYLOAD_TOO_LARGE') {
      return new Response(JSON.stringify({ ok: false, error: 'Payload Too Large: maximum allowed size is 64 KB' }), {
        status: 413,
        headers: responseHeaders,
      });
    }
    return new Response(JSON.stringify({ ok: false, error: 'Error reading request body.' }), {
      status: 400,
      headers: responseHeaders,
    });
  }

  // 8. Safe JSON parse
  let data;
  try {
    data = JSON.parse(rawBody);
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Malformed JSON payload.' }), {
      status: 400,
      headers: responseHeaders,
    });
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid JSON payload structure.' }), {
      status: 400,
      headers: responseHeaders,
    });
  }

  // 9. Honeypot check (silent drop before external calls)
  if (data.website || data.hp_field) {
    return new Response(JSON.stringify({ ok: true, dropped: true }), {
      status: 200,
      headers: responseHeaders,
    });
  }

  // 10. Authoritative server-side field validation
  const fullName = typeof data.full_name === 'string' ? data.full_name.trim() : '';
  const phoneRaw = typeof data.phone === 'string' ? data.phone.trim().replace(/[\s\-()]/g, '') : '';
  const serviceSlug = typeof data.service_slug === 'string' ? data.service_slug.trim() : '';
  const locality = typeof data.locality === 'string' ? data.locality.trim() : '';
  const projectDetails = typeof data.project_details === 'string' ? data.project_details.trim() : '';
  const rawDrawingsStatus = data.drawings_status;
  let drawingsStatus = 'none';
  let hasValidDrawingsStatus = true;
  if (
    rawDrawingsStatus === undefined ||
    rawDrawingsStatus === null ||
    (typeof rawDrawingsStatus === 'string' && rawDrawingsStatus.trim() === '')
  ) {
    drawingsStatus = 'none';
  } else if (typeof rawDrawingsStatus === 'string' && ALLOWED_DRAWING_STATUSES.has(rawDrawingsStatus.trim())) {
    drawingsStatus = rawDrawingsStatus.trim();
  } else {
    hasValidDrawingsStatus = false;
  }
  const consent = data.consent === true || data.consent === 'true';

  if (fullName.length < 2 || fullName.length > 120) {
    return new Response(JSON.stringify({ ok: false, error: 'Please enter a valid full name or company name (2 to 120 characters).' }), {
      status: 400,
      headers: responseHeaders,
    });
  }

  const standardPhone = phoneRaw.startsWith('+91') ? phoneRaw.slice(3) : phoneRaw;
  if (!PHONE_REGEX.test(phoneRaw) || !/^[6-9]\d{9}$/.test(standardPhone)) {
    return new Response(JSON.stringify({ ok: false, error: 'Please provide a valid 10-digit Indian mobile number (starting with 6-9).' }), {
      status: 400,
      headers: responseHeaders,
    });
  }

  if (!ALLOWED_SERVICES.has(serviceSlug)) {
    return new Response(JSON.stringify({ ok: false, error: 'Please select an approved fabrication service.' }), {
      status: 400,
      headers: responseHeaders,
    });
  }

  if (!ALLOWED_LOCALITIES.has(locality)) {
    return new Response(JSON.stringify({ ok: false, error: 'Please select an approved Mumbai, Thane, or Navi Mumbai locality.' }), {
      status: 400,
      headers: responseHeaders,
    });
  }

  if (projectDetails.length < 10 || projectDetails.length > 2000) {
    return new Response(JSON.stringify({ ok: false, error: 'Please provide between 10 and 2000 characters describing project scope.' }), {
      status: 400,
      headers: responseHeaders,
    });
  }

  if (!hasValidDrawingsStatus) {
    return new Response(JSON.stringify({ ok: false, error: 'Please select a valid drawings availability status (yes, in_progress, or none).' }), {
      status: 400,
      headers: responseHeaders,
    });
  }

  if (!consent) {
    return new Response(JSON.stringify({ ok: false, error: 'Explicit consent is required to submit a quotation request.' }), {
      status: 400,
      headers: responseHeaders,
    });
  }

  // 11. Cloudflare Turnstile verification (always required in production & preview, or whenever TURNSTILE_SECRET_KEY is set)
  if (envMode === 'production' || envMode === 'preview' || turnstileSecret) {
    const rawToken = data.turnstile_token || data['cf-turnstile-response'];
    const turnstileToken = typeof rawToken === 'string' ? rawToken.trim() : '';
    if (!turnstileToken) {
      return new Response(JSON.stringify({ ok: false, error: 'Human verification token missing.' }), {
        status: 403,
        headers: responseHeaders,
      });
    }

    const clientIp = request.headers.get('CF-Connecting-IP') || undefined;
    const outcome = await verifyTurnstileToken(turnstileToken, turnstileSecret, clientIp);
    if (!outcome || outcome.success !== true) {
      return new Response(JSON.stringify({ ok: false, error: 'Human verification failed. Please refresh and try again.' }), {
        status: 403,
        headers: responseHeaders,
      });
    }

    const verifiedHost = typeof outcome.hostname === 'string' ? outcome.hostname.trim().toLowerCase() : '';
    if (envMode === 'production') {
      if (!ALLOWED_PROD_HOSTNAMES.has(verifiedHost) || verifiedHost !== validatedOrigin?.hostname) {
        return new Response(JSON.stringify({ ok: false, error: 'Forbidden: Turnstile hostname mismatch.' }), {
          status: 403,
          headers: responseHeaders,
        });
      }
    }
    if (envMode === 'preview') {
      // Preview Origin hostname and Turnstile-verified hostname must match each other AND be an allowed preview hostname
      if (
        !isAllowedPreviewHostname(verifiedHost, env) ||
        !validatedOrigin ||
        verifiedHost !== validatedOrigin.hostname
      ) {
        return new Response(JSON.stringify({ ok: false, error: 'Forbidden: Turnstile preview hostname mismatch.' }), {
          status: 403,
          headers: responseHeaders,
        });
      }
    }
  }

  // 12. Supabase write (using server-only SUPABASE_SECRET_KEY with fallback to SUPABASE_SERVICE_ROLE_KEY)
  const supabaseUrl = typeof env?.SUPABASE_URL === 'string' ? env.SUPABASE_URL.trim() : '';
  const newSecretKey = typeof env?.SUPABASE_SECRET_KEY === 'string' ? env.SUPABASE_SECRET_KEY.trim() : '';
  const legacyServiceRoleKey =
    typeof env?.SUPABASE_SERVICE_ROLE_KEY === 'string' ? env.SUPABASE_SERVICE_ROLE_KEY.trim() : '';
  const supabaseServiceKey = newSecretKey || legacyServiceRoleKey;

  if (isPublicSupabaseKey(newSecretKey) || isPublicSupabaseKey(legacyServiceRoleKey)) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Configuration error: public Supabase key cannot be used as backend secret.' }),
      {
        status: 502,
        headers: responseHeaders,
      }
    );
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    if (envMode === 'production' || envMode === 'preview') {
      return new Response(JSON.stringify({ ok: false, error: 'Configuration error: Supabase endpoint unavailable.' }), {
        status: 502,
        headers: responseHeaders,
      });
    }
    // Controlled mock response ONLY in explicitly configured local development or test mode
    return new Response(JSON.stringify({ ok: true, mock: true }), {
      status: 200,
      headers: responseHeaders,
    });
  }

  const dbHeaders = {
    apikey: supabaseServiceKey,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };
  // New opaque sb_secret_ keys belong strictly in apikey; legacy service_role JWTs also require Authorization: Bearer
  if (!supabaseServiceKey.startsWith('sb_secret_')) {
    dbHeaders.Authorization = `Bearer ${supabaseServiceKey}`;
  }

  try {
    const res = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/quote_requests`, {
      method: 'POST',
      headers: dbHeaders,
      body: JSON.stringify({
        full_name: fullName,
        phone: standardPhone,
        service_slug: serviceSlug,
        locality,
        project_details: projectDetails,
        drawings_status: drawingsStatus,
        consent: true,
      }),
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false, error: 'Unable to save request. Please contact us directly by phone or WhatsApp.' }), {
        status: 502,
        headers: responseHeaders,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: responseHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Database service unreachable. Please call +91 79775 91792 or use WhatsApp.' }), {
      status: 500,
      headers: responseHeaders,
    });
  }
}

export async function onRequestPost(context) {
  return handleQuotePost(context);
}

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...BASE_JSON_HEADERS, Allow: 'POST' },
    });
  }
  return handleQuotePost(context);
}
