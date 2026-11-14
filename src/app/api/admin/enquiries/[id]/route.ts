import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdminAuth } from '@/lib/auth/session';

type Params = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdminAuth();
    const { id } = await params;
    const admin = getAdminClient();

    const { data: enquiry, error } = await admin
      .from('wholesale_enquiries')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !enquiry) {
      return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: enquiry });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdminAuth();
    const { id } = await params;
    const body = await request.json();

    const admin = getAdminClient();
    const { data: enquiry, error } = await admin
      .from('wholesale_enquiries')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error || !enquiry) {
      return NextResponse.json({ success: false, error: 'Enquiry not found or update failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: enquiry });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}
