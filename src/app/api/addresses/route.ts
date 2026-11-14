import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const admin = getAdminClient();
    const { data: addresses, error } = await admin
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: (addresses || []).map((a) => ({
        id: a.id,
        fullName: a.name,
        phone: a.phone,
        addressLine1: a.line1,
        addressLine2: a.line2,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        isDefault: a.is_default,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
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

    const { data: created, error } = await admin
      .from('addresses')
      .insert({
        user_id: user.id,
        name: fullName || name || 'Customer',
        phone: phone || '',
        line1: addressLine1 || line1 || '',
        line2: addressLine2 || line2 || null,
        city: city || '',
        state: state || '',
        pincode: pincode || '',
        is_default: !!isDefault,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
