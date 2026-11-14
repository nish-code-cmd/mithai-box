import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() ?? '';
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '8', 10), 20);

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: { suggestions: [] } }, { status: 200 });
    }

    const admin = getAdminClient();
    const { data: products } = await admin
      .from('products')
      .select('name, slug, images, base_price, wholesale_price')
      .eq('is_active', true)
      .or(`name.ilike.%${q}%,description.ilike.%${q}%,sku.ilike.%${q}%`)
      .limit(limit);

    const suggestions = (products || []).map((p: any) => {
      const firstImg = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
      return {
        name: p.name,
        slug: p.slug,
        imageUrl: typeof firstImg === 'string' ? firstImg : firstImg?.url ?? null,
        price: p.wholesale_price ?? p.base_price,
      };
    });

    return NextResponse.json({
      success: true,
      data: { suggestions },
    });
  } catch (err) {
    console.error('[GET /api/search] Error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
