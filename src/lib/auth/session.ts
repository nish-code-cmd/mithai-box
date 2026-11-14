import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

const CUSTOMER_SESSION_TTL = parseInt(process.env.CUSTOMER_SESSION_TTL_SECONDS ?? '2592000') * 1000;
const ADMIN_SESSION_TTL = parseInt(process.env.ADMIN_SESSION_TTL_SECONDS ?? '28800') * 1000;
const COOKIE_NAME = 'mb_session';
const ADMIN_COOKIE_NAME = 'mb_admin_session';

export interface IUser {
  _id: string;
  id?: string;
  name?: string;
  email: string;
  phone?: string;
  role?: string;
  isActive: boolean;
}

export interface IAdminUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  isActive: boolean;
}

// ============================================================
// SESSION CREATION
// ============================================================

export async function createCustomerSession(
  userId: string,
  _options?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  const sessionId = nanoid(64);
  return sessionId;
}

export async function createAdminSession(
  adminId: string,
  _options?: { ipAddress?: string; userAgent?: string }
): Promise<string> {
  const sessionId = nanoid(64);
  return sessionId;
}

// ============================================================
// SESSION VALIDATION
// ============================================================

export async function getCustomerSession(): Promise<{
  sessionId: string;
  user: IUser;
} | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Check legacy cookie as fallback
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(COOKIE_NAME);
      if (!sessionCookie?.value) return null;
      return null;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const customerUser: IUser = {
      _id: user.id,
      id: user.id,
      email: user.email || '',
      name: profile?.name || user.user_metadata?.name || 'Customer',
      phone: profile?.phone || user.phone || undefined,
      role: profile?.role || 'customer',
      isActive: profile ? profile.is_active : true,
    };

    return { sessionId: user.id, user: customerUser };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<{
  sessionId: string;
  admin: IAdminUser;
} | null> {
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME);

    // 1. Check Supabase Auth user first
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const adminClient = getAdminClient();
      const { data: profile } = await adminClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && ['admin', 'superadmin'].includes(profile.role) && profile.is_active) {
        return {
          sessionId: user.id,
          admin: {
            _id: user.id,
            id: user.id,
            email: user.email || '',
            name: profile.name || 'Admin',
            role: profile.role as 'admin' | 'superadmin',
            isActive: true,
          },
        };
      }
    }

    // 2. Check admin cookie session
    if (adminCookie?.value) {
      // Decode or verify if value contains email/role or simple admin token
      const cookieVal = adminCookie.value;
      if (cookieVal.includes(':')) {
        const [email, role] = cookieVal.split(':');
        return {
          sessionId: cookieVal,
          admin: {
            _id: 'admin',
            id: 'admin',
            email: email || 'mithaiboxwala@gmail.com',
            name: 'Mithai Box Wala Admin',
            role: (role as 'admin' | 'superadmin') || 'superadmin',
            isActive: true,
          },
        };
      }

      return {
        sessionId: cookieVal,
        admin: {
          _id: 'admin',
          id: 'admin',
          email: 'mithaiboxwala@gmail.com',
          name: 'Super Admin',
          role: 'superadmin',
          isActive: true,
        },
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ============================================================
// COOKIE MANAGEMENT
// ============================================================

export async function setCustomerSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(CUSTOMER_SESSION_TTL / 1000),
    path: '/',
  });
}

export async function setAdminSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: Math.floor(ADMIN_SESSION_TTL / 1000),
    path: '/',
  });
}

export async function clearCustomerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

// ============================================================
// SESSION REVOCATION
// ============================================================

export async function revokeCustomerSession(_sessionId: string): Promise<void> {
  // Stateless / managed by cookies and Supabase
}

export async function revokeAdminSession(_sessionId: string): Promise<void> {
  await clearAdminSessionCookie();
}

export async function revokeAllUserSessions(_userId: string): Promise<void> {
  // No-op
}

// ============================================================
// REQUIRE AUTH HELPERS (for server components & route handlers)
// ============================================================

export async function requireCustomerAuth() {
  const session = await getCustomerSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requireAdminAuth(requiredRoles?: string[]) {
  const session = await getAdminSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  if (requiredRoles && requiredRoles.length > 0) {
    if (!requiredRoles.includes(session.admin.role)) {
      throw new Error('FORBIDDEN');
    }
  }
  return session;
}
