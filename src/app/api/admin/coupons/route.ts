import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET() {
  try {
    await requireAdminAuth();
    const admin = getAdminClient();
    const { data: coupons, error } = await admin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: coupons || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
    const body = await request.json();
    const { code, discount_type, type, discount_value, value, min_order_amount, minOrderAmount } = body;

    const couponCode = (code || '').toUpperCase().trim();
    if (!couponCode) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: coupon, error } = await admin
      .from('coupons')
      .insert({
        code: couponCode,
        discount_type: (discount_type || type || 'percent') === 'percentage' ? 'percent' : 'percent',
        discount_value: Number(discount_value || value || 10),
        min_order_amount: min_order_amount || minOrderAmount || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
