/**
 * Next.js 16 Proxy / Middleware entry point
 * Must export `proxy` function (not `middleware`)
 * Delegates session refresh to Supabase SSR middleware
 */
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets (images, icons)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|images|icons|uploads).*)',
  ],
};
