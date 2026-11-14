import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const body = await request.json();
    const quantity = parseInt(body.quantity, 10);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const admin = getAdminClient();

    if (quantity <= 0) {
      await admin.from('cart_items').delete().eq('id', itemId);
      return NextResponse.json({ success: true, message: 'Item removed' });
    }

    const { data: updated, error } = await admin
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', itemId)
      .select('*, products(*)')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to update item' }, { status: 400 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const { itemId } = await params;
    const admin = getAdminClient();
    await admin.from('cart_items').delete().eq('id', itemId);

    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
