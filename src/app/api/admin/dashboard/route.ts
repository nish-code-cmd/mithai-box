/**
 * Admin Dashboard Stats API
 * GET /api/admin/dashboard
 * Returns real metrics from Supabase
 * Protected: admin + superadmin only
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'superadmin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admin = getAdminClient();

    // Run all stats queries in parallel
    const [
      ordersResult,
      revenueResult,
      customersResult,
      productsResult,
      pendingOrdersResult,
      recentOrdersResult,
      newEnquiriesResult,
    ] = await Promise.all([
      admin.from('orders').select('id', { count: 'exact', head: true }),
      admin.from('orders').select('total_amount').eq('payment_status', 'paid'),
      admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      admin.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
      admin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      admin.from('orders')
        .select(`id, order_number, status, payment_status, total_amount, created_at, profiles(name)`)
        .order('created_at', { ascending: false })
        .limit(10),
      admin.from('wholesale_enquiries').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    ]);

    const totalRevenue = revenueResult.data?.reduce(
      (sum, o) => sum + (o.total_amount || 0), 0
    ) ?? 0;

    return NextResponse.json({
      stats: {
        totalOrders: ordersResult.count ?? 0,
        totalRevenue,
        totalCustomers: customersResult.count ?? 0,
        activeProducts: productsResult.count ?? 0,
        pendingOrders: pendingOrdersResult.count ?? 0,
        newEnquiries: newEnquiriesResult.count ?? 0,
      },
      recentOrders: recentOrdersResult.data ?? [],
    });
  } catch (err) {
    console.error('[Admin Dashboard] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
