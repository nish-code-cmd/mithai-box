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

    const { data: order, error } = await admin
      .from('orders')
      .select('*, order_items(*), profiles(name, phone)')
      .eq('id', id)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
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
    const { status, payment_status, notes } = body;

    const admin = getAdminClient();
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (status) updatePayload.status = status;
    if (payment_status) updatePayload.payment_status = payment_status;
    if (notes) updatePayload.notes = notes;

    const { data: order, error } = await admin
      .from('orders')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !order) {
      return NextResponse.json({ success: false, error: 'Order update failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}
