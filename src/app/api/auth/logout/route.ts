/**
 * Auth API — Logout
 * POST /api/auth/logout
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[Logout] Error:', err);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
