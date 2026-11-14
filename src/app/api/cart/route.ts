/**
 * Cart API
 * GET /api/cart — get current user's cart
 * POST /api/cart — add item to cart
 * PATCH /api/cart — update item quantity
 * DELETE /api/cart?item_id=xyz — remove item
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        products(id, name, slug, base_price, mrp, images, stock, min_order_qty, unit)
      `)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] });
  } catch (err) {
    console.error('[Cart GET] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { product_id, quantity = 1 } = body;

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Check product exists and has stock
    const { data: product } = await supabase
      .from('products')
      .select('id, stock, min_order_qty')
      .eq('id', product_id)
      .eq('is_active', true)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // Upsert cart item
    const { data, error } = await supabase
      .from('cart_items')
      .upsert(
        { user_id: user.id, product_id, quantity },
        { onConflict: 'user_id,product_id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
    }

    return NextResponse.json({ item: data }, { status: 201 });
  } catch (err) {
    console.error('[Cart POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { item_id, quantity } = body;

    if (!item_id || quantity === undefined) {
      return NextResponse.json({ error: 'item_id and quantity required' }, { status: 400 });
    }

    if (quantity <= 0) {
      // Delete item if quantity is 0 or negative
      await supabase.from('cart_items').delete().eq('id', item_id).eq('user_id', user.id);
      return NextResponse.json({ success: true, deleted: true });
    }

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq('id', item_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
    }

    return NextResponse.json({ item: data });
  } catch (err) {
    console.error('[Cart PATCH] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('item_id');

    if (!itemId) {
      return NextResponse.json({ error: 'item_id required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Cart DELETE] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
