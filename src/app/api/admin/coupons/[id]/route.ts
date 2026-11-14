import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdminAuth } from '@/lib/auth/session';

type Params = { params: Promise<{ id: string }> };

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdminAuth();
    const { id } = await params;
    const body = await request.json();

    const admin = getAdminClient();
    const { data: coupon, error } = await admin
      .from('coupons')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error || !coupon) {
      return NextResponse.json({ success: false, error: 'Coupon not found or update failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: coupon });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Params
) {
  try {
    await requireAdminAuth();
    const { id } = await params;
    const admin = getAdminClient();

    const { error } = await admin
      .from('coupons')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Coupon deactivated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}
