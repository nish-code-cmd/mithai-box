import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ success: false, error: 'Product slug is required' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: product, error } = await admin
      .from('products')
      .select('*, categories(id, name, slug, description)')
      .eq('slug', slug.toLowerCase().trim())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    const rawImages = Array.isArray(product.images) ? product.images : [];
    const images = rawImages.map((img: any, idx: number) => {
      if (typeof img === 'string') return { url: img, altText: product.name, sortOrder: idx };
      return { url: img?.url || '', altText: img?.altText || product.name, sortOrder: idx };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        images,
        basePrice: Number(product.base_price),
        salePrice: product.wholesale_price ? Number(product.wholesale_price) : null,
        moq: product.min_order_qty,
        unit: product.unit || 'piece',
        stock: product.stock,
        isFeatured: product.is_featured,
        category: product.categories,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
