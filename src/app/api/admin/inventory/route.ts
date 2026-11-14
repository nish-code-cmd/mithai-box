import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth();
    const { searchParams } = new URL(request.url);
    const lowStockOnly = searchParams.get('lowStock') === 'true';

    const admin = getAdminClient();
    let query = admin
      .from('products')
      .select('id, name, sku, stock, low_stock_threshold, base_price, images, categories(name)')
      .eq('is_active', true)
      .order('stock', { ascending: true });

    if (lowStockOnly) {
      query = query.filter('stock', 'lte', 'low_stock_threshold');
    }

    const { data: products, error } = await query;

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const items = (products || []).map((p: any) => ({
      _id: p.id,
      id: p.id,
      product: {
        _id: p.id,
        name: p.name,
        sku: p.sku,
        basePrice: p.base_price,
        images: p.images,
        category: p.categories,
      },
      quantityOnHand: p.stock,
      quantityReserved: 0,
      lowStockThreshold: p.low_stock_threshold,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, data: items });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}
