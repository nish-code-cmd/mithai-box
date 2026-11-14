import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { getAdminClient } from '@/lib/supabase/admin';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await requireAdminAuth(['admin', 'superadmin']);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const admin = getAdminClient();

    const { data: category, error } = await admin
      .from('categories')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error || !category) {
      return NextResponse.json({ error: 'Category not found or update failed' }, { status: 404 });
    }

    return NextResponse.json({ category });
  } catch (err) {
    console.error('[Admin Category PUT] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await requireAdminAuth(['admin', 'superadmin']);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const admin = getAdminClient();
    const { error } = await admin
      .from('categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Category archived' });
  } catch (err) {
    console.error('[Admin Category DELETE] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
