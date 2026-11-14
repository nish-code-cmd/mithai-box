import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fullName, name, phone, addressLine1, line1, addressLine2, line2, city, state, pincode, isDefault } = body;

    const admin = getAdminClient();

    if (isDefault) {
      await admin.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    }

    const { data: updated, error } = await admin
      .from('addresses')
      .update({
        name: fullName || name,
        phone,
        line1: addressLine1 || line1,
        line2: addressLine2 || line2,
        city,
        state,
        pincode,
        is_default: !!isDefault,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json({ success: false, error: 'Address not found or update failed' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdminClient();
    const { error } = await admin
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to delete address' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
