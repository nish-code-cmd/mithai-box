import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';
import path from 'path';
import fs from 'fs/promises';

type Params = { params: Promise<{ id: string }> };

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest, { params }: Params) {
  try {
    await requireAdminAuth(['admin', 'superadmin']);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;

  try {
    const admin = getAdminClient();

    // Check product exists
    const { data: product, error: fetchErr } = await admin
      .from('products')
      .select('id, images')
      .eq('id', id)
      .single();

    if (fetchErr || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('image') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: jpeg, png, webp, avif' }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: 'File too large. Max 10MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.type.split('/')[1] || 'jpg';
    const filename = `${id}-${Date.now()}.${ext}`;
    const storagePath = `products/${id}/${filename}`;

    let imageUrl: string = '';

    // 1. Try Supabase Storage upload
    const { data: uploadData, error: uploadErr } = await admin.storage
      .from('product-images')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (!uploadErr && uploadData) {
      const { data: publicUrlData } = admin.storage
        .from('product-images')
        .getPublicUrl(storagePath);
      imageUrl = publicUrlData.publicUrl;
    } else {
      // 2. Fallback to local storage if bucket is not yet created in Supabase Dashboard
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      imageUrl = `/uploads/products/${filename}`;
    }

    // Append to product images array in Supabase
    const currentImages = Array.isArray(product.images) ? product.images : [];
    const updatedImages = [...currentImages, imageUrl];

    const { error: updateErr } = await admin
      .from('products')
      .update({ images: updatedImages, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update product images' }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        image: {
          url: imageUrl,
          filename,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('[Admin Product Images POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await requireAdminAuth(['admin', 'superadmin']);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unauthorized';
    return NextResponse.json({ error: msg }, { status: msg === 'FORBIDDEN' ? 403 : 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'imageUrl is required' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: product } = await admin
      .from('products')
      .select('images')
      .eq('id', id)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const currentImages = Array.isArray(product.images) ? product.images : [];
    const filteredImages = currentImages.filter((img: string) => img !== imageUrl);

    await admin
      .from('products')
      .update({ images: filteredImages, updated_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin Product Images DELETE] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
