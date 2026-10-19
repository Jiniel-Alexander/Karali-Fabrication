/**
 * Frontend Supabase configuration.
 *
 * Only two PUBLIC values are read, both via Vite env vars:
 *   VITE_SUPABASE_URL       – project API endpoint
 *   VITE_SUPABASE_ANON_KEY  – anon (JWT) or publishable (sb_publishable_...) key
 *
 * As a safety net, a privileged key (service_role JWT or sb_secret_...) is
 * refused so it can never be used from the browser even if misconfigured.
 */

const PLACEHOLDER_PREFIX = 'your-';

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
  const anonKey = (env?.VITE_SUPABASE_ANON_KEY ?? '').trim();

  if (!url || !anonKey || anonKey.startsWith(PLACEHOLDER_PREFIX)) {
    return { configured: false, url: '', anonKey: '', problem: 'missing' };
  }
  if (!isValidHttpsUrl(url)) {
    return { configured: false, url: '', anonKey: '', problem: 'invalid-url' };
  }
  if (isPrivilegedKey(anonKey)) {
    return { configured: false, url: '', anonKey: '', problem: 'privileged-key' };
  }
  return { configured: true, url, anonKey, problem: null };
}

export const supabaseConfig = resolveSupabaseConfig(import.meta.env);

if (import.meta.env?.DEV && !supabaseConfig.configured) {
  const hints = {
    missing: 'Copy .env.example to .env.local and set VITE_SUPABASE_ANON_KEY.',
    'invalid-url': 'VITE_SUPABASE_URL is not a valid https URL.',
    'privileged-key': 'VITE_SUPABASE_ANON_KEY is a service_role/secret key. Use the public anon/publishable key ONLY.',
  };
  console.warn(`[supabase] Not configured: ${hints[supabaseConfig.problem]}`);
}
