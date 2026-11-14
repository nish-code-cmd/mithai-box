import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdminAuth } from '@/lib/auth/session';
import { BUSINESS } from '@/lib/constants';

export async function GET() {
  try {
    await requireAdminAuth();
    const admin = getAdminClient();
    const { data: settings } = await admin.from('settings').select('*');

    return NextResponse.json({
      success: true,
      data: settings && settings.length > 0 ? settings : [
        { key: 'business_info', value: BUSINESS },
        { key: 'shipping_rules', value: { dispatchDays: 2, minFreeShipping: 5000 } },
        { key: 'tax_settings', value: { gstRate: 12, inclusive: false } },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdminAuth(['superadmin', 'admin']);
    const body = await request.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: 'Setting key is required' }, { status: 400 });
    }

    const admin = getAdminClient();
    const { data: setting, error } = await admin
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: setting });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}
