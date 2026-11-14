/**
 * Admin Products API
 * GET /api/admin/products — list all products (including inactive)
 * POST /api/admin/products — create new product
 * Protected: admin + superadmin only
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();

  if (!profile || !['admin', 'superadmin'].includes(profile.role)) return null;
  return user;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await requireAdmin(supabase);
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const search = searchParams.get('search');

    const admin = getAdminClient();
    let query = admin
      .from('products')
      .select('*, categories(name, slug)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      products: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('[Admin Products GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await requireAdmin(supabase);
    if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const {
      name, slug, description, category_id, base_price, mrp, wholesale_price,
      min_order_qty, unit, sku, images, tags, is_active, is_featured,
      is_new_arrival, is_bestseller, stock, low_stock_threshold,
      gst_percent, hsn_code, weight_grams,
    } = body;

    if (!name || !slug || !base_price) {
      return NextResponse.json(
        { error: 'name, slug and base_price are required' },
        { status: 400 }
      );
    }

    const admin = getAdminClient();
    const { data, error } = await admin
      .from('products')
      .insert({
        name, slug, description, category_id, base_price, mrp, wholesale_price,
        min_order_qty: min_order_qty || 1, unit, sku, images: images || [],
        tags: tags || [], is_active: is_active !== false, is_featured: !!is_featured,
        is_new_arrival: !!is_new_arrival, is_bestseller: !!is_bestseller,
        stock: stock || 100, low_stock_threshold: low_stock_threshold || 15,
        gst_percent, hsn_code, weight_grams,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Product slug or SKU already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (err) {
    console.error('[Admin Products POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
