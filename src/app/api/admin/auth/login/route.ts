import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { AdminLoginSchema } from '@/lib/validation/schemas';
import { setAdminSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = AdminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed: ' + parsed.error.errors[0]?.message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const supabase = await createClient();
    const adminClient = getAdminClient();

    // 1. Try Supabase Auth password sign-in directly
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (!error && data?.user) {
      // Check role in profiles
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
      // Find or create real superadmin user in Supabase Auth
      const { data: usersData } = await adminClient.auth.admin.listUsers();
      let user = usersData?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);

      if (!user) {
        const createRes = await adminClient.auth.admin.createUser({
          email: normalizedEmail,
          password: bootstrapPass,
          email_confirm: true,
          user_metadata: { full_name: 'Ajay Packers Admin' },
        });
        user = createRes.data?.user;
      }

      if (user) {
        // Ensure profile exists with role: superadmin
        await adminClient.from('profiles').upsert(
          {
            id: user.id,
            email: normalizedEmail,
            name: 'Ajay Packers Admin',
            role: 'superadmin',
            is_active: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        await setAdminSessionCookie(`${normalizedEmail}:superadmin`);

        return NextResponse.json({
          success: true,
          admin: {
            id: user.id,
            name: 'Ajay Packers Super Admin',
            email: normalizedEmail,
            role: 'superadmin',
          },
        });
      }
    }

    return NextResponse.json(
      { error: 'Invalid admin credentials. Please check your email and password.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('[Admin Login] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
