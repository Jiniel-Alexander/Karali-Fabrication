/**
 * Supabase client module (loaded lazily so the landing page renders and the
 * call / WhatsApp buttons work without downloading the client).
 */
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config.js';

let client = null;

/** @returns {import('@supabase/supabase-js').SupabaseClient | null} */
export function getSupabaseClient() {
  if (!supabaseConfig.configured) return null;
  client ??= createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      // Anonymous, write-only usage: no sessions, no token storage.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}
