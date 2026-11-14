import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');

    const admin = getAdminClient();
    const { data: orders, error } = await admin
      .from('orders')
      .select('*, profiles(name, phone)')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (format === 'csv') {
      const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Status', 'Payment Status', 'Subtotal', 'Discount', 'Grand Total'];
      const rows = (orders || []).map((o: any) => {
        const addr = typeof o.shipping_address === 'object' ? o.shipping_address : {};
        return [
          o.order_number,
          new Date(o.created_at).toISOString().split('T')[0],
          `"${o.profiles?.name || addr.name || 'Customer'}"`,
          o.profiles?.phone || addr.phone || '',
          o.status,
          o.payment_status,
          o.subtotal,
          o.discount_amount,
          o.total_amount,
        ];
      });

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="orders-report-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, data: orders || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Unauthorized' }, { status: 401 });
  }
}
