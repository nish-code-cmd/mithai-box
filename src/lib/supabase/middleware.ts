/**
 * Supabase Middleware — Session Refresh
 * Keeps user session alive across navigations by updating the session cookie
 * This runs in the Next.js Edge runtime (src/middleware.ts)
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the user session — do NOT remove this line
  // It is required to keep the session alive & protect server routes
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /account/* routes — redirect to login if not authenticated
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/account') && !user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect /admin/* routes — check profile role
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!user) {
      const adminLoginUrl = new URL('/admin/login', request.url);
      adminLoginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  // Prevent logged-in users from hitting auth pages
  if (pathname === '/auth/login' && user) {
    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/account';
    return NextResponse.redirect(new URL(returnUrl, request.url));
  }

  return supabaseResponse;
}
