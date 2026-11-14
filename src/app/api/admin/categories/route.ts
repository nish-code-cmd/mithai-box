import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    await requireAdminAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = getAdminClient();
    const { data: categories, error } = await admin
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ categories: categories || [] });
  } catch (err) {
    console.error('[Admin Categories GET] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminAuth(['admin', 'superadmin']);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, slug, description, imageUrl, sortOrder, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: 'name and slug are required' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: category, error } = await admin
      .from('categories')
      .insert({
        name,
        slug,
        description: description || null,
        image_url: imageUrl || null,
        sort_order: sortOrder || 0,
        is_active: isActive !== false,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A category with that slug already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ category }, { status: 201 });
  } catch (err) {
    console.error('[Admin Categories POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
