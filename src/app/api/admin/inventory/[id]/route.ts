import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdminAuth } from '@/lib/auth/session';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await params;
    const body = await request.json();
    const { adjustment, stock } = body;

    const admin = getAdminClient();
    const { data: product } = await admin
      .from('products')
      .select('id, stock')
      .eq('id', id)
      .single();

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    let newStock = product.stock;
    if (typeof stock === 'number') {
      newStock = Math.max(0, stock);
    } else if (typeof adjustment === 'number') {
      newStock = Math.max(0, product.stock + adjustment);
    }

    const { data: updated, error } = await admin
      .from('products')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    // Record audit log
    const changeQty = newStock - product.stock;
    if (changeQty !== 0) {
      await admin.from('inventory_logs').insert({
        product_id: id,
        previous_stock: product.stock,
        new_stock: newStock,
        change_qty: changeQty,
        reason: body.reason || (changeQty > 0 ? 'Manual stock addition' : 'Manual stock reduction'),
        created_by: 'admin',
      });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}
