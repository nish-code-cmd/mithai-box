/**
 * Supabase Browser Client
 * Use in Client Components (React hooks, event handlers, useEffect)
 * Uses the publishable key — safe to expose to browser
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

// Singleton for client components
let _client: ReturnType<typeof createClient> | null = null;

export function getClient() {
  if (!_client) {
    _client = createClient();
  }
  return _client;
}
