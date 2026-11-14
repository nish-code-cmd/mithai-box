import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body.code?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: coupon, error } = await admin
      .from('coupons')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !coupon) {
      return NextResponse.json({ success: false, error: 'Invalid or inactive coupon code' }, { status: 400 });
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      return NextResponse.json({ success: false, error: 'This coupon has expired' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        minOrderAmount: coupon.min_order_amount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  return NextResponse.json({ success: true, message: 'Coupon removed' });
}
