/**
 * lib/supabase.js
 * ─────────────────────────────────────────────────────────────
 * Single, reusable Supabase client for the entire application.
 *
 * Rules:
 *  - Import `supabase` from here — never call createClient() elsewhere.
 *  - All credentials come from environment variables only.
 *  - Auth is pre-configured with persistent sessions and auto token refresh.
 * ─────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';

// ─── Environment validation ───────────────────────────────────────────────────
const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[supabase] Missing environment variables.\n' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// ─── Client configuration ─────────────────────────────────────────────────────
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Persist session in localStorage so users stay logged in on refresh
    persistSession:    true,
    // Automatically refresh the JWT before it expires
    autoRefreshToken:  true,
    // Detect OAuth redirects automatically (needed for magic link / OAuth flows)
    detectSessionInUrl: true,
    // Use pkce flow for better security with OAuth providers
    flowType: 'pkce',
  },
  realtime: {
    // Reconnect automatically if the websocket drops
    reconnectAfterMs: (tries) => Math.min(tries * 1000, 30000),
  },
  global: {
    headers: {
      // Identify the app in Supabase logs
      'x-application-name': 'lifegift-network',
    },
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the currently authenticated user, or null if not signed in.
 * @returns {Promise<import('@supabase/supabase-js').User|null>}
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * Returns the current session, or null if not signed in.
 * @returns {Promise<import('@supabase/supabase-js').Session|null>}
 */
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
