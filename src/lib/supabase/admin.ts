/**
 * Supabase Admin Client — Service Role
 * NEVER use in client-side code or expose to browser
 * Use only in:
 *  - Server-side API routes
 *  - Admin-only actions
 *  - Scripts and migrations
 *
 * Bypasses RLS — has full DB access
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

let _adminClient: ReturnType<typeof createClient<Database>> | null = null;

export function getAdminClient() {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variables'
      );
    }

    _adminClient = createClient<Database>(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return _adminClient;
}
