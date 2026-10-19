import { isAllowedLocality } from '../data/localities.js';

export const SUBMISSIONS_TABLE = 'location_test_submissions';

/**
 * Inserts a locality. Sends ONLY `locality` (id/created_at are DB defaults) and
 * does not request returned rows (anon has no SELECT grant).
 *
 * Never throws; never returns raw DB errors to the caller-facing UI.
 *
 * @param {{client: any, locality: string, timeoutMs?: number}} args
 * @returns {Promise<{ok: true} | {ok: false, reason: 'invalid' | 'unavailable' | 'timeout' | 'failed'}>}
 */
export async function submitLocality({ client, locality, timeoutMs = 15000 }) {
  if (!isAllowedLocality(locality)) return { ok: false, reason: 'invalid' };
  if (!client) return { ok: false, reason: 'unavailable' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const { error } = await client
      .from(SUBMISSIONS_TABLE)
      .insert({ locality })
      .abortSignal(controller.signal);

    if (error) {
      if (controller.signal.aborted) return { ok: false, reason: 'timeout' };
      if (import.meta.env?.DEV) console.error('[supabase] insert failed:', error);
      return { ok: false, reason: 'failed' };
    }
    return { ok: true };
  } catch (err) {
    if (controller.signal.aborted) return { ok: false, reason: 'timeout' };
    if (import.meta.env?.DEV) console.error('[supabase] insert threw:', err);
    return { ok: false, reason: 'failed' };
  } finally {
    clearTimeout(timer);
  }
}
