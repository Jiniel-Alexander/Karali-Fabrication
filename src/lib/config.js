/**
 * Frontend Supabase configuration.
 *
 * Only PUBLIC values are read via Vite env vars:
 *   VITE_SUPABASE_URL             – project API endpoint
 *   VITE_SUPABASE_PUBLISHABLE_KEY – preferred public publishable key (sb_publishable_...)
 *   VITE_SUPABASE_ANON_KEY        – legacy fallback public key (anon JWT or sb_publishable_...)
 *
 * As a safety net, a privileged key (service_role JWT or sb_secret_...) in either
 * frontend key variable is refused so it can never be used from the browser even if misconfigured.
 */

const PLACEHOLDER_PATTERN = /^(your[-_]|<your|replace[-_]|placeholder)/i;

function isPlaceholder(value) {
  return PLACEHOLDER_PATTERN.test(value);
}

function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

export function isPrivilegedKey(key) {
  if (!key || typeof key !== 'string') return false;
  if (key.startsWith('sb_secret_')) return true;
  const payload = decodeJwtPayload(key);
  return payload?.role === 'service_role';
}

function isValidHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || (url.protocol === 'http:' && url.hostname === '127.0.0.1');
  } catch {
    return false;
  }
}

/**
 * @param {Record<string, string | undefined>} env
 * @returns {{configured: boolean, url: string, anonKey: string, problem: null | 'missing' | 'invalid-url' | 'privileged-key'}}
 */
export function resolveSupabaseConfig(env) {
  const url = (env?.VITE_SUPABASE_URL ?? '').trim();
  const publishableKey = (env?.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim();
  const legacyAnonKey = (env?.VITE_SUPABASE_ANON_KEY ?? '').trim();
  const anonKey = publishableKey || legacyAnonKey;

  if (isPrivilegedKey(publishableKey) || isPrivilegedKey(legacyAnonKey)) {
    return { configured: false, url: '', anonKey: '', problem: 'privileged-key' };
  }
  if (!url || !anonKey || isPlaceholder(anonKey)) {
    return { configured: false, url: '', anonKey: '', problem: 'missing' };
  }
  if (!isValidHttpsUrl(url)) {
    return { configured: false, url: '', anonKey: '', problem: 'invalid-url' };
  }
  return { configured: true, url, anonKey, problem: null };
}

export const supabaseConfig = resolveSupabaseConfig(import.meta.env);

if (import.meta.env?.DEV && !supabaseConfig.configured) {
  const hints = {
    missing:
      'Copy .env.example to .env.local and set VITE_SUPABASE_PUBLISHABLE_KEY (or legacy VITE_SUPABASE_ANON_KEY).',
    'invalid-url': 'VITE_SUPABASE_URL is not a valid https URL.',
    'privileged-key':
      'VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY is a service_role/secret key. Use the public publishable (sb_publishable_...) or anon key ONLY.',
  };
  console.warn(`[supabase] Not configured: ${hints[supabaseConfig.problem]}`);
}
