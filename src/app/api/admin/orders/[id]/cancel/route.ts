import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdminAuth } from '@/lib/auth/session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await params;
    const body = await request.json().catch(() => ({}));

    const admin = getAdminClient();
    const { data: order, error } = await admin
      .from('orders')
      .update({
        status: 'cancelled',
        notes: body.reason ? `Cancellation reason: ${body.reason}` : 'Cancelled by administrator',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !order) {
      return NextResponse.json({ success: false, error: 'Order not found or update failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}
