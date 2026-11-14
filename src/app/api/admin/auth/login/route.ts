import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { AdminLoginSchema } from '@/lib/validation/schemas';
import { setAdminSessionCookie } from '@/lib/auth/session';
import { isTrustedMutation } from '@/lib/security/request';

export async function POST(request: NextRequest) {
  if (!isTrustedMutation(request)) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = AdminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed: ' + parsed.error.errors[0]?.message }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const supabase = await createClient();

    // 1. Try Supabase Auth password sign-in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (!error && data?.user) {
      // Check role in profiles
      const adminClient = getAdminClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('role, is_active, name')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile && ['admin', 'superadmin'].includes(profile.role) && profile.is_active) {
        await setAdminSessionCookie(`${normalizedEmail}:${profile.role}`);
        return NextResponse.json({
          success: true,
          admin: {
            id: data.user.id,
            name: profile.name || 'Admin',
            email: normalizedEmail,
            role: profile.role,
          },
        });
      }
    }

    // 2. Admin master credential fallback
    const bootstrapEmail = (process.env.ADMIN_BOOTSTRAP_EMAIL || 'mithaiboxwala@gmail.com').toLowerCase().trim();
    const bootstrapPass = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'MithaiAdmin2024!';

    if (normalizedEmail === bootstrapEmail && password === bootstrapPass) {
      // Ensure superadmin profile exists in database
      const adminClient = getAdminClient();
      await adminClient.from('profiles').upsert(
        {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Ajay Packers Admin',
          role: 'superadmin',
          is_active: true,
        },
        { onConflict: 'id' }
      );

      await setAdminSessionCookie(`${normalizedEmail}:superadmin`);

      return NextResponse.json({
        success: true,
        admin: {
          id: '00000000-0000-0000-0000-000000000001',
          name: 'Ajay Packers Super Admin',
          email: normalizedEmail,
          role: 'superadmin',
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid admin credentials. Please check your email and password.' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[Admin Login] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
