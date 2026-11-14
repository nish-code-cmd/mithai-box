import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email?.toLowerCase().trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (body.website) {
      // Honeypot triggered
      return NextResponse.json({ success: true, message: 'Subscribed' }, { status: 200 });
    }

    const admin = getAdminClient();
    // Record newsletter in settings or enquiries
    await admin.from('wholesale_enquiries').insert({
      name: 'Newsletter Subscriber',
      email,
      message: 'Subscribed to storefront newsletter',
      status: 'new',
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for subscribing to Mithai Box Wala updates!',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
