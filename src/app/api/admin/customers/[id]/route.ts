import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await params;
    const admin = getAdminClient();

    const [profileRes, ordersRes, addressesRes] = await Promise.all([
      admin.from('profiles').select('*').eq('id', id).maybeSingle(),
      admin.from('orders').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(10),
      admin.from('addresses').select('*').eq('user_id', id),
    ]);

    if (!profileRes.data) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        customer: profileRes.data,
        orders: ordersRes.data || [],
        addresses: addressesRes.data || [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}
