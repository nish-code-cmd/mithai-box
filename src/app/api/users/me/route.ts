import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: profile?.name || null,
        phone: profile?.phone || null,
        company: profile?.company || null,
        gstin: profile?.gstin || null,
        role: profile?.role || 'customer',
        createdAt: profile?.created_at || user.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, company, gstin } = body;

    const admin = getAdminClient();
    const { data: updated, error: updateErr } = await admin
      .from('profiles')
      .upsert({
        id: user.id,
        name: name || null,
        phone: phone || null,
        company: company || null,
        gstin: gstin || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
